import {Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild, Output, EventEmitter} from '@angular/core';
import {SmxActiveModal} from '../../smx-component/smx-modal/smx-modal.module';
import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {Router} from '@angular/router';
import {AppService} from '../../s-service/app.service';
import {DataStorage} from '../../s-service/local.storage';
import {toError, get} from '../../smx-component/smx.module';
// 类型组件
import {SmxInputInfoComponent} from './smx-input-info/smx-input-info.component';

import {getMapInstance} from '../../s-service/smx-map';
import * as DrawControl from '@smx/smartmapx-draw';
import html2canvas from 'html2canvas';
import {ICONNUM, SMXNAME} from '../../s-service/utils';

@Component({
  selector: 'app-data-modal',
  templateUrl: './data-popue.component.html',
  styleUrls: ['./data-popue.component.scss']
})

export class PopueComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() type: any; // 操作类型
  @Input() keyConfig: any;  // 配置文件
  @Input() modalData: any;  // 数据
  @Input() smxControl: any;  // 数据
  @Output() outEvent = new EventEmitter();  // 数据


  // 类型组件
  @ViewChild(SmxInputInfoComponent, {static: false}) siic: SmxInputInfoComponent;

  userName: any;
  dataShareUserList: any[] = [];
  isdasabled: boolean;  // 是否禁用分享按钮


  // 创建添加
  mymapChecked = true;
  create_flag = false;
  baseMapList: any[];
  checkedItem: any;
  searchKey: any;
  tag = 'mymap';  // 分类选择
  name = '';
  description = '';

  // 分页数据
  everyPageNum = 12;
  pageNum = 1;
  totalPage = 0;

  // 小程序类型
  apptype: any;
  appIcon: any; // 小程序背景图


  /***********************************************新模态框*****************************************************/
  imgFile: any; // 图片路径
  inputFile: any; // 图片文件
  mapNum = {
    baseMapNum: 0,
    staMapNum: 0
  }; // 地图数量


  viewMap: any;
  searchTip = '数据加载中...';


  /**********************************新模态框*************************************/

  geoType: number;   // 数据类型
  statisticsType = '';  // 统计图类型(信息,创建)


  // 统计图类型
  staList = [
    {
      id: '7154b538-3257-4c51-b1ec-cbfacafb05e5',
      name: '流向图',
      url: './assets/source-img/sta_assets/lxt2.gif',
      type: 'LINESTRING',
    },
    {
      id: '6a66b3a7-d49a-44a4-bd5f-374dc9a06c9c',
      name: '等级设色',
      url: './assets/source-img/sta_assets/djss.png',
      type: 'POLYGON',
    },
    {
      id: '22c8992e-9714-48cd-8795-e377a9117f36',
      name: '行政区域设色',
      url: './assets/source-img/sta_assets/xzqy.png',
      type: 'POLYGON',
    },
    {
      id: '70d9e333-a40c-49d0-a88c-fbf156a37766',
      name: '定点符号图',
      url: './assets/source-img/sta_assets/ddfh.png',
      type: 'POINT',
    },
    {
      id: 'd20fb4db-484b-4408-a59b-dc96812c6d5e',
      name: '柱状图',
      url: './assets/source-img/sta_assets/zzt.png',
      type: 'POINT',
    },
    {
      id: 'c40527b1-c55a-4922-9e2d-351897741583',
      name: '饼状图',
      url: './assets/source-img/sta_assets/pzt.png',
      type: 'POINT',
    },
    {
      id: 'b8e4c3c0-55ec-4c47-b28f-6b2572bd48cd',
      name: '灯光图',
      url: './assets/source-img/sta_assets/dgt.png',
      type: 'POINT',
    },
    {
      id: '1b42b204-a0a7-47a9-8ad3-934f03d2ed49',
      name: '热力图',
      url: './assets/source-img/sta_assets/rlt.png',
      type: 'POINT',
    },
    {
      id: '05e20d72-c000-4f59-af97-8adb31bcc522',
      name: '聚合图',
      url: './assets/source-img/sta_assets/jht.png',
      type: 'POINT',
    },
    {
      id: 'cb1a9c12-e64a-11e8-b3e0-0242ac120002',
      name: '图标符号图',
      url: './assets/source-img/sta_assets/ddfh.png',
      type: 'POINT',
    }
  ];

  createTableNameStatus = false;

  // 坐标
  leftTop: string;
  rightTop: string;
  rightBottom: string;
  leftBottom: string;

  // 服务发布tab标题
  serviceTab = [
    {name: '地图', desc: 'map'},
    {name: '图层', desc: 'layer'},
    {name: '小程序', desc: 'mini_program'},
    {name: '数据源', desc: 'data_source'},
    {name: '数据查询', desc: 'data_query_scheme'},
    {name: '秘钥', desc: 'secret_key'}
  ];
  oindex = 0;
  // 用户选择的发布资源数据
  serviceData = {
    map: [],
    layer: [],
    mini_program: [],
    data_source: [],
    data_query_scheme: [],
    secret_key: []
  };

  serviceParam = {
    currentTab: 'map'
  };
  showData: any; // 服务发布--元数据信息

  // 服务发布--元数据信息--Ljy
  changelist = 0;
  servicelist(index: any, desc: any) {
    this.changelist = index;
    this.oindex = index;
    this.showData = [];
    if (index === 0) {
      const info = this.modalData.data_info.map;
      for (let i = 0 ; i < info.length ; i++) {
        const obj = {
          name : info[i].name,
          service_event_id : info[i].map_id,
          createTime : this.formatDate(new Date(this.modalData.create_time * 1000))
        };
        this.showData.push(obj);
      }
    }else if (index === 1) {
      const info = this.modalData.data_info.layer;
      for (let i = 0 ; i < info.length ; i++) {
        const obj = {
          name : info[i].name,
          service_event_id : info[i].layer_id,
          createTime : this.formatDate(new Date(this.modalData.create_time * 1000))
        };
        this.showData.push(obj);
      }
    }else if (index === 2) {
      const info = this.modalData.data_info.mini_program;
      for (let i = 0; i < info.length; i++) {
        const obj = {
          name : info[i].name,
          service_event_id : info[i].mini_program_id,
          createTime : this.formatDate(new Date(this.modalData.create_time * 1000))
        };
        this.showData.push(obj);
      }
    }else if (index === 3) {
      const info = this.modalData.data_info.data_source;
      for (let i = 0; i < info.length; i++) {
        const obj = {
          name : info[i].name,
          createTime : this.formatDate(new Date(this.modalData.create_time * 1000))
        };
        this.showData.push(obj);
      }
    }else if (index === 4) {
      const info = this.modalData.data_info.data_query_scheme;
      for (let i = 0 ; i < info.length ; i++) {
        const obj = {
          name : info[i].name,
          service_event_id : info[i].service_event_id,
          createTime : this.formatDate(new Date(this.modalData.create_time * 1000))
        };
        this.showData.push(obj);
      }
    }else if (index === 5) {
      const info = this.modalData.data_info.secret_key;
      for (let i = 0 ; i < info.length ; i++) {
        const obj = {
          name : info[i].name,
          service_event_id : info.application_id,
          createTime : this.formatDate(new Date(this.modalData.create_time * 1000))
        };
        this.showData.push(obj);
      }
    }
  }


  /**
   * 背景图url
   */
  getUrl(type: any) {
    let url = '';
    switch (type) {
      case 10 :
      case 'POINT':
        url = './assets/img/point.png';
        break;
      case 20:
      case 'LINESTRING':
        url = './assets/img/line.png';
        break;
      case 30:
      case 'POLYGON':
        url = './assets/img/poygon.png';
        break;
    }
    return url;
  }




  constructor(public activeModal: SmxActiveModal,
              public smxModal: SmxModal,
              public httpService: HttpService,
              public toastService: ToastService,
              private router: Router,
              private appService: AppService,
              private ds: DataStorage) {

  }


  ngOnInit() {
    if (this.type === 'chooseMap') {
      if (this.modalData) {// 判断是否上一步
        // 判断标签
        this.tag = this.modalData.tag;
        this.create_flag = true;
        this.switchData();
      } else {
        this.getSystemMapList();
        // 获取右侧统计图数量
        this.getStaticMapNum();
      }
    } else if (this.type === 'shareAccess') {
      this.getShareUserList();
    } else if (this.type === 'create') {
      // 小程序图标默认选中
      if (this.keyConfig.create.modal.info.type) {
        this.apptype = this.keyConfig.create.modal.info.type.values[0];
      }
    } else if (this.type === 'update') {
      if (this.keyConfig.update.modal.info.type) {
        if (this.modalData.type && this.modalData.type !== '') {
          this.apptype = this.modalData.type;
        } else {
          this.apptype = this.keyConfig.update.modal.info.type.values[0];
        }
      }

    }


    // todo 处理统计三级跳跃第二部回显问题,后期需要优化
    if (this.type === 20) {
      if (this.modalData.statisticsType) {
        this.checkStatisticsType(this.modalData.statisticsType);
      }
    }

    this.isdasabled = false;

    if (this.type === 13) {
      // 服务发布--元数据信息--默认map列表--Ljy
      const info = this.modalData.data_info.map;
      this.showData = [];
      for (let j = 0; j < info.length; j++) {
        const obj = {
          name: info[j].name,
          service_event_id: info[j].map_id,
          createTime: this.formatDate(new Date(this.modalData.create_time * 1000))
        };
        this.showData.push(obj);
      }
    }

  }
  // 服务发布 -- 时间戳转日期格式 -- Ljy
  formatDate(now: any) {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    return year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;
  }

  ngOnDestroy() {
    if (this.viewMap) {
      this.viewMap.remove();
    }
  }

  ngAfterViewInit() {
    switch (this.type) {
      case 12: // 修改
        if (this.keyConfig.type === 1) { // 图标修改
          this.imgFile = this.modalData.url;
        }
        break;
      case 14: // 分享
        this.isdasabled = false;
        this.getShareList();
        break;
      case 15: // 选择地图
        if (this.modalData) {// 判断是否上一步
          this.tag = this.modalData.tag; // 判断标签
          this.create_flag = true;
          this.checkedItem = this.modalData;
          this.switchList();
        } else {
          this.getLeftList();
        }

        break;
      case 16: // 发布
        this.initMap();
        break;
      case 18: // csv
        if (this.modalData.name) {
          this.createTable();
        }
        break;
      case 22:
        this.modalData.leftTop = this.modalData.coordinates[0][0] + ',' + this.modalData.coordinates[0][1];
        this.modalData.rightTop = this.modalData.coordinates[1][0] + ',' + this.modalData.coordinates[1][1];
        this.modalData.rightBottom = this.modalData.coordinates[2][0] + ',' + this.modalData.coordinates[2][1];
        this.modalData.leftBottom = this.modalData.coordinates[3][0] + ',' + this.modalData.coordinates[3][1];
        break;

      case 23:
        this.tag = 'map';
        this.getTabList('map', this.keyConfig.url['mapQuery']);
        break;
    }
  }

  initMap() {
    this.viewMap = getMapInstance('release_map', {
      style: this.modalData.style,
      center: [this.modalData.center.lng, this.modalData.center.lat],
      zoom: this.modalData.zoom,
      bearing: this.modalData.bearing,
      pitch: this.modalData.pitch,
      preserveDrawingBuffer: true,
      appServerUrl: '/uploadfile/miniprogram', // 线上使用
    });
  }

  // 服务发布 - 资源选择弹框‘下一步’按钮事件
  createServiceNext() {
    this.outEvent.emit(this.serviceData);
  }

  /**
   * 获取小程序图标类型
   * @param v
   * @returns {string}
   */
  getAppIcon(v: any, tag: any) {
    let url = './assets/source-img/miniApp/query.png';
    let url_upload = './assets/source-img/miniApp/1_1.png';
    let type = '查询检索';

    switch (v) {
      case 1:
        url = './assets/source-img/miniApp/query.png';
        url_upload = './assets/source-img/miniApp/1_1.png';
        type = '查询检索';
        break;
      case 2:
        url = './assets/source-img/miniApp/data.png';
        url_upload = './assets/source-img/miniApp/2_2.png';
        type = '动态数据接入';
        break;
      case 3:
        url = './assets/source-img/miniApp/interaction.png';
        url_upload = './assets/source-img/miniApp/3_3.png';
        type = '交互';
        break;
      case 4:
        url = './assets/source-img/miniApp/sta.png';
        url_upload = './assets/source-img/miniApp/4_4.png';
        type = '统计分析';
        break;
    }

    if (tag === 'icon') {
      return url;
    } else if (tag === 'type') {
      return type;
    } else if (tag === 'upload') {
      return url_upload;
    }
  }


  // 查询共享用户列表
  getShareUserList() {
    const body = this.getParams(this.keyConfig.shareAccess.params, this.modalData);
    // body[this.keyConfig.shareAccess.id[0]] = this.modalData[this.keyConfig.shareAccess.id[1]];

    this.httpService.getData(body, true, 'execute', this.keyConfig.shareAccess.interface.queryUser, 'data')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'data') {
            return;
          }
          this.dataShareUserList = (data as any).data;
          this.isdasabled = false;
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求出错,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  // 添加用户
  shareAddUser() {
    // const userName = localStorage.getItem('user_id');
    const userName = get('user_id');
    if (userName === this.userName) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '不可共享给当前帐户！', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    for (const l of this.dataShareUserList) {
      if (l.login_name === this.userName) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '此用户已经共享！', 2000);
        this.toastService.toast(toastCfg);
        return;
      }
    }
    if (this.userName) {
      const body = this.getParams(this.keyConfig.shareAccess.params, this.modalData);
      body['login_name'] = this.userName;
      if (this.keyConfig.type === 'en') { // 数据查询方案分支处理
        body['entity_id'] = body['entity_id'];
      }


      this.isdasabled = true;
      this.httpService.getData(body, true, 'execute', this.keyConfig.shareAccess.interface.addUser, 'map')
        .subscribe(
          data => {
            if ((data as any).status < 0 || (data as any).tag !== 'map') {
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '共享失败,请稍后再试！', 2000);
              this.toastService.toast(toastCfg);
              this.isdasabled = false;
              return;
            } else {
              if ((data as any).data.count === 0) {
                const toast = new ToastConfig(ToastType.WARNING, '', '用户名不存在！', 2000);
                this.toastService.toast(toast);
                this.isdasabled = false;
                return;
              }

              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '当前数据源共享成功！', 2000);
              this.toastService.toast(toastCfg);
              this.getShareUserList();


            }

          },
          error => {
            toError(error);
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求出错,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            this.isdasabled = false;
          }
        );
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '   请输入您要添加的用户名！', 2000);
      this.toastService.toast(toastCfg);
    }

  }

  // 取消共享用户
  shareDeleteUser(v: any) {
    const body = ({} as any);
    body[this.keyConfig.shareAccess.share_id] = v[this.keyConfig.shareAccess.share_id];
    this.httpService.getData(body, true, 'execute', this.keyConfig.shareAccess.interface.deleteUser, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            return;
          } else {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除共享用户成功！', 2000);
            this.toastService.toast(toastCfg);
            this.getShareUserList();
          }
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '取消共享权限出错！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  // 编辑查看权限
  sharePermission(v: any) {
    const body = ({
      isview: v.isview,
      isedit: v.isedit,
    } as any);

    body[this.keyConfig.shareAccess.share_id] = v[this.keyConfig.shareAccess.share_id];

    this.httpService.getData(body, true, 'execute', this.keyConfig.shareAccess.interface.updatePermission, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据请求失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          } else {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '权限修改成功！', 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '权限修改失败！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  // 修改数据信息
  testUpdateData(activeModal: any) {

    if (this.modalData[this.keyConfig.update.params[1][1]]) {
      const test = SMXNAME.REG.test(this.modalData[this.keyConfig.update.params[1][1]]);

      if (test) {
        activeModal.dismiss(this.modalData);
      } else {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
        this.toastService.toast(toastCfg);
      }
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '名称不能为空!', 3000);
      this.toastService.toast(toastCfg);
    }
  }

  // 得到统计图层数量
  getStaticMapNum() {
    const body = {
      start: 0,
      limit: this.everyPageNum * this.pageNum
    };
    this.httpService.getData(body, true, 'execute', this.keyConfig.chooseMap.interface.queryRight, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.mapNum.staMapNum = (data as any).data.totalProperty;
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        });
  }

  // 得到左侧数据
  getSystemMapList() {
    // document.getElementById('list').addEventListener('scroll', this.onScrollHandle(this));
    const body = {
      start: 0,
      limit: this.everyPageNum * this.pageNum
    };
    this.httpService.getData(body, true, 'execute', this.keyConfig.chooseMap.interface.queryLeft, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.totalPage = (data as any).data.totalProperty;
          this.baseMapList = (data as any).data.root;
          if (this.baseMapList.length === 0) {
            this.searchTip = '未搜索到数据';
          } else {
            this.searchTip = '';
          }
          this.mapNum.baseMapNum = (data as any).data.totalProperty;

          // 默认选中状态
          if (this.create_flag) { // 上一步
            this.checkedItem = this.modalData.checkedItem;
            this.create_flag = false;
          } else {
            if (this.baseMapList[0]) {
              this.checkedItem = this.baseMapList[0];
              this.checkedItem['isCustom'] = false;
            } else {
              this.checkedItem = null;
            }
          }

        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  // 得到右侧数据
  getUserMapList() {
    const body = {
      start: 0,
      limit: this.everyPageNum * this.pageNum
    };
    this.httpService.getData(body, true, 'execute', this.keyConfig.chooseMap.interface.queryRight, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.totalPage = (data as any).data.totalProperty;
          this.baseMapList = (data as any).data.root;
          if (this.baseMapList.length === 0) {
            this.searchTip = '未搜索到数据';
          } else {
            this.searchTip = '';
          }

          // 默认选中状态
          if (this.create_flag) { // 上一步

            this.checkedItem = this.modalData.checkedItem;
            this.create_flag = false;

          } else {
            if (this.baseMapList[0]) {

              this.checkedItem = this.baseMapList[0];
              this.checkedItem['isCustom'] = false;

            } else {
              this.checkedItem = null;
            }
          }
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  /**
   * 切换分类
   * @param tag
   */
  public switchData() {
    if (this.searchKey && this.searchKey !== '') { // 带有关键字
      if (this.tag === 'mymap') {
        this.mymapChecked = true;
      } else if (this.tag === 'sharemap') {
        this.mymapChecked = false;
      }
      this.searchMap();
    } else { // 不带关键字
      this.everyPageNum = 12;
      this.pageNum = 1;
      this.totalPage = 0;
      if (this.tag === 'mymap') {
        this.mymapChecked = true;
        this.getSystemMapList();
      } else if (this.tag === 'sharemap') {
        this.mymapChecked = false;
        this.getUserMapList();
      }
    }
  }

  /**
   * 选中底图
   * @param e
   */
  public checkedBaseMap(v: any) {
    if (this.checkedItem) {
      this.checkedItem['isCustom'] = false;
    }
    this.checkedItem = v;
    this.checkedItem['isCustom'] = false;
  }

  /**
   * 清除搜索
   */
  public clearInput() {
    this.searchKey = '';
    this.searchTip = '';
    // 没有数据提示
    if (this.tag === 'mymap') {
      this.getSystemMapList();
    } else {
      this.getUserMapList();
    }
  }

  /**
   * 搜索
   */
  public searchMap() {
    if (this.searchKey) {
      let api;
      if (this.tag === 'mymap') {
        api = this.keyConfig.chooseMap.interface.searchLeft;
      } else {
        api = this.keyConfig.chooseMap.interface.searchRight;
      }
      this.httpService.getData({key: this.searchKey}, true, 'execute', api, 'map')

        .subscribe(
          data => {
            if ((data as any).status < 0 || (data as any).tag !== 'map') {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
              this.toastService.toast(toastCfg);
              return;
            }
            this.baseMapList = (data as any).data.root;

            // 没有数据提示
            if (this.baseMapList.length === 0) {
              this.searchTip = '未搜索到' + this.searchKey + '的数据';
            } else {
              this.searchTip = '';
            }

            // 默认选中状态
            if (this.baseMapList[0]) {

              this.checkedItem = this.baseMapList[0];
              this.checkedItem['isCustom'] = false;
            } else {
              this.checkedItem = null;
              this.checkedItem['isCustom'] = false;
            }

          },
          error => {
            toError(error);
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
          }
        );
    } else {
      if (this.tag === 'mymap') {
        this.getSystemMapList();
      } else {
        this.getUserMapList();
      }
    }
  }


  // 滚动条判断
  public handleScroll(event: any) {
    if (event.isReachingBottom) {
      if (!this.searchKey || this.searchKey === '') {
        if (this.everyPageNum * this.pageNum < this.totalPage) {
          this.pageNum = this.pageNum + 1;
          if (this.tag === 'mymap') {
            this.getSystemMapList();
          } else if (this.tag === 'sharemap') {
            this.getUserMapList();
          }

        }
      }
    }
  }


  /**
   * 选择类型
   * @param v
   */
  checkedIcon(v: any) {
    this.apptype = v;
    this.appIcon = this.getAppIcon(v, 'upload');
    if (this.type === 'update') {
      this.modalData.type = v;
      this.modalData.icon = this.getAppIcon(v, 'upload');
    }
  }


  /**
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


  // 复制成功
  copySuccess() {
    const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '复制成功！', 3000);
    this.toastService.toast(toastCfg);
  }


  // 创建名称验证
  testCreateMap(activeModal: any) {
    if (this.name) {
      const c = /^[\u4E00-\u9FA50-9A-Za-z_()]{1,12}$/;
      const test = SMXNAME.REG.test(this.name);
      if (test) {
        activeModal.dismiss({name: this.name, description: this.description, type: this.apptype, icon: this.appIcon});
      } else {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
        this.toastService.toast(toastCfg);
      }
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '名称不能为空!', 3000);
      this.toastService.toast(toastCfg);
    }
  }


  /**************************************************************new****************************************/


  /**
   * 上传图片
   * @param event
   */
  fileChangeEvent(e: any, m: any) {
    this.inputFile = e.target.files;
    m.value = e.target.files;
    const reader = new FileReader();


    for (const v of this.keyConfig.view) {
      if (v.alias === 'description') {
        // const s1 = this.inputFile[0].name.split('.');
        // v.value = s1[0];
        const index = this.inputFile[0].name.lastIndexOf('.');
        v.value = this.inputFile[0].name.substring(0, index);
        break;
      }
    }
    // 为文件读取成功设置事件
    reader.onload = (res) => {
      this.imgFile = (res as any).target.result;
    };

    // 正式读取文件
    reader.readAsDataURL(this.inputFile[0]);
  }


  /**
   * 取消图片上传
   */
  cancelFileChange(m: any) {
    this.imgFile = null;
    this.inputFile = null;
    m.value = null;
  }

  /**
   * 确认提交
   * @param tag
   */
  submit(tag: any, arr?: any[]) {
    switch (tag) {
      case 10: // 创建
      case 101: // 创建
        if (this.checkout(3, arr)) {
          if (this.keyConfig.tag === 'icon_upload') {// 符号上传
            this.inputFile = this.siic.getValue();
            this.uploadIcon(arr);
          } else {
            this.activeModal.close(arr);
            // 创建服务发布 - lc
            if (this.keyConfig.title === '创建部署服务') {
              this.smxModal.dismissAll();
            }
          }
        }
        break;
      case 17:
        if (this.checkout(1, arr)) {
          if (this.keyConfig.tag === 'cds' && this.keyConfig.view.value === 2) { // 文件上传
            this.uploadCSV(arr); // 上传csv
          } else if (this.keyConfig.tag === 'raster' && this.keyConfig.view.value === 4 && arr.length > 4) {  // 栅格处理
            this.tranRasterParams(arr);
            this.activeModal.close([1, arr]);
          } else {
            this.activeModal.close([1, arr]);
          }

        }
        break;
      case 12: // 修改
        if (this.keyConfig.type === 1) {// 符号修改
          this.updateIcon();
        } else {
          const verify2 = this.checkout(2, arr);
          if (verify2) {
            this.activeModal.close(this.modalData);
          }
        }
        break;
      case 16: // 发布图层
        html2canvas(document.querySelector('#release_map')).then((cavans) => {
          // document.body.appendChild(cavans);
          const imgUrl = (cavans as any).toDataURL('image/jpeg', 0.75);
          this.activeModal.close(imgUrl);
        });
        // const canvas = (document.getElementById('release_map') as any).getElementsByClassName('smartmapx-canvas');
        // const imgUrl = (canvas[0] as any).toDataURL('image/jpeg', 0.75);
        // this.activeModal.close(imgUrl);
        break;
      case 18: // 导出csv
        // todo
        // 点击确定时验证输入是否合法
        if (this.modalData) {
          if (this.modalData.name) {
            const test = SMXNAME.REG.test(this.modalData.name);
            if (!test) {
              const toastCfgs = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
              this.toastService.toast(toastCfgs);
              return;
            }
          } else {
            const toastCfgs = new ToastConfig(ToastType.WARNING, '', '名称不能为空!', 3000);
            this.toastService.toast(toastCfgs);
            return;
          }
        }
        for (const v of this.modalData.inputData.inputColumns) {
          if (v.use) {
            this.activeModal.close(this.modalData);
            return;
          }
        }
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '至少选择一条导出数据!', 2000);
        this.toastService.toast(toastCfg);
        break;
    }
  }


  /**
   * 校验
   * @param arr
   */
  checkout(tag: any, arr: any[]) {

    // 新建验证
    if (tag === 1) {
      for (const v of arr) {// 非空
        if (!v.isNull && !v.value) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', v.title + '不能为空!', 3000);
          this.toastService.toast(toastCfg);
          return false;
        }
      }

      for (const v of arr) {// 正则
        if (!v.isPass || v.isPass === 0) {
          continue;
        }

        if (v.isPass === 1) {
          const num = v.maxLength || 40;
          const c = new RegExp('^[\u4E00-\u9FA50-9A-Za-z_()]{1,' + num + '}$');
          if (!c.test(v.value)) {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '支持1-' + num + '个汉字 数字 字母 _ ()', 3000);
            this.toastService.toast(toastCfg);
            return false;
          }
        }


        if (v.isPass === 2) {
          const c = /^[0-9]{7}$/;
          if (!c.test(v.value)) {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '只支持7位数字编号!', 3000);
            this.toastService.toast(toastCfg);
            return false;
          }
        }
      }
    }


    // 修改验证
    if (tag === 2) {
      for (const v of arr) { // 非空
        if (!v.isNull && !this.modalData[v.alias]) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', v.title + '不能为空!', 3000);
          this.toastService.toast(toastCfg);
          return false;
        }
      }


      for (const v of arr) {// 正则
        if (!v.isPass || v.isPass === 0) { // 不约束
          continue;
        }

        if (v.isPass === 1) { // 名称验证
          let name;
          if (v.value) {
            name = v.value;
          } else {
            name = this.modalData[v.alias];
          }
          if (!SMXNAME.REG.test(name)) {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 3000);
            this.toastService.toast(toastCfg);
            return false;
          }
        }

        if (v.isPass === 2) { // 7位数字验证
          if (!ICONNUM.REG.test(v.value)) {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', ICONNUM.MSG, 3000);
            this.toastService.toast(toastCfg);
            return false;
          }
        }
      }

    }

    // todo 添加
    // 新版本编号由系统生成，不检测编号正确性，所以另里分支
    // updateUser: ruansong
    // 新建验证
    if (tag === 3) {
      for (const v of arr) {// 非空
        if (!v.isNull && !v.value) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', v.title + '不能为空!', 3000);
          this.toastService.toast(toastCfg);
          return false;
        }
      }
      for (const v of arr) {// 正则
        if (!v.isPass || v.isPass === 0) {
          continue;
        }
        if (v.isPass === 1) {
          const num = v.maxLength || 40;
          const c = new RegExp('^[\u4E00-\u9FA50-9A-Za-z_()]{1,' + num + '}$');
          if (!c.test(v.value)) {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '支持1-' + num + '个汉字 数字 字母 _ ()', 3000);
            this.toastService.toast(toastCfg);
            return false;
          }
        }
      }
    }

    return true;
  }


  /**
   * 图标上传
   */
  uploadIcon(arr: any[]) {
    // 文件上传服务
    this.httpService.makeFileRequest('/handler/sprite/upload.html',
      {}, this.inputFile, 'sprite').subscribe(
      data => {
        if ((data as any).status < 0) {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
          this.toastService.toast(toastCfg);
          return;
        }

        for (const v of arr) {
          if (v.alias === 'icon_upload') {
            v.value = (data as any).data[0];
            break;
          }
        }
        this.activeModal.close(arr);
      }
    );

  }

  /**
   * 图标修改
   */
  updateIcon() {
    if (!this.imgFile) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '图标不能为空!', 3000);
      this.toastService.toast(toastCfg);
      return;
    }
    if (!this.modalData['description']) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '图标名称不能为空!', 3000);
      this.toastService.toast(toastCfg);
      return;
    }
    if (!SMXNAME.REG.test(this.modalData['description'])) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 3000);
      this.toastService.toast(toastCfg);
      return;
    }


    if (!this.inputFile) {
      this.activeModal.close(this.modalData);
      return;
    }

    // 文件上传服务
    this.httpService.makeFileRequest('/handler/sprite/upload.html',
      {}, this.inputFile, 'sprite').subscribe(
      data => {
        if ((data as any).status < 0) {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
          this.toastService.toast(toastCfg);
          return;
        }

        this.modalData.url = (data as any).data[0].url;
        this.modalData.path = (data as any).data[0].path;
        this.activeModal.close(this.modalData);

      }, error => {
        toError(error);
      });
  }


  /**
   * 文件上传
   * @param arr
   */
  uploadCSV(arr: any[]) {
    this.httpService.makeFileRequest('/upload/1.0.0/etl/getEntityColumns',
      {charset: arr[1].value}, arr[0].value).subscribe(
      data => {
        if ((data as any).status < 0) {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
          this.toastService.toast(toastCfg);
          return;
        }


        const index = arr[0].value[0].name.lastIndexOf('.');
        const name = arr[0].value[0].name.substring(0, index);
        (data as any).data['name'] = name;
        this.activeModal.close([2, (data as any).data]);

      }
    );
  }

  /**
   * 得到iframe地址
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
        if (this.modalData.hasOwnProperty('plot_id')) {  // 如果是标绘地图--Ljy
          baseUrl = `${config.serviceIP.basemap}/show/plot.html?plotID=${id}`;
        }

        if (type === 'url') {
          return baseUrl;
        }


        if (type === 'iframe') {
          const ifurl = 'src=' + baseUrl + '>';
          return ifurl;
        }
      } else {
        return '';
      }
    }


  }


  /**
   * 获取分享列表
   */
  getShareList() {
    const body = {};
    body[this.keyConfig.view.id] = this.modalData[this.keyConfig.view.id];
    this.isdasabled = true;
    this.httpService.getData(body, true, 'execute', this.keyConfig.url.query, 'share')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'share') {
            return;
          }

          this.dataShareUserList = (data as any).data;
          this.isdasabled = false;
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求出错,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  /**
   * 分享用户
   */
  shareUser() {
    // const userName = localStorage.getItem('user_id');
    const userName = get('user_id');
    if (userName === this.userName) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '不可共享给当前帐户！', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    for (const l of this.dataShareUserList) {
      if (l.login_name === this.userName) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '此用户已经共享！', 2000);
        this.toastService.toast(toastCfg);
        return;
      }
    }


    if (this.userName) {
      const body = {};
      body[this.keyConfig.view.id] = this.modalData[this.keyConfig.view.id];
      body['login_name'] = this.userName;
      if (this.keyConfig.type === 'service') {
        body[this.keyConfig.view.id] = this.modalData[this.keyConfig.view.id];
        body['login_name'] = this.userName;
        body['update_user_id'] = this.modalData.user_id;
      }

      this.isdasabled = true;
      this.httpService.getData(body, true, 'execute', this.keyConfig.url.insert, 'share')
        .subscribe(
          data => {
            if ((data as any).status < 0 || (data as any).tag !== 'share') {
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '共享失败,请稍后再试！', 2000);
              this.toastService.toast(toastCfg);
              this.isdasabled = false;
              return;
            } else {

              if ((data as any).data.count === 0) {
                const toast = new ToastConfig(ToastType.WARNING, '', '用户名不存在！', 2000);
                this.toastService.toast(toast);
                this.isdasabled = false;
                return;
              }


              this.isdasabled = false;
              const info = (data as any).data.root[0];
              info['login_name'] = this.userName;
              this.dataShareUserList.push(info);
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '分享成功！', 2000);
              this.toastService.toast(toastCfg);


            }

          },
          error => {
            toError(error);
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求出错,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            this.isdasabled = false;
          }
        );
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '   请输入您要添加的用户名！', 2000);
      this.toastService.toast(toastCfg);
    }
  }

  /**
   * 删除用户
   */
  deleteShare(index: any) {
    const body = ({} as any);
    body[this.keyConfig.view.share_id] = this.dataShareUserList[index][this.keyConfig.view.share_id];
    this.httpService.getData(body, true, 'execute', this.keyConfig.url.delete, 'share')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'share') {
            return;
          }

          this.dataShareUserList.splice(index, 1);

          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除共享用户成功！', 2000);
          this.toastService.toast(toastCfg);


        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '取消共享权限出错！', 2000);
          this.toastService.toast(toastCfg);
        }
      );

  }


  /**
   * 修改用户权限
   */
  updateShare(v: any) {
    let body;
    if (v.istransfer) {
      body = ({isview: v.isview, isedit: v.isedit, istransfer: v.istransfer} as any);
    } else {
      body = ({isview: v.isview, isedit: v.isedit} as any);
    }


    body[this.keyConfig.view.share_id] = v[this.keyConfig.view.share_id];

    this.httpService.getData(body, true, 'execute', this.keyConfig.url.update, 'share')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'share') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据请求失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          } else {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '权限修改成功！', 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '权限修改失败！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  /**
   * 查询左侧列表
   */
  getLeftList() {
    const body = {
      start: 0,
      limit: this.everyPageNum * this.pageNum
    };
    this.httpService.getData(body, true, 'execute', this.keyConfig.url.queryLeft, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }

          this.totalPage = (data as any).data.totalProperty;
          this.baseMapList = (data as any).data.root;

          if (this.baseMapList.length === 0) {
            this.searchTip = '未搜索到数据';
          } else {
            this.searchTip = '';
          }

          // 默认选中状态
          if (this.create_flag) { // 上一步
            this.checkedItem = this.modalData.checkedItem;
            this.create_flag = false;
          } else {
            if (this.baseMapList[0]) {
              this.checkedItem = this.baseMapList[0];
              this.checkedItem['isCustom'] = false;
            } else {
              this.checkedItem = null;
            }
          }

        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  /**
   * 查询右侧列表
   */
  getRightList() {
    const body = {
      start: 0,
      limit: this.everyPageNum * this.pageNum
    };
    this.httpService.getData(body, true, 'execute', this.keyConfig.url.queryRight, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }

          this.baseMapList = (data as any).data.root;
          if (this.baseMapList.length === 0) {
            this.searchTip = '未搜索到数据';
          } else {
            this.searchTip = '';
          }

          // 默认选中状态
          if (this.create_flag) { // 上一步

            this.checkedItem = this.modalData.checkedItem;
            this.create_flag = false;

          } else {
            if (this.baseMapList[0]) {
              this.checkedItem = this.baseMapList[0];
              this.checkedItem['isCustom'] = false;
            } else {
              this.checkedItem = null;
            }
          }
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  /***
   * 创建部署服务 - 查询列表数据
   * **/

  getTabList(tab: string, url: string) {
    const body = {
      start: 0,
      limit: this.everyPageNum * this.pageNum
    };

    this.httpService.getData(body, true, 'execute', url, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }

          this.totalPage = (data as any).data.totalProperty;
          (data as any).data.root.forEach((item: any) => {
            item.valueCheck = false;
          });
          this.baseMapList = (data as any).data.root;

          this.baseMapList.forEach((item: any) => {
            if (this.serviceData[tab].length > 0) {
              this.serviceData[tab].forEach((v: any) => {
                switch (tab) {
                  case 'map':
                    if (item['map_id'] === v['map_id']) {
                      item.valueCheck = true;
                    }
                    break;
                  case 'layer':
                    if (item['layer_id'] === v['layer_id']) {
                      item.valueCheck = true;
                    }
                    break;
                  case 'mini_program':
                    if (item['mini_program_id'] === v['mini_program_id']) {
                      item.valueCheck = true;
                    }
                    break;

                  case 'data_source':
                    if (item['event_id'] === v['event_id']) {
                      item.valueCheck = true;
                    }
                    break;

                  case 'data_query_scheme':
                    if (item['service_event_id'] === v['service_event_id']) {
                      item.valueCheck = true;
                    }
                    break;

                  case 'secret_key':
                    if (item['application_id'] === v['application_id']) {
                      item.valueCheck = true;
                    }
                    break;
                }

              });
            }
          });


          if (this.baseMapList.length === 0) {
            this.searchTip = '未搜索到数据';
          } else {
            this.searchTip = '';
          }

          // 默认选中状态
          if (this.create_flag) { // 上一步
            this.checkedItem = this.modalData.checkedItem;
            this.create_flag = false;
          } else {
            if (this.baseMapList[0]) {
              this.checkedItem = this.baseMapList[0];
              this.checkedItem['isCustom'] = false;
            } else {
              this.checkedItem = null;
            }
          }
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  /**
   * 搜索
   */
  searchList() {
    if (this.searchKey) {
      let api;
      if (this.tag === 'mymap') {
        api = this.keyConfig.url.searchLeft;
      } else if (this.tag === 'sharemap') {
        api = this.keyConfig.url.searchRight;
      }

      this.httpService.getData({key: this.searchKey}, true, 'execute', api, 'map')

        .subscribe(
          data => {
            if ((data as any).status < 0 || (data as any).tag !== 'map') {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
              this.toastService.toast(toastCfg);
              return;
            }
            this.baseMapList = (data as any).data.root;

            if (this.baseMapList.length === 0) {
              this.searchTip = '未搜索到' + this.searchKey + '的数据';
            } else {
              this.searchTip = '';
            }

            // 默认选中状态
            if (this.baseMapList[0]) {

              this.checkedItem = this.baseMapList[0];
              this.checkedItem['isCustom'] = false;
            } else {
              this.checkedItem = null;
              this.checkedItem['isCustom'] = false;
            }

          },
          error => {
            toError(error);
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
          }
        );
    } else {
      if (this.tag === 'mymap') {
        this.getSystemMapList();
      } else {
        this.getUserMapList();
      }
    }
  }

  /**
   * 发布服务 - 搜索
   * **/
  servicePublicSearch() {
    if (this.searchKey) {
      let configID;
      switch (this.serviceParam.currentTab) {
        case 'map':
          configID = '8e6da0cc-e894-48af-ba9f-53542eb10875';
          break;

        case 'layer':
          configID = '2fba9ce4-141a-4969-ac00-3b5c873e3c61';
          break;

        case 'mini_program':
          configID = '65ca2227-a32f-45e9-a171-cca8f22a320e';
          break;

        case 'data_soruce':
          configID = '2024ebee-c088-4ada-855c-0b557b13a345';
          break;

        case 'data_query_scheme':
          configID = 'c09a5bec-d46b-4fcd-90a7-d64a31b000fc';
          break;

        case 'secret_key':
          configID = '857229ed-7f40-45b9-9bb1-d1383c1cb898';
          break;

      }

      const body = {
        filters: [{
          service_event_config_id: configID,
          value: this.searchKey,
          rule: '22c85efb-357e-4336-a31a-cc28921c26de'
        }],
        conjunction: 'and'
      };

      this.httpService.getData(body, true, 'execute', this.keyConfig.url[this.serviceParam.currentTab + 'Query'], 'map')

        .subscribe(
          data => {
            if ((data as any).status < 0 || (data as any).tag !== 'map') {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
              this.toastService.toast(toastCfg);
              return;
            }
            this.baseMapList = (data as any).data.root;
            (data as any).data.root.forEach((item: any) => {
              item.valueCheck = false;
            });
            this.baseMapList = (data as any).data.root;

            this.baseMapList.forEach((item: any) => {
              if (this.serviceData[this.serviceParam.currentTab].length > 0) {
                this.serviceData[this.serviceParam.currentTab].forEach((v: any) => {
                  switch (this.serviceParam.currentTab) {
                    case 'map':
                      if (item['map_id'] === v['map_id']) {
                        item.valueCheck = true;
                      }
                      break;
                    case 'layer':
                      if (item['layer_id'] === v['layer_id']) {
                        item.valueCheck = true;
                      }
                      break;
                    case 'mini_program':
                      if (item['mini_program_id'] === v['mini_program_id']) {
                        item.valueCheck = true;
                      }
                      break;

                    case 'data_soruce':
                      if (item['event_id'] === v['event_id']) {
                        item.valueCheck = true;
                      }
                      break;

                    case 'data_query_scheme':
                      if (item['service_event_id'] === v['service_event_id']) {
                        item.valueCheck = true;
                      }
                      break;

                    case 'secret_key':
                      if (item['application_id'] === v['application_id']) {
                        item.valueCheck = true;
                      }
                      break;
                  }

                });
              }
            });


            if (this.baseMapList.length === 0) {
              this.searchTip = '未搜索到' + this.searchKey + '的数据';
            } else {
              this.searchTip = '';
            }

            // 默认选中状态
            // if (this.baseMapList[0]) {
            //   this.checkedItem = this.baseMapList[0];
            //   this.checkedItem['isCustom'] = false;
            // } else {
            //   this.checkedItem = null;
            //   this.checkedItem['isCustom'] = false;
            // }

          },
          error => {
            toError(error);
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
          }
        );
    } else {
      this.getTabList(this.serviceParam.currentTab, this.keyConfig.url[this.serviceParam.currentTab + 'Query']);
    }
  }

  /**
   * 发布服务 - 清除搜索
   * */
  clearServiceSearch() {
    this.searchKey = '';
    this.searchTip = '';
    this.getTabList(this.serviceParam.currentTab, this.keyConfig.url[this.serviceParam.currentTab + 'Query']);
  }

  /**
   * 清除搜索
   */
  clearSearch() {
    this.searchKey = '';
    this.searchTip = '';
    if (this.tag === 'mymap') {
      this.getLeftList();
    } else {
      this.getRightList();
    }
  }


  /**
   * 切换分类
   * @param tag
   */
  public switchList() {
    if (this.searchKey && this.searchKey !== '') { // 带有关键字
      if (this.tag === 'mymap') {
        this.mymapChecked = true;
      } else if (this.tag === 'sharemap') {
        this.mymapChecked = false;
      }
      this.searchList();
    } else { // 不带关键字
      this.everyPageNum = 12;
      this.pageNum = 1;
      this.totalPage = 0;
      if (this.tag === 'mymap') {
        this.mymapChecked = true;
        this.getLeftList();
      } else if (this.tag === 'sharemap') {
        this.mymapChecked = false;
        this.getRightList();
      }
    }
  }

  /**
   * 服务发布 - 切换tab
   * **/
  switchServiceList(index?: any, name?: any) {
    this.oindex = index;
    this.serviceParam.currentTab = name;
    if (this.searchKey && this.searchKey !== '') { // 带有关键字
      this.servicePublicSearch();
    } else {
      this.getTabList(name, this.keyConfig.url[name + 'Query']);
    }
  }




  /**
   * 选中底图
   * @param e
   */
  public checkedBaseData(v: any) {
    if (this.checkedItem) {
      this.checkedItem['isCustom'] = false;
    }
    this.checkedItem = v;
    this.checkedItem['isCustom'] = false;

  }


  getUrlRoot(tag: any) {

    let base = '';
    if (tag === '添加图层' || tag === '选择底图') {
      base = '/uploadfile/';
    }
    return base;
  }

  /**
   * 滚动条判断
   * @param event
   */
  public handleScrollEvent(event: any) {
    if (event.isReachingBottom) {
      if (!this.searchKey || this.searchKey === '') {
        if (this.everyPageNum * this.pageNum < this.totalPage) {
          this.pageNum = this.pageNum + 1;
          if (this.tag === 'mymap') {
            this.getLeftList();
          } else if (this.tag === 'sharemap') {
            this.getRightList();
          }

        }
      }
    }
  }

  /**
   * 选中底图2
   * @param e
   */
  public checkStatisticsType(e: any, tag?: any) {
    if (tag && tag === 'no') {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '此数据类型无法使用当前统计类型！', 2000);
      this.toastService.toast(toastCfg);
    } else {
      /* if (e === '7154b538-3257-4c51-b1ec-cbfacafb05e5') {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '即将开放,敬请期待！', 2000);
        this.toastService.toast(toastCfg);
        return;
      } */
      // 获取选中的统计图名称，赋值给模态框数据
      for (let i = 0; i < this.staList.length; i++) {
        if (this.staList[i].id === e) {
          this.modalData.staName = this.staList[i].name;
        }
      }
      this.modalData.statisticsType = e;
      this.statisticsType = e;
    }

  }


  createTable() {
    // this.outputTableSelect = undefined;
    if (this.modalData.name !== '' && this.modalData.name !== undefined) {
      const test = SMXNAME.REG.test(this.modalData.name);

      if (!test) {
        this.createTableNameStatus = false;
        const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
        this.toastService.toast(toastCfg);
      } else {
        this.createTableNameStatus = true;
      }
    } else {
      this.createTableNameStatus = false;
    }
  }


  btnEvent(e: any) {
    this.outEvent.emit(e);
  }


  mapLoaded(map: any) {
    const draw = new DrawControl({
      mode: 'draw_arrow',
      edit: true,
      continue: false,
      custom: true
    });
    map.addControl(draw);
    draw.setImage({
      url: this.modalData.url,
      coordinates: this.modalData.coordinates,
      polygon: true
    });

    map.on('update.layer', (res) => {
      const coordinates = res.features[0].properties.content.image_coordinates;
      const iLT = coordinates[0][0].toString().indexOf('.');
      const iRT = coordinates[1][0].toString().indexOf('.');
      const iRB = coordinates[2][0].toString().indexOf('.');
      const iLB = coordinates[3][0].toString().indexOf('.');
      const lLT = coordinates[0][0].toString().substr(0, iLT + 6);
      const lRT = coordinates[1][0].toString().substr(0, iRT + 6);
      const lRB = coordinates[2][0].toString().substr(0, iRB + 6);
      const lLB = coordinates[3][0].toString().substr(0, iLB + 6);
      this.modalData.coordinates = coordinates;
      this.modalData.leftTop = `${lLT},${coordinates[0][1].toString().substr(0, 8)}`;
      this.modalData.rightTop = `${lRT},${coordinates[1][1].toString().substr(0, 8)}`;
      this.modalData.rightBottom = `${lRB},${coordinates[2][1].toString().substr(0, 8)}`;
      this.modalData.leftBottom = `${lLB},${coordinates[3][1].toString().substr(0, 8)}`;

    });

  }


  tranRasterParams(arr: any[]) {
    let leftTop = '';
    let rightTop = '';
    let rightBottom = '';
    let leftBottom = '';
    for (const v of arr) {
      if (v.tag === 'leftTop') {
        leftTop = v.value;
      }
      if (v.tag === 'rightBottom') {
        rightBottom = v.value;
      }

      if (v.tag === 'rightTop') {
        rightTop = v.value;
      }
      if (v.tag === 'leftBottom') {
        leftBottom = v.value;
      }
    }


    if (!rightTop || !leftBottom) {
      const lt = leftTop.split(',');
      const rb = rightBottom.split(',');
      rightTop = rb[0] + ',' + lt[1];
      leftBottom = lt[0] + ',' + rb[1];
    }


    for (const v of arr) {
      if (v.tag === 'rightTop') {
        v.value = rightTop;
      }
      if (v.tag === 'leftBottom') {
        v.value = leftBottom;
      }
    }
  }


  // 服务发布- 选择资源
  chooseServiceSoruce(event: any, source: any) {
    if (event.target.checked) {
      source.valueCheck = true;
      switch (this.serviceParam.currentTab) {
        case 'map':
          this.serviceData['map'].push({map_id: source['map_id'], name: source.name});
          break;

        case 'layer':
          this.serviceData['layer'].push({layer_id: source['layer_id'], name: source.name});
          break;

        case 'mini_program':
          // mini_program_id
          this.serviceData['mini_program'].push({mini_program_id: source['mini_program_id'], name: source.name});
          break;

        case 'data_source':
          this.serviceData['data_source'].push({entity_id: source['service_event_id'], name: source.name});
          break;

        case 'data_query_scheme':
          this.serviceData['data_query_scheme'].push({service_event_id: source['service_event_id'], name: source.name});
          break;

        case 'secret_key':
          this.serviceData['secret_key'].push({application_id: source['application_id'], name: source.name});
          break;
      }
    } else {
      source.valueCheck = false;
      switch (this.serviceParam.currentTab) {
        case 'map':
          this.serviceData['map'].forEach((item: any, i: number) => {
            if (item['map_id'] === source['map_id']) {
              this.serviceData['map'].splice(i, 1);
            }
          });
          break;

        case 'layer':
          this.serviceData['layer'].forEach((item: any, i: number) => {
            if (item['layer_id'] === source['layer_id']) {
              this.serviceData['layer'].splice(i, 1);
            }
          });
          break;

        case 'mini_program':
          this.serviceData['mini_program'].forEach((item: any, i: number) => {
            if (item['mini_program_id'] === source['mini_program_id']) {
              this.serviceData['mini_program'].splice(i, 1);
            }
          });
          break;

        case 'data_source':
          this.serviceData['data_source'].forEach((item: any, i: number) => {
            if (item['event_id'] === source['event_id']) {
              this.serviceData['data_source'].splice(i, 1);
            }
          });
          break;

        case 'data_query_scheme':
          this.serviceData['data_query_scheme'].forEach((item: any, i: number) => {
            if (item['service_event_id'] === source['service_event_id']) {
              this.serviceData['data_query_scheme'].splice(i, 1);
            }
          });
          break;

        case 'secret_key':
          this.serviceData['secret_key'].forEach((item: any, i: number) => {
            if (item['application_id'] === source['application_id']) {
              this.serviceData['secret_key'].splice(i, 1);
            }
          });
          break;
      }
    }
  }



}
