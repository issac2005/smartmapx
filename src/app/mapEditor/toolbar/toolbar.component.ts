///<reference path="../../../typings.d.ts"/>
import {toError} from '../../smx-component/smx-util';
import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {HttpService} from '../../s-service/http.service';
import {LocalStorage} from '../../s-service/local.storage';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {addMapControl} from '../../s-service/smx-map';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, OnDestroy {
  @Input() map: any;
  @Input() loaded: any;
  @Input() config: any;
  @Output() exportEvent = new EventEmitter();
  @Output() inspectClick = new EventEmitter();
  inspect: any;
  mapAndViewboolean = false;
  extendfunctionboolen = false;
  minZoomBoolean = false;
  maxZoomBoolean = false;
  boundBoolean = false;
  btnStatus = false;
  zoomValue: any;
  rotateValue: any;
  info: any;
  mc: any;
  screenStatus: any;
  fullScreen: any;
  measour_enclick1 = false;
  measour_enclick2 = false;
  mapWanderBoolean = false;

  mapObj: any;
  mapJson: any;


  zoomListener: any;
  rotateListener: any;


  constructor(
    private httpService: HttpService,
    private toastService: ToastService,
    private ls: LocalStorage) {
  }


  ngOnInit() {
    this.info = this.ls.getObject('visitInfo');
    // 限制状态处理判断条件（设置最大缩放级别，最小缩放级别，固定视窗）
    this.initBounds();


    this.zoomValue = this.map.getZoom();
    this.rotateValue = this.map.getBearing();


    this.zoomListener = () => {
      this.zoomValue = this.fixString(this.map.getZoom().toFixed(1));
    };


    this.rotateListener = () => {
      this.rotateValue = -this.map.getBearing();
    };

    const data = setInterval(() => {
      if (this.map.isStyleLoaded()) {
        clearInterval(data);
        this.inspect = addMapControl(this.map, 'inspect');
      }
    }, 100);


    // 当前缩放级别及旋转角度监听
    this.map.on('zoomend', this.zoomListener);
    this.map.on('rotate', this.rotateListener);

    this.mc = addMapControl(this.map, 'measure', null, {showButton: false});
  }


  ngOnDestroy() {
    this.map.off(this.zoomListener);
    this.map.off(this.rotateListener);
  }

  initBounds() {
    if (!this.config.lock_bounds) {
      this.boundBoolean = false;
    } else {
      this.boundBoolean = true;
    }
    if (!this.config.lock_max) {
      this.maxZoomBoolean = false;
    } else {
      this.maxZoomBoolean = true;
    }
    if (!this.config.lock_min) {
      this.minZoomBoolean = false;
    } else {
      this.minZoomBoolean = true;
    }
  }


  fixString(str: string) {
    const i = str.indexOf('.0');
    return i === -1 ? str : str.substring(0, i);
  }


  // toolbarZoom='10';
  // 放大
  mapMagnifying() {
    this.map.zoomIn();
  }

  // 缩小
  mapReduce() {
    this.map.zoomOut();
  }

  // 漫游启动禁止
  mapWander() {
    if (this.mapWanderBoolean === false) {
      this.mapWanderBoolean = true;
    } else {
      this.mapWanderBoolean = false;
    }
    if (this.btnStatus === false) {
      this.map.boxZoom.disable();
      this.map.scrollZoom.disable();
      this.map.dragPan.disable();
      this.map.dragRotate.disable();
      this.map.doubleClickZoom.disable();
      this.map.touchZoomRotate.disable();
      this.map.keyboard.disable();
      this.btnStatus = true;
      return;
      // 颜色的变化

    } else {
      this.map.boxZoom.enable();
      this.map.scrollZoom.enable();
      this.map.dragPan.enable();
      this.map.dragRotate.enable();
      this.map.doubleClickZoom.enable();
      this.map.touchZoomRotate.enable();
      this.map.keyboard.enable();
      this.btnStatus = false;
      return;
    }

  }

  // 全图
  allMap(options?: any) {
    const style = this.map.getStyle();
    const sources = style.sources;
    if (sources) {
      let mapBounds = [180, 85.0511, -180, -85.0511];
      for (const name in sources) {
        if (name) {
          const bounds = this.map.getSource(name).bounds;
          if (bounds && bounds.length === 4) {
            if (bounds[0] < mapBounds[0]) {
              mapBounds[0] = bounds[0];
            }
            if (bounds[1] < mapBounds[1]) {
              mapBounds[1] = bounds[1];
            }

            if (bounds[2] > mapBounds[2]) {
              mapBounds[2] = bounds[2];
            }

            if (bounds[3] > mapBounds[3]) {
              mapBounds[3] = bounds[3];
            }

          }
        }

      }
      if (mapBounds[0] === 180) {
        mapBounds = [-180, -85.0511, 180, 85.0511];
      }
      this.map.fitBounds(mapBounds, options);
    }

  }

  // 指北针
  northarrow() {
    this.map.jumpTo({pitch: 0});
    this.map.resetNorth();
  }


  // 设置最小缩放级别
  setMinZoom() {
    let id;
    let postData;
    let url;
    const type = this.info.type;
    const zoom = Math.round(this.map.getZoom());

    if (type === 'map') {
      id = this.info.mapId;
      postData = {
        map_id: id,
        minZoom: zoom,
        lock_min: 1
      };
      url = '118bf4f6-c88b-4644-be5e-dd04d4a32c07';
    } else if (type === 'plot') {
      id = this.info.plotId;
      postData = {
        plot_id: id,
        minzoom: zoom,
        lock_min: 1
      };
      url = 'ae46115c-4fbb-4e38-9361-547f54b3de40';
    }

    if (this.minZoomBoolean === false) {
      if (!this.config.maxzoom || this.config.maxzoom > zoom) {
        this.minZoomBoolean = true;
        this.httpService.getData(postData, true, 'execute', url, '')
          .subscribe(
            (data: any) => {
              if ((data as any).status <= 0) {
                const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
                this.toastService.toast(toast);
                return;
              }


              this.config.minzoom = zoom;
              this.config.lock_min = 1;
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);
              this.toastService.toast(toastCfg);
            },
            error => {
              toError(error);
            }
          );
      } else {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '最小缩放级别不能大于最大缩放级别!', 2000);
        this.toastService.toast(toastCfg);
      }
    } else {
      this.minZoomBoolean = false;
      let postData1;
      if (type === 'map') {
        postData1 = {
          map_id: id,
          minZoom: 0,
          lock_min: 0
        };
      } else if (type === 'plot') {
        postData1 = {
          plot_id: id,
          minzoom: 0,
          lock_min: 0
        };
      }
      this.httpService.getData(postData1, true, 'execute', url, '')
        .subscribe(
          (data: any) => {
            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }

            this.config.minzoom = 0;
            this.config.lock_min = 0;
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '取消成功!', 2000);

            this.toastService.toast(toastCfg);
          },
          error => {
            toError(error);
          }
        );
    }

  }

  // 设置最大缩放级别
  setMaxZoom() {
    let id;
    let postData;
    let url;
    const zoom = Math.round(this.map.getZoom());
    const type = this.info.type;

    if (type === 'map') {
      id = this.info.mapId;
      postData = {
        map_id: id,
        maxZoom: zoom,
        lock_max: 1
      };
      url = '609d1824-ca8a-4eb1-b9df-2f251b490009';
    } else if (type === 'plot') {
      id = this.info.plotId;
      postData = {
        plot_id: id,
        maxzoom: zoom,
        lock_max: 1
      };
      url = 'b3b2db52-493b-4b57-952c-472bfe59a420';
    }
    if (this.maxZoomBoolean === false) {
      if (!this.config.minzoom || this.config.minzoom < zoom) {
        this.maxZoomBoolean = true;

        this.httpService.getData(postData, true, 'execute', url, '')
          .subscribe(
            (data: any) => {
              if ((data as any).status <= 0) {
                const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
                this.toastService.toast(toast);
                return;
              }

              this.config.maxzoom = zoom;
              this.config.lock_max = 1;
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);
              this.toastService.toast(toastCfg);
            },
            error => {
              toError(error);
            }
          );
      } else {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '最大缩放级别不能小于最小缩放级别!', 2000);
        this.toastService.toast(toastCfg);
      }
    } else {
      this.maxZoomBoolean = false;
      let postData1;
      if (type === 'map') {
        postData1 = {
          map_id: id,
          maxZoom: 22,
          lock_max: 0
        };
      } else if (type === 'plot') {
        postData1 = {
          plot_id: id,
          maxzoom: 22,
          lock_max: 0
        };
      }
      this.httpService.getData(postData1, true, 'execute', url, '')
        .subscribe(
          (data: any) => {
            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }

            this.config.maxzoom = 22;
            this.config.lock_max = 0;
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '取消成功!', 2000);
            this.toastService.toast(toastCfg);
          },
          error => {
            toError(error);
          }
        );
    }
  }

  // 固定视窗
  setBound() {
    const bounds = this.map.getBounds();
    const type = this.info.type;
    let id;
    let url;
    let postData;
    const bound =
      [[bounds._sw.lng, bounds._sw.lat], [bounds._ne.lng, bounds._ne.lat]];
    if (type === 'map') {
      id = this.info.mapId;
      postData = {
        map_id: id,
        bounds: JSON.stringify(bound),
        lock_bounds: 1
      };
      url = '997ae9a9-d3d4-483d-a369-65ef0c1b1c92';
    } else if (type === 'plot') {
      id = this.info.plotId;
      postData = {
        plot_id: id,
        bounds: JSON.stringify(bound),
        lock_bounds: 1
      };
      url = 'f29695ff-2c8d-4e99-b91a-18bc06e75d7d';
    }
    if (this.boundBoolean === false) {
      this.boundBoolean = true;
      this.httpService.getData(postData, true, 'execute', url, '')
        .subscribe(
          (data: any) => {
            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }
            // this.map.setMaxBounds(bounds);
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);
            this.toastService.toast(toastCfg);
          },
          error => {
            toError(error);
          }
        );
    } else {
      this.boundBoolean = false;
      let postData1;
      if (type === 'map') {
        postData1 = {
          map_id: id,
          bounds: null,
          lock_bounds: 0
        };
      } else if (type === 'plot') {
        postData1 = {
          plot_id: id,
          bounds: null,
          lock_bounds: 0
        };
      }
      this.httpService.getData(postData1, true, 'execute', url, '')
        .subscribe(
          (data: any) => {
            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }

            // this.map.setMaxBounds(null);
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '取消成功!', 2000);
            this.toastService.toast(toastCfg);
          },
          error => {
            toError(error);
          }
        );
    }
  }

// 扩展功能-设置中心点
  setCenter(tag?: any) {
    const mapCenter = this.map.getCenter();
    // const mapZoom = Math.round(this.map.getZoom());
    const mapZoom = this.map.getZoom();
    const mapPitch = this.map.getPitch();
    const mapBearing = this.map.getBearing();
    let id;
    let postData;
    let url;
    const type = this.info.type;
    if (type === 'map') {
      id = this.info.mapId;
      postData = {
        map_id: id,
        center: mapCenter.lng + ',' + mapCenter.lat,
        zoom: mapZoom,
        pitch: mapPitch,
        bearing: mapBearing
      };
      url = '7e1e2082-76f3-4c25-8a56-f4ff36738019';
    } else if (type === 'plot') {
      id = this.info.plotId;
      postData = {
        plot_id: id,
        center: mapCenter.lng + ',' + mapCenter.lat,
        zoom: mapZoom,
        pitch: mapPitch,
        bearing: mapBearing
      };
      url = 'cedf8928-6a9d-4735-a95b-505c555c3db2';
    }
    this.httpService.getData(postData, true, 'execute', url, '')
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '保存成功!', 2000);
          this.toastService.toast(toastCfg);
        },
        error => {
          toError(error);
        }
      );
  }

// 测距
  measureDistance() {
    this.mc.startMeasure('measure-distance-on');
  }

// 测面
  measureAre() {
    this.mc.startMeasure('measure-area-on');
  }

  // 地图检视 状态码 以及地图和检视转换
  changeMapViewStatus() {
    this.inspect.toggleInspector();
    // this.inspectClick.emit();
    if (this.mapAndViewboolean === false) {
      this.mapAndViewboolean = true;
    } else {
      this.mapAndViewboolean = false;
    }
  }


// 全屏状态码切换
  changeScreenStatus() {
    this.fullScreen = addMapControl(this.map, 'fullscreen', null, {showButton: false})
    this.fullScreen._onClickFullscreen();
    if (this.screenStatus === true) {
      this.screenStatus = false;
      return;
    } else {
      this.screenStatus = false;
      return;
    }

  }


  // 扩展功能状态码
  changeExtend() {
    if (this.extendfunctionboolen === false) {
      this.extendfunctionboolen = true;
      return;
    } else {
      this.extendfunctionboolen = false;
      return;
    }
  }


  /**
   * 发布
   */
  publicMap() {
    this.exportEvent.emit('public');
  }

  // 切换底图--李景阳
  changeMap() {
    this.exportEvent.emit('change');
  }

  // 打印
  print() {
    // ;
    // const newstr = (document.getElementById('map') as any).getElementsByClassName('smartmapx-canvas');
    const imgUrl = this.map.getCanvas().toDataURL('image/png');
    // console.log(imgUrl);
    this.exportEvent.emit(imgUrl);
    setTimeout(() => {
      window.print();
      this.exportEvent.emit('close');
    }, 10);
  }


}
