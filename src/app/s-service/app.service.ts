/**
 * Created by LLCN on 2017/9/14 16:03.
 *
 * name: app.service.ts
 * description: 全局事件服务模块
 */

import {Injectable, EventEmitter} from '@angular/core';


/**
 * app服务
 */
@Injectable()
export class AppService {
  scale = 100; // 浏览器比例
  properties: any; // 配置信息


  // 标题
  titleNowChoose: string;
  titleEventEmitter: EventEmitter<string>;

  // http请求事件
  httpEventEmitter: EventEmitter<any>;


  // 主页菜单列表数据
  mainListEventEmitter: EventEmitter<any>;

  // 登录登出结果
  loginedFlagEventEmitter: EventEmitter<any>;

  // 地图管理搜索数据
  mapsearchEventEmitter: EventEmitter<any>;
  mapsInitEventEmitter: EventEmitter<any>;
  mapsDeleteEventEmitter: EventEmitter<any>;

  // 数据操作事件
  dataActionEventEmitter: EventEmitter<any>;


  // 可视化工具操作事件
  changeStyleEventEmitter: EventEmitter<any>;
  layerEditorEventEmitter: EventEmitter<any>;
  iconChangeEventEmitter: EventEmitter<any>;

  // 统计专题操作事件
  statisticsEventEmitter: EventEmitter<any>;
  // 鼠标键盘事件监听
  mouseEventEmitter: EventEmitter<any>;
  // 界面改变事件
  onresizeEventEmitter: EventEmitter<any>;

  // 名称修改事件
  layerNameEventEmitter: EventEmitter<any>;


  // 小程序js、json编辑器内容变化事件
  onJsChangeEventEmitter: EventEmitter<any>;
  onJsonChangeEventEmitter: EventEmitter<any>;
  onResourceChangeEventEmitter: EventEmitter<any>;

  // 小程序--确认发布
  onConfirmPublishEventEmitter: EventEmitter<any>;
  // 小程序--确认发布后保存app.js
  onJsSavedEmitter: EventEmitter<any>;
  // 小程序--确认发布后保存app.json
  onJsonSavedEventEmitter: EventEmitter<any>;
  // 小程序--确认提交
  onConfirmSubmitEventEmitter: EventEmitter<any>;
  // 小程序--设置推荐
  onSetRecdEventEmitter: EventEmitter<any>;
  // 小程序--版本设置-编辑
  onEditEventEmitter: EventEmitter<any>;
  // 小程序--版本设置-获取版本号后发送给弹框组件
  onGetVersionEmitter: EventEmitter<any>;
  // 标绘地图-选择样式
  onSelectStyleEmitter: EventEmitter<any>;
  // 标绘地图-保存样式
  onSaveStyleEmitter: EventEmitter<any>;
  // 地图管理-图层删除
  onLayerDeleteEmitter: EventEmitter<any>;

  constructor() {
    this.titleEventEmitter = new EventEmitter();
    this.httpEventEmitter = new EventEmitter();
    this.mainListEventEmitter = new EventEmitter();
    this.mapsearchEventEmitter = new EventEmitter();
    this.mapsDeleteEventEmitter = new EventEmitter();
    this.mapsInitEventEmitter = new EventEmitter();
    this.loginedFlagEventEmitter = new EventEmitter();
    this.dataActionEventEmitter = new EventEmitter();
    this.changeStyleEventEmitter = new EventEmitter();
    this.layerEditorEventEmitter = new EventEmitter();
    this.iconChangeEventEmitter = new EventEmitter();
    this.statisticsEventEmitter = new EventEmitter();
    this.mouseEventEmitter = new EventEmitter();
    this.onresizeEventEmitter = new EventEmitter();
    this.onJsChangeEventEmitter = new EventEmitter();
    this.onJsonChangeEventEmitter = new EventEmitter();
    this.onResourceChangeEventEmitter = new EventEmitter();
    this.onConfirmPublishEventEmitter = new EventEmitter();
    this.onConfirmSubmitEventEmitter = new EventEmitter();
    this.onSetRecdEventEmitter = new EventEmitter();
    this.onEditEventEmitter = new EventEmitter();
    this.onGetVersionEmitter = new EventEmitter();
    this.onSelectStyleEmitter = new EventEmitter();
    this.onSaveStyleEmitter = new EventEmitter();
    this.onJsSavedEmitter = new EventEmitter();
    this.onJsonSavedEventEmitter = new EventEmitter();
    this.onLayerDeleteEmitter = new EventEmitter();
    this.layerNameEventEmitter = new EventEmitter();
  }
}
