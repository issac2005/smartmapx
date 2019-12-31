import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {toError} from '../smx-component/smx-util';
import {HttpService} from '../s-service/http.service';
import {SmxModal} from '../smx-component/smx-modal/smx-modal.module';
import {Router} from '@angular/router';
import {PopueComponent} from '../data/modal/data-popue.component';
import {DataStorage, LocalStorage} from '../s-service/local.storage';
import * as validateStyleMin from '@smx/smartmapx-gl-style-validate';
import * as GlSpec from '@smx/smartmapx-gl-style-validate/reference/latest.js';
import {RasterPanelComponent} from './raster-panel/raster-panel.component';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';
import {addMapControl, getMapInstance} from '../s-service/smx-map';

@Component({
  selector: 'app-smx-raster',
  templateUrl: './smx-raster.component.html',
  styleUrls: ['./smx-raster.component.scss']
})
export class SmxRasterComponent implements OnInit {
  @ViewChild(RasterPanelComponent, {static: false}) btn: RasterPanelComponent;
  @Input() keyConfig: any; // 信息配置
  postData: any;
  mapJson: any;
  mapObj: any;
  info: any; // 本地信息
  layerInfo: any; // 图层信息
  map: any;
  mapId: any;
  imageBoolean = false;
  isImage = false;
  listItem: any; // 图层列表
  name: any; // 传进来的name
  url: any;
  type: any;
  title: any; // 图层名称
  mapOpacity = 100;
  isMapOpacity: any; // 地图透明度弹框
  lngLat = [];
  styleUrl: any; // 地图样式路径
  layerBootomBtn: any;
  panelShow = true; // 面板伸缩判断标志
  properties: any;
  maploaded = false;  // 地图加载状态

  constructor(private httpService: HttpService,
              private modalService: SmxModal,
              private toastService: ToastService,
              public router: Router,
              private ds: DataStorage,
              private ls: LocalStorage) {
  }

  ngOnInit() {
    this.properties = <any>this.ds.get('properties');
    this.info = this.ls.getObject('data_info');
    // 加载地图样式
    this.getRasterMap();

    // 设置地图透明度的框
    this.isMapOpacity = false;
  }

  // 返回上级页面，路由跳转
  goBack() {
    const goback = this.ls.get('goback_share');
    if (goback === '0') {
      this.ls.set('goback_share', '1');
    }
    this.router.navigate(['/app/raster'], {queryParams: {module: 'raster'}});
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

        // tslint:disable-next-line:one-variable-per-declaration
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
              // 切换地图的时候如果在之前置底了，切换后会取消，手动给置为false
              this.btn.layerBootomBtn = false;
            }
          );


      }
    });
  }

  // 将json地址转换成json
  getJson(url: any): Promise<any> {
    return this.httpService.getFile(url)
      .toPromise()
      .then((res: any) => {
        const mapData = res;
        // 替换地理专题底图图层
        this.changeMap(mapData);
      })
      .catch(this.handleError);
  }

  saveData() {
    const data = {
      map_id: this.postData.mapID,
      layer_style_id: this.info.layer_style_id
    };
    this.httpService.getData(data, true, 'execute', '85e43597-c9e7-40f2-b99a-ba237b25743f', '')
      .subscribe();
  }

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

    // 给新的地图图层添加透明度属性
    this.addOpacity(this.mapJson.layers);
  }

  // 异常
  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  reaseView() {
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

  }

  /**
   * 发布图片上传
   * @param imgUrl
   */
  publish(imgUrl: any) {
    const file = this.dataURLtoFile(imgUrl, this.info.layer_style_id + '.jpg'); // 添加图片名称
    // this.httpService.uploadFileRequest({forceDelete: true}, [file], 'map', 'img', 'fb')
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


  // 保存视窗中心点
  saveWindow() {
    const zoom = this.mapObj.getZoom();
    const center = this.mapObj.getCenter();
    // const token_id = localStorage.getItem('id_token');
    const postBody = {
      id: this.info.layer_style_id,
      center: center.lng + ',' + center.lat,
      // tslint:disable-next-line:object-literal-shorthand
      zoom: zoom,
      type: 'layer_style',
    };
    this.httpService.getData(postBody, true, 'execute', 'reviseMapCenter', 'em', 'em')
      .subscribe(
        response => {
          if ((response as any).status > 0) {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '保存成功！', 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          toError(error);
        }
      );
  }

  /**
   * 加载地理地图
   */
  getRasterMap() {
    const postData = {version: 'current', layerStyleID: this.info.layer_style_id};
    this.httpService.getData(postData, true, 'execute', 'getGeographyLayerStyle', 'em', 'em')// 1.请求的参数 2.是否带token值 3，模块分类 4，路径方式
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.styleUrl = data.data;
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
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < self.mapJson.layers.length; i++) {
          if (self.mapJson.layers[i].type === 'raster') {
            this.layerInfo = self.mapJson.layers[i];
          }
        }
        const options = {style: mapData};

        const map = getMapInstance('rasterId', options);

        // 加载地图全屏控件
        addMapControl(map, 'fullscreen');
        addMapControl(map, 'navigation');
        self.mapObj = map;
        map.on('load', () => {
          this.maploaded = true;
          this.name = this.layerInfo.metadata.name;
          this.type = this.layerInfo.type;
          // 图层的url
          const str = self.layerInfo.source;

          self.title = this.layerInfo.metadata.layer_name;

          // 所有图层数组
          this.listItem = self.mapJson.layers;
          // 给所有图层添加默认透明度
          this.addOpacity(this.listItem);
          this.mapJson.layers = this.listItem;


          if (map.getSource(str).type === 'image') {
            // this.rasterUrl = map.getSource(str).url;
            this.url = map.getSource(str).url;
            this.lngLat = map.getSource(str).coordinates;
            this.isImage = true;
          } else {
            // this.rasterUrl = map.getSource(str).tiles[0];
            this.url = map.getSource(str).tiles[0];
          }
          // this.url = this.rasterUrl;
          // // 显示级别
          // this.rangeValues = [map.getSource(str).minzoom, map.getSource(str).maxzoom];
        });
      })
      .catch(this.handleError);

  }

  // 给地图图层添加上透明度属性
  addOpacity(item: any) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < item.length; i++) {
      if (item[i].type === 'background') {
        if (item[i].paint['background-opacity']) {
          item[i].paint['background-opacity'] = 1;
        } else {
          item[i].paint['background-opacity'] = 1;
        }
      }

      if (item[i].type === 'symbol') {
        if (item[i].paint) {
          if (item[i].paint['icon-opacity']) {
            // 透明度属性存在，也都把透明度设置为1
            item[i].paint['icon-opacity'] = 1;
          } else {
            // 透明度属性不存在，给paint加上透明度属性字段，并赋值为1
            item[i].paint['icon-opacity'] = 1;
          }
        } else {
          // 点图层没有paint属性 加一个paint属性
          item[i].paint = {'icon-opacity': 1};
        }
      }

      if (item[i].type === 'line') {
        if (item[i].paint['line-opacity']) {
          if (item[i].paint['line-opacity'].stops) {
            // 透明度属性分级存在，也都把透明度设置为1
            item[i].paint['line-opacity'].stops[0] = [0, 1];
            item[i].paint['line-opacity'].stops[1] = [0, 1];
          } else {
            // 透明度属性存在但是不分级，也都把透明度设置为1
            item[i].paint['line-opacity'] = 1;
          }
        } else {
          // 透明度属性存在，也都把透明度设置为1
          item[i].paint['line-opacity'] = 1;
        }
      }

      if (item[i].type === 'fill') {
        if (item[i].paint['fill-opacity']) {
          item[i].paint['fill-opacity'] = 1;
        } else {
          item[i].paint['fill-opacity'] = 1;
        }
      }

      if (item[i].type === 'raster') {
        if (item[i].paint) {
          if (this.layerInfo.paint) {
            // 在切换底图时，如果原有栅格图层设置了透明度，把原来的透明度赋值给新图层
            item[i].paint['raster-opacity'] = this.layerInfo.paint['raster-opacity'];
          } else {
            item[i].paint['raster-opacity'] = 1;
          }
        } else {
          item[i].paint = {'raster-opacity': 1};
        }
      }
    }
  }

  // 地图透明度框
  openOpacity() {
    this.isMapOpacity = !this.isMapOpacity;
  }

  // 地图透明度改变
  mapOpacityChange(e: any) {
    const value = e / 100;
    this.mapOpacity = e;
    this.listItem = this.mapJson.layers;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.listItem.length; i++) {

      if (this.listItem[i].type === 'background') {
        this.listItem[i].paint['background-opacity'] = value;
      }

      if (this.listItem[i].type === 'fill') {
        this.listItem[i].paint['fill-opacity'] = value;
      }

      if (this.listItem[i].type === 'symbol') {
        this.listItem[i].paint['icon-opacity'] = value;
      }

      if (this.listItem[i].type === 'line') {
        if (this.listItem[i].paint['line-opacity'].stops) {
          this.listItem[i].paint['line-opacity'].stops[0] = [0, value];
          this.listItem[i].paint['line-opacity'].stops[1] = [0, value];
        } else {
          this.listItem[i].paint['line-opacity'] = value;
        }
      }
    }

    this.mapJson.layers = this.listItem;
    this.mapObj.setStyle(this.mapJson);
  }


  // 设置编辑栅格图层
  editorRasterLayer() {
    this.imageBoolean = !this.imageBoolean;
    if (this.imageBoolean === true) {
      const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-popule'});
      modalRef.componentInstance.type = 22;
      modalRef.componentInstance.modalData = {
        mapOptions: {
          mapId: this.properties.serviceIP.default_map_id || 'map_id_1',
          center: [(this.lngLat[0][0] + this.lngLat[2][0]) / 2, (this.lngLat[0][1] + this.lngLat[2][1]) / 2],
          zoom: 10
        },
        mapBase: this.properties.serviceIP.basemap,
        url: this.url,
        coordinates: this.lngLat,
        style: this.styleUrl
      };
      modalRef.componentInstance.keyConfig = {title: '地图校准'};
      modalRef.result.then(result => {
        const str = this.layerInfo.source;
        if (this.mapObj.getSource(str).type === 'image') {
          // 根据数据源id拿到数据源里的经纬度数组
          this.mapObj.getSource(str).setCoordinates(result.coordinates);
          this.lngLat = result.coordinates;
          this.mapJson.sources[str].coordinates = result.coordinates;
        }

        // 修改完图片经纬度后把按钮样式重置回来
        this.imageBoolean = false;

        // 地图里修改图片经纬度后存库操作
        const postdata = {
          layer_id: this.info.layer_id,
          source_url: {coordinates: result.coordinates, type: this.mapObj.getSource(str).type, url: this.url}
        };
        this.httpService.getData(postdata, true, 'execute', '8a927155-2d64-43d0-9832-09541a3d2ef8', '')
          .subscribe(
            (data: any) => {
              if ((data as any).status <= 0) {
                const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
                this.toastService.toast(toast);
                return;
              }
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改成功！', 2000);
              this.toastService.toast(toastCfg);
              // 修改完图片经纬度更新地图样式
              //this.mapObj.setStyle(this.mapJson, {diff : true});
              return;
            }
          );
      }, reson => {
        this.imageBoolean = false;
      });
    }
  }


  changeStyle(json: any) {
    this.layerInfo = json;
    // this.mapJson = json;
    const value = this.layerInfo;
    for (let i = 0; i < this.mapJson.layers.length; i++) {
      if (this.mapJson.layers[i].type === 'raster') {
        this.mapJson.layers[i] = this.layerInfo;
      }
    }
    const errors = validateStyleMin(this.mapJson, GlSpec);
    if (errors.length > 0) {
      const toastCfg = new ToastConfig(ToastType.ERROR, '', '您的编辑不符合样式规范!', 5000, true, errors[0].message);
      this.toastService.toast(toastCfg);
      return;
    }
    let postdata;
    postdata = {
      content: JSON.stringify(value),
      layer_style_id: value.metadata.layer_style_id,
      layer_id: value.metadata.layer_id,
      name: value.metadata.name
    };

    this.listItem = this.mapJson.layers;

    this.mapJson.layers = this.listItem;

    this.mapObj.setStyle(this.mapJson, {diff: true});

    // 在编辑面板修改存库
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
  }

  // 图层置底
  setLayerBottom(bottomType: any) {
    this.layerBootomBtn = bottomType.type;
    this.layerInfo = bottomType.value;
    if (this.layerBootomBtn) {
      const midArray = [];
      midArray.push(this.layerInfo);
      for (let i = 0; i < this.mapJson.layers.length - 1; i++) {
        midArray.push(this.mapJson.layers[i]);
      }
      this.mapJson.layers = midArray;
    } else {
      const midArray = [];
      for (let i = 1; i < this.mapJson.layers.length; i++) {
        midArray.push(this.mapJson.layers[i]);
      }
      midArray.push(this.layerInfo);
      this.mapJson.layers = midArray;
    }
    this.mapObj.setStyle(this.mapJson, {diff: true});
  }

  // 关闭编辑面板
  closePanel() {
    this.panelShow = !this.panelShow;
  }

  // 修改图层名称
  changeLayerName(result: any) {

    if (result.tag === 'layer') {
      const postdata = {
        layer_id: this.layerInfo.metadata.layer_id,
        name: result.value
      };
      this.httpService.getData(postdata, true, 'execute', '8e2a7de2-fe0c-404a-86fc-f9554f4f552e', '')
        .subscribe(
          (data: any) => {
            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }
            this.btn.changeName(result.value, result.tag);
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改成功！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
        );
    }

    if (result.tag === 'layer_style') {
      this.btn.changeName(result.value, result.tag);
    }

  }


}
