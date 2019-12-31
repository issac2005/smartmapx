import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {HttpService} from '../../s-service/http.service';
import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {PopueComponent} from '../modal/data-popue.component';
import {Router} from '@angular/router';
// 导入服务
import {AppService} from '../../s-service/app.service';
// 吐司
import {DataStorage, LocalStorage} from '../../s-service/local.storage';
import {toError, toLog, setObject, set} from '../../smx-component/smx-util';
import {ToastService, ToastConfig, ToastType} from '../../smx-unit/smx-unit.module';

@Component({
  selector: 'app-data-home',
  templateUrl: './data-home.component.html',
  styleUrls: ['./data-home.component.scss']
})


export class DataHomeComponent implements OnInit, OnDestroy {

  @Input() keyConfig: any; // 信息配置
  @Input() paddingValue: any; // 居中配置
  @Output() scrollLoad = new EventEmitter();
  @Output() addNum = new EventEmitter();
  @ViewChild('outputCsv', {static: false}) outputCsv: any;   // csv输出对象
  createTableConfig: any;
  @ViewChild('smxTable', {static: false}) smxTable: any;   // 表格

  types: any[] = [];
  public dataType: any;
  public dataList: any[];
  public searchKey: string; // 模态框回调
  public closeResult: string; // 模态框回调
  bodyHidth: number;
  loading = true;
  mapsearchEvent: any;
  midName: any; // 处理统计图上一步后，重新选择统计图后默认名称没有修改的问题，用来存储原始数据源名称
  midData: any; // 处理栅格上一步后模态框关闭的问题，用来存储开始创建的时候，模态框的配置信息
  saveData: any; // 处理上一步模态框里数据回显的问题，用来存储在模态框里填入的数据
  serviceData: any; // 服务发布所选择的资源

  constructor(public httpService: HttpService,
              private modalService: SmxModal,
              private appService: AppService,
              public toastService: ToastService,
              private ls: LocalStorage,
              public router: Router,
              private ds: DataStorage) {
    this.mapsearchEvent = this.appService.mapsearchEventEmitter.subscribe((value: any[]) => {
      if (value) {
        if ((value as any).type !== this.dataType) {
          this.dataList = [];
        }
        setTimeout(() => {
          this.loading = false;
          this.dataType = (value as any).type;
          this.dataList = (value as any).dataList;
          this.searchKey = (value as any).searchKey;
        }, 50);
      }
    });
  }


  ngOnInit() {
    console.log(this.keyConfig);

  }


  ngOnDestroy() {
    this.mapsearchEvent.unsubscribe();
  }

  /**
   * 背景图替换
   * @param type
   * @returns {string}
   */
  getUrl(item: any, v: any) {

    let url = './assets/source-img/none.jpg';

    if (v === 'da') { // 数据
      switch (item.geo_type) {
        case '':
        case 0:
          url = './assets/source-img/data/attribute.png';
          break;
        case 'POINT' :
        case 10 :
          url = './assets/source-img/data/point.png';
          break;
        case 'LINESTRING' :
        case 20 :
          url = './assets/source-img/data/line.png';
          break;
        case 'POLYGON' :
        case 30 :
          url = './assets/source-img/data/polygon.png';
          break;
      }
    }

    if (v === 'en') { // 方案
      switch (item.operation_type) {
        case 'delete':
          url = './assets/source-img/en/delete.png';
          break;
        case 'update':
          url = './assets/source-img/en/update.png';
          break;
        case 'insert':
          url = './assets/source-img/en/insert.png';
          break;
        case 'query':
          url = './assets/source-img/en/select.png';
          break;
        case 'select':
          url = './assets/source-img/en/query.png';
          break;
        case 'selects':
          url = './assets/source-img/en/selects.png';
          break;
      }
    }


    if (v === 'ap') {  // 小程序
      switch (item.type) {
        case 1:
          url = './assets/source-img/miniApp/1_bg.png';
          break;
        case 2:
          url = './assets/source-img/miniApp/2_bg.png';
          break;
        case 3:
          url = './assets/source-img/miniApp/3_bg.png';
          break;
        case 4:
          url = './assets/source-img/miniApp/4_bg.png';
          break;
      }
    }

    if (v === 'icon') {  // 图标
      url = item.url;
    }

    if (v === 'map' || v === 'geo' || v === 'sta' || v === 'raster' || v === 'plot') { // 地图
      if (item.thumbnail && item.thumbnail !== '') {
        url = '/uploadfile/' + item.thumbnail;
      } else {
        url = './assets/source-img/zwfb_bg.png';
      }
    }

    if (v === 'service') {
      switch (item.state) {
        // 0表示创建中,11表示打包完成，1表示未部署，2表示重新上传后未更新部署,10表示已部署，3表示正在部署，-1表示部署失败,-2表示打包失败
        case 0:
          url = './assets/source-img/service/service-fbz.gif';
          break;
        case 1:
          url = './assets/source-img/service/service-wbs.png';
          break;
        case 2:
          url = './assets/source-img/service/service-wbs.png';
          break;
        case 3:
          url = './assets/source-img/service/service-bsz.gif';
          break;
        case 10:
          url = './assets/source-img/service/service-ybs.png';
          break;
        case 11:
          url = './assets/source-img/service/service-ybs.png';
          break;
        case -1:
          url = './assets/source-img/service/service-bssb.png';
          break;
        case -2:
          url = './assets/source-img/service/service-fbsb.png';
          break;

        default:
          url = './assets/source-img/service/service-ybs.png';
          break;
      }
    }

    return url;
  }

  /**
   * @param mapId
   */
  public editData(item: any) {
    if (item.isedit === 0) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '您没有编辑权限！', 2000);
      this.toastService.toast(toastCfg);
    } else {

      this.setCurrentStatus();

      if (item.geo_type !== null || item.geo_type !== undefined) {
        item['entity_type'] = item.geo_type === 0 ? 1 : 2;
      }


      if (this.dataType) {
        item['data_type'] = this.dataType === 'sharedata' || this.dataType === 'sharedata_search' ? 'sharedata' : 'mydata';
      }

      item['visit_type'] = 0;


      if (this.keyConfig.type === 'da') {
        setObject('data_info', item);
        this.router.navigate(['/app/data'], {queryParams: {type: 4}});
      }

      if (this.keyConfig.type === 'ap') {
        if (item.isedit === 1 || item.isedit === 2) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '您没有编辑权限！', 2000);
          this.toastService.toast(toastCfg);
        } else {
          setObject('appsInfo', item);
          this.router.navigate(['/app/programEditor']);
        }
      }

      // 路由传参，用于退出继续停留在查找界面
      if (this.keyConfig.type === 'en') {
        setObject('enInfo', item);
        this.router.navigate(['/app/enDataSchema'], {
          queryParams: {gobanckKey: this.searchKey}
        });
      }

      if (this.keyConfig.type === 'map') {
        // 参数
        const options = {
          type: 'map',
          mapId: item.map_id,
          isEdit: 1,
          version: 'current',
          mapName: item.name,
          user_id: item.user_id
        };

        // this.toMapEditor(options); // 进入编辑
        setObject('visitInfo', options);
        this.router.navigate(['/app/editor']);
      }

      if (this.keyConfig.type === 'sta') {
        const style = JSON.parse(item.layer_styles);
        setObject('data_info', {
          service_event_parameters_id: item.service_event_parameters_id,
          service_event_id: item.service_event_id,
          event_type: item.event_type,
          entity_id: item.entity_id,
          visit_type: 0,
          sta_type: style[0].layer_statistics_id,
          layer_style_id: style[0].layer_style_id,
          type: 'sta',
          layer_id: item.layer_id,
          version: 'current',
          geo_type: item.geo_type,
          name: item.name,
          description: item.description,
          layer_style_name: style[0].name,
          class_name: item.class_name
        });
        this.router.navigate(['/app/statistics'], {queryParams: {type: 5}});

      }
      if (this.keyConfig.type === 'geo') {
        const style = JSON.parse(item.layer_styles);
        const options = {
          type: 'geo',
          layer_id: item.layer_id,
          isEdit: 1,
          version: 'current',
          service_event_id: item.service_event_id,
          geo_type: item.geo_type,
          layer_style_id: style[0].layer_style_id,
          change_layer_type: style[0].release_time
        };

        setObject('data_info', {
          service_event_parameters_id: item.service_event_parameters_id,
          service_event_id: item.service_event_id,
          event_type: item.event_type,
          entity_id: item.entity_id,
          layer_id: item.layer_id,
          name: item.name,
          description: item.description,
          visit_type: 0,
          class_name: item.class_name,
          layer_style_id: style[0].layer_style_id,
          layer_style_name: style[0].name,
        });
        setObject('visitInfo', options);
        this.router.navigate(['/app/geography'], {queryParams: {type: 6}});

      }

      // 编辑标绘地图
      if (this.keyConfig.type === 'plot') {
        const options = {
          type: 'plot',
          plotId: item.plot_id,
          isEdit: 1,
          version: 'current',
          mapName: item.name,
          user_id: item.user_id,
          entity_id: item.entity_id
        };


        setObject('visitInfo', options);
        this.router.navigate(['/app/plotEditor']);
      }


      if (this.keyConfig.type === 'raster') {
        const style = JSON.parse(item.layer_styles);
        setObject('data_info', {
          visit_type: 0,
          layer_style_id: style[0].layer_style_id,
          type: 100,
          layer_id: item.layer_id,
          version: style[0].release_time,
          name: item.name,
          description: item.description,
          layer_style_name: style[0].name,
          class_name: item.class_name
        });
        this.router.navigate(['/app/RasterHome']);
      }

    }
  }


  /**
   *  查看数据
   * @param mapIdany
   */
  public viewData(item: any) {

    this.setCurrentStatus();


    // 数据管理
    if (this.keyConfig.type === 'da') {
      setObject('data_info', {
        service_event_parameters_id: item.service_event_parameters_id,
        service_event_id: item.service_event_id,
        event_type: item.event_type,
        entity_id: item.entity_id,
        visit_type: 1, // 1 查看模式 0 编辑模式
        entity_type: item.geo_type === 0 ? 1 : 2,
        type: item.type,
        data_type: this.dataType === 'sharedata' || this.dataType === 'sharedata_search' ? 'sharedata' : 'mydata',
      });

      this.router.navigate(['/app/data'], {queryParams: {type: 4}});

    }


    // 企业查询方案
    if (this.keyConfig.type === 'en') {
      const enItem = {
        service_event_id: item.service_event_id,
        visit_type: 1, // 1 查看模式 0 编辑模式
        data_type: this.dataType === 'sharedata' || this.dataType === 'sharedata_search' ? 'sharedata' : 'mydata',
      };
      setObject('enInfo', enItem);
      this.router.navigate(['/app/enDataSchema']);
    }


    // 地图管理
    if (this.keyConfig.type === 'map') {
      if (this.isPublicStatus(item.release_time)) {
        const options = {
          type: 'map',
          mapId: item.map_id,
          isEdit: 0,
          version: item.release_time,
          mapName: item.name,
          url: this.getiframe('url', item.map_id, item.release_time),
          iframe: this.getiframe('iframe', item.map_id, item.release_time),
          visitCount: item.visit_count,
          description: item.description,
          create_time: item.cteate_time,
          update_time: item.update_time,
          user_id: item.user_id
        };


        // this.toMapEditor(options); // 进入查看地图

        setObject('visitInfo', options);
        this.router.navigate(['/app/editor']);

      }
    }

    // 标绘地图
    if (this.keyConfig.type === 'plot') {
      if (this.isPublicStatus(item.release_time)) {
        const options = {
          type: 'plot',
          mapId: item.defalut_map_id,
          plotId: item.plot_id,
          entity_id: item.entity_id,
          isEdit: 0,
          version: 'current',
          mapName: item.name,
          url: this.getiframe('url', item.plot_id, item.release_time),
          iframe: this.getiframe('iframe', item.plot_id, item.release_time),
          visitCount: item.visit_count,
          description: item.description,
          create_time: item.create_time,
          update_time: item.update_time,
          user_id: item.user_id
        };


        // this.toMapEditor(options); // 进入查看地图

        setObject('visitInfo', options);
        this.router.navigate(['/app/plotEditor']);
      }
    }


    // 小程序
    if (this.keyConfig.type === 'ap') {
      if (item.isedit === 1) { //  调用 1 查看 2 编辑 3
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '您没有查看权限！', 2000);
        this.toastService.toast(toastCfg);
      } else {
        item['visit_type'] = 1;
        setObject('appsInfo', item);
        this.router.navigate(['/app/programEditor']);
      }
    }


    if (this.keyConfig.type === 'sta') {
      const style = JSON.parse(item.layer_styles);
      if (this.isPublicStatus(style[0].release_time)) {
        setObject('data_info', {
          service_event_parameters_id: item.service_event_parameters_id,
          service_event_id: item.service_event_id,
          event_type: item.event_type,
          entity_id: item.entity_id,
          visit_type: 1,
          sta_type: style[0].layer_statistics_id,
          layer_style_id: style[0].layer_style_id,
          type: 'sta',
          layer_id: item.layer_id,
          version: style[0].release_time,
          geo_type: item.geo_type,
          name: item.name,
          description: item.description,
          layer_style_name: style[0].name,
          class_name: item.class_name
        });
        this.router.navigate(['/app/statistics'], {queryParams: {type: 5}});
      }

    }


    // 地理图层
    if (this.keyConfig.type === 'geo') {
      const style = JSON.parse(item.layer_styles);

      if (this.isPublicStatus(style[0].release_time)) {
        const options = {
          type: 'geo',
          layer_id: item.layer_id,
          isEdit: 0,
          service_event_id: item.service_event_id,
          geo_type: item.geo_type,
          layer_style_id: style[0].layer_style_id,
          version: style[0].release_time,
        };

        setObject('data_info', {
          service_event_parameters_id: item.service_event_parameters_id,
          service_event_id: item.service_event_id,
          event_type: item.event_type,
          entity_id: item.entity_id,
          layer_id: item.layer_id,
          name: item.name,
          description: item.description,
          visit_type: 1,
          class_name: item.class_name,
          layer_style_id: style[0].layer_style_id,
          layer_style_name: style[0].name,
        });


        // this.toGeoMap(options);


        setObject('visitInfo', options);
        this.router.navigate(['/app/geography'], {queryParams: {type: 6}});
      }
    }


    if (this.keyConfig.type === 'raster') {
      const style = JSON.parse(item.layer_styles);
      if (this.isPublicStatus(style[0].release_time)) {
        setObject('data_info', {
          visit_type: 1,
          layer_style_id: style[0].layer_style_id,
          type: 100,
          layer_id: item.layer_id,
          version: style[0].release_time,
          name: item.name,
          description: item.description,
          layer_style_name: style[0].name,
          class_name: item.class_name
        });
        this.router.navigate(['/app/RasterHome']);
      }
    }
  }


  /**
   * 新模态框管理器
   * @param n
   * @param e
   */
  openModal(n: any, e?: any, v?: any) {
    // 服务发布--下载服务 -- Ljy
    if (n.modal.type === 'service_download') { // 判断是否是服务发布下载
      if (e.path) { // 判断是否是新创建服务之后直接点击下载（新创建服务后e中没有path，对应path在backup_id中）
        this.httpService.open(window.location.origin + '/downloadfile/' + e.path);
      }else {
        this.httpService.open(window.location.origin + '/downloadfile/' + e.backup_id[0].path);
      }
      return;
    }

    // 分享时发布功能检测
    let release_time;
    if (e && n.modal.type === 14) {
      try {
        const style = JSON.parse(e.layer_styles);
        release_time = style[0].release_time;
      } catch (error) {
        release_time = e.release_time;
      }
      if (e.backup_id) { // 判断服务发布 -- Ljy
        if (!this.isServiceStatus(e.state)) {
          return;
        }
      }else if (e.version) { // 判断是否是小程序-刘超
        if (!this.isPublicStatus(e.version)) {
          return;
        }
      } else {
        if (!this.isPublicStatus(release_time)) {
          return;
        }
      }
    }

    // 给统计图添加默认名称
    if (v !== undefined && v.staName != null) {
      n.modal.config.view[0].value = this.midName;
      n.modal.config.view[0].value += '_' + v.staName;
      let str = n.modal.config.view[0].value;
      if (str.length > 12) {
        str = str.substring(0, 40);
        n.modal.config.view[0].value = str;
      }
    }
    // whx 把栅格的创建图层的模态框数据备份，用于上一步，显示模态框
    if (n.modal.type === 17) {
      this.midData = n;
    }
    // whx
    const config = n.modal.config ? JSON.parse(JSON.stringify(n.modal.config)) : null;
    const modalRef = this.createModal(n.modal.type, config, n.modal.event, n.modal.template);
    switch (n.modal.type) {
      case 10: // 添加
        modalRef.result.then((result) => {
          if (result === 'pre') {// 上一步
            if (v) {
              this.openModal(v.preModal, v);
            }
            // whx 在栅格创建图层的时候，点击上一步，模态框关闭，因为v里没有数据
            if (n.type === 17) {
              if (this.saveData[1][0].selectType === 101) {
                this.midData.modal.config.view.value = 1;
                this.midData.modal.config.view.children['1'] = this.saveData[1];
              }
              if (this.saveData[1][0].selectType === 105) {
                this.midData.modal.config.view.value = 2;
                this.midData.modal.config.view.children['2'] = this.saveData[1];
              }
              if (this.saveData[1][0].selectType === 106) {
                this.midData.modal.config.view.value = 3;
                this.midData.modal.config.view.children['3'] = this.saveData[1];
              }
              if (this.saveData[1][0].selectType === 109) {
                this.midData.modal.config.view.value = 4;
                this.midData.modal.config.view.children['4'] = this.saveData[1];
              }
              this.openModal(this.midData);
            }
            // whx

            // 服务发布 - 创建部署服务lc
            if (this.keyConfig.type === 'service') {
              const modal = document.getElementsByClassName('modal')[0];
              const modalBack = document.getElementsByClassName('modal-backdrop')[0];
              modal['style'].opacity = 1;
              modal['style'].zIndex = 1050;
              modalBack['style'].display = 'block';
            }

          } else {
            const body = this.getBody(result, n.modal.config.tag);
            if (result[0].element === 'icon_upload') {
              delete body.name;  // 接口不需要name参数
              if (this.ls.localStorage.userId === 'fm_system_operation') {
                body.type = 0;
              }
            }
            // 地图
            if (this.keyConfig.type === 'map') {
              body['status'] = 1;
              body['reference_map_id'] = v.checkedItem.map_id;
              body['reference_type'] = v.checkedItem.isCustom ? 10 : 1;
            }


            // 统计 地理
            if (this.keyConfig.type === 'geo' || this.keyConfig.type === 'sta') {
              body['type'] = this.keyConfig.type === 'geo' ? 200 : 10;
              body['minzoom'] = 0;
              body['maxzoom'] = 24;
              body['status'] = 1;
              body['layer_class_id'] = '19304440-6606-11e7-bd54-e3a9f18a16cb';
              body['service_event_id'] = v.checkedItem.service_event_id;
              body['sta_type'] = this.keyConfig.type === 'sta' ? v.statisticsType : null;
            }

            // 判断是不是标绘
            if (this.keyConfig.type === 'plot') {
              body['default_map_id'] = v.checkedItem.map_id;
            }

            // 栅格
            if (this.keyConfig.type === 'raster') {
              const source = this.dealRasterParams(e);
              // whx 添加创建图层的类型
              if (e[0].selectType && e[0].selectType === 101) {
                body['type'] = e[0].selectType;
              }
              if (e[0].selectType && e[0].selectType === 105) {
                body['type'] = e[0].selectType;
              }
              if (e[0].selectType && e[0].selectType === 106) {
                body['type'] = e[0].selectType;
              }
              if (e[0].selectType && e[0].selectType === 109) {
                body['type'] = e[0].selectType;
              }
              // whx
              body['layer_class_id'] = '19304440-6606-11e7-bd54-e3a9f18a16cb';
              // body['type'] = 100;
              body['minzoom'] = 0;
              body['maxzoom'] = 24;
              body['status'] = 1;
              body['source_url'] = source;
            }

            // 服务发布
            if (this.keyConfig.type === 'service') {
              const tempid = Date.now();
              body['backup_info'] = this.serviceData;
              body['name'] = result[0].value;
              body['description'] = result[1].value;
              body['user_id'] = '';
              body['temp_id'] = tempid;

              this.dataList.unshift({state: 0, name: result[0].value, temp_id: tempid});
            }

            this.postCreate(body, v);
          }
        }, (reason) => {
          if (this.keyConfig.type === 'service') {
            this.modalService.dismissAll();
          }
        });
        break;
      case 11: // 删除
        modalRef.result.then((result) => {
          this.postDelete(e, n);
        }, (reason) => {

        });
        break;
      case 12: // 修改
        modalRef.componentInstance.modalData = JSON.parse(JSON.stringify(e));
        modalRef.result.then((result) => {
          for (const l in e) {
            if (l) {
              e[l] = result[l];
            }
          }
          this.postUpdate(result);
        }, (reason) => {

        });
        break;
      case 13: // 信息
        if (this.keyConfig.type === 'sta') {
          e.layer_statistics_id = JSON.parse(e.layer_styles)[0].layer_statistics_id;
        }
        if (this.keyConfig.type === 'ap') {
          const postData = {mini_program_id: e.mini_program_id};
          this.httpService.getData(postData, true, 'execute', '957f3672-668e-4107-a900-52be1ebf8f62', '')
            .subscribe(
              (data: any) => {
                const versionData = data.data;
                const versiondata = [];
                versionData.forEach((vData: any, index: any) => {
                  if (vData.type === 1) {
                    const obj = {};
                    obj['versionNo'] = vData.version;
                    obj['versionDesc'] = vData.description;
                    versiondata.push(obj);
                  }
                });
                modalRef.componentInstance.modalData.recommend = e.recommend;
                modalRef.componentInstance.modalData.versiondata = versiondata;
              });
        }
        modalRef.componentInstance.modalData = e;
        break;
      case 14: // 分享
        modalRef.componentInstance.modalData = e;
        break;
      case 15: // 选择地图
        if (e) { // 返回回来
          modalRef.componentInstance.modalData = e;
        }

        modalRef.result.then((result) => {
          if (n.modal.config.independence === 2) { // 下一步
            result['preModal'] = n;
            // midName 记录选择的数据源的名称
            this.midName = result.checkedItem.description;
            if (n.modal.config.modal.type === 10) {
              if (n.title === '创建地图' || n.title === '创建标绘地图') {
                // 创建地图不添加默认名称
              } else {
                n.modal.config.modal.config.view[0].value = result.checkedItem.description;
              }
            }
            if (n.modal.config.modal.type === 20) {
              n.modal.config.modal.config.modal.config.view[0].value = result.checkedItem.description;
            }
            this.openModal(n.modal.config, null, result);
          }
        }, (reason) => {
        });
        break;
      case 17: // 分选
        modalRef.result.then((result) => {
          if (n.modal.tag === 'create-raster') {
            this.saveData = result;
            this.openModal(n.modal, result[1]);
          } else {
            this.selectType(result);
          }
        }, (reason) => {
        });
        break;
      case 20:
        v.geo_type = v.checkedItem.geo_type;
        modalRef.componentInstance.modalData = v;
        modalRef.result.then((result) => {
          if (result === 'pre') {
            this.openModal(v.preModal, v);
          } else {
            this.openModal(n.modal.config, null, v);
          }
        }, (reason) => {
        });
        break;
      case 23: // 服务发布 - 资源选择弹框“下一步”按钮事件 lc
        modalRef.componentInstance.outEvent.subscribe((data) => {
          let sourceSelected = false;
          for (const key of Object.keys(data)) {
            if (data[key].length > 0) {
              sourceSelected = true;
            }
          }

          if (sourceSelected) { // true 为已选中至少一个资源
            this.serviceData = data;
            this.openModal(n.modal.config, null);
            const modal = document.getElementsByClassName('modal')[0];
            const modalBack = document.getElementsByClassName('modal-backdrop')[0];
            // modal['style'].display = 'none !important';
            modal['style'].opacity = 0;
            modal['style'].zIndex = -1;
            modalBack['style'].display = 'none';
          } else {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '您还未选择要部署的服务' , 2000);
            this.toastService.toast(toastCfg);
          }
        });
        break;
      case 101:
        modalRef.result.then((result) => {
          if (result === 'pre') {// 上一步
            delete v.staName;
            this.openModal(v.preModal.modal.config, null, v);
          } else {
            const body = this.getBody(result, n.modal.config.tag);
            // 统计
            if (this.keyConfig.type === 'sta') {
              body['type'] = this.keyConfig.type === 'geo' ? 0 : 10;
              body['minzoom'] = 0;
              body['maxzoom'] = 24;
              body['status'] = 1;
              body['layer_class_id'] = '19304440-6606-11e7-bd54-e3a9f18a16cb';
              body['service_event_id'] = v.checkedItem.service_event_id;
              body['sta_type'] = this.keyConfig.type === 'sta' ? v.statisticsType : null;
            }
            this.postCreate(body, v);
          }
        }, (reason) => {
        });
        break;
    }
  }


  /**
   * 创建modal对象
   * @param type
   * @param config
   */
  createModal(type: any, config: any, event: any = 'none', template: any = 'none') {
    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.type = type; // 类型
    modalRef.componentInstance.keyConfig = config; // config
    if (event && event !== 'none') {
      modalRef.componentInstance.outEvent.subscribe(event, event);
    }

    if (template && template !== 'none') {
      modalRef.componentInstance.smxControl = template; // config
    }
    return modalRef;

  }

  /**
   * new新请求创建
   * @param body
   */
  postCreate(body: any, item: any) {
    this.httpService.getData(body, true, 'execute', this.keyConfig.create.url, 'create')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'create') {
            return;
          }

          // 创建图标
          if (this.keyConfig.type === 'icon' && (data as any).data) {
            this.dataList.unshift((data as any).data);
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '图标上传成功！', 2000);
            this.toastService.toast(toastCfg);
            this.addNum.emit();
          }


          // 创建地图
          if (this.keyConfig.type === 'map') {
            this.dataList.unshift({
              'map_id': (data as any).data.map_id,
              'name': body.name,
              'description': body.description,
            });

            const options = {
              type: 'map',
              mapId: (data as any).data.map_id,
              isEdit: 1,
              version: 'current',
              mapName: body.name
            };


            this.toMapEditor(options);

          }


          // 创建地理
          if (this.keyConfig.type === 'geo') {
            this.dataList.unshift({
              layer_id: (data as any).data.layer_id,
              name: body.name,
              description: body.description,
              service_event_id: item.checkedItem.service_event_id
            });


            setObject('visitInfo', {
              type: 'geo',
              layer_id: (data as any).data.layer_id,
              isEdit: 1,
              version: 'current',
              service_event_id: item.checkedItem.service_event_id,
              layer_style_id: (data as any).data.layer_id,
              geo_type: item.checkedItem.geo_type
            });
            setObject('data_info', {
              service_event_parameters_id: item.checkedItem.service_event_parameters_id,
              service_event_id: item.checkedItem.service_event_id,
              event_type: item.checkedItem.event_type,
              entity_id: item.checkedItem.entity_id,
              layer_id: (data as any).data.layer_id,
              name: body.name,
              description: body.description,
              layer_style_id: (data as any).data.layer_id,
              layer_style_name: body.name,
              visit_type: 0,
              class_name: '默认分类'
            });


            this.router.navigate(['/app/geography'], {queryParams: {type: 6}});
          }


          // 创建统计
          if (this.keyConfig.type === 'sta') {
            this.dataList.unshift({
              layer_id: (data as any).data.layer_id,
              name: body.name,
              description: body.description,
              service_event_id: item.checkedItem.service_event_id,
            });

            setObject('data_info', {
              service_event_parameters_id: item.checkedItem.service_event_parameters_id,
              service_event_id: item.checkedItem.service_event_id,
              event_type: item.checkedItem.event_type,
              entity_id: item.checkedItem.entity_id,
              visit_type: 0,
              sta_type: item.statisticsType,
              layer_style_id: (data as any).data.layer_id,
              type: 'sta',
              layer_id: (data as any).data.layer_id,
              version: 'current',
              geo_type: item.checkedItem.geo_type,
              name: body.name,
              description: body.description,
              layer_style_name: body.name,
              class_name: '默认分类'
            });
            this.router.navigate(['/app/statistics'], {queryParams: {type: 5}});

          }

          // 标绘地图
          if (this.keyConfig.type === 'plot') {
            this.dataList.unshift({
              'plot_id': (data as any).data.root[0].plot_id,
              'name': body.name,
              'description': body.description,
            });

            const options = {
              type: 'plot',
              plotId: (data as any).data.root[0].plot_id,
              isEdit: 1,
              version: 'current',
              mapName: body.name,
              entity_id: (data as any).data.root[0].entity_id
            };

            setObject('visitInfo', options);
            this.toMapEditor(options);
            // this.router.navigate(['app/plotEditor']);

          }

          if (this.keyConfig.type === 'raster') {
            this.dataList.unshift({
              layer_id: (data as any).data.layer_id,
              name: body.name,
              description: body.description
            });

            setObject('data_info', {
              visit_type: 0,
              layer_style_id: (data as any).data.layer_id,
              layer_id: (data as any).data.layer_id,
              version: 'current',
              type: body.type,
              name: body.name,
              description: body.description
            });
            this.router.navigate(['/app/RasterHome']);

          }

          // 发布服务
          if (this.keyConfig.type === 'service') {
            this.dataList.forEach((serItem: any, i: number) => {
              if (serItem.temp_id === body['temp_id']) {
                this.dataList.splice(i, 1, (data as any).data.backup_id[0]);
                return;
              }
            });

            // 轮询服务发布状态-- 正在发布、发布成功、发布失败
            // this.getServiceStatus(this.dataList[0]);
          }
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求出错,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );

  }

  /**
   * new请求删除数据
   * @param id
   */
  postDelete(e: any, n: any) {
    const body = ({} as any);
    /**
     * 现所有删除都不需要用'layer_id', 改用layer_style_id
     * 注：只有地理、统计、栅格改变，其他不变
     * update_user: ruansong
     * */
    if (n.old_id) {
      const layer_styles = JSON.parse(e.layer_styles)[0];
      body[n.old_id] = layer_styles[n.old_id];
      body[n.id] = e[n.id];
    } else {
      body[n.id] = e[n.id];
    }
    this.httpService.getData(body, true, 'execute', this.keyConfig.delete.url, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            return;
          }
          for (let i = 0; i < this.dataList.length; i++) {
            if (this.dataList[i][n.id] === body[n.id]) {
              this.dataList.splice(i, 1);
              break;
            }
          }
          this.appService.mapsDeleteEventEmitter.emit(this.dataList.length);
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功！', 2000);
          this.toastService.toast(toastCfg);
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求出错,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );

  }


  /**
   * new请求修改
   */
  postUpdate(body: any) {
    this.httpService.getData(body, true, 'execute', this.keyConfig.update.url, 'update')
      .subscribe(
        data => {
          for (let i = 0; i < this.dataList.length; i++) {
            if (this.dataList[i][this.keyConfig.update.id] === body[this.keyConfig.update.id]) {
              for (const v of this.keyConfig.update.params) {
                this.dataList[i][v[1]] = body[v[0]];
              }
              break;
            } else if (this.dataList[i]['service_event_id'] === body[this.keyConfig.update.id] && this.keyConfig.type === 'en') {
              for (const v of this.keyConfig.update.params) {
                this.dataList[i][v[1]] = body[v[0]];
              }
            }
          }

          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改成功！', 2000);
          this.toastService.toast(toastCfg);

        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求出错,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );

  }

  /**
   * 参数处理
   * @param {any[]} arr
   * @param tag
   * @returns {any}
   */
  getBody(arr: any[], tag?: any) {
    const body = ({} as any);

    // 普通参数处理
    if (!tag || tag === 0) {
      for (const v of arr) {
        body[v.alias] = v.value;
      }

      return body;
    }


    // 图标上传
    if (tag === 'icon_upload') {
      for (const v of arr) {
        if (v.alias === 'icon_upload') {
          body.path = v.value.path;
          body.url = v.value.url;
        } else {
          body[v.alias] = v.value;
        }
      }


      body.type = 1;
      return body;
    }
  }


  /**
   * 获取ifram
   * @param type
   * @param id
   * @param version
   */
  getiframe(type: any, id: any, version: any) {
    // const config = this.appService.properties;
    const config = <any>this.ds.get('properties');
    let baseUrl;
    if (config.serviceIP.basemap) {
      if (version !== '') {
        baseUrl = `${config.serviceIP.basemap}/show/show.html?mapID=${id}`;
        if (this.keyConfig.type === 'plot') {  // 如果是标绘地图--Ljy
          baseUrl = `${config.serviceIP.basemap}/show/plot.html?plotID=${id}`;
        }

        if (type === 'url') {
          return baseUrl;
        }
        if (type === 'iframe') {
          const ifurl = `src=${baseUrl}>`;
          return ifurl;
        }
      } else {
        return '';
      }
    }


  }

  /**
   * 获取二维码
   * @param id
   * @param version
   */
  getQc(item: any) {
    // const config = this.appService.properties;
    const config = <any>this.ds.get('properties');
    if (item.release_time !== '') {
      let baseUrl = `${config.serviceIP.basemap}/show/show.html?mapID=${item.map_id}`;
      if (item.hasOwnProperty('plot_id')) { // Ljy标绘地图二维码
        baseUrl = `${config.serviceIP.basemap}/show/plot.html?plotID=${item.plot_id}`;
      }
      // return url + '?mapID=' + item.map_id;
      return baseUrl;
    } else {
      return 'Unreleased!';
    }
  }


  /**
   * 滚动触发
   */
  handleScroll(event: any) {
    if (event.isReachingBottom) {
      this.scrollLoad.emit();
    }
  }


  // 获取地图url路径
  toMapEditor(options: any) {
    let postData;
    let url;
    if (options.type === 'plot') {
      postData = {version: options.version, plotID: options.plotId};
      url = 'getMapPlotStyle';
    } else {
      postData = {version: options.version, mapID: options.mapId};
      url = 'getMapStyle';
    }
    this.httpService.getData(postData, true, 'execute', url, 'em', 'em')
      .subscribe(
        (data: any) => {
          if ((data as any).status > 0) {
            options['style'] = data.data;
            // localStorage.setItem('visitInfo', JSON.stringify(options));
            setObject('visitInfo', options);
            if (options.type === 'plot') {
              this.router.navigate(['app/plotEditor']);
            }
            if (options.type === 'map') {
              this.router.navigate(['/app/editor']);
            }
          }
        },
        error => {
          toError(error);
        }
      );
  }


  /**
   * 保存当前状态
   */
  setCurrentStatus() {
    if (this.dataType === 'sharedata' || this.dataType === 'sharedata_search') {
      set('goback_share', '0');
    }
  }


  /**
   * 是否发布
   */
  isPublicStatus(version: any) {
    if (!version || version === '') {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', this.keyConfig.pubCheck ? this.keyConfig.pubCheck : '未发布！', 2000);
      this.toastService.toast(toastCfg);
      return false;
    } else {
      return true;
    }
  }

  /**
   * 服务发布--是否发布--Ljy
   */
  isServiceStatus(state: any) {
    if (state === -2 || state === -1 || state === 0 || state === 3) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', this.keyConfig.pubCheck ? this.keyConfig.pubCheck : '未发布！', 2000);
      this.toastService.toast(toastCfg);
      return false;
    } else if (state === 1 || state === 2 || state === 10 || state === 11) {
      return true;
    }
  }


// ----------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------非通用业务逻辑------------------------------------------------------ //
// ----------------------------------------------------------------------------------------------------------------------- //


  /**
   * 添加方案
   * @param body
   */
  createEn(body: any) {
    const item = {
      visit_type: 2, // 创建模式
      data_type: this.dataType === 'sharedata' || this.dataType === 'sharedata_search' ? 'sharedata' : 'mydata',

    };
    setObject('enInfo', item);
    this.router.navigate(['/app/enDataSchema']);
  }


  /**
   * 表格添加()
   */
  // insertItem() {
  //   this.smxTable.insertItem({'column_desc': '自定义名称', 'type': {type: 'sys_ui_c_text', component_data_type_id: 'fm_ui_input_text'}});
  // }

  // 上面是原来代码，下面王鹤鑫修改
  insertItem() {
    let num = 0;
    num = this.smxTable.datas.length - 2;
    this.smxTable.insertItem({
      'column_desc': '自定义字段' + num,
      'type': {type: 'sys_ui_c_text', component_data_type_id: 'fm_ui_input_text'}
    });
  }


  /**
   * 栅格处理栅格上传参数
   * @param e
   */
  dealRasterParams(e: any) {
    const source = ({} as any);
    for (const item of e) {
      if (item.tag === 'url') {
        source['type'] = 'raster';
        source['tiles'] = [item.value];
        source['tileSize'] = 256;
      }


      if (item.tag === 'image') {
        source['type'] = 'image';
        source['url'] = item.value;
      }

      if (item.tag === 'tileSize') {
        source['tileSize'] = item.value ? Number(item.value) : 256;
      }

      if (item.tag === 'leftTop') {
        if (!(source as any).coordinates) {
          source['coordinates'] = [];
        }
        const coor = item.value.split(',');
        source['coordinates'].push([Number(coor[0]), Number(coor[1])]);

      }
      if (item.tag === 'rightTop') {
        if (!(source as any).coordinates) {
          source['coordinates'] = [];
        }
        const coor = item.value.split(',');
        source['coordinates'].push([Number(coor[0]), Number(coor[1])]);

      }
      if (item.tag === 'rightBottom') {
        if (!(source as any).coordinates) {
          source['coordinates'] = [];
        }
        const coor = item.value.split(',');
        source['coordinates'].push([Number(coor[0]), Number(coor[1])]);

      }
      if (item.tag === 'leftBottom') {
        if (!(source as any).coordinates) {
          source['coordinates'] = [];
        }

        const coor = item.value.split(',');
        source['coordinates'].push([Number(coor[0]), Number(coor[1])]);
      }
    }

    return source;
  }


  /**
   * 加载自定义数据源中的类型
   */
  selectType(result) {
    this.httpService.getData({'parent_id': 'sys_column_type'}, true,
      'execute', '6a35661d-7a2c-4a75-b3f2-e3a82ed953e0', '1')
      .subscribe(
        data => {

          if ((data as any).status > 0) {
            const obj = [];
            for (let v = 0; v < (data as any).data.length; v++) {
              if ((data as any).data[v].item_name === '区域' || (data as any).data[v].item_name === '点') {
                (data as any).data.splice(v, 1);
              }
              obj.push({
                label: (data as any).data[v].item_name,
                value: (data as any).data[v].baseid
              });
            }
            this.types = obj;
            for (let i = 0; i < this.types.length; i++) {
              if (this.types[i].label === '线') {
                this.types.splice(i, 1);
              }
            }
          }

          // 自定义结构

          if (result && result[0] === 1) {
            this.dealCustomImportParams(result);
          }


          // csv导入
          if (result && result[0] === 2) {
            this.dealCsvImportParams(result);
          }

        },
        error => {
          toError(error);
        }
      );
  }


  /**
   * 处理CSV导入结构数据
   * @param result
   */
  dealCsvImportParams(result: any) {
    const data = {
      inputData: {
        inputColumns: result[1].fields,
        upload_file: result[1].upload_file.uploads
      },
      code: result[1].charset,
      class: 1,
      name: result[1].name
    };
    const modal = this.createModal(18, {title: '创建数据源'});
    modal.componentInstance.modalData = data;
    modal.result.then((res) => {
      this.transformCSV(res);
    }, (rea) => {
    });
  }


  /**
   * 处理自定义数据源结构参数
   * @param result
   */
  dealCustomImportParams(result: any) {
    let data = ({} as any);
    for (const view of result[1]) {
      view['disabled'] = true;
      if (view.element === 'radio') {
        for (const o of view.options) {
          if (o.value === view.value) {
            view.options = [];
            view.options.push(o);
            if (o.label === '属性数据') {
              data = [{
                'column_desc': '名称',
                'type': {type: 'sys_ui_c_text', component_data_type_id: 'fm_ui_input_text', disabled: false},
                disabled: false
              }, {
                'column_desc': '描述',
                'type': {type: 'sys_ui_c_text', component_data_type_id: 'fm_ui_input_text', disabled: false},
                disabled: false
              }];
            } else {
              const component_data_type_id = o.label === '面' ? 'fm_ui_polygon_geo' : o.label === '线' ?
                'fm_ui_line_geo' : 'fm_ui_point_geo';
              data = [{
                'column_desc': '空间字段',
                'type': {type: 'sys_ui_c_geo', component_data_type_id: component_data_type_id, disabled: true},
                disabled: true
              }, {
                'column_desc': '名称',
                'type': {type: 'sys_ui_c_text', component_data_type_id: 'fm_ui_input_text', disabled: false},
                disabled: false
              }, {
                'column_desc': '描述',
                'type': {type: 'sys_ui_c_text', component_data_type_id: 'fm_ui_input_text', disabled: false},
                disabled: false
              }];
            }
          }
        }
      }
    }
    result[1].push({
      element: 'c-control',
      isNull: true,
      control: 'table',
      cols: [
        {field: 'column_desc', header: '字段别名', reg: '^[\u4E00-\u9FA50-9A-Za-z_()]{1,40}$'},
        {field: 'type', header: '字段设置', type: 'custom'}
      ],
      pipe: 'ColumnType',
      datas: data,
      config: {deleteBtn: true}
    });
    this.createTableConfig = {
      title: '创建数据源',
      smxControl: {'table': this.outputCsv},
      view: result[1],
      submitDisabled: false
    };
    const modal = this.createModal(10, this.createTableConfig);
    modal.result.then((res) => {
      this.createCustomTable(result[1]);
    }, (rea) => {
    });
  }


  /**
   * 创建自定义数据表
   */
  createCustomTable(data: any) {
    const array = [];
    for (let i = 0; i < data[2].datas.length; i++) {
      if (data[2].datas[i].type === '点') {
        data[2].datas[i].type = 'postgres_point';
      } else if (data[2].datas[i].type === '线') {
        data[2].datas[i].type = 'postgres_line';
      } else if (data[2].datas[i].type === '面') {
        data[2].datas[i].type = 'postgres_polygon';
      }
      if (data[2].datas[i].length === '-') {
        data[2].datas[i].length = 4000;
      }
      if (data[2].isNull === true) {
        data[2].isNull = 0;
      } else {
        data[2].isNull = 1;
      }
      let obj = {
        'column_desc': data[2].datas[i].column_desc,
        'precision': data[2].datas[i].length,
        'null_able': data[2].isNull
      };
      obj = Object.assign(obj, data[2].datas[i].type);
      array.push(obj);
    }
    const databody = {
      'fields': array,
      'entity_desc': data[0].value
    };


    this.httpService.getData(databody, true, 'execute', '2d901cb4-84ea-46bd-bf49-5809cae70dac', '1')
      .subscribe(
        res => {
          if ((res as any).status < 0) {
            return;
          } else {
            this.appService.mapsDeleteEventEmitter.emit('add');
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '创建数据源成功!', 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
        }
      );
  }

  /**
   * 转换csv
   */
  transformCSV(data: any) {
    const postData = {
      'operation_type': 'create_entity_csv',
      'upload_file': data.inputData.upload_file,
      'entity_desc': data.name,
      'charset': data.code,
      'fields': []
    };
    for (const i of data.inputData.inputColumns) {
      if (i.use) {
        if (!i.output) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '请输入已选择的字段描述!', 2000);
          this.toastService.toast(toastCfg);
          return;
        }

        if (data.inputData.upload_file) {
          postData.fields.push({
            'name': i.name,
            'column_desc': i.output,
            'type': i.type,
            'length': i.length,
            'precision': '2',
            'ispk': i.ispk,
            'component_data_type_id': i.component_data_type_id,
            'config': i.config,
            'null_able': 1
          });
        } else {
          postData.fields.push({
            'name': i.name,
            'column_desc': i.output,
            'ispk': i.ispk,
            'component_data_type_id': i.component_data_type_id,
            'config': i.config
          });
        }
      }
    }


    for (const j of postData.fields) {
      j['isunique'] = j['ispk'];
      // 删除原来的键
      delete j['ispk'];
    }

    this.httpService.getData(postData, true, 'etl', 'setEntityColumns', '1')
      .subscribe(
        res => {
          if ((res as any).status < 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          const modalRef = this.createModal(19, {title: '数据转换', view: {label: '数据入库中,请耐心等待...'}});
          modalRef.componentInstance.modalData = {value: 0, max: 100};
          this.getResult((res as any).data.execution_id, modalRef);
        },
        error => {
        }
      );
  }


  /**
   * 转换后轮训结果
   * @param execution_id
   */
  getResult(execution_id: any, modalRef: any, value?: any) {
    this.httpService.getData({execution_id: execution_id}, true, 'etl', 'result', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }
          if (!(data as any).data.finished) {
            modalRef.componentInstance.modalData = {value: value ? value < 90 ? value + 10 : 90 : 10, max: 100};
            setTimeout(() => {
              this.getResult(execution_id, modalRef);
            }, 1000);
          } else {
            modalRef.componentInstance.modalData = {value: 100, max: 100};
            setTimeout(() => {
              modalRef.close((reason) => {
              });
              this.appService.mapsDeleteEventEmitter.emit('add');

            }, 1000);

          }
        },
        error => {
        }
      );
  }


  // *************************************************弃用********************************************* //
  // *************************************************弃用********************************************* //
  // *************************************************弃用********************************************* //
  // *************************************************弃用********************************************* //
  // *************************************************弃用********************************************* //
  // *************************************************弃用********************************************* //
  // *************************************************弃用********************************************* //
  // *************************************************弃用********************************************* //
  /**
   * @deprecated  已经弃用 不建议再使用 修改数据信息
   * @param e
   */
  public editDataInfo(n: any) {

    this.httpService.getData(n, true, 'execute', this.keyConfig.update.url, 'map')
      .subscribe(
        data => {

          for (let i = 0; i < this.dataList.length; i++) {
            if (this.dataList[i][this.keyConfig.update.id] === n[this.keyConfig.update.id]) {
              for (const v of this.keyConfig.update.params) {
                this.dataList[i][v[1]] = n[v[0]];
              }
              break;
            } else if (this.dataList[i]['service_event_id'] === n[this.keyConfig.update.id] && this.keyConfig.type === 'en') {
              for (const v of this.keyConfig.update.params) {
                this.dataList[i][v[1]] = n[v[0]];
              }
            }
          }
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '信息修改成功！', 2000);
          this.toastService.toast(toastCfg);

        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求出错,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  /**
   * @deprecated  已经弃用 不建议再使用 创建
   */
  createData(e: any) {
    if (!e.name) {
      // 地图名为null
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '名称不能为空！', 2000);
      this.toastService.toast(toastCfg);
    } else {

      const body = ({} as any);
      if (this.keyConfig.create.params) {
        for (const v in this.keyConfig.create.params) {
          if (v) {
            body[v] = e[this.keyConfig.create.params[v]];
          }
        }
      } else {
        return;
      }
      this.httpService.getData(body, true, 'execute', this.keyConfig.create.url, 'apps')
        .subscribe(
          data => {
            if ((data as any).status < 0 || (data as any).tag !== 'apps') {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据请求失败,请稍后再试！', 2000);
              this.toastService.toast(toastCfg);
              return;
            }

            if ((data as any).data.root[0] && this.keyConfig.type === 'ap') {
              this.dataList.unshift((data as any).data.root[0]);
              // 跳转编辑页面
              // localStorage.setItem('appsInfo', JSON.stringify((data as any).data.root[0]));
              setObject('appsInfo', (data as any).data.root[0]);
              // 跳转编辑页面
              this.router.navigate(['/app/programEditor']);
            }
          },
          error => {
            toError(error);
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
          }
        );
    }
  }


  /**
   * @deprecated  已经弃用 不建议再使用   弹窗
   */
  open(n: any, e: any) {
    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.keyConfig = this.keyConfig;
    switch (n) {
      case 'chooseMap':
        modalRef.componentInstance.type = 'chooseMap';
        modalRef.componentInstance.modalData = e || false;


        modalRef.result.then((result) => {
          // this.closeResult = `Closed with: ${}`;
        }, (reason) => {
          if (reason && reason !== 'close') {
            this.closeResult = `Dismissed ${this.open('create', reason)}`;
          }
        });
        break;
      case 'create':
        modalRef.componentInstance.type = 'create';
        modalRef.result.then((result) => {
          if (result && result !== 'close') {
            this.open(result, e);
          }
        }, (reason) => {
          if (reason && reason !== 'close') {
            const obj = Object.assign(e.checkedItem, reason);
            this.closeResult = `Dismissed ${this.createData(obj)}`;
          }
        });
        break;
      case 'update':
        modalRef.componentInstance.type = 'update';
        modalRef.componentInstance.modalData = this.getParams(this.keyConfig.update.params, e);
        modalRef.result.then((result) => {
          // this.closeResult = `Closed with: ${}`;
        }, (reason) => {
          if (reason && reason !== 'close') {
            // reason['id'] = e[this.keyConfig.id];
            // const obj = Object.assign(e, reason);
            this.closeResult = `Dismissed ${this.editDataInfo(reason)}`;
          }
        });
        break;
      case 'viewInfo':
        modalRef.componentInstance.type = 'viewInfo';
        modalRef.componentInstance.modalData = e;
        modalRef.result.then((result) => {
        }, (reason) => {

        });
        break;
      case 'shareAccess':
        modalRef.componentInstance.type = 'shareAccess';
        modalRef.componentInstance.modalData = e;

        modalRef.result.then((result) => {
          toLog(result);
        }, (reason) => {
          toLog(reason);
        });
        break;
    }

  }

  /**
   * @deprecated  已经弃用 不建议再使用
   * 参数处理
   * @param data
   * @param n
   * @returns {any}
   */
  getParams(data: any, n: any) {
    const body = ({} as any);
    if (data) {
      for (const v of data) {
        body[v[0]] = n[v[1]];
      }
    }

    return body;
  }


  regNoMatch(e: any) {
    if (e === '0') {
      this.createTableConfig.submitDisabled = true;
    } else {
      this.createTableConfig.submitDisabled = false;
    }

  }


  // 服务发布 - 服务创建完毕后，轮询请求服务的状态
  getServiceStatus(serviceItem: any) {
    // 向后台轮询服务状态
    // 0表示创建中,11表示打包完成（已部署状态），1表示未部署，10表示部署成功，3表示正在部署，-1表示部署失败
    // 当服务状态不为0的时候设置在列表中设置背景

    this.httpService.getData({start: 0, limit: 10}, true, 'execute', '06b992d7-b0c5-438e-89d1-9196a2808db5', '').subscribe(
      res => {
        (res as any).data.root.forEach((v: any, i: number) => {
          const a = (res as any).data.root;
          if (v.backup_id === serviceItem.backup_id) {
            if (v.state !== 0 && v.state !== 3) {
              if (v.state === 10) {
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '部署成功', 2000);
                this.toastService.toast(toastCfg);
              }
              serviceItem.state = v.state;
              return;
            } else {
              this.getServiceStatus(serviceItem);
            }
          }
        });
      },
      error => {
        console.log(error);
      }
    );
  }


  // 服务发布 - 部署
  deployService(item: any) {
    const originState = item.state;
    item.state = 3;
    // 执行部署接口请求
    const body = {backup_id: item.backup_id};
    this.httpService.getData(body, true, 'execute', '3525db6b-7153-4184-bf4b-3b6b76012ac2', '').subscribe(
      res => {
        if ((res as any).status > 0) {
          if ((res as any).data.backup[0].state === -1) {
            item.state = -1;
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '部署失败', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          if ((res as any).data.backup[0].state === 10) {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '部署成功', 2000);
            this.toastService.toast(toastCfg);
            item.state = 10;
          }

          // this.getServiceStatus(item);
        } else {
          item.state = -1;
          const toastCfg = new ToastConfig(ToastType.WARNING, '', (res as any).msg, 2000);
          this.toastService.toast(toastCfg);
          item.state = originState;
        }
      },
      error => {
      }
    );
  }

}
