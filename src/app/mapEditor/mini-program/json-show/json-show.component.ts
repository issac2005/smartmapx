import {Component, OnInit, OnChanges, OnDestroy, AfterViewInit, Input, Output, EventEmitter, Renderer2} from '@angular/core';
import {HttpService} from '../../../s-service/http.service';
import {AppService} from '../../../s-service/app.service';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';
@Component({
  selector: 'app-json-show',
  templateUrl: './json-show.component.html',
  styleUrls: ['./json-show.component.scss']
})

export class JsonShowComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() schema: any;
  @Input() programInfo: any;
  @Input() mapObj: any;
  @Input() appsInfo: any;
  @Output() changeSetting = new EventEmitter();
  @Output() changeVersion = new EventEmitter();
  @Output() showCover = new EventEmitter();

  editor: any;
  smallProgram: any;
  modal = false;
  BooleanColseHtml = true;
  versionList = [];
  version: any;
  versionDeleted = false;
  newVersion = false;
  getVerson: any;
  versionDesc: any;

  constructor(
    private render2: Renderer2,
    private httpService: HttpService,
    private appService: AppService,
    private toastService: ToastService,
  ) {

    }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.editorInit(this.schema);
  }


  ngOnChanges() {

  }



  editorInit(schemaData: any) {
    this.smallProgram = {};
    this.smallProgram = this.programInfo.properties;
    if (schemaData && schemaData.modal) {
      this.modal = true;
      this.changeSetting.emit(this.smallProgram);
    } else {
      this.changeSetting.emit({});
    }
  }



  // 添加、更新小程序
  update(item: any) {
    const app = {
      id: item.id,
      map_mini_program_id: item.map_mini_program_id,
      title: item.title,
      description: item.description,
      properties: this.editor.getValue(),
      map_mini_user_id: item.map_mini_user_id
    };
    this.mapObj.addApp(app);
  }

  beforeChange($event: any) {
    const parent = document.getElementById($event.panelId + '-header');
    if ($event.nextState) {
      this.render2.addClass(parent.children[0].children[1], 'ngb-sort-up');
    } else {
      this.render2.removeClass(parent.children[0].children[1], 'ngb-sort-up');
    }
  }

  // 接收组件值的变化
  getChange(event: any) {
    this.changeSetting.emit(this.smallProgram);
  }

  getValueChange(event: any) {
    this.smallProgram[event[0]] = event[1];
    this.changeSetting.emit(this.smallProgram);
  }

  // 选择小程序版本
  chooseVersion(event: any) {
    this.showCover.emit(true);
    // 首先请求小程序切换版本接口，再请求app.json
    if (this.versionDeleted) {
      this.versionDeleted = false;
    }
    let version;
    const reg = /-recommand/img;
    const len = '-recommand'.length;
    if (reg.test(event)) {
      version = null;
    } else {
      version = event;
    }

    const postData = {
      mini_program_id: this.programInfo.id,
      version: version ? version : this.programInfo.recommend
    };
    this.versionList.forEach((item: any) => {
      if (item.value === version) {
        this.versionDesc = item.description;
      }
    });
    this.changeVersion.emit(version);
    this.httpService.getData(postData, true, 'execute', '628bd398-1d97-4eaf-ba2b-129bac635810', '', '').subscribe(
      (data: any) => {
        if (data.status > 0) {
          this.getAppjson(version);
        } else {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
          this.toastService.toast(toastCfg);
        }
      },
      error => {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
        this.toastService.toast(toastCfg);
      });

    for (let a = 0; a < this.versionList.length; a++) {
      if (version === this.versionList[a].value) {
        for (let b = 0; b < this.versionList.length; b++) {
          if (this.versionList[a].timestamp < this.versionList[b].timestamp) {
            this.newVersion = true;
            return;
          } else {
            this.newVersion = false;
            return;
          }
        }
      }
    }
  }

  // 获取app.json
  getAppjson(version: any) {
    const postData = {
      mini_program_id: this.programInfo.id,
      version: version
    };
    this.httpService.getData(postData, true, 'app', 'JSONshow', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.showCover.emit(false);
            const json = {};
            if (JSON.stringify(this.schema).length === 2) {
              this.schema = JSON.parse(data.data);
              this.editorInit(this.schema);
            } else {
              this.schema = JSON.parse(data.data);
            }

            for (let i = 0; i < this.schema.group.length; i++) {
              const properties = this.schema.group[i].properties;
              for (let m = 0; m < properties.length; m++) {
                json[properties[m].attribute] = properties[m].default;
              }
            }
            this.smallProgram = json;
            this.changeSetting.emit(json);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });
  }

}
