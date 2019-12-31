import {Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, AfterViewInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {JsonEditPanelComponent} from './json-edit-panel/json-edit-panel.component';
import {JsEditPanelComponent} from './js-edit-panel/js-edit-panel.component';
import {SettingPanelComponent} from './setting-panel/setting-panel.component';
import {AppService} from '../../s-service/app.service';
import {HttpService} from '../../s-service/http.service';
import {SourcePanelComponent} from './source-panel/source-panel.component';
import * as Ajv from 'ajv';
import {MiniProgramModalComponent} from '../mini-program-modal/mini-program-modal.component';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';

@Component({
  selector: 'app-edit-panel',
  templateUrl: './edit-panel.component.html',
  styleUrls: ['./edit-panel.component.scss']
})
export class EditPanelComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() dataInfo: any;
  @Input() mapObj: any;
  @Output() event = new EventEmitter();
  title: any;
  passValidate: any;
  versionList: any;
  josnEditorIsChange = false;
  update = false;
  childIsFull = false;
  showSetting = true;
  mapLoaded = true;
  resetRecommend: any;
  resetVersion: any;
  version: any;
  tabTitle = [
    {'name': 'JavaScript'},
    {'name': 'Json'},
    {'name': '资源'},
    {'name': '配置'}
  ];
  oind = 0;
  isEdit = false;

  @ViewChild(JsonEditPanelComponent, {static: false}) JsonEdit: JsonEditPanelComponent;
  @ViewChild(JsEditPanelComponent, {static: false}) JSedit: JsEditPanelComponent;
  @ViewChild(SettingPanelComponent, {static: false}) JSONeditor: SettingPanelComponent;
  @ViewChild(SourcePanelComponent, {static: false}) Resource: SourcePanelComponent;

  constructor(private modalService: SmxModal,
              private router: Router,
              private httpService: HttpService,
              private appService: AppService,
              private toastService: ToastService) {

    this.resetRecommend = this.appService.onSetRecdEventEmitter.subscribe((data) => {
      this.dataInfo.recommend = data;
    });
    this.resetVersion = this.appService.onEditEventEmitter.subscribe(
      (data) => {
        this.version = data.version;
      }
    );
  }

  ngOnInit() {
    this.title = this.dataInfo.name;
    if (this.dataInfo) {
      this.isEdit = !this.dataInfo.visit_type;
    }
    // 显示当前版本
    if (this.dataInfo.version || this.dataInfo.recommend) {
      this.version = this.dataInfo.version || this.dataInfo.recommend;
    }

    // 获取版本列表，如果没有数据则是用户新建小程序
    this.getVersionList(false, null);
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.resetRecommend.unsubscribe();
    this.resetVersion.unsubscribe();
  }

  // 监听json-edit保存json事件
  listenChild() {
    this.JSONeditor.showJson();
  }

  // 监听从jsoneditor中得到的最新数据
  receiveJsonEditorData() {
    let jsoncode;
    if (this.JSONeditor.programJson.modal) {
      jsoncode = this.JSONeditor.smallProgram;
    }
    if (this.update) {
      this.updateApp(jsoncode);
      this.update = false;
    }
  }

  receiveJsonChange() {
    this.josnEditorIsChange = true;
  }

  liClick(i: any) {
    this.oind = i;
  }

  // 返回
  back() {
    if (this.JSedit.jsStatus !== 'default' || this.JsonEdit.jsonStatus !== 'default' || this.Resource.resoruceStatus !== 'default') {
      const modalRef = this.modalService.open(MiniProgramModalComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-miniProgrampopule'});
      modalRef.componentInstance.type = 'quit-tip';
      modalRef.componentInstance.keyConfig = {title: '提示'};
      return;
    }

    if (localStorage.getItem('goback_share') === '0') {
      localStorage.setItem('goback_share', '1');
    }
    this.router.navigate(['/app/showapplet'], {queryParams: {module: 'ap'}});

  }


  // 运行
  perform() {
    const jscode = this.JSedit.jsEditor.getValue();
    let jsoncode;
    if (this.JSONeditor.programJson && this.JSONeditor.programJson.modal) {
      jsoncode = this.JSONeditor.smallProgram;
    }
    if (jscode.length === 0) {
      const toastCfg = new ToastConfig(ToastType.INFO, '', 'JavaScript不能为空,请编辑JavaScript', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    this.saveChildJs(true, null);
    if (this.passValidate) {
      if (this.josnEditorIsChange && this.oind === 3) { // 用户只更改配置中的参数时，执行以下操作
        this.updateApp(jsoncode);
        const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '已保存并成功运行!', 2000);
        this.toastService.toast(toastCfg);
      } else { // 用户在json中修改配置时，执行以下操作
        this.saveChildJson(true, null); // 保存修改后的json代码
        if (this.passValidate) {
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '已保存并成功运行！', 2000);
          this.toastService.toast(toastCfg);
          this.update = true;
        }
      }
    }

  }


  saveChildJs(param: any, type: any) {
    const self = this;
    const jscode = this.JSedit.jsEditor.getValue();
    if (jscode.length === 0) {
      this.passValidate = false;
      const toastCfg = new ToastConfig(ToastType.WARNING, '', 'JavaScript不能为空', 2000);
      self.toastService.toast(toastCfg);
      return;
    }
    this.JSedit.validateApp(this.JSedit.jsEditor.getValue(), function (err: any) {
      if (err) {
        self.passValidate = false;
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '应用程序验证错误\n' + (err.toString() || err), 2000);
        self.toastService.toast(toastCfg);
      } else {
        self.passValidate = true;
        self.JSedit.postJs(param, type);
      }
    });
  }

  saveChildJson(param: any, type: any) {
    const ajv = new Ajv({allErrors: true});
    const self = this;
    if (this.JsonEdit.jsonEditor.getValue().length === 0) {
      this.passValidate = false;
      const toastCfg = new ToastConfig(ToastType.WARNING, '', 'Json不能为空', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    try {
      const reslut = ajv.validateSchema(JSON.parse(this.JsonEdit.jsonEditor.getValue()));
      if (reslut) {
        self.passValidate = true;
        this.JsonEdit.postJson(param, type);
      } else {
        self.passValidate = false;
        const toastCfg = new ToastConfig(ToastType.ERROR, '', this.JsonEdit.errorsText(ajv.errors), 2000);
        self.toastService.toast(toastCfg);
      }
    } catch (e) {
      self.passValidate = false;
      const toastCfg = new ToastConfig(ToastType.ERROR, '', 'Json格式错误', 2000);
      self.toastService.toast(toastCfg);

    }
  }


  updateApp(value: any) {
    const app = {
      id: this.dataInfo.mini_program_id,
      map_mini_program_id: this.dataInfo.map_mini_program_id || this.dataInfo.mini_program_id,
      title: this.JSONeditor.programJson.title || '',
      description: this.JSONeditor.programJson.description || '',
      properties: value,
      map_mini_user_id: this.dataInfo ? this.dataInfo.user_id : '',
      version: 'current'
    };
    this.mapObj.addApp(app);
  }


  // 接受子组件js-edit-panel/json-edit-panel设置全屏属性
  setFullScreen(event: any) {
    this.childIsFull = event;
    this.event.emit(this.childIsFull);
  }

  // 版本列表弹框
  openVersionModal() {
    const modalRef = this.modalService.open(MiniProgramModalComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-miniProgrampopule'});
    modalRef.componentInstance.type = 'version-list';
    modalRef.componentInstance.keyConfig = {
      title: '小程序版本设置',
      mini_program_id: this.dataInfo.mini_program_id,
      jsNotChanged: this.JSedit.jsStatus,
      jsonNotChanged: this.JsonEdit.jsonStatus
    };

    this.getVersionList(true, modalRef);
    modalRef.result.then(
      (result) => {
      },
      (reason) => {
        if (reason && reason !== 'close') {
        }
      }
    );
  }

  // 获取版本列表
  getVersionList(bool: any, modalRef: any) {
    const postData = {mini_program_id: this.dataInfo.mini_program_id};
    this.httpService.getData(postData, true, 'execute', '957f3672-668e-4107-a900-52be1ebf8f62', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            if (bool) {
              data.data.forEach((item: any) => {
                if (item.version === this.version) {
                  item.current = true;
                } else {
                  item.current = false;
                }

                if (item.version === this.dataInfo.recommend) {
                  item.recommend = true;
                } else {
                  item.recommend = false;
                }
              });
              modalRef.componentInstance.modalData = data.data;
            } else {
              this.versionList = data.data;
            }
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '查询小程序版本请求失败', 2000);
          this.toastService.toast(toastCfg);
        });

  }


}
