import {Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {AppService} from '../../s-service/app.service';

@Component({
  selector: 'raster-panel',
  templateUrl: './raster-panel.component.html',
  styleUrls: ['./raster-panel.component.scss']
})
export class RasterPanelComponent implements OnInit, OnChanges {


  @Input() layerInfo: any; // 栅格图层信息
  @Output() changeStyle = new EventEmitter<any>();
  @Output() changeBottom = new EventEmitter<any>();
  @Input() mapType: any;
  rasterName: any;
  rasterLayerName: any;
  rasterUrl;
  any;
  rasterType: any;
  rangeValues: number[];
  rasterOpacity: any;
  layerBootomBtn: any;
  panelShow = true; // 面板伸缩判断标志
  myTextarea: any; // 样式编辑内容
  listItem: any;
  @Input() isBottom = true;
  layerType: any; // 栅格图层的类型

  constructor(private appService: AppService) {
  }

  ngOnChanges() {
    // 样式编辑的信息
    this.myTextarea = JSON.stringify(this.layerInfo, null, 2);
    // 图层名称
    this.rasterName = this.layerInfo.metadata.name;
    this.rasterLayerName = this.layerInfo.metadata.layer_name;
    // 图层的类型
    this.layerTypeShow(this.layerInfo);
    // 图层的显示级别
    if (this.layerInfo) {
      this.rangeValues = [this.layerInfo.minzoom, this.layerInfo.maxzoom];
    } else {
      this.rangeValues = [0, 22];
    }
    // 图层的透明度
    this.rasterOpacity = this.layerInfo.paint['raster-opacity'] * 100;
  }

  ngOnInit() {

  }

  // 修改图层名称
  changeName(e: any, tag: any) {
    if (tag === 'layer_style') {
      this.layerInfo.metadata.name = e;
      this.updateMapJson(this.layerInfo);
      this.rasterName = e;
    }

    if (tag === 'layer') {
      this.rasterLayerName = e;
    }

  }

  // 图层缩放级别
  slideEnds(e: any) {
    this.layerInfo['minzoom'] = e[0];
    this.layerInfo['maxzoom'] = e[1];
    this.rangeValues[0] = e[0];
    this.rangeValues[1] = e[1];
    this.updateMapJson(this.layerInfo);
  }


  // 栅格图层透明度改变
  rasterLayerChange(e: any) {
    this.rasterOpacity = e;
    const value = e / 100;
    if (this.layerInfo.paint) {
      this.layerInfo.paint['raster-opacity'] = value;
    } else {
      this.layerInfo.paint = {'raster-opacity': value};
    }
    this.updateMapJson(this.layerInfo);
  }

  // 图层置底
  layerSetBottom() {
    this.layerBootomBtn = !this.layerBootomBtn;
    const info = {type: this.layerBootomBtn, value: this.layerInfo};
    this.changeBottom.emit(info);
  }

  // 设置编辑图层
  textChange(e: any) {
    this.layerInfo = JSON.parse(e.target.value);
    if (this.layerInfo.minzoom) {

    } else {
      this.layerInfo.minzoom = 0;
    }

    if (this.layerInfo.maxzoom) {

    } else {
      this.layerInfo.maxzoom = 22;
    }

    if (this.layerInfo.paint) {
      if (this.layerInfo.paint['raster-opacity']) {

      }
    } else {
      this.layerInfo.paint = {'raster-opacity': this.rasterOpacity / 100};
    }
    this.updateMapJson(this.layerInfo);
    this.rangeValues = [this.layerInfo['minzoom'], this.layerInfo['maxzoom']];
    this.rasterOpacity = this.layerInfo.paint['raster-opacity'] * 100;
    this.rasterName = this.layerInfo.metadata.name;
    this.rasterType = this.layerInfo.type;
  }

  // 更新修改后的图层数据
  updateMapJson(layerInfo: any) {
    this.layerInfo.paint['raster-opacity'] = this.rasterOpacity / 100;
    this.myTextarea = JSON.stringify(layerInfo, null, 2);
    if (!this.isBottom) {
      this.appService.changeStyleEventEmitter.emit(this.layerInfo);
    } else {
      this.changeStyle.emit(layerInfo);
    }
  }

  layerTypeShow(layerInfo) {
    if (layerInfo) {
      if (layerInfo.metadata.type === 101) {
        this.layerType = 'raster';
      }
      if (layerInfo.metadata.type === 105) {
        this.layerType = 'WMS';
      }
      if (layerInfo.metadata.type === 106) {
        this.layerType = 'WMTS';
      }
      if (layerInfo.metadata.type === 109) {
        this.layerType = 'image ';
      }
    }
  }

}
