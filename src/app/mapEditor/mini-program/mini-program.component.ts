import {Component, OnInit, OnChanges, OnDestroy, Input, Output, AfterViewInit, ViewChild, EventEmitter} from '@angular/core';
import {PopueComponent} from '../../data/modal/data-popue.component';
import {HttpService} from '../../s-service/http.service';

import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {AppService} from '../../s-service/app.service';
import {JsonShowComponent} from './json-show/json-show.component';
import {AppJsonComponent} from './json/json.component';

import {LayerSelectComponent} from '../../multiplex/layer-select/layer-select.component';


@Component({
  selector: 'app-mini-program',
  templateUrl: './mini-program.component.html',
  styleUrls: ['./mini-program.component.scss']
})
export class MiniProgramComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() mapJson: any;
  @Input() mapObj: any;
  @Input() editStatus: any;
  @Input() vistInfo: any;
  @Output() showPopue = new EventEmitter();

  editor: any;
  programId: any;
  oindex: any;
  mapPoupe: any;
  appsInfo: any;

  programInfo = ({} as any);
  isOpen = false;
  isHide = true;
  jsonEditorShow = false;
  schema = ({} as any);
  version: any;
  programData = ([] as any);
  coverShow = true;
  versionNo: any;

  @ViewChild(JsonShowComponent, {static: false}) jsonShow: JsonShowComponent;
  @ViewChild(AppJsonComponent, {static: false}) jsonComponent: AppJsonComponent;
  @ViewChild(LayerSelectComponent, {static: false}) layerSelect: LayerSelectComponent;

  constructor(private modalService: SmxModal,
              private httpService: HttpService,
              private appService: AppService,
              private toastService: ToastService) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.mapObj && this.mapJson && this.mapJson.metadata && this.mapJson.metadata.apps) {
      this.mapPoupe = false;
      this.sendPopueInfo();

      this.appsInfo = this.vistInfo;

      this.mapJson.metadata.apps.forEach( (v: any, i: any) => {
        if (v.properties.layer || v.properties.infoPopue || v.properties.dataFilter) {
            this.liClick(v, i, false);
        }
        // 判断小程序中的mapid与当前地图是否一致，如果一致，则为当前地图的小程序：需在小程序面板中显示，否则（是底图中的小程序）不显示
        if (v.map_id === this.vistInfo.mapId) {
          this.programData.push(v);
        }
      });
    }

  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.mapPoupe = true;
    this.sendPopueInfo();
  }

  sendPopueInfo() {
    this.showPopue.emit(this.mapPoupe);
  }

  // 小程序弹框
  openModal() {
    const key_config = {
      chooseMap: {
        action: 2, // 1 有自定义 // 2 无自定义
        independence: 1, // 1 独立性  2 有关联
        title: '选择小程序',
        modal: {
          leftTitle: '我的小程序',
          rightTitle: '共享小程序',
          id: 'mini_program_id',
          name: 'name',
          description: 'description',
          img: 'icon'
        },
        interface: {
          queryLeft: '31456438-8a32-4789-8168-74716805a462', // 查询我的小程序 do
          queryRight: '86241ac9-a07e-4630-83d1-e83803c06bed', // 查询共享小程序 do
          searchLeft: '6dedafc9-6dcf-4812-b852-003a45443a5e', // 关键字查询我的小程序 do
          searchRight: '836d72ec-595a-4078-af84-0cec52ba7ac1', //
        }
      }
    };

    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.keyConfig = key_config;
    modalRef.componentInstance.type = 'chooseMap';

    modalRef.result.then((result) => {
    }, (reason) => {
      if (reason && reason !== 'close') {
        this.addMiniProgram(reason);
      }
    });
  }


  // 添加小程序
  addMiniProgram(reason: any) {
    const len = this.programData.length;
    let content;
    let previousId;
    if (len !== 0) { // 如果添加过小程序，获取最后一个小程序的id
      previousId = this.programData[len - 1].map_mini_program_id;
    } else { // 如果没添加过小程序，id为空
      previousId = null;
    }
    content = reason.checkedItem.default_content ? JSON.parse(reason.checkedItem.default_content) : null;
    const params = {
      map_id: this.mapJson.id,
      mini_program_id: reason.checkedItem.mini_program_id,
      content: content,
      previous: previousId,
      version: reason.checkedItem.recommend
    };

    this.httpService.getData(params, true, 'execute', 'e8fdedfa-3a3f-43cd-835d-35a1cf705e5f', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            const obj = ({} as any);
            if (data.data.root[0].content !== '') {
              const json = data.data.root[0].content ? JSON.parse(data.data.root[0].content) : null;
              obj['properties'] = json;
            }
            obj['icon'] = reason.checkedItem.icon;
            obj['map_id'] = this.vistInfo.mapId;
            obj['title'] = reason.checkedItem.name;
            obj['type'] = reason.checkedItem.type;
            obj['map_mini_user_id'] = reason.checkedItem.user_id;
            obj['map_mini_program_id'] = data.data.root[0].map_mini_program_id;
            obj['id'] = data.data.root[0].mini_program_id;
            obj['status'] = data.data.root[0].status;
            obj['recommend'] = reason.checkedItem.recommend;
            obj['content'] = reason.checkedItem.default_content;
            // obj['current_version'] = reason.checkedItem.recommend; // 添加的小程序当前版本必须是推荐版本
            this.programData.push(obj);
            // 将小程序放入地图样式中
            this.mapJson.metadata.apps = this.programData;
            // 启用加入的小程序
            this.update(obj, obj['recommend']);
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '小程序添加成功！', 2000);
            this.toastService.toast(toastCfg);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '添加小程序失败了，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  // 删除小程序
  deleteProgram(item: any) {
    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.type = 11;
    modalRef.componentInstance.keyConfig = {
      title: '删除小程序',
      view: '确定要删除小程序?'
    };
    modalRef.result.then((result) => {
      this.isOpen = false;
      const data = {map_mini_program_id: item.map_mini_program_id};
      this.httpService.getData(data, true, 'execute', 'd3c6268d-5b43-461f-bab1-c69c376c4c37', '')
        .subscribe(
          () => {
            this.programData.map((value: any, index: any) => {
              if (value.map_mini_program_id === item.map_mini_program_id) {
                this.isOpen = false;
                this.programData.map((v: any) => {
                  if (v.map_mini_program_id === item.map_mini_program_id) {
                    this.mapObj.removeAppByInstanceId(item.map_mini_program_id);
                  }
                });
                this.programData.splice(index, 1);
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 2000);
                this.toastService.toast(toastCfg);
                return;
              }
            });

            this.mapJson.metadata.apps.forEach((v: any, i: number) => {
              if (item.map_mini_program_id === v.map_mini_program_id) {
                this.mapJson.metadata.apps.splice(i, 1);
                return;
              }
            });
          }
        );
    }, (reason) => {
    });
  }

  // 切换滑动
  toggleSlide() {
    this.isOpen = !this.isOpen;
  }


  // 打开配置面板
  liClick(item: any, index: any, panelShow: boolean) {
    this.coverShow = true;
    // 配置面板中选择小程序版本的下拉列表
    const postData = {mini_program_id: item.id};
    const versionList = [];
    let versionDeleted = true;
    let description;
    // 判断小程序是否已被删除，如果没有被删除，则请求版本列表和json配置
    if (item.status !== -1) {
      // 获取版本列表
      this.httpService.getData(postData, true, 'execute', '957f3672-668e-4107-a900-52be1ebf8f62', '')
        .subscribe(
          (data: any) => {
            // 给版本下拉框列表创建数据
            const versionData = data.data;
            const recomdVersion = {};
            versionData.forEach((v: any) => {
              if (v.type === 1) {
                const obj = {};
                if (item.recommend === v.version) {
                  obj['label'] = '推荐版本';
                  obj['value'] = v.version + '-recommand';

                  recomdVersion['label'] = v.version + '(推荐)';
                  recomdVersion['value'] = v.version;
                  recomdVersion['timestamp'] = v.update_time;
                  recomdVersion['description'] = v.description;
                  versionList.push(recomdVersion);
                } else {
                  obj['label'] = v.version;
                  obj['value'] = v.version;
                }

                obj['timestamp'] = v.update_time;
                obj['description'] = v.description;
                versionList.push(obj);

                // 判断用户当前使用的版本是否被删除，如果版本列表中的版本号与当前版本匹配，则当前版本未被删除
                if (item.current_version) {
                  if (item.current_version === v.version) {
                    versionDeleted = false;
                    description = v.description;
                  }
                } else {
                  if (item.recommend === v.version) {
                    versionDeleted = false;
                    description = v.description;
                  }
                }
              }
            });

            // 给版本下拉框列表赋值
            this.jsonShow.versionList = versionList;
            this.jsonShow.versionDesc = description;
            // 用户未手动选择版本时，current_version为null
            debugger;
            if (item.current_version) {
              this.jsonShow.version = item.current_version;
              this.versionNo = item.current_version;
            } else {
              this.jsonShow.version = item.recommend + '-recommand';
              this.versionNo = null;
            }

            // 如果加载的版本已被删除
            if (versionDeleted) {
              this.coverShow = false;
              this.jsonShow.versionList.push({label: item.current_version, value: item.current_version, disabled: true});
              this.jsonShow.versionDeleted = true;
              this.jsonComponent.jsonData = '';
              this.jsonShow.schema = {};
            } else {
              this.showJson(item);
              if (this.jsonShow.versionDeleted) {
                this.jsonShow.versionDeleted = false;
              }
            }

            // 切换下拉列表中版本时新版本推荐提示的显隐
            for (let a = 0; a < this.jsonShow.versionList.length; a++) {
              if (this.jsonShow.version === this.jsonShow.versionList[a].value) {
                for (let b = 0; b < this.jsonShow.versionList.length; b++) {
                  if (this.jsonShow.versionList[a].timestamp < this.jsonShow.versionList[b].timestamp) {
                    this.jsonShow.newVersion = true;
                    return;
                  } else {
                    this.jsonShow.newVersion = false;
                    return;
                  }
                }
              }
            }

          }
        );
    } else {
      // 清空小程序面板中的版本、配置、josn
      this.jsonComponent.jsonData = '';
      this.jsonShow.schema = {};
      this.jsonShow.version = '';
      this.coverShow = false;
    }

    // 原有的打开配置面板
    this.programInfo = item;
    if (panelShow) {
      this.oindex = index;
    }
    if (!this.isOpen && panelShow) {
      this.isOpen = true;
    }
  }


  // 请求json数据
  showJson(item: any) {
    // 需修改version
    // 给‘代码编辑’模块赋值json
    this.jsonComponent.jsonData = JSON.stringify(item.properties, null, 4);
    const postData = {
      mini_program_id: item.id,
      version: item.current_version ? item.current_version : item.recommend
    };
    this.httpService.getData(postData, true, 'app', 'JSONshow', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.coverShow = false;
            if (data.data !== '' && data.data !== null && data.data !== undefined) {
              this.schema = JSON.parse(data.data);
              if (this.jsonShow) {
                this.jsonShow.editorInit(this.schema);
              }
            } else { // 当请求的json数据为空时
              this.schema = {group: []};
              this.jsonShow.editorInit(null);
            }
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }

        });
  }


  // 保存修改数据
  getUserData() {
    // 强制从编辑配置项获取数据并赋值给上面的配置显示器
    const self = this;
    let json;
    if (this.jsonShow.schema.modal) {
      json = this.jsonComponent.jsonData ? JSON.parse(this.jsonComponent.jsonData) : null;
    } else {
      json = this.jsonShow.editor.getValue();
    }

    if (!this.jsonComponent.validateJson()) { // 校验配置项中的json
      return;
    }
    const data = {
      status: this.programInfo.status, // 1启用 0禁用
      content: json,
      map_mini_program_id: this.programInfo.map_mini_program_id,
      version: this.versionNo
    };
    this.mapJson.metadata.apps.map(function (item: any, index: any) {
      if (item.map_mini_program_id === self.programInfo.map_mini_program_id) {
        item.properties = json;
      }
    });
    this.httpService.getData(data, true, 'execute', '83a0f98e-cd3f-41d6-9a65-6455c7e1ad07', '')
      .subscribe(
        (res: any) => {
          if (res.status > 0) {
            const version = this.versionNo || this.programInfo['recommend'];
            if (this.programInfo.status === 1) { // 如果小程序当前为已启用状态
              this.update(this.programInfo, version);
            } else { // 如果小程序当前为禁用状态
              this.enableUse(this.programInfo);
            }
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '应用成功!', 2000);
            this.toastService.toast(toastCfg);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', res.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  // 点击禁用按钮执行下面方法
  enableUse(v: any) {
    const self = this;
    this.programData.map(function (item: any) {
      if (item.map_mini_program_id === v.map_mini_program_id) {
        item.status = 1;
        self.update(v, v.recommend);
      }
    });

    const data = {
      status: 1, // 1启用 0禁用
      content: v.properties,
      map_mini_program_id: v.map_mini_program_id,
      version: this.version
    };
    this.httpService.getData(data, true, 'execute', '83a0f98e-cd3f-41d6-9a65-6455c7e1ad07', '')
      .subscribe(
        (res: any) => {
          if (res.status > 0) {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '已启用小程序', 2000);
            this.toastService.toast(toastCfg);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', res.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        }
      );

  }

  // 点击启用按钮执行下面方法
  unableUse(v: any) {
    this.isOpen = false;
    const self = this;
    this.programData.map(function (item: any) {
      if (item.map_mini_program_id === v.map_mini_program_id) {
        item.status = 0;
        self.mapObj.removeAppByInstanceId(item.map_mini_program_id);
      }
    });

    const data = {
      status: 0, // 1启用 0禁用
      content: v.properties,
      map_mini_program_id: v.map_mini_program_id,
      version: this.version
    };
    this.httpService.getData(data, true, 'execute', '83a0f98e-cd3f-41d6-9a65-6455c7e1ad07', '')
      .subscribe(
        (res: any) => {
          if (res.status > 0) {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '已禁用小程序', 2000);
            this.toastService.toast(toastCfg);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', res.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  // 添加、更新小程序
  update(item: any, version: string) {
    const app = {
      id: item.id,
      map_mini_program_id: item.map_mini_program_id,
      title: item.title,
      description: item.description,
      properties: item.properties,
      map_mini_user_id: item.map_mini_user_id,
      // version: item.recommend
      version: version
    };
    this.mapObj.addApp(app);
  }

  // 接收子组件json.components传来的参数-当‘编辑配置’中数据改变时，更新上面的json配置项
  receiveJsonChange(data: any) {
    if (this.jsonShow) {
      if (this.jsonShow.schema.modal && data) {
        this.jsonShow.smallProgram = JSON.parse(data);
      }
    }
  }

  // 接收子组件传来的参数-当配置项数据改变时，更新‘编辑配置’中的数据
  receiveChangeSetting(data: any) {
    if (this.jsonComponent) {
      this.jsonComponent.jsonData = JSON.stringify(data, null, 4);
    }
  }

  // 接收子组件传来的版本参数
  receiveChangeVersion(data: any) {
    this.versionNo = data;
    if (this.programInfo.recommend === data) {
      this.version = null;
    } else {
      this.version = data;
    }

    this.programData.forEach((item: any, index: any) => {
      if (index === this.oindex) {
        item.current_version = data;
      }
    });
  }

  // 子组件选择小程序版本时显示隐藏遮罩层
  receiveShowCover(data: any) {
    this.coverShow = data;
  }


}
