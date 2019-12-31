import {Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import * as smartmapx from '@smx/api';
import {AppService} from '../../s-service/app.service';
import * as DrawControl from '@smx/smartmapx-draw';
import {debounceTime} from 'rxjs/operators';
import {HttpService} from '../../s-service/http.service';
import {SmxModal} from '../../smx-component/smx.module';
import {PopueComponent} from '../../data/modal/data-popue.component';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {DataStorage} from '../../s-service/local.storage';

@Component({
  selector: 'plot-edit',
  templateUrl: './plot-edit.component.html',
  styleUrls: ['./plot-edit.component.scss']
})
export class PlotEditComponent implements OnInit, OnChanges, OnDestroy {
  @Input() map: any;
  @Input() info: any;
  @Input() plotId: any;
  @Input() plotStatus: any;
  @Input() interFaceList: any;
  @Input() plotInfoIdList: any;
  @Output() drawChange = new EventEmitter<any>();
  @Output() clickLayer = new EventEmitter<any>();
  @Output() plotSource = new EventEmitter<any>();
  @Output() addList = new EventEmitter<any>();
  draw: any;
  clickMap: any;
  markClick: any;
  plot_source: any;
  mode_type: any;
  geoId: any;
  deleteGeo: any;
  imageUrl: any;
  plot_style: any;
  popup: any;
  grab: any;
  grabbing: any;
  waterMark: any;
  polygon_hover: any = false;
  line_hover: any = false;
  pendant_hover: any = false;
  style_change: any;
  serverlist = {};
  routingTooltip = '';

  constructor(private appService: AppService,
              private toastService: ToastService,
              private httpService: HttpService,
              private elementRef: ElementRef,
              private ds: DataStorage,
              private smxModal: SmxModal) {
    this.style_change = this.appService.onSelectStyleEmitter.pipe(debounceTime(500)).subscribe((value: any) => {
      console.log(value);
      this.plot_style = value;
      if (value.reviseTemplateStyle) {
        this.reviseTemplateStyle(value);
      }
      if (value.type) {
        this.clearEdit();
        if (this.deleteGeo) {

          this.deleteGeo.properties.style = value.style;
          if (this.deleteGeo.properties.mode_type === 'draw_pendant_image') {
            this.deleteGeo = this.waterMark.getProperty();
            this.deleteGeo.properties.style = value.style;
            /* this.waterMark.setPosition({top: 'auto', left: 'auto'});
             for (const i in this.deleteGeo.properties.content.position) {
               this.deleteGeo.properties.content.position[i] = 10;
             }*/
            // this.waterMark.setPosition(this.deleteGeo.properties.content.position);
            this.deleteGeo.properties.style.backgroundRepeat = 'no-repeat';
            this.deleteGeo.properties.style.backgroundImage = this.imageUrl;
          }
          if (this.deleteGeo.properties.mode_type === 'draw_pendant_words') {
            this.deleteGeo = this.waterMark.getProperty();
            this.deleteGeo.properties.style = value.style;
            /*  this.waterMark.setPosition({top: 'auto', left: 'auto'});
              for (const i in this.deleteGeo.properties.content.position) {
                this.deleteGeo.properties.content.position[i] = 10;
              }*/
            // this.waterMark.setPosition(this.deleteGeo.properties.content.position);
          }
          this.updateGeometry(this.deleteGeo, false);
          this.updateLayer(this.deleteGeo);
        } else {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '无选中图层!', 2000);
          this.toastService.toast(toastCfg);
        }
        this.draw.setStyle(value.style);
      } else {
        this.draw.setStyle(value.style);
      }
    });
  }

  ngOnInit() {
    this.serverlist = this.ds.get('serverlist'); // 获取服务列表
    if (!(this.serverlist as any).routing) {
      this.routingTooltip = '需要购买路劲规划服务';
    }


    const update = [];
    for (let i = 0; i < this.plotInfoIdList.length; i++) {
      if (this.plotInfoIdList[i].config_type === 'updateKey') {
        update.push(this.plotInfoIdList[i]);
        this.geoId = this.plotInfoIdList[i].alias;
      }
    }
    const _that = this;
    let edit = true;
    if (this.info.isEdit === 0) {
      edit = false;
    }
    this.plot_source = {
      type: 'FeatureCollection',
      features: []
    };
    const data = setInterval(() => {
      if (this.map.loaded()) {
        clearInterval(data);
        const label = new smartmapx.Label('未定义', {
          position: [116.27378152938205, 40.04974276757861],
          offset: [0, 14]
        });
        this.draw = new DrawControl({
          mode: 'draw_arrow',
          edit: edit,
          continue: false,
          custom: true,
          id: 'f_system_id',
          route: this.plotStatus.router
        });
        this.draw.setLabel(label);
        this.map.addControl(this.draw, 'top-right');
        _that.httpService.getFile('/geomap/plot_geojson/' + _that.plotId).subscribe((geojson: any) => {
          _that.plot_source = geojson;
          this.plotSource.emit(_that.plot_source);
          for (let i = 0; i < _that.plot_source.features.length; i++) {
            _that.addLayer(_that.plot_source.features[i], 'draw-control-polygon-layer');
          }
        });
      }
    }, 100);
    this.map.on('update.layer', function (e) {
      const feature = e.features[0];
      for (let i = 0; i < _that.plot_source.features.length; i++) {
        if (feature.properties[_that.geoId] === _that.plot_source.features[i].properties[_that.geoId]) {
          _that.plot_source.features[i].geometry = feature.geometry;
          if (feature.properties.mode_type === 'draw_words') {
            _that.plot_source.features[i].properties.description = feature.properties.description;
          }
        }
      }
      _that.updateGeometry(feature, true);
    });
    this.map.on('create.layer', (e) => {
      const feature = e.features[0];
      if (_that.mode_type === 'draw_pendant_words') {
        feature.properties.mode_type = 'draw_pendant_words';
      }
      _that.map.on('click', _that.clickMap);
      this.map.on('mousedown', this.grabbing);
      this.map.on('mouseup', this.grab);
      if (feature.geometry.coordinates[0].length < 1) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '绘制图形未能搜索到路线，请重新绘制!', 3000);
        this.toastService.toast(toastCfg);
        return;
      }
      _that.addGeometry(feature);
    });

    /**
     * 点击地图触发事件
     * 通过过滤点击的特定图层做不同的处理
     * */
    this.clickMap = function (e) {
      const diff = 1;
      const leftTop = {x: e.point.x - diff, y: e.point.y - diff};
      const rightBottom = {x: e.point.x + diff, y: e.point.y + diff};
      const result = _that.map.queryRenderedFeatures([leftTop, rightBottom], {
        filter: ['has', 'mode_type']
      });
      if (result.length > 0) {
        const selectId = result[0].properties[_that.geoId];
        for (let i = 0; i < _that.plot_source.features.length; i++) {
          if (selectId === _that.plot_source.features[i].properties[_that.geoId]) {
            _that.deleteGeo = _that.plot_source.features[i];
            _that.clickLayer.emit(_that.plot_source.features[i]);
            _that.draw.set({
              type: 'FeatureCollection',
              features: [_that.plot_source.features[i]]
            }, {
              edit: true,
              mode: _that.plot_source.features[i].properties.mode_type
            });
            if (_that.info.isEdit !== 1) {
              _that.draw.disableEdit();
              _that.map.getCanvas().style.cursor = 'grab';
            }
          }
        }
      } else {
        _that.deleteGeo = null;
        _that.clickLayer.emit([]);
        _that.draw.set({
          type: 'FeatureCollection',
          features: []
        }, {edit: false});
        _that.map.dragPan.enable();
        _that.map.doubleClickZoom.enable();
        _that.mode_type = null;
      }
    };
    this.map.on('click', this.clickMap);
    /**
     * 添加水印地图点击事件
     * */
    this.markClick = function (e) {
      const point = _that.map.project(e.lngLat);
      const feature = {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [point.x, point.y]
        },
        'properties': {
          'content': {
            'position': {
              'top': point.y,
              'left': point.x
            },
            'reference': 'topLeft',
            'zIndex': 1
          },
          'reference_style_id': null,
          'mode_type': 'draw_pendant_image',
          'name': '挂件图片',
          'description': '挂件图片',
          'style': _that.plot_style.style
        }
      };
      feature.properties.style.backgroundRepeat = 'no-repeat';
      feature.properties.style.backgroundImage = 'url(' + _that.imageUrl + ')';
      _that.addGeometry(feature);
      _that.map.off('click', _that.markClick);
      _that.map.on('click', _that.clickMap);
      _that.map.getCanvas().style.cursor = 'grab';
    };

    /**
     * 右键点击弹出popup窗口
     * */
    this.popup = new smartmapx.Popup({
      closeButton: false,
      closeClick: true
    });
    this.grabbing = function () {
      _that.map.getCanvas().style.cursor = 'grabbing';
    };
    this.grab = function () {
      _that.map.getCanvas().style.cursor = 'grab';
    };
    this.map.on('mousedown', this.grabbing);
    this.map.on('mouseup', this.grab);
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    this.style_change.unsubscribe();
  }

  /**
   * 切换绘制模式，同时禁用地图点击事件
   * 向父组件发射切换事件
   * */
  draw_mode(mode: any) {
    this.mode_type = mode;
    this.draw.enable(mode);
    this.drawChange.emit(mode);
    this.map.off('mousedown', this.grabbing);
    this.map.off('mouseup', this.grab);
    this.map.off('click', this.clickMap);
  }

  /**
   * 添加要素图层
   * 向服务器提交各种类型要素
   * */
  addGeometry(feature: any) {
    const postData = {
      plot_id: this.plotId,
      name: feature.properties.name,
      description: '标绘描述',
      mode_type: feature.properties.mode_type,
      content: feature.properties.content,
      geom: feature.geometry,
      style: feature.properties.style
    };
    if (this.plot_style.plot_template_style_id) {
      (postData as any).reference_style_id = this.plot_style.plot_template_style_id;
    }
    postData.content.status = 1;
    postData.content.img = [];
    if (feature.properties.mode_type === 'draw_words') {
      postData.description = feature.properties.description;
    } else if (feature.properties.mode_type === 'draw_pendant_words') {
      const style = this.words_style();
      const position = this.map.project(feature.geometry.coordinates);
      postData.geom.coordinates = [position.x, position.y];
      postData.description = feature.properties.description;
      feature.properties.style = style;
      feature.properties.content.position = {left: position.x, top: position.y};
      feature.properties.content.reference = 'topLeft';
      feature.properties.content.zIndex = 1;
      postData.style = style;
    } else if (feature.properties.mode_type === 'draw_pendant_image') {
      (postData as any).reference_style_id = null;
      feature.properties.reference_style_id = null;
    }
    this.httpService.getData(postData, true, 'execute', this.interFaceList.insert, '', '').subscribe(
      (data: any) => {
        feature.properties = data.data.root[0];
        delete feature.properties.geom;
        feature.properties.content = postData.content;
        if (feature.properties.mode_type === 'draw_pendant_image' || feature.properties.mode_type === 'draw_pendant_words') {
          feature.properties.reference_style_id = null;
        }
        this.addList.emit(feature);
        this.addLayer(feature, 'draw-control-polygon-layer');
        this.plot_source.features.push(feature);
        this.map.getSource(this.plotId).setData(this.plot_source);
      }
    );
  }

  /**
   * 文字水印做特殊处理*/
  words_style() {
    const words_style = {};
    const styles = this.plot_style.style;
    words_style['height'] = (Number(styles['text-size']) * styles['text-line-height']) + 'px';
    for (const key in styles) {
      if (key === 'text-color') {
        words_style['color'] = styles[key];
      } else if (key === 'text-size') {
        words_style['fontSize'] = styles[key] + 'px';
      } else if (key === 'text-max-width') {
        words_style['width'] = styles[key] + 'px';
      } else if (key === 'text-line-height') {
        words_style['lineHeight'] = styles[key];
      } else if (key === 'text-halo-width') {
        if (styles[key] === 1) {
          words_style['fontWeight'] = 'bold';
        } else {
          words_style['fontWeight'] = 'normal';
        }
      }
    }
    words_style['word-break'] = 'break-all';
    return words_style;
  }

  /**
   * 添加水印，整个流程和添加geojson数据有区分，做一个特殊处理
   * 原理：以添加marker的方式添加水印
   * */
  addWaterMark(type: any) {
    this.draw.disable();
    this.map.getCanvas().style.cursor = 'crosshair';
    this.mode_type = type;
    this.drawChange.emit(type);
    if (type === 'draw_pendant_words') {
      this.draw.enable('draw_words');
      this.map.off('click', this.clickMap);
    } else {
      this.map.on('click', this.markClick);
    }
  }

  /**
   * 修改图层要素时触发
   * 包括样式的改变、geom变更、拖动
   * */
  updateGeometry(feature: any, reference: boolean) {
    const postData = {
      plot_id: this.plotId,
      name: feature.properties.name,
      description: feature.properties.description,
      mode_type: feature.properties.mode_type,
      content: feature.properties.content,
      geom: feature.geometry,
      style: feature.properties.style
    };
    if (feature.properties.mode_type === 'draw_pendant_words') {
      const style = this.words_style();
      feature.properties.style = style;
      postData.style = style;
    }
    if (this.plot_style.plot_template_style_id) {
      (postData as any).reference_style_id = this.plot_style.plot_template_style_id;
      feature.properties.reference_style_id = this.plot_style.plot_template_style_id;
    } else if (reference) {
      (postData as any).reference_style_id = feature.properties.reference_style_id;
    } else {
      (postData as any).reference_style_id = null;
      feature.properties.reference_style_id = null;
    }
    postData[this.geoId] = feature.properties[this.geoId];
    this.httpService.getData(postData, true, 'execute', this.interFaceList.update, '', '').subscribe(
      (data: any) => {
        this.map.getSource(this.plotId).setData(this.plot_source);
      }
    );
  }

  /**
   * 删除要素图层
   * 传递参数： 标准的feature 数据
   * */
  deleteGeometry(deleteGeo: any) {
    const postData = {};
    if (!deleteGeo) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '未选中删除图层!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    postData[this.geoId] = deleteGeo.properties[this.geoId];
    this.httpService.getData(postData, true, 'execute', this.interFaceList.delete, '', '').subscribe(
      (data: any) => {
        if (deleteGeo.geometry.type === 'Polygon') {
          this.map.removeLayer(postData[this.geoId] + '_copy');
        }
        this.map.removeLayer(postData[this.geoId]);
        for (let i = 0; i < this.plot_source.features.length; i++) {
          if (postData[this.geoId] === this.plot_source.features[i].properties[this.geoId]) {
            if (this.plot_source.features[i].properties.mode_type === 'draw_photo') {
              this.map.removeLayer(this.plot_source.features[i].properties.content.image_source);
              this.map.removeSource(this.plot_source.features[i].properties.content.image_source);
            }
            this.plot_source.features.splice(i, 1);
          }
        }
        this.draw.set({
          type: 'FeatureCollection',
          features: []
        }, {edit: true});
        this.deleteGeo = null;
      }
    );
  }

  /**
   * 删除要素图层
   * 传递参数： 标准的feature 数据
   * */
  deleteMark(deleteId: any) {
    const modalRef = this.smxModal.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.type = 11;
    modalRef.componentInstance.keyConfig = {
      title: '删除挂件图片',
      view: '删除挂件图片将不可恢复，确定要删除?'
    };
    modalRef.result.then((result) => {
      const postData = {};
      postData[this.geoId] = deleteId;
      this.httpService.getData(postData, true, 'execute', this.interFaceList.delete, '', '').subscribe(
        (data: any) => {
          for (let i = 0; i < this.plot_source.features.length; i++) {
            if (postData[this.geoId] === this.plot_source.features[i].properties[this.geoId]) {
              this.plot_source.features.splice(i, 1);
            }
          }
          this.deleteGeo = null;
          this.waterMark.remove();
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '挂件删除成功!', 2000);
          this.toastService.toast(toastCfg);
        }
      );
    }, () => {
    });
  }

  /**
   * 选中一个要素图层，给标会插件图层添加数据源，使其能编辑
   * */
  selectGeometry(feature: any) {
    const selectId = feature.properties[this.geoId];
    //this.deleteGeo = feature;
    for (let i = 0; i < this.plot_source.features.length; i++) {
      if (selectId === this.plot_source.features[i].properties[this.geoId]) {
        this.deleteGeo = this.plot_source.features[i];
        this.draw.set({
          type: 'FeatureCollection',
          features: [this.plot_source.features[i]]
        }, {
          edit: true,
          smx: true,
          mode: this.plot_source.features[i].properties.mode_type
        });
      }
    }
  }

  /**
   * 添加标会图层，每个要素对应一个图层便于后续的图层排序。
   * 根据拿到的geojson及每个要素对应的图层样式，以此来组合错一个图层
   * */
  addLayer(feature, afterLayer) {
    if (feature.geometry.type === 'Polygon') {
      const fill_layer = {
        'id': feature.properties[this.geoId],
        'type': 'fill',
        'source': this.plotId,
        'filter': [
          'all',
          ['==', this.geoId, feature.properties[this.geoId]]
        ],
        'layout': {
          'visibility': feature.properties.content.status === 1 ? 'visible' : 'none'
        },
        'paint': {
          'fill-color': feature.properties.style['fill-color'],
          'fill-opacity': feature.properties.style['fill-opacity']
        }
      };
      if (feature.properties.style['fill-pattern']) {
        fill_layer.paint['fill-pattern'] = feature.properties.style['fill-pattern'];
      }
      this.map.addLayer(fill_layer, afterLayer);
      this.map.addLayer({
        'id': feature.properties[this.geoId] + '_copy',
        'type': 'line',
        'source': this.plotId,
        'filter': [
          'all',
          ['==', this.geoId, feature.properties[this.geoId]]
        ],
        'layout': {
          'visibility': feature.properties.content.status === 1 ? 'visible' : 'none',
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': feature.properties.style['fill-outline-color'],
          'line-width': feature.properties.style['fill-outline-width'],
          'line-opacity': 1
        }
      }, afterLayer);
    }
    if (feature.geometry.type === 'LineString') {
      const line_layer = {
        'id': feature.properties[this.geoId],
        'type': 'line',
        'source': this.plotId,
        'filter': [
          'all',
          ['==', this.geoId, feature.properties[this.geoId]]
        ],
        'layout': {
          'visibility': feature.properties.content.status === 1 ? 'visible' : 'none',
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': feature.properties.style['line-color'],
          'line-width': feature.properties.style['line-width'],
          'line-opacity': feature.properties.style['line-opacity']
        }
      };
      if (feature.properties.style['line-dasharray'] === 1) {
        line_layer.paint['line-dasharray'] = [2, 2];
      } else {
        line_layer.paint['line-dasharray'] = [1, 0];
      }
      this.map.addLayer(line_layer, afterLayer);
    }
    if (feature.properties.mode_type === 'draw_point') {
      this.map.addLayer({
        'id': feature.properties[this.geoId],
        'source': this.plotId,
        'type': 'circle',
        'filter': [
          'all',
          ['==', this.geoId, feature.properties[this.geoId]]
        ],
        'layout': {
          'visibility': feature.properties.content.status === 1 ? 'visible' : 'none'
        },
        'paint': {
          'circle-radius': feature.properties.style['circle-radius'],
          'circle-opacity': feature.properties.style['circle-opacity'],
          'circle-color': feature.properties.style['circle-color'],
          'circle-stroke-color': feature.properties.style['circle-stroke-color'],
          'circle-stroke-width': feature.properties.style['circle-stroke-width'],
          'circle-stroke-opacity': feature.properties.style['circle-opacity']
        }
      }, afterLayer);
    }
    if (feature.properties.mode_type === 'draw_photo') {
      this.map.addSource(feature.properties.content.image_source, {
        'type': 'image',
        'url': feature.properties.content.image_url,
        'coordinates': feature.properties.content.image_coordinates
      });
      this.map.addLayer({
        'id': feature.properties.content.image_source,
        'type': 'raster',
        'source': feature.properties.content.image_source,
        'minzoom': 2,
        'maxzoom': 22,
        'layout': {
          'visibility': feature.properties.content.status === 1 ? 'visible' : 'none'
        }
      }, afterLayer);
    }
    if (feature.properties.mode_type === 'draw_symbol') {
      this.map.addLayer({
        'id': feature.properties[this.geoId],
        'source': this.plotId,
        'type': 'symbol',
        'filter': [
          'all',
          ['==', this.geoId, feature.properties[this.geoId]]
        ],
        'layout': {
          'visibility': feature.properties.content.status === 1 ? 'visible' : 'none',
          'icon-image': feature.properties.style['icon-image'],
          'icon-size': feature.properties.style['icon-size'],
          'text-field': '{none}',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        },
        'paint': {
          'icon-opacity': feature.properties.style['icon-opacity']
        }
      }, afterLayer);
    }
    if (feature.properties.mode_type === 'draw_words') {
      this.map.addLayer({
        'id': feature.properties[this.geoId],
        'source': this.plotId,
        'type': 'symbol',
        'filter': [
          'all',
          ['==', this.geoId, feature.properties[this.geoId]]
        ],
        'layout': {
          'visibility': feature.properties.content.status === 1 ? 'visible' : 'none',
          'text-field': '{description}',
          'text-font': ['Microsoft YaHei Regular'],
          'text-size': feature.properties.style['text-size'],
          'text-offset': [0, -0.5],
          'text-max-width': feature.properties.style['text-max-width'],
          'text-line-height': feature.properties.style['text-line-height'],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        },
        'paint': {
          'text-color': feature.properties.style['text-color'],
          'text-halo-color': feature.properties.style['text-color'],
          'text-halo-width': feature.properties.style['text-halo-width'],
          'text-halo-blur': 0
        }
      }, afterLayer);
    }
    if (feature.properties.mode_type === 'draw_pendant_words') {
      const point = feature.properties.content.position;
      const marker = new smartmapx.UnionMarker(point, {watermark: true});
      marker.addTo(this.map);
      marker.setHTML('<div>' + feature.properties.description + '</div>');
      marker.setStyle(feature.properties.style);
      marker.setProperty(feature);
      marker.enableDragging();
      marker.setIndex(feature.properties.content.zIndex);
      marker.setReferencePoint(feature.properties.content.reference);
      const _that = this;
      marker.on('click', function (e) {
        e.stopPropagation();
        _that.waterMark = marker;
        _that.deleteGeo = marker.getProperty();
        _that.clickLayer.emit(marker.properties);
      });
      marker.on('dragstart', function (e) {
        _that.waterMark = marker;
        _that.deleteGeo = marker.getProperty();
        _that.clickLayer.emit(marker.properties);
      });
      marker.on('dragend', function (event) {
        let marker_feature = marker.getProperty();
        const new_point = _that.map.project(event.mapEvent.lngLat);
        const diff_x = JSON.parse(JSON.stringify(new_point.x)) - event.marker._element.offsetLeft;
        const diff_y = JSON.parse(JSON.stringify(new_point.y)) - event.marker._element.offsetTop;
        new_point.x = new_point.x - diff_x;
        new_point.y = new_point.y - diff_y;
        marker_feature.geometry.coordinates = [new_point.x, new_point.y];
        marker.setProperty(marker_feature);
        marker_feature = _that.changeReference(marker, _that.map);
        setTimeout(() => {
          _that.updateGeometry(marker_feature, true);
        }, 1000);
      });
    }
    if (feature.properties.mode_type === 'draw_pendant_image') {
      const point = feature.properties.content.position;
      const marker = new smartmapx.UnionMarker(point, {watermark: true});
      marker.addTo(this.map);
      marker.setStyle(feature.properties.style);
      marker.setProperty(feature);
      marker.enableDragging();
      marker.setIndex(feature.properties.content.zIndex);
      marker.setReferencePoint(feature.properties.content.reference);
      const _that = this;
      const html = '<span><i class="fa fa-link"></i>锁定</span>' +
        '<span><i class="fa fa-arrows"></i>拖拽</span>' +
        '<span><i class="fa fa-remove "></i>删除</span>' +
        '<span><i class="fa fa-arrow-up"></i>上移</span>' +
        '<span><i class="fa fa-arrow-down"></i>下移</span>';
      marker.on('click', function (e) {
        e.stopPropagation();
        _that.waterMark = marker;
        _that.deleteGeo = marker.getProperty();
        _that.imageUrl = _that.deleteGeo.properties.style.backgroundImage;
        _that.clickLayer.emit(marker.properties);
      });
      /*marker.on('contextmenu', function (event) {
        if (event.button === 2 && (_that.info.isEdit === 1)) {
          event.preventDefault();
          _that.waterMark = marker;
          const points = JSON.parse(JSON.stringify(marker.properties.geometry.coordinates));
          points[0] = points[0] + (marker._element.offsetWidth / 2);
          points[1] = points[1] + (marker._element.offsetHeight / 2);
          const lnglat = _that.map.unproject(points);
          _that.popup.setLngLat(lnglat)
              .setHTML('<div class="waterMarker">' + html + '</div>')
              .addTo(_that.map);
          const element = document.getElementsByClassName('waterMarker')[0];
          const spans = element.getElementsByTagName('span');
          spans[0].onclick = function () {
            _that.waterMark.disableDragging();
            _that.popup.remove();
          };
          spans[1].onclick = function () {
            _that.waterMark.enableDragging();
            _that.popup.remove();
          };
          spans[2].onclick = function () {
            _that.deleteMark(_that.waterMark.properties.properties[_that.geoId]);
            _that.waterMark.remove();
            _that.popup.remove();
          };
          spans[3].onclick = function () {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '功能后续开放!', 2000);
            _that.toastService.toast(toastCfg);
          };
          spans[4].onclick = function () {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '功能后续开放!', 2000);
            _that.toastService.toast(toastCfg);
          };
        }
      });*/
      marker.on('dragend', (event) => {
        let marker_feature = marker.getProperty();
        const new_point = this.map.project(event.mapEvent.lngLat);
        const diff_x = JSON.parse(JSON.stringify(new_point.x)) - event.marker._element.offsetLeft;
        const diff_y = JSON.parse(JSON.stringify(new_point.y)) - event.marker._element.offsetTop;
        new_point.x = new_point.x - diff_x;
        new_point.y = new_point.y - diff_y;
        marker_feature.geometry.coordinates = [new_point.x, new_point.y];
        marker.setProperty(marker_feature);
        marker_feature = this.changeReference(marker, this.map);
        this.updateGeometry(marker_feature, true);
      });
    }
  }

  /**
   * 选则参考坐标系是更换偏移类型和值
   * */
  changeReference(marker, map) {
    const marker_feature = marker.getProperty();
    const new_point = {
      x: marker_feature.geometry.coordinates[0],
      y: marker_feature.geometry.coordinates[1]
    };
    const referencePoint = marker.getReferencePoint();
    let position = {};
    const canvasRect = map.getCanvas().getBoundingClientRect();
    const markerRect = marker._element.getBoundingClientRect();
    if (referencePoint === 'topLeft') {
      position = {
        'top': new_point.y,
        'left': new_point.x
      };
    } else if (referencePoint === 'topRight') {
      new_point.x = canvasRect.width - new_point.x - markerRect.width;
      position = {
        'top': new_point.y,
        'right': new_point.x
      };
    } else if (referencePoint === 'bottomLeft') {
      new_point.y = canvasRect.height - new_point.y - markerRect.height;
      position = {
        'bottom': new_point.y,
        'left': new_point.x
      };
    } else if (referencePoint === 'bottomRight') {
      new_point.y = canvasRect.height - new_point.y - markerRect.height;
      new_point.x = canvasRect.width - new_point.x - markerRect.width;
      position = {
        'bottom': new_point.y,
        'right': new_point.x
      };
    }
    marker_feature.properties.content.position = position;
    marker_feature.properties.content.reference = referencePoint;
    marker.setProperty(marker_feature);
    marker.setPosition({top: 'auto', left: 'auto'});
    marker.setPosition(marker_feature.properties.content.position);
    return marker_feature;
  }


  /**
   * maker删除
   * */
  markerDelete() {
    this.waterMark.remove();
  }

  /**
   * 修改要素图层所触发事件
   * 此事件主要修改对应图层样式
   * */
  updateLayer(feature) {
    if (feature.geometry.type === 'Polygon') {
      /*this.map.setPaintProperty(feature.properties[this.geoId], 'fill-color', feature.properties.style['fill-color']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'fill-opacity', feature.properties.style['fill-opacity']);
      if (feature.properties.style['fill-pattern']) {
        this.map.setPaintProperty(feature.properties[this.geoId], 'fill-pattern', feature.properties.style['fill-pattern']);
      } else {
        console.log(this.map.getLayer(feature.properties[this.geoId]));
        this.map.setPaintProperty(feature.properties[this.geoId], 'fill-pattern', 'none');
      }
      this.map.setPaintProperty(feature.properties[this.geoId] + '_copy', 'line-color', feature.properties.style['fill-outline-color']);
      this.map.setPaintProperty(feature.properties[this.geoId] + '_copy', 'line-width', feature.properties.style['fill-outline-width']);
*/
      const mapLayers = this.map.getStyle().layers;
      for (let i = 0; i < mapLayers.length; i++) {
        if (feature.properties[this.geoId] === mapLayers[i].id) {
          const afterLayer_id = mapLayers[i + 2].id;
          this.map.removeLayer(feature.properties[this.geoId]);
          this.map.removeLayer(feature.properties[this.geoId] + '_copy');
          if (feature.properties.mode_type === 'draw_photo') {
            this.map.removeSource(feature.properties.content.image_source);
          }
          this.addLayer(feature, afterLayer_id);
        }
      }
    }
    if (feature.geometry.type === 'LineString') {
      this.map.setPaintProperty(feature.properties[this.geoId], 'line-color', feature.properties.style['line-color']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'line-opacity', feature.properties.style['line-opacity']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'line-width', feature.properties.style['line-width']);
      if (feature.properties.style['line-dasharray'] === 1) {
        this.map.setPaintProperty(feature.properties[this.geoId], 'line-dasharray', [2, 2]);
      } else {
        this.map.setPaintProperty(feature.properties[this.geoId], 'line-dasharray', [1, 0]);
      }
    }
    if (feature.properties.mode_type === 'draw_point') {
      this.map.setPaintProperty(feature.properties[this.geoId], 'circle-radius', feature.properties.style['circle-radius']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'circle-opacity', feature.properties.style['circle-opacity']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'circle-color', feature.properties.style['circle-color']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'circle-stroke-color', feature.properties.style['circle-stroke-color']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'circle-stroke-width', feature.properties.style['circle-stroke-width']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'circle-stroke-opacity', feature.properties.style['circle-opacity']);
    }
    if (feature.properties.mode_type === 'draw_photo') {
      this.map.setPaintProperty(feature.properties[this.geoId], 'fill-color', feature.properties.style['fill-color']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'fill-opacity', feature.properties.style['fill-opacity']);
      if (feature.properties.style['fill-pattern']) {
        this.map.setPaintProperty(feature.properties[this.geoId], 'fill-pattern', feature.properties.style['fill-pattern']);
      }
      this.map.setPaintProperty(feature.properties[this.geoId] + '_copy', 'line-color', feature.properties.style['fill-outline-color']);
      this.map.setPaintProperty(feature.properties[this.geoId] + '_copy', 'line-width', feature.properties.style['fill-outline-width']);
    }
    if (feature.properties.mode_type === 'draw_symbol') {
      this.map.setLayoutProperty(feature.properties[this.geoId], 'icon-image', feature.properties.style['icon-image']);
      this.map.setLayoutProperty(feature.properties[this.geoId], 'icon-size', feature.properties.style['icon-size']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'icon-opacity', feature.properties.style['icon-opacity']);
    }
    if (feature.properties.mode_type === 'draw_words') {
      this.map.setLayoutProperty(feature.properties[this.geoId], 'text-size', feature.properties.style['text-size']);
      this.map.setLayoutProperty(feature.properties[this.geoId], 'text-max-width', feature.properties.style['text-max-width']);
      this.map.setLayoutProperty(feature.properties[this.geoId], 'text-line-height', feature.properties.style['text-line-height']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'text-color', feature.properties.style['text-color']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'text-halo-color', feature.properties.style['text-color']);
      this.map.setPaintProperty(feature.properties[this.geoId], 'text-halo-width', feature.properties.style['text-halo-width']);
    }
    if (feature.properties.mode_type === 'draw_pendant_words') {
      this.waterMark.setStyle(this.words_style());
    }
    if (feature.properties.mode_type === 'draw_pendant_image') {
      this.waterMark.setStyle(this.plot_style.style);
    }
  }

  /**
   * 文字和图片挂件进行置顶操作
   * */
  markTop() {
    const feature = this.waterMark.getProperty();
    for (let i = 0; i < this.plot_source.features.length; i++) {
      const properties = this.plot_source.features[i].properties;
      if (properties.mode_type === 'draw_pendant_image' || properties.mode_type === 'draw_pendant_words') {
        if (feature.properties.content.zIndex <= properties.content.zIndex) {
          feature.properties.content.zIndex = properties.content.zIndex;
        }
      }
    }
    feature.properties.content.zIndex += 1;
    this.waterMark.setProperty(feature);
    this.waterMark.setIndex(feature.properties.content.zIndex);
    this.updateGeometry(feature, true);
  }

  /**
   * 同一修改样式库组件中相应对应id的图层样式
   * 不用调用接口，后台会根据样式id把样式塞给图层
   * */
  reviseTemplateStyle(value: any) {
    for (let i = 0; i < this.plot_source.features.length; i++) {
      if (this.plot_source.features[i].properties.reference_style_id === value.plot_template_style_id) {
        this.plot_source.features[i].properties.style = value.style;
        //console.log(this.plot_source.features[i]);
        this.updateLayer(this.plot_source.features[i]);
      }
    }
    this.draw.set({
      type: 'FeatureCollection',
      features: []
    }, {edit: true});
  }

  /**
   *导入数据调用方法，在导入数据结束后重新请求数据接口
   * 更新导入数据
   * 此方法用于父组件调用，在导入接口成功后调用此事件
   **/
  importData() {
    const mapJson = this.map.getStyle();
    for (let i = (mapJson.layers.length - 1); i >= 0; i--) {
      if (mapJson.layers[i].source === this.plotId) {
        mapJson.layers.splice(i, 1);
      }
    }
    this.httpService.getFile('/geomap/plot_geojson/' + this.plotId).subscribe((geojson: any) => {
      this.plot_source = geojson;
      this.map.setStyle(mapJson);
      const _that = this;
      const data = setInterval(() => {
        if (_that.map.isStyleLoaded()) {
          clearInterval(data);
          this.plotSource.emit();
          for (let i = 0; i < _that.plot_source.features.length; i++) {
            _that.addLayer(_that.plot_source.features[i], 'draw-control-polygon-layer');
          }
        }
      }, 100);
    });
  }

  /**
   * 切换地图触发事件，此事件由父组件触发
   * 切换地图后地图所有图层消失，需重新绘制一遍
   * */
  changeMap() {
    this.httpService.getFile('/geomap/plot_geojson/' + this.plotId).subscribe((geojson: any) => {
      this.plot_source = geojson;
      for (let i = 0; i < this.plot_source.features.length; i++) {
        this.addLayer(this.plot_source.features[i], 'draw-control-polygon-layer');
      }
    });
  }

  /**
   * 清除绘制插件的编辑状态
   * */
  clearEdit() {
    this.draw.set({
      type: 'FeatureCollection',
      features: []
    }, {edit: true});
  }

  /**
   * 查看模式下点击列表图层名称 地图做高亮联动
   * */
  viewSelect(geometry: any) {
    this.draw.set({
      type: 'FeatureCollection',
      features: [geometry]
    }, {edit: false});
    this.draw.disableEdit();
  }

  /**
   * 添加图片方法
   * 包括图片图层添加、挂件图片添加
   * */
  addImage(type: any) {
    const obf = this.smxModal.open(PopueComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-popule'});
    obf.componentInstance.type = 10;
    obf.componentInstance.keyConfig = {
      title: '图片上传',
      tag: 'plot',
      view: [
        {
          element: 'icon_upload',
          title: '图片',
          alias: 'icon_upload',
          value: '',
          isNull: false,
          isPass: 0
        }],
    };

    obf.result.then((result) => {
      this.httpService.makeFileRequest('/upload/1.0.0/mapplot/uploadFile', {forceDelete: true}, [result[0].value[0]])
        .subscribe(
          (data: any) => {
            this.imageUrl = '/uploadfile/' + data.data.upload_file.uploads;
            this.mode_type = type;
            this.drawChange.emit(type);
            this.map.off('click', this.clickMap);
            if (type === 'draw_pendant_image') {
              this.draw.disable();
              this.map.getCanvas().style.cursor = 'crosshair';
              this.map.on('click', this.markClick);
            } else {
              this.draw.enable('draw_photo', {
                url: this.imageUrl
              });
            }
          }, error => {
          }
        );
    }, reson => {

    });
  }
}
