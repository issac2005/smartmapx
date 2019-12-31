import {Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, Renderer2} from '@angular/core';
import {MapComponent} from './map/map.component';
import {PopueComponent} from '../data/modal/data-popue.component';
import {HttpService} from '../s-service/http.service';
import {SmxModal} from '../smx-component/smx-modal/smx-modal.module';
import {EditPanelComponent} from './edit-panel/edit-panel.component';
import {JsEditPanelComponent} from './edit-panel/js-edit-panel/js-edit-panel.component';
import {JsonEditPanelComponent} from './edit-panel/json-edit-panel/json-edit-panel.component';
import {AppService} from '../s-service/app.service';
import {LocalStorage} from '../s-service/local.storage';
import {MiniProgramModalComponent} from './mini-program-modal/mini-program-modal.component';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';
@Component({
  selector: 'app-program-editor',
  templateUrl: './program-editor.component.html',
  styleUrls: ['./program-editor.component.scss']
})
export class ProgramEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'app';
  isHide = false;
  proInfo = {};
  parentIsFull = false;
  mapLoad = false;

  jsData: any;
  jsonData: any;
  dataInfo: any;
  url: any;
  date: any;
  date1;
  isEdit = false;
  publishConfirm: any;
  submitConfirm: any;
  publishModal: any;
  submitModal: any;
  reason: any;
  type: any;
  unJsSaved: any;
  unJsonSaved: any;


  @ViewChild(MapComponent, {static: false}) map: MapComponent;
  @ViewChild(EditPanelComponent, {static: false}) edit: EditPanelComponent;
  @ViewChild(JsEditPanelComponent, {static: false}) jsEdit: JsEditPanelComponent;
  @ViewChild(JsonEditPanelComponent, {static: false}) jsonEdit: JsonEditPanelComponent;

  constructor(private modalService: SmxModal,
              private httpService: HttpService,
              private toastService: ToastService,
              private appService: AppService,
              private renderer: Renderer2,
              private elementRef: ElementRef,
              private ls: LocalStorage) {

    this.publishConfirm = this.appService.onConfirmPublishEventEmitter.subscribe((data) => {
      this.confirmPublish(data, 'publish');
    });
     this.submitConfirm = this.appService.onConfirmSubmitEventEmitter.subscribe(
       (data) => {
         this.confirmPublish(data, 'submit');
       }
     );
     this.unJsSaved = this.appService.onJsSavedEmitter.subscribe(
       (data) => {
         // 当app.js保存完毕后，保存app.json
         this.edit.saveChildJson(true, this.type);
       }
     );
     this.unJsonSaved = this.appService.onJsonSavedEventEmitter.subscribe(
       () => {
         // 当app.json保存完毕后，再去执行提交代码或者发布版本
         this.sumbitPublish();
       }
     );
  }

  ngOnInit() {
    this.dataInfo = this.ls.getObject('appsInfo');
    if (this.dataInfo) {
      this.isEdit = !this.dataInfo.visit_type;
    }

    this.renderer.listen(
      this.elementRef.nativeElement, 'click', event => {
        this.appService.iconChangeEventEmitter.emit(event);
      });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    if (this.map.map) {
      this.map.map.clearApps();
    }
    this.publishConfirm.unsubscribe();
    this.unJsSaved.unsubscribe();
    this.unJsonSaved.unsubscribe();
  }


  // 地图全屏切换
  slideToggle() {
    this.isHide = !this.isHide;
    const self = this;
    setTimeout(function () {
      self.map.map.resize();
    }, 300);
  }
  // 提交代码
  checkCode() {
    // 临时版本号的时间戳
    this.date = new Date();
    const y = this.date.getFullYear();
    let m = this.date.getMonth() + 1;
    if ((this.date.getMonth() + 1) < 10 ) {
       m  = '0' + m;
    }
    let d = this.date.getDate();
    if ( d < 10) {
      d = '0' + d;
    }
    let h = this.date.getHours();
    if ( h < 10) {
      h = '0' + h;
    }
    let nm = this.date.getMinutes();
    if (nm < 10) {
      nm = '0' + nm;
    }
    this.date1 = y + m + d + h + nm;

    this.publishModal = this.modalService.open(MiniProgramModalComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-miniProgrampopule'});
    this.publishModal.componentInstance.type = 'submit';
    this.publishModal.componentInstance.keyConfig = {title: '小程序提交版本设置',
              date1: this.date1,
              mini_program_id: this.dataInfo.mini_program_id
    };

  }

  // 切换底图
  openModal() {
    const key_config = {
      chooseMap: {
        action: 2, // 1 有自定义 // 2 无自定义
        independence: 1, // 1 独立性  2 有关联
        title: '选择底图',
        modal: {
          leftTitle: '系统底图',
          rightTitle: '用户底图',
          id: 'map_id',
          name: 'name',
          description: 'description',
          img: 'thumbnail'
        },
        interface: {
          queryLeft: 'fa20136d-a6b2-40da-b8c5-29b3a361c42b', // 查询系统地图 do
          searchLeft: '5878e037-1c61-4c9a-9f4a-653e70c2d5c4', // 关键字搜索系统底图 do
          searchRight: '8b6f180d-63ee-44f9-99b6-334159fcc124', // 关键字搜索用户地图 do
          queryRight: '31a835e5-8e55-439a-9b63-3886cb08390e', // 查询用户地图 do
        }
      }
    };

    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.keyConfig = key_config;
    modalRef.componentInstance.type = 'chooseMap';
    modalRef.result.then((result) => {
    }, (reason) => {

      if (reason && reason !== 'close') {
        const mapid = reason.checkedItem.map_id,
          version = reason.checkedItem.release_time;
        const postData = {
          mapID: mapid,
          version: version
        };
        this.httpService.getData(postData, true, 'execute', 'getMapStyle', 'em', 'em')
          .subscribe(
            (data: any) => {
              this.map.map.setStyle(data.data);
              this.getJson(data.data);
            }
          );

        // 保存所选地图id、小程序id到服务器
        this.httpService.getData({
          'map_id': mapid,
          'mini_program_id': this.dataInfo.mini_program_id
        }, true, 'execute', 'c972e80b-38f6-4ef0-9dd9-be74ea3d7e9f', '')
          .subscribe(
            (data: any) => {
            }
          );
      }
    });
  }

  // 将json地址转换成json
  getJson(url: any) {
    this.httpService.getFile(url).subscribe(res => {
      const mapData = res;
      this.map.map.setZoom((mapData as any).zoom);
      this.map.map.setCenter((mapData as any).center);
    }, error => {

    });
  }

   // 发布按钮事件
   publishProgram() {
    this.publishModal = this.modalService.open(MiniProgramModalComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-miniProgrampopule'});
    this.publishModal.componentInstance.type = 'publish';
    this.publishModal.componentInstance.keyConfig = {title: '小程序发布设置', isPublished: false};
    this.publishModal.result.then((result) => {
    }, (reason) => {});

    // 获取历史版本用来判断是否设置‘设为推荐’选择框为默认
     const postData = {mini_program_id: this.dataInfo.mini_program_id};
     this.httpService.getData(postData, true, 'execute', '957f3672-668e-4107-a900-52be1ebf8f62', '')
       .subscribe(
         (data: any) => {
           if (data.status > 0) {
             const versionData = data.data;
             this.appService.onGetVersionEmitter.emit(versionData);
             versionData.forEach((item: any) => {
               if (item.type === 1) {
                 this.publishModal.componentInstance.keyConfig.isPublished = true;
               }
             });
           } else {
             const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
             this.toastService.toast(toastCfg);
           }
         },
         error => {
           const toastCfg = new ToastConfig(ToastType.ERROR, '', '发送请求失败，请检查网络', 2000);
           this.toastService.toast(toastCfg);
         });
  }

  // 发布弹框中确认按钮事件
  confirmPublish(reason: any, type: any) {
    this.reason = reason;
    this.type = type;
    this.mapLoad = false;
    this.publishModal.dismiss();
    this.publishModal = null;
    // 判断js文件是否为空
    const jscode = this.edit.JSedit.textJS;
    if (jscode.length === 0) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', 'JavaScript不能为空', 2000);
      this.toastService.toast(toastCfg);
      this.mapLoad = true;
      return;
    }

    if (this.edit.versionList.length === 0 && !this.edit.JSedit.saveClicked) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '您还未编辑保存JavaScript', 2000);
      this.toastService.toast(toastCfg);
      this.mapLoad = true;
      return;
    }

    // 保存app.js
    this.edit.saveChildJs(true, type);

  }

  // 提交代码或发布小程序
  sumbitPublish() {
    if (this.type === 'publish') {
      const postData = {
        mini_program_id: this.dataInfo.mini_program_id,
        version: this.reason.version,
        description: this.reason.textarea,
        isRecommend: this.reason.recomd ? 1 : 0,
        fork: this.edit.version ? this.edit.version : null
      };
      this.httpService.getData(postData, true, 'execute', '0f408f2b-68ae-4ce2-86b2-33eca9ad9748', '')
        .subscribe(
          (res) => {
            if (res.status > 0) {
              this.edit.JSedit.jsStatus = 'default';
              this.edit.JsonEdit.jsonStatus = 'default';
              this.edit.Resource.resoruceStatus = 'default';
              if (postData.isRecommend) {
                this.appService.onSetRecdEventEmitter.emit(postData.version);
              }
              // 显示发布之后当前的版本
              this.edit.version = postData.version;
              this.mapLoad = true;
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', postData.version + '版本发布成功', 2000);
              this.toastService.toast(toastCfg);
            } else {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', res.msg, 2000);
              this.toastService.toast(toastCfg);
            }
          },
          error => {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '发送请求失败，请检查网络', 2000);
            this.toastService.toast(toastCfg);
          }
        );
    } else if (this.type === 'submit') {
      const postData = {
        mini_program_id: this.dataInfo.mini_program_id,
        description: this.reason.description
      };
      this.httpService.getData(postData, true, 'execute', '018ed99e-0c21-44eb-a2dc-d56799b7091f', '')
        .subscribe(
          (re) => {
            if (re.status > 0) {
              this.edit.JSedit.jsStatus = 'default';
              this.edit.JsonEdit.jsonStatus = 'default';
              this.edit.Resource.resoruceStatus = 'default';
              this.mapLoad = true;
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '提交成功！', 2000);
              this.toastService.toast(toastCfg);
            } else {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', re.msg, 2000);
              this.toastService.toast(toastCfg);
            }
          },
          error => {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '发送请求失败，请检查网络', 2000);
            this.toastService.toast(toastCfg);
          }
        );
    }
  }


  // 接受子组件edit-panel属性设置全屏属性
  parentSetFullScreen(event: any) {
    this.parentIsFull = event;
  }

  receiveMsg(data: any) {
    this.edit.mapLoaded = false;
    this.mapLoad = data;
  }


}
