///<reference path="../../../typings.d.ts"/>
import {toError} from '../../smx-component/smx-util';
import {debounceTime, map} from 'rxjs/operators';
import {Component, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {Router} from '@angular/router';
import {multiPolygon, polygon} from '@turf/helpers';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {DragulaService} from 'ng2-dragula';
import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module'; // 模态框
import {AppService} from '../../s-service/app.service';
import {PopueComponent} from '../../data/modal/data-popue.component';   // 模态框组件
import {union} from 'martinez-polygon-clipping';
import {DataStorage, LocalStorage} from '../../s-service/local.storage';
import 'rxjs/Rx';

import * as turf from '@turf/turf';
import * as validateStyleMin from '@smx/smartmapx-gl-style-validate';
import * as GlSpec from '@smx/smartmapx-gl-style-validate/reference/latest.js';

import {getMapInstance, addMapControl} from '../../s-service/smx-map';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  @Input() dataConfig: any;
  title: any;
  listItem: any;
  checkedId: any;
  layerId: any;
  panelShow: any;
  itemData: any;
  mapObj: any;
  mapJson: any;
  mapId: any;
  dragIndex: any;
  dropIndex: any;
  mapType: any;
  editStatus: any;
  editLayer: any;
  geoType: any;
  info: any;
  layerIndex: any;
  layerEditor: any;
  unlayerEditor: any;
  unsubscribe: any;
  dropEvent: any;
  dragEvent: any;
  postData: any;
  listArray: any;
  baseMapLastIndex: any;
  mapIsCustom: any;
  preLayerId: any;
  layerNum: any;
  inspect: any;

  hasLayers = false;
  relatedLayers = ([] as any);
  fakeListItem = ([] as any);
  showPoupue = true;
  publishHide = false;
  layerListHide = false;
  toolsContainerShow = false;
  isToolShow = false;
  drawTrash: any = [];
  dataInfo: any;
  drawControl: any;

  mode = 1;
  loaded = false;
  drawloaded = false;
  unDataAction: any;
  layer_id: any;
  viewTable: any;

  staType: any;


  listener_add: any;
  listener_delete: any;
  listener_update: any;
  listener_selectionchange: any;
  currentLayer: any;
  geojsonData: any; // geo绘制数据
  navTab = ['图层', '小程序'];
  tabIndex = 0;

  statisticArray = ([] as any);
  paramData: any;


  printStatus = false;
  imgUrl: string;
  bounds: any;  // 地理专题数据范围框

  basemap_config: any;   // 地图配置


  ngb0 = true;
  tipMsg = [];
  tipShow = false;


  isDrawAction = false;
  properties: any; // 配置文件

  constructor(private httpService: HttpService,
              private toastService: ToastService,
              private dragulaService: DragulaService,
              private appService: AppService,
              private elementRef: ElementRef,
              private renderer: Renderer2,
              private router: Router,
              private modalService: SmxModal,
              private ls: LocalStorage, private ds: DataStorage) {

    this.unDataAction = this.appService.dataActionEventEmitter.subscribe((value: any) => {
      // 地图地理图层geojson刷新
      if (value && this.drawControl) {
        if (value.type === 'removeFail') {
          this.drawControl.add(this.dataInfo);
        }

        if (value.type === 'addFail') {
          this.drawControl.delete(this.dataInfo.id).getAll();
        }

        if (value.type === 'updateFail') {
          this.drawControl.delete(this.dataInfo.id).getAll();
          this.drawControl.add(this.dataInfo);

        }

        if (value.type === 'unionFail') {
          this.drawControl.delete(this.dataInfo.id).getAll();
        }

        if (value.type === 'addSuccess') {
          for (const v in value.value) {
            if (v) {
              this.drawControl.setFeatureProperty(this.dataInfo.id, v, value.value[v]);
            }
          }

          // this.setDataSource();
          if (this.mode === 2 && !this.isDrawAction) {
            this.switchMode();
          }
          this.isDrawAction = false;
        }


        if (value.type === 'updateSuccess') {
          // this.setDataSource();
          if (this.mode === 2 && !this.isDrawAction) {
            this.switchMode();
          }
          this.isDrawAction = false;
        }

        if (value.type === 'removeSuccess') {
          // this.setDataSource();
          if (this.mode === 2 && !this.isDrawAction) {
            this.switchMode();
          }
          this.isDrawAction = false;
        }

        if (value.type === 'unionSuccess') {
          for (const v in value.value) {
            if (v) {
              this.drawControl.setFeatureProperty(this.dataInfo.id, v, value.value[v]);
            }
          }

          if (this.drawTrash.length > 1) {
            for (let i = 0; i < this.drawTrash.length; i++) {
              this.drawControl.delete(this.drawTrash[i].id).getAll();
            }
          }

          // this.setDataSource();
          this.isDrawAction = false;
          if (this.mode === 2 && !this.isDrawAction) {
            this.switchMode();
          }
          // this.drawControl = [];
        }
      }
      this.setDataSource();
    });


    this.unlayerEditor = this.appService.layerEditorEventEmitter.subscribe((value: any) => {

      this.layerClick(value[0], this.listItem, value[1]);
    });

    // 地图样式更新
    this.unsubscribe = this.appService.changeStyleEventEmitter.pipe(debounceTime(1200)).subscribe((value: any) => {
      // console.log(value);
      const errors = validateStyleMin(this.mapJson, GlSpec);
      if (errors.length > 0) {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '您的编辑不符合样式规范!', 5000, true, errors[0].message);
        this.toastService.toast(toastCfg);
        return;
      }
      let postdata;

      if (value.flag && value.flag === 'diff') {
        postdata = {
          content: JSON.stringify(value.layerInfo),
          layer_style_id: value.layerInfo.metadata.layer_style_id,
          layer_id: value.layerInfo.metadata.layer_id,
          name: value.layerInfo.metadata.name
        };
        this.mapObj.setStyle(this.mapJson, {diff: false});
      } else if (value.property && value.property === true) {
        /**
         * 新版本逐步修改为此方法
         * 通过setPaintProperty 与 setLayoutProperty 的方法来改变地图样式
         * */
        postdata = {
          content: JSON.stringify(value.layerInfo),
          layer_style_id: value.layerInfo.metadata.layer_style_id,
          layer_id: value.layerInfo.metadata.layer_id,
          name: value.layerInfo.metadata.name
        };
        if (value.belong === 'paint') {
          const stops = {'stops': [[10, 'rgba(255, 255, 255, 1)'], [12, 'rgba(0, 0, 0, 1)']]};
          // this.mapObj.setPaintProperty(value.id, value.attribute, stops);
          const layer = this.mapObj.getLayer(value.id);
          layer.setPaintProperty(value.attribute, stops);
        } else {
          this.mapObj.setLayoutProperty(value.id, value.attribute, value.value);
        }
      } else {
        postdata = {
          content: JSON.stringify(value),
          layer_style_id: value.metadata.layer_style_id,
          layer_id: value.metadata.layer_id,
          name: value.metadata.name
        };
        this.mapObj.setStyle(this.mapJson, {diff: true});
      }

      // this.mapJson.layers[this.mapJson.layers.length - 1] = value;
      this.httpService.getData(postdata, true, 'execute', '5105850b-e244-4530-ad51-3bc2f21d1ab4', '')
        .subscribe(
          (data: any) => {
            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改成功！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
        );

    });

  }

  ngOnInit() {
    this.info = this.ls.getObject('visitInfo');
    this.properties = <any>this.ds.get('properties');
    if (this.info !== '' && this.info) {
      this.mapType = this.info.type;
      this.editStatus = this.info.isEdit;
      this.layer_id = this.info.layer_id;
      if (this.info && this.info.type === 'map') {
        // 用户复制地图
        this.mapId = this.info.mapId;
        this.getUserMap(this.info.mapId, this.info.version);
        // this.getData(this.info.style);


        if (this.info && this.info.isEdit === 0) {
          this.publishHide = true;
        }
      } else {
        // 地理专题地图
        this.getGeoMap(this.info);
        // this.getData(this.info.style);
        // 隐藏图层列表面板
        this.layerListHide = true;
        if (this.info && this.info.isEdit === 0) {
          this.publishHide = true;
        }
      }
    }
    this.renderer.listen(
      this.elementRef.nativeElement, 'click', event => {
        this.appService.iconChangeEventEmitter.emit(event);
      });

  }

  ngOnDestroy() {
    this.unsubscribe.unsubscribe();
    this.unlayerEditor.unsubscribe();
    // this.dropEvent.unsubscribe();
    // this.dragEvent.unsubscribe();
    this.unDataAction.unsubscribe();
    if (this.mapObj) {
      this.mapObj.clearApps();
      this.mapObj.remove();
      // this.mapObj = null;
    }

  }

  // 向上拖动1
  dragUp(moveArray: any) {
    this.createDrapUp(moveArray, this.listItem);
    this.mapJson.layers = this.listItem;
  }


  // 向下拖动1
  dragDown(moveArray: any) {
    this.createDragDown(moveArray, this.listItem);
    this.mapJson.layers = this.listItem;
  }

  // 向上拖动2
  createDrapUp(moveArray: any, liList: any) {
    let firstArry;
    let lastArry;
    if (moveArray[0].metadata.grouping) {// 如果被托动图层有关联图层（统计图）
      const num = moveArray.length;
      firstArry = liList.slice(0, this.dropIndex);
      lastArry = liList.slice(this.dropIndex);
      const arr = moveArray.concat(lastArry);
      liList = firstArry.concat(arr);
      liList.splice(this.dragIndex + num, num);
      this.listItem = liList;
    } else {
      if (liList[this.dropIndex].metadata.grouping) { // 判断拖拽后放下的位置图层是否有关联图层
        const groupingLayerNum = liList[this.dropIndex].metadata.grouping.length;
        firstArry = liList.slice(0, this.dropIndex);
        lastArry = liList.slice(this.dropIndex);
        liList = firstArry.concat(moveArray, lastArry);
        liList.splice(this.dragIndex + 1, 1);
        this.listItem = liList;

      } else {
        firstArry = liList.slice(0, this.dropIndex);
        lastArry = liList.slice(this.dropIndex);
        liList = firstArry.concat(moveArray, lastArry);
        liList.splice(this.dragIndex + 1, 1);
        this.listItem = liList;
      }
    }
    if (this.dropIndex > 0 && !liList[this.dropIndex - 1].metadata.basemap) {
      this.preLayerId = liList[this.dropIndex - 1].metadata.instance_layer_id;
    } else {
      this.preLayerId = null;
    }
  }

  // 向下拖动2
  createDragDown(moveArray: any, liList: any) {
    let lastArry;
    let firstArry;
    if (moveArray[0].metadata.grouping) { // 如果被托动图层有关联图层（统计图）
      const num = moveArray[0].metadata.grouping.length;
      firstArry = liList.slice(0, this.dropIndex + 1);
      lastArry = liList.slice(this.dropIndex + 1);

      liList = firstArry.concat(moveArray, lastArry);
      liList.splice(this.dragIndex, num + 1);
      this.listItem = liList;

    } else {
      if (liList[this.dropIndex].metadata.grouping) { // 判断拖拽后放下的位置图层是否有关联图层
        const groupingLayerNum = liList[this.dropIndex].metadata.grouping.length;
        firstArry = liList.slice(0, this.dropIndex + 1 + groupingLayerNum);
        lastArry = liList.slice(this.dropIndex + 1 + groupingLayerNum);
        liList = firstArry.concat(moveArray, lastArry);
        liList.splice(this.dragIndex, 1);
        this.listItem = liList;
      } else {
        firstArry = liList.slice(0, this.dropIndex + 1);
        lastArry = liList.slice(this.dropIndex + 1);
        liList = firstArry.concat(moveArray, lastArry);
        liList.splice(this.dragIndex, 1);
        this.listItem = liList;
      }
    }

    if (this.dropIndex <= liList.length - 1) {
      if (this.hasLayers) {
        this.preLayerId = liList[this.dropIndex - moveArray.length].metadata.instance_layer_id;
      } else {
        this.preLayerId = liList[this.dropIndex - 1].metadata.instance_layer_id;
      }

    }
  }


  // 返回
  back() {
    const goback = this.ls.get('goback_share');
    if (goback === '0') {
      this.ls.set('goback_share', '1');
    }
    this.router.navigate(['/app/showmap'], {queryParams: {module: 'map'}});
  }

  /**
   * 加载地图
   */
  getUserMap(mapID: any, version: any) {
    const postData = {version: version, mapID: mapID};

    this.mapId = mapID;

    this.httpService.getData(postData, true, 'execute', 'getMapStyle', 'em', 'em')
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.getData(data.data);
        },
        error => {
          console.log(error);
        }
      );
  }

  /**
   * 加载地理地图
   */
  getGeoMap(info: any) {
    const postData = {version: info.version, layerStyleID: info.layer_style_id};
    this.httpService.getData(postData, true, 'execute', 'getGeographyLayerStyle', 'em', 'em')// 1.请求的参数 2.是否带token值 3，模块分类 4，路径方式
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.getData(data.data);
        },
        error => {
          console.log(error);
        }
      );
  }


  getData(url: any): Promise<any> {
    const self = this;
    return this.httpService.getFile(url)
      .toPromise()
      .then((res) => {
        const mapData = res;
        self.mapJson = mapData;
        this.basemap_config = (mapData as any).metadata.basemap_config;
        const options = ({
          style: mapData,
          preserveDrawingBuffer: true,
          // appServerUrl: '/uploadfile/miniprogram', // 线上使用*/
        } as any);


        // 限制条件
        if (this.info && (this.info.isEdit === '0' || this.info.isEdit === 0) && this.mapType === 'map') {
          if (this.basemap_config && this.basemap_config.lock_min) {
            options.minZoom = this.basemap_config.minzoom;
          }


          if (this.basemap_config && this.basemap_config.lock_max) {
            options.maxZoom = this.basemap_config.maxzoom;
          }


          if (this.basemap_config && this.basemap_config.lock_bounds) {
            options.maxBounds = JSON.parse(this.basemap_config.bounds);
          }
        }


        self.mapObj = getMapInstance('map', options);
        self.title = self.mapJson.name;
        self.listItem = self.mapJson.layers;
        if (self.listItem[0].metadata.basemap) {
          self.mapIsCustom = true;
        } else {
          self.mapIsCustom = false;
        }
        if (this.mapType === 'geo') {

          addMapControl(self.mapObj, 'fullscreen');
          addMapControl(self.mapObj, 'navigation');
          addMapControl(self.mapObj, 'scale', 'bottom-left');
        }

        self.mapObj.on('load', () => { // 地图加载成功事件
          // 初始化检视插件
          setTimeout(() => {
            this.drawloaded = true;
          }, 1500);
          this.loaded = true;
          if (this.mapType === 'geo' && this.info && (this.info.isEdit === '1' || this.info.isEdit === 1)) {
            if (self.mapJson.center[0] === 104.94064811833391) {
              const layer_style = self.listItem[self.listItem.length - 1];
              this.bestCenter(layer_style);
            }
            // 打开图层详情面板
            this.openLayer();
            // 隐藏图层列表面板
            this.layerListHide = true;
          }
          // wb 给地理专题添加 最佳视野功能
          if (this.mapType === 'geo' && self.mapJson.metadata.basemap_config.lock_bounds === 0) {
            this.getBestCenter();
          }
          // 判断地图中是否有已删除版本的小程序，有的话给吐司提示
          if (this.mapType !== 'geo') {
            const mapStyle = self.mapObj.getStyle();
            if (mapStyle.metadata && mapStyle.metadata.apps) {
              mapStyle.metadata.apps.forEach((v: any) => {
                // if (v.status < 0) {
                //   // const toastCfg = new ToastConfig(ToastType.WARNING, '', v.title + '小程序已被删除', 3000);
                //   // this.toastService.toast(toastCfg);
                //   const msg = v.title + '小程序' + '小程序已被删除';
                //   const obj = {msg: msg};
                //   this.tipMsg.push(obj);
                //   return;
                // }

                if (v.status === -1) {  // 小程序删除
                  const msg = v.title + '小程序已被删除';
                  const obj = {msg: msg};
                  this.tipMsg.push(obj);
                  this.toastHide(5000);
                } else { // 版本删除
                  const postData = {mini_program_id: v.id};
                  const currentVersion = v.current_version ? v.current_version : v.recommend;
                  this.httpService.getData(postData, true, 'execute', '957f3672-668e-4107-a900-52be1ebf8f62', '').subscribe((data: any) => {
                    const versionList = data.data;
                    let versionDeleted = true;
                    versionList.forEach((verItem: any) => {
                      if (verItem.version === currentVersion) {
                        versionDeleted = false;
                      }
                    });

                    if (versionDeleted) {
                      // const toastCfg = new ToastConfig(ToastType.WARNING, '', v.title + '小程序' + currentVersion + '版本已被删除', 30000);
                      // this.toastService.toast(toastCfg);
                      // if()
                      const msg = v.title + '小程序' + currentVersion + '版本已被删除';
                      const obj = {msg: msg};
                      this.tipMsg.push(obj);
                      this.toastHide(5000);
                    }
                  });
                }

              });

            }
          }
        });


        if (self.info.isEdit === 1 && self.mapType === 'map') {/*地图查看模式不可使用以下功能*/
          let popup: any = null;
          self.mapObj.on('click', function (e: any) {
            if (popup) {
              popup.remove();
            }

            const diff = 4;

            const leftTop = {x: e.point.x - diff, y: e.point.y - diff};
            const rightBottom = {x: e.point.x + diff, y: e.point.y + diff};
            const result = self.mapObj.queryRenderedFeatures([leftTop, rightBottom]);

            let layers = '';
            let fontClass = '';
            const newResult: any[] = [];
            if (result.length <= 0) {
              return;
            } else {
              const arr = [];
              for (let i = 0; i < result.length; i++) {
                if (arr.indexOf(result[i].layer.id) === -1) {
                  arr.push(result[i].layer.id);
                  newResult.push(result[i]);
                }
              }

              // 对统计图中含有多个图层的数据处理，只显示一个图层
              newResult.map(function (value: any, index: any) {
                if (value.layer.metadata && value.layer.metadata.no_isibility) {
                  newResult.splice(index, 1);
                }
              });

            }


            for (let i = 0; i < newResult.length; i++) {

              if (newResult[i].layer.metadata && !newResult[i].layer.metadata.basemap) {
                const type = newResult[i].layer.type;
                switch (type) {
                  case 'symbol':
                    fontClass = 'fa fa-map-marker';
                    break;
                  case 'line':
                    fontClass = 'fa fa-road';
                    break;
                  case 'fill':
                    fontClass = 'fa fa-map-o';
                    break;
                  case 'background':
                    fontClass = 'fa fa-picture-o';
                    break;
                  case 'circle':
                    fontClass = 'fa fa-circle-o';
                    break;
                  case 'building':
                    fontClass = 'fa fa-building-o';
                    break;
                }

                if (newResult[i].layer.metadata.reference_type) {

                  layers += `<li title="不可编辑" class="unedit"><i class="${fontClass}">
</i><i>${newResult[i].layer.metadata.name}</i></li>`;
                } else {
                  layers += `<li><i class="${fontClass}"></i><i> ${newResult[i].layer.metadata.name}</i></li>`;
                }

              }
            }
            if (layers !== '') {
              if (self.showPoupue) {
                popup = addMapControl(self.mapObj, 'popup');
                popup.setLngLat(e.lngLat)
                  .setHTML('<div class=\'titleContainer\'><ul class=\'layerTitle\'>' + layers + '</ul></div>')
                  .addTo(self.mapObj);

                if (newResult[0].layer.metadata) {
                  const element = document.getElementsByClassName('layerTitle')[0];

                  // const element = this.elementRef.nativeElement.getElementsByClassName('layerTitle')[0];
                  const lis = element.getElementsByTagName('li');
                  for (let m = 0; m < lis.length; m++) {
                    lis[m].onclick = function () {
                      const id = newResult[m].layer.id;
                      for (let i = 0; i < self.listItem.length; i++) {
                        if (id === self.listItem[i].id) {
                          self.layerId = id;
                          self.layerClick(self.listItem[i], self.listItem, i);
                        }
                      }
                    };
                  }
                }
              }
            }
          });
        }


      })
      .catch(this.handleError);
  }


  toastHide(delay: number) {
    setTimeout(() => {
      this.tipShow = true;
      setTimeout(() => {
        this.tipMsg = [];
      }, 700);
    }, delay);
  }

  reciveInspectClick() {
    // this.inspect.toggleInspector();
  }


  // 数据样式模式切换
  switchMode() {
    this.drawloaded = false;
    setTimeout(() => {
      this.drawloaded = true;
    }, 500);
    if (this.mode === 1) {
      this.addDrawTools();
    } else {
      if (this.listener_add) {
        this.mapObj.off('draw.create', this.listener_add);
      }
      if (this.listener_update) {
        this.mapObj.off('draw.update', this.listener_update);
      }
      if (this.listener_delete) {
        this.mapObj.off('draw.delete', this.listener_delete);
      }
      if (this.listener_selectionchange) {
        this.mapObj.off('draw.selectionchange', this.listener_selectionchange);
      }
      this.openStyleMode();
    }
  }

  // 绘制模式
  addDrawTools() {
    if (this.dataConfig.isedit === 0) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '您没有此数据源的操作权限!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }


    const self = this;
    const layer_style_id = this.info.layer_style_id;
    const drawInitData = this.mapObj.getSource(layer_style_id);


    if (!drawInitData._geojsonData) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '样式尚未渲染完毕,请稍后再试!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    // 绘制控件

    const options = {
      displayControlsDefault: false,
      controls: {
        point: (this.info.geo_type === '10' || this.info.geo_type === 10 || this.info.geo_type === 'POINT') ? true : false,
        line_string: (this.info.geo_type === '20' || this.info.geo_type === 20 || this.info.geo_type === 'LINESTRING') ? true : false,
        polygon: (this.info.geo_type === '30' || this.info.geo_type === 30 || this.info.geo_type === 'POLYGON') ? true : false,
        trash: (this.info.isEdit === '1' || this.info.isEdit === 1) ? true : false
      },
    };
    this.drawControl = addMapControl(this.mapObj, 'draw', 'top-right', options);

    this.drawControl.set(drawInitData._geojsonData);

    this.mode = 2;
    if (this.panelShow) {
      this.closePanel();
    }


    this.listener_add = function (e: any) {
      if (e.features) {
        self.drawControl.setFeatureProperty(e.features[0].id, 'actionType', 'create');
        const poiInfo = {
          type: 'addGeo',
          value:
            {
              id: e.features[0].id,
              coordinates: e.features[0].geometry.coordinates,
              type: e.features[0].geometry.type
            }
        };
        // 发送事件
        // localStorage.setItem('addGeo', JSON.stringify(poiInfo));
        self.appService.dataActionEventEmitter.emit(poiInfo);
        self.dataInfo = poiInfo.value;

        self.isDrawAction = true;
      } else {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '添加失败!', 2000);
        self.toastService.toast(toastCfg);

      }
    };
    this.listener_delete = function (e: any) {
      // self.drawControl.delete(e.features[0].id).getAll();
      const info = {
        type: 'removeGeo',
        value: e.features[0].properties,
        unionInfo: e.features
      };
      self.appService.dataActionEventEmitter.emit(info);
      self.dataInfo = e.features[0];
      self.isDrawAction = true;
    };
    this.listener_update = function (e: any) {
      if (e.features) {
        for (const i in e.features[0].properties) {
          if (e.features[0].properties[i] && (e.features[0].properties[i] === 'geom' || typeof e.features[0].properties[i] === 'object')) {
            e.features[0].properties[i] = JSON.stringify(e.features[0].geometry);
          }
        }
        const info = {
          type: 'updateGeo',
          value: e.features[0].properties
        };


        // 发送事件
        self.appService.dataActionEventEmitter.emit(info);
        self.isDrawAction = true;
        // localStorage.setItem('updateGeo', JSON.stringify(e.features[0].properties));
      }
    };


    this.listener_selectionchange = function (e: any) {
      self.dataInfo = e.features[0];
      /*面和并开始*/
      const unionInfo = e;
      if (!e.features[0]) {
        arrUnion = [];
      }
      const clickUnion = self.elementRef.nativeElement.getElementsByClassName('union')[0];
      clickUnion.onclick = function () {
        arrUnion = [];
        if (unionInfo && unionInfo.features[0]) {
          for (let i = 0; i < unionInfo.features.length; i++) {
            /* const polygon = unionInfo.features[i].geometry.coordinates;*/
            arrUnion.push(unionInfo.features[i]);
          }
        }
        if (arrUnion.length > 1) {
          unionObj = turf.union.apply(null, arrUnion);
          if (unionObj.geometry.type !== 'MultiPolygon') {
            const featureIds = self.drawControl.add(unionObj);
            const poiInfo = {
              type: 'unionGeo',
              value:
                {
                  id: featureIds[0],
                  coordinates: unionObj.geometry.coordinates,
                  type: unionObj.geometry.type,
                  unionInfo: unionInfo.features
                }
            };
            self.appService.dataActionEventEmitter.emit(poiInfo);
            unionObj = null;
            self.dataInfo = poiInfo.value;
            for (let i = 0; i < unionInfo.features.length; i++) {
              self.drawTrash.push(unionInfo.features[i]);
            }
            self.isDrawAction = true;
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '合并失败,不支持相离面合并!', 2000);
            self.toastService.toast(toastCfg);
          }
        } else {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请选择两个以上独立的面进行和并!', 2000);
          self.toastService.toast(toastCfg);
        }
      };
    };


    // 新增geo事件
    this.mapObj.on('draw.create', this.listener_add);


    let arrUnion: any = [];
    let unionObj: any = null;


    // 点击
    if ((this.info.geo_type === 30) || this.info.geo_type === 'POLYGON') {
      this.mapObj.on('draw.selectionchange', this.listener_selectionchange);
    }


    // 更新geo
    this.mapObj.on('draw.update', this.listener_update);


    // 删除geo
    this.mapObj.on('draw.delete', this.listener_delete);
  }


  unions(obj: any) {
    let unioned = obj[0];
    for (let i = 1; i < obj.length; i++) {
      /* buffer(obj[i], 500, {units: 'miles'});*/
      const unionBuffer = turf.buffer(turf.polygon(obj[i]), 1, {units: 'miles'});
      unioned = union(unioned, unionBuffer.geometry.coordinates);
      /*unioned = union(unioned, obj[i]);*/
    }
    if (unioned.length === 0) {
      return null;
    }
    if (unioned.length === 1) {
      return polygon(unioned[0]);
    } else {
      return multiPolygon(unioned);
    }
  }

  openStyleMode() {
    this.mode = 1;
    this.openLayer();
    this.mapObj.removeControl(this.drawControl);
    // this.mapObj = this.mapObj.setStyle(this.mapJson, {diff: true});

  }

  openLayer() {
    const layerId = this.info.layer_id;
    for (let i = 0; i < this.listItem.length; i++) {
      if (this.listItem[i].metadata.layer_id === layerId) {
        this.layerClick(this.listItem[i], this.listItem, i);
        this.currentLayer = this.listItem[i];
      }
    }
  }

  // 异常
  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }


  // 点击图层列表
  layerClick(item: any, listItem: any, index: any) {

    const self = this;
    if (this.info.isEdit === 1) {// 编辑地图状态下可点击
      if (!item.metadata.reference_type) {

        // 记录类型
        this.staType = 'geo';
        if (!item.metadata.noSta) {
          // 统计图
          this.staType = item.metadata.layer_statistics_id;
        } else {
          if (item.type === 'raster' || item === 'image') {
            // 栅格
            this.staType = 'raster';
          }
        }


        if (item.metadata.grouping) { // 如果有关联图层
          // this.relatedLayers.push(item);
          const arr = ([item] as any);
          for (let i = 0; i < item.metadata.grouping.length; i++) {
            this.listItem.map(function (value: any) {
              if (value.id === item.metadata.grouping[i]) {
                arr.push(value);
              }
            });
          }
          this.relatedLayers = [];
          this.relatedLayers = arr;
          this.panelShow = true;
          this.layerIndex = index;

        } else {
          this.relatedLayers = [];
          this.relatedLayers.push(item);
          this.layerId = item.id;
          this.layerIndex = index;
          this.layerEditor = listItem;
          this.itemData = item;
          this.panelShow = true;
        }
      } else {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '引用图层不可编辑', 2000);
        this.toastService.toast(toastCfg);
      }
    }
  }


  // 关闭面板抽屉
  closePanel() {
    if (this.info.isEdit === 1) {
      this.panelShow = !this.panelShow;
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '查看模式不可编辑', 2000);
      this.toastService.toast(toastCfg);
    }
  }


  // 复制图层
  copyLayer(item: any) {
    // 判断是否为引用图层
    if (item.metadata.reference_type) {
      const toastCfg = new ToastConfig(ToastType.ERROR, '', '引用图层不可复制', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    this.addLayer(item, true);
  }

  // 复制图层
  addLayer(item: any, isCustom: any) {
    let referenceType;
    if (isCustom) {
      referenceType = 10;
    } else {
      referenceType = 1;
    }

    const postData = {
      layer_id: item.metadata.layer_id,
      layer_style_id: item.metadata.layer_style_id,
      map_id: this.mapId,
      reference_type: referenceType
    };


    this.httpService.getData(postData, true, 'execute',
      '2849943a-f5f4-4d79-bd24-27f1ced9dcea', '')// 1.请求的参数 2.是否带token值 3，模块分类 4，路径方式 (数字地址tag中不能加em)
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          if (data.data.layer_style_id === 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '此图层已存在', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          let themeType;
          if (item.metadata.noSta) {
            themeType = '1';
          } else {
            themeType = '2';
          }
          const layerParam = {
            layerStyleID: data.data.layer_style_id,
            themetype: themeType,
            instance_layer_id: data.data.instance_layer_id,
            reference_type: referenceType
          };
          this.httpService.getData(layerParam, true, 'execute', 'getLayerStyle', 'em', 'em')
            .subscribe(
              (data1: any) => {
                // 将数据库返回的图层对象放到图层列表数组中
                if (data1.data.layers.length === 1) { // 添加单个图层
                  this.listItem.push(data1.data.layers[0]);
                } else { // 添加聚合图层-三个图层
                  for (let i = 0; i < data1.data.layers.length; i++) {
                    this.listItem.push(data1.data.layers[i]);
                  }
                }

                this.mapJson.layers = this.listItem;
                this.mapJson.sources = Object.assign(this.mapJson.sources, data1.data.sources);
                this.mapObj.setStyle(this.mapJson, {diff: true});

                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '复制成功！', 2000);
                this.toastService.toast(toastCfg);
              }
            );
        },
        error => {
          toError(error);
        }
      );
  }

  // 删除图层
  deleteLayer(item: any) {
    const number = this.listItem.indexOf(item);

    const postData = {
      instance_layer_id: item.metadata.instance_layer_id
    };

    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.type = 11;
    modalRef.componentInstance.keyConfig = {
      title: '删除图层',
      view: '删除图层将不可恢复，确定要删除图层?'
    };
    modalRef.result.then((result) => {
      this.httpService.getData(postData, true, 'execute', 'aa8bae0c-aaca-4f61-bf1c-8dec9d40ac61', '')
        .subscribe(
          (data: any) => {
            /* 流向图删除 */
            if (this.listItem[number].metadata.flowgraph) {
              this.mapObj.removeEcharts();
            }


            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }
            if (item.id === this.layerId) {
              // 关闭详情面板
              this.panelShow = false;
            }
            const oind = this.listItem.indexOf(item);
            if (item.metadata.grouping) {
              this.listItem.splice(oind, 3);
            } else {
              this.listItem.splice(oind, 1);
            }

            // this.mapObj.removeLayer(item.id);
            this.mapObj.setStyle(this.mapJson, {diff: true});
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 2000);
            this.toastService.toast(toastCfg);
          },
          error => {
            toError(error);
          }
        );
    }, (reason) => {

    });


    // if (window.confirm('删除图层将不可恢复，确定要删除图层？')) {
    //   this.httpService.getData(postData, true, 'execute', 'aa8bae0c-aaca-4f61-bf1c-8dec9d40ac61', '')
    //     .subscribe(
    //       (data: any) => {
    //
    //         if ((data as any).status <= 0) {
    //           const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
    //           this.toastService.toast(toast);
    //           return;
    //         }
    //         if (item.id === this.layerId) {
    //           // 关闭详情面板
    //           this.panelShow = false;
    //         }
    //         const oind = this.listItem.indexOf(item);
    //         if (item.metadata.grouping) {
    //           this.listItem.splice(oind, 3);
    //         } else {
    //           this.listItem.splice(oind, 1);
    //         }
    //
    //
    //         // this.mapObj.removeLayer(item.id);
    //         this.mapObj.setStyle(this.mapJson, {diff: true});
    //         const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 2000);
    //         this.toastService.toast(toastCfg);
    //       },
    //       error => {
    //         console.log(error);
    //       }
    //     );
    // }

  }

  // 图层显示、隐藏
  showLayer(item: any) {
    if (this.editStatus === 0) {// 编辑状态为0的时候，不与服务器交互
      const oind = this.listItem.indexOf(item);
      this.listItem[oind].layout['visibility'] = 'visible';
      this.mapObj.setStyle(this.mapJson, {diff: true});
    } else {
      let id, layertype;
      if (item.metadata.reference_type) {
        layertype = '1'; // 引用图层
        const oind = this.listItem.indexOf(item);
        id = this.listItem[oind].metadata.instance_layer_id;
      } else {
        layertype = '10'; // 复制自定义图层
        id = item.metadata.layer_style_id;
      }
      const visibility = 'visible';
      const postData = {
        id: id,
        layer_type: layertype,
        visibility: visibility
      };

      this.httpService.getData(postData, true, 'execute', 'reviseLayerVisibility', 'em', 'em')
        .subscribe(
          (data: any) => {
            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }
            const oind = this.listItem.indexOf(item);
            if (item.metadata.grouping) { // 如果有关联图层（统计图）
              for (let i = oind; i < oind + 3; i++) {
                if (this.listItem[i].layout === undefined) {
                  this.listItem[i].layout = {};
                  this.listItem[i].layout = {'visibility': 'visible'};
                  this.mapObj.setLayoutProperty(this.listItem[i].id, 'visibility', 'visible');
                } else {
                  this.listItem[i].layout['visibility'] = 'visible';
                  this.mapObj.setLayoutProperty(this.listItem[i].id, 'visibility', 'visible');
                }
              }

            } else {
              if (this.listItem[oind].layout === undefined) {
                this.listItem[oind].layout = {};
                this.listItem[oind].layout = {'visibility': 'visible'};
                this.mapObj.setLayoutProperty(this.listItem[oind].id, 'visibility', 'visible');
              } else {
                this.listItem[oind].layout['visibility'] = 'visible';
                this.mapObj.setLayoutProperty(this.listItem[oind].id, 'visibility', 'visible');
              }
            }

            // this.mapObj.setStyle(this.mapJson, {diff: true});
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);
            this.toastService.toast(toastCfg);
            // this.appService.layerEditorEventEmitter.emit([this.listItem[oind], oind]);
          },
          error => {
            toError(error);
          }
        );
    }
  }

  /* 流向图显隐 */

  hideFlowGrap(event: any) {
    const number = this.listItem.indexOf(event);
    this.listItem[number].metadata.showflowgraph = false;
    this.mapObj.hideEcharts();
  }

  showFlowGrap(event: any) {
    const number = this.listItem.indexOf(event);
    this.listItem[number].metadata.showflowgraph = true;
    this.mapObj.showEcharts(event);
  }

  hideLayer(item: any) {
    /*console.log(item);
    const oind = this.listItem.indexOf(item);
    console.log(oind);
    */
    if (this.editStatus === 0) {// 编辑状态为0的时候，不与服务器交互
      const oind = this.listItem.indexOf(item);
      this.listItem[oind].layout['visibility'] = 'none';
      this.mapObj.setStyle(this.mapJson, {diff: true});
    } else {
      let layertype, id;
      if (item.metadata.reference_type) {
        const oind = this.listItem.indexOf(item);
        layertype = '1'; // 引用图层
        id = this.listItem[oind].metadata.instance_layer_id;
      } else {
        layertype = '10'; // 复制自定义图层
        id = item.metadata.layer_style_id;
      }
      const visibility = 'none';
      const postData = {
        id: id,
        layer_type: layertype,
        visibility: visibility
      };
      this.httpService.getData(postData, true, 'execute', 'reviseLayerVisibility', 'em', 'em')
        .subscribe(
          (data: any) => {
            const self = this;
            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }

            const oind = this.listItem.indexOf(item);
            if (item.metadata.grouping) { // 如果有关联图层（统计图）
              for (let i = oind; i < oind + 3; i++) {
                if (this.listItem[i].layout === undefined) {
                  this.listItem[i].layout = {};
                  this.listItem[i].layout['visibility'] = 'none';
                  this.mapObj.setLayoutProperty(this.listItem[i].id, 'visibility', 'none');
                } else {
                  this.listItem[i].layout['visibility'] = 'none';
                  this.mapObj.setLayoutProperty(this.listItem[i].id, 'visibility', 'none');
                }
              }
            } else {
              if (this.listItem[oind].layout === undefined) {
                this.listItem[oind].layout = {};
                this.listItem[oind].layout['visibility'] = 'none';
                this.mapObj.setLayoutProperty(this.listItem[oind].id, 'visibility', 'none');
              } else {
                this.listItem[oind].layout['visibility'] = 'none';
                this.mapObj.setLayoutProperty(this.listItem[oind].id, 'visibility', 'none');
              }
            }

            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);
            this.toastService.toast(toastCfg);
            // this.appService.layerEditorEventEmitter.emit([this.listItem[oind], oind]);
          },
          error => {
            toError(error);
          }
        );
    }
  }

  // 扩展功能-显示
  toolsShow() {
    this.isToolShow = true;
  }

  // 扩展功能-隐藏
  toolsHide() {
    this.isToolShow = false;
  }

  // 扩展功能-设置中心点
  setCenter(tag: any) {
    const mapCenter = this.mapObj.getCenter();
    // const zoom = Math.round(this.mapObj.getZoom() * 10) / 10;
    const zoom = this.mapObj.getZoom();

    let postData;
    if (tag === 'map') {
      postData = {
        id: this.info.mapId,
        type: 'map',
        zoom: zoom,
        center: [mapCenter.lng, mapCenter.lat]
      };

    } else {
      postData = {
        id: this.info.layer_style_id,
        center: [mapCenter.lng, mapCenter.lat],
        zoom: zoom,
        type: 'layer_style'
      };
    }

    this.httpService.getData(postData, true, 'execute', 'reviseMapCenter', 'em', 'em')
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);
          this.toastService.toast(toastCfg);

        },
        error => {
          toError(error);
        }
      );
  }


  // 扩展功能-设置最小缩放
  setZoom() {
    // const vistInfo = localStorage.getItem('visitInfo') || '';
    // const info = JSON.parse(vistInfo);
    const info = this.ls.getObject('visitInfo');
    const id = info.mapId;
    const zoom = Math.round(this.mapObj.getZoom());
    const type = 'max';

    const postData = {
      map_id: id,
      type: type,
      zoom: zoom
    };
    this.httpService.getData(postData, true, 'execute', 'saveZoom', 'em', 'em')
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);

          this.toastService.toast(toastCfg);
        },
        error => {
          toError(error);
        }
      );
  }

  setBound() {
    // const visitInfo = localStorage.getItem('visitInfo') || '';
    // const info = JSON.parse(visitInfo);
    const info = this.ls.getObject('visitInfo');
    const bounds = this.mapObj.getBounds();
    const id = info.mapId;
    const bound = [
      [bounds._ne.lat, bounds._ne.lng],
      [bounds._sw.lat, bounds._sw.lng]];
    const postData = {
      map_id: id,
      bounds: bound
    };
    this.httpService.getData(postData, true, 'execute', 'saveBounds', 'em', 'em')
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);
          this.toastService.toast(toastCfg);
        },
        error => {
          toError(error);
        }
      );
  }


  test() {
    this.mapObj.removeControl(this.drawControl);
    this.closePanel();
  }

  // 切换底图
  toggleMap() {
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
        this.postData = {
          mapID: mapid,
          version: version
        };
        this.httpService.getData(this.postData, true, 'execute', 'getMapStyle', 'em', 'em')
          .subscribe(
            (data: any) => {
              this.getJson(data.data);
              // 传参:编辑的地理专题图层ID 选择的地图id
              this.saveData();
            }
          );


      }
    });
  }

  // 将json地址转换成json
  getJson(url: any): Promise<any> {
    const self = this;
    return this.httpService.getFile(url)
      .toPromise()
      .then((res: any) => {
        const mapData = res;
        // 替换地理专题底图图层
        this.changeMap(mapData);
      })
      .catch(this.handleError);
  }

  /**
   * 切换底图
   * v2.6 切换后保持当前中心点和缩放级别
   * @param mapData
   */
  changeMap(mapData: any) {
    // 1.替换原地图图层
    // 原地图删除与no_default_id不匹配的图层
    const self = this;
    const keepLayerId = this.mapJson.metadata.no_default_id; // 数组
    const keepLayerSourceId = ([] as any);
    const keepLayerSource = ({} as any);
    const newMapLayers = ([] as any);
    const zoom = this.mapObj.getZoom();
    const center = this.mapObj.getCenter();
    keepLayerId.map(function (item: any) {
      self.mapJson.layers.map(function (value: any) {
        if (item === value.id) {
          newMapLayers.push(value);
          keepLayerSourceId.push(value.source);
        }
      });
    });

    // 将原地图保留下来的图层与新地图的图层合并
    this.mapJson.layers = mapData.layers.concat(newMapLayers);

    // 2.替换原地图数据源
    keepLayerSourceId.map(function (value: any) {
      for (const key in self.mapJson.sources) {
        if (value === key) {
          keepLayerSource[key] = self.mapJson.sources[key];
        }
      }
    });

    // 将原地图保留下来的数据源与新地图的数据源合并
    this.mapJson.sources = Object.assign(keepLayerSource, mapData.sources);
    this.mapJson.metadata = Object.assign(this.mapJson.metadata, mapData.metadata);
    this.mapObj.setStyle(this.mapJson);
    this.mapObj.setZoom(zoom);
    this.mapObj.setCenter(center);
    // this.mapObj.setZoom(mapData.zoom);
    // this.mapObj.setCenter(mapData.center);
  }

  saveData() {
    const data = {
      map_id: this.postData.mapID,
      layer_style_id: this.info.layer_style_id
    };
    this.httpService.getData(data, true, 'execute', '85e43597-c9e7-40f2-b99a-ba237b25743f', '')// ,
      .subscribe();
  }

  // 接受子组件mini-program发送的点击地图是否显示弹出的布尔值
  receiveMiniProgramInfo(data: any) {
    this.showPoupue = data;
  }


  /**
   * 地理图层set数据源
   */
  setDataSource() {
    if (this.mapJson.sources[this.currentLayer.source].type === 'geojson') {
      this.mapObj.getSource(this.currentLayer.source).setData(this.mapJson.sources[this.currentLayer.source].data);
    } else {
      this.mapObj.setStyle(this.mapJson, {diff: false});
    }
  }

  // 图层、小程序选项卡
  tabToggle(index: any) {
    if (this.mapJson && this.mapJson.metadata) {
      this.tabIndex = index;
    }
    if (index === 0) {
      const aa = localStorage.fi;
      if (aa) {
        const c = aa.split(',');
        if (aa !== '') {
          c.forEach((v: any) => {
            this.mapObj.setFilter(v, ['all']);
          });
          localStorage.setItem('fi', '');
        }
      }
      // 图层过滤小程序点击图层选项卡时，清除小程序中输入框中的条件
      const input_data = (document.getElementsByClassName('input_data') as any);
      if (input_data.length !== 0) {
        for (let i = 0; i < input_data.length; i++) {
          input_data[i].value = '';
        }
      }

      const btn = (document.getElementsByClassName('btn_clean') as any);
      for (let i = 0; i < btn.length; i++) {
        btn[i].click();
      }
    } else {
    }
  }


  reaseView(e: any) {
    if (e === 'public') {
      const style = this.mapJson;
      const zoom = this.mapObj.getZoom();
      const center = this.mapObj.getCenter();
      const bearing = this.mapObj.getBearing();
      const pitch = this.mapObj.getPitch();
      const refModal = this.modalService.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
      refModal.componentInstance.type = 16;
      refModal.componentInstance.keyConfig = {title: '发布预览'};
      refModal.componentInstance.modalData = {
        style: style,
        zoom: zoom,
        center: center,
        bearing: bearing,
        pitch: pitch
      };

      refModal.result.then(
        (result) => {
          this.publish(result);
        },
        (reason) => {
        });
    } else if (e === 'close') {
      this.printStatus = false;
    } else {
      this.printStatus = true;
      this.imgUrl = e;
    }
  }


  /**
   * 发布图片上传
   * @param imgUrl
   */
  publish(imgUrl: any) {
    if (this.info.type === 'map') {
      const file = this.dataURLtoFile(imgUrl, this.mapJson.id + '.jpg'); // 添加图片名称
      // this.httpService.uploadFileRequest({forceDelete: true}, [file], 'map', 'img', 'fb')
      this.httpService.makeFileRequest('/upload/1.0.0/layer/img', {forceDelete: true}, [file])
        .subscribe(
          data => {
            if ((data as any).data && (data as any).data.upload_file && (data as any).data.upload_file.uploads) {
              this.publicStyle({
                thumbnail: (data as any).data.upload_file.uploads,
                mapID: this.mapJson.id,
                version: 'release'
              }, 'getMapStyle');
            }

          }, error => {
          }
        );
    }

    if (this.info.type === 'geo') {
      const file = this.dataURLtoFile(imgUrl, this.info.layer_style_id + '.jpg'); // 添加图片名称
      // this.httpService.uploadFileRequest({forceDelete: true}, [file], 'layer', 'img', 'fb')
      this.httpService.makeFileRequest('/upload/1.0.0/layer/img', {forceDelete: true}, [file])
        .subscribe(
          data => {
            if ((data as any).data && (data as any).data.upload_file && (data as any).data.upload_file.uploads) {
              this.publicStyle({
                thumbnail: (data as any).data.upload_file.uploads,
                layerStyleID: this.info.layer_style_id,
                version: 'release'
              }, 'getGeographyLayerStyle');
            }
          }, error => {

          }
        );
    }

  }


  /**
   * 发布样式
   * @param body
   * @param url
   */
  publicStyle(body: any, url: any) {
    this.httpService.getData(body, true, 'execute', url, 'em', 'em')
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          // imgUrl();
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '发布成功!', 2000);
          this.toastService.toast(toastCfg);
          return;
        }
      );
  }


  /**
   * base 转 file
   * @param dataurl
   * @param filename
   */
  dataURLtoFile(dataurl, filename) { // 将base64转换为文件
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let nl = bstr.length;
    const u8arr = new Uint8Array(nl);
    while (nl--) {
      u8arr[nl] = bstr.charCodeAt(nl);
    }
    return new File([u8arr], filename, {type: mime});
  }


  /**最佳视野*************************/
  bestCenter(layer_style: any) {
    if (layer_style.metadata.status === 10) {
      return;
    }
    const postData = {layer_style_id: layer_style.metadata.layer_style_id};
    this.httpService.getData(postData, true, 'execute', 'getDataBox', 'em', 'em')// 1.请求的参数 2.是否带token值 3，模块分类 4，路径方式
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            const box = data.data.slice(4, -1).split(',');
            this.bounds = [box[0].split(' '), box[1].split(' ')];
            if (this.getLayerZoom(layer_style)[0] > this.getBestZoom(this.bounds)[0]) {
              const lng = (Number(this.bounds[0][0]) + Number(this.bounds[1][0])) / 2;
              const lat = (Number(this.bounds[0][1]) + Number(this.bounds[1][1])) / 2;
              this.mapObj.jumpTo({center: [lng, lat], zoom: this.getLayerZoom(layer_style)[0]});
            } else {
              this.mapObj.fitBounds(this.bounds, {
                padding: {top: 50, bottom: 50, left: 50, right: 50},
                animate: false
              });
            }
          }
        },
        error => {
          toError(error);
        }
      );
  }

  getBestCenter() {
    const layer_style = this.listItem[this.listItem.length - 1];
    this.bestCenter(layer_style); // 实时点击计算最佳视野
    /*if (this.bounds) {
      if (this.getLayerZoom(layer_style)[0] > this.getBestZoom(this.bounds)[0]) {
        const lng = (Number(this.bounds[0][0]) + Number(this.bounds[1][0])) / 2;
        const lat = (Number(this.bounds[0][1]) + Number(this.bounds[1][1])) / 2;
        this.mapObj.jumpTo({center: [lng, lat], zoom: this.getLayerZoom(layer_style)[0]});
      } else {
        this.mapObj.fitBounds(this.bounds, {
          padding: {top: 50, bottom: 50, left: 50, right: 50},
          animate: false
        });
      }
    } else {
      this.bestCenter(layer_style);
    }*/
  }

  getBestZoom(bound: any) {
    const grade = [];
    let zoom = [];
    for (let m = 0; m < 23; m++) {
      grade.push(((85.05113 + 85.05113) / 512) * Math.pow(2, -m));
    }
    const dimensions = this.mapObj._containerDimensions();
    const width = dimensions[0];
    const height = dimensions[1];
    const dissX = Math.abs(bound[0][0] - bound[1][0]) / width;
    const dissY = Math.abs(bound[0][1] - bound[1][1]) / height;
    const grade1 = Math.min(dissX, dissY);
    for (let i = 0; i < grade.length; i++) {
      if (grade[i] > grade1 && grade1 > grade[i + 1]) {
        zoom = [i, Number(i + 1)];
      } else {
      }
    }
    return zoom;
  }

  getLayerZoom(layer) {
    const min = layer.minzoom;
    const max = layer.maxzoom;
    const zoom = [min ? min : 0, max ? max : 24];
    return zoom;
  }

  smxTreeClick(item) {
    if (item.type === 'click') {
      let index = null;
      for (let i = 0; i < this.mapJson.layers.length; i++) {
        if (this.mapJson.layers[i].id === item.item.layers.id) {
          index = i;
        }
      }
      this.layerClick(item.item.layers, this.listItem, index);
    } else if (item.type === 'remove') {
      this.panelShow = false;
      // 将删除事件发射给订阅该事件的小程序
      // this.appService.onLayerDeleteEmitter.emit(item.item.layer_id);
    }
  }


}


