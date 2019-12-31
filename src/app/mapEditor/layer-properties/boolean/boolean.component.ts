import {Component, Input, NgZone, OnChanges, OnInit} from '@angular/core';
// import {MapEditorService} from '../../mapEditor.service';
import {AppService} from '../../../s-service/app.service';

@Component({
  selector: 'app-boolean',
  templateUrl: './boolean.component.html',
  styleUrls: ['./boolean.component.scss']
})
export class BooleanComponent implements OnInit, OnChanges {
  @Input() layer: any;
  @Input() patemter: any;
  @Input() testInfo: any;
  @Input() layerIndex: any;
  layerInfo: any;
  attribute: any;
  showStyle: any;
  isArray: any;
  isArrayline: any;
  pattern: any;
  title: any;
  model: any;
  tooltip: any;
  lineDashaIsshow = false; /* s */
  tooltipDasha = '是否要显示虚线样式';
  /* 保留虚线样式属性 */
  lineDashpaint = [];
  ArrayOne = [];
  ArrayTwo = [];
  dasharray: any = [];

  constructor(private mapEditorService: AppService, public zone: NgZone,) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (!this.layer[this.patemter.belong]) {
      this.layer[this.patemter.belong] = {};
    }
    this.layerInfo = this.layer[this.patemter.belong];
    this.attribute = this.patemter.attribute;
    if (this.layerInfo[this.attribute] === undefined) {
      this.pattern = this.patemter.pattern;
      this.title = this.patemter.title;
      this.model = this.patemter.default;
      this.tooltip = this.patemter.tooltip;
    } else {
      this.pattern = this.patemter.pattern;
      this.title = this.patemter.title;
      this.model = this.layerInfo[this.attribute];
      this.tooltip = this.patemter.tooltip;
    }
    this.showStyle = typeof this.layerInfo[this.attribute];
    this.isArray = this.layerInfo[this.attribute] instanceof Array;
    if (this.layerInfo['line-dasharray']) {
      this.isArrayline = this.layerInfo['line-dasharray'] instanceof Array;
    } else {
      this.isArrayline = false;
    }
  }

  /* 没有缩放级别 修改虚线样式 */
  changeline(event: any, index: any, item) {
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  dasharrayList() {
    const num = this.layerInfo[this.attribute].length - 1;
    this.layerInfo[this.attribute].push(this.layerInfo[this.attribute][num]);
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  dasharray_del(index: any) {
    this.layerInfo[this.attribute].splice(index, 1);
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  indexTracker(index: number, value: any) {
    return index;
  }

  clickAdd(event: any) {
    if (this.layerInfo[this.attribute] === undefined) {
      this.layerInfo[this.attribute] = {
        'stops': [
          [6, this.model], [10, this.model]
        ]
      };
    } else {
      this.layerInfo[this.attribute] = {
        'stops': [
          [6, this.layerInfo[this.attribute]], [10, this.layerInfo[this.attribute]]
        ]
      };
    }
    this.showStyle = typeof this.layerInfo[this.attribute];
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  remove(index: any) {
    this.layerInfo[this.attribute].stops.splice(index, 1);
    if (this.layerInfo[this.attribute].stops.length <= 1) {
      const value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
      this.layerInfo[this.attribute] = value;
      this.showStyle = typeof this.layerInfo[this.attribute];
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  /* 删除虚实线小组元素 */
  removeDeExline(index1: any, index2: any) {
    if (this.layerInfo[this.attribute].stops[index1][1].length <= 2) {
      return;
    } else {
      this.layerInfo[this.attribute].stops[index1][1].splice(index2, 1);
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  /* 删除虚线组 */
  removeline(index: any) {
    this.layerInfo[this.attribute].stops.splice(index, 1);
    if (this.layerInfo[this.attribute].stops.length <= 1) {
      const value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
      const array = [];
      for (let i = 0; i < value.length; i++) {
        array.push(value[i]);
      }
      this.layerInfo[this.attribute] = array;
      this.showStyle = typeof this.layerInfo[this.attribute];
      this.isArray = this.layerInfo[this.attribute] instanceof Array;
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  /* 虚线样式 组内元素增加 */
  lineDaMingroup(index: any) {
    const minArrayLength = this.layerInfo[this.attribute].stops[index][1].length - 1;
    const lastValue = this.layerInfo[this.attribute].stops[index][1][minArrayLength];
    this.layerInfo[this.attribute].stops[index][1].push(lastValue);
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  /* 虚线样式 添加分组 */
  lineDaMaxgroup() {
    const num = this.layerInfo[this.attribute].stops.length - 1;
    const value = this.layerInfo[this.attribute].stops[num][1];
    const index = this.layerInfo[this.attribute].stops[num][0];
    const array = [];
    for (let i = 0; i < value.length; i++) {
      array.push(value[i]);
    }
    this.layerInfo[this.attribute].stops.push([Number(index) + 1, array]);
  }

  buttomAdd() {
    const num = this.layerInfo[this.attribute].stops.length - 1;
    const value = this.layerInfo[this.attribute].stops[num][1];
    const index = this.layerInfo[this.attribute].stops[num][0];
    this.layerInfo[this.attribute].stops.push([Number(index) + 1, value]);
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  changesline(event: any, index1: any, index2: any) {
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  change() {
    this.layerInfo[this.attribute] = Number(this.model);
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  /* 变为含有缩放级别的虚线 */
  clickAddLine() {
    const array1 = [];
    const array2 = [];
    const value = this.layerInfo[this.attribute];
    for (let i = 0; i < value.length; i++) {
      array1.push(value[i]);
      array2.push(value[i]);
    }
    this.layerInfo[this.attribute] = {
      'stops': [
        [6, array1],
        [10, array2]
      ]
    };
    this.ArrayTwo[0] = this.layerInfo[this.attribute].stops;
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  /* 虚线显示 */
  onLineChecked(event: any) {
    if (event.target.checked) {
      if (this.dasharray[this.layerIndex]) {
        this.layerInfo[this.attribute] = this.dasharray[this.layerIndex];
      } else {
        this.layerInfo[this.attribute] = [2, 2];
      }
    } else {
      this.dasharray[this.layerIndex] = this.layerInfo[this.attribute];
      delete this.layerInfo[this.attribute];
    }
    this.isArrayline = this.layerInfo['line-dasharray'] instanceof Array;
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  onChecked(event: any, index: any) {
    if (index >= 0) {
      this.layerInfo[this.attribute].stops[index][1] = event.target.checked;
    } else {
      if (event.target.checked) {
        this.layerInfo[this.attribute] = event.target.checked;
      } else {
        this.layerInfo[this.attribute] = event.target.checked;
      }
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  testline(event: any, index: any) {
    if (event.target.value < 0) {
      this.layerInfo[this.attribute].stops[index][0] = 0;
    } else if (event.target.value > 24) {
      this.layerInfo[this.attribute].stops[index][0] = 24;
    } else {
      this.layerInfo[this.attribute].stops[index][0] = event.target.value;
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  test(event: any, index: any) {
    const pattern = /^((\d)|(1\d)|(2[0-4]))$/;
    const fall = pattern.test(event.target.value);
    if (!fall) {
      let min = 0;
      let max = 0;
      if (index === 0) {
        min = 0;
        max = this.layerInfo[this.attribute].stops[index + 1][0];
      } else if (index === (this.layerInfo[this.attribute].stops.length) - 1) {
        min = this.layerInfo[this.attribute].stops[index - 1][0];
        max = 24;
      } else {
        min = this.layerInfo[this.attribute].stops[index - 1][0];
        max = this.layerInfo[this.attribute].stops[index + 1][0];
      }
      this.layerInfo[this.attribute].stops[index][0] = Math.floor(Math.random() * (max - min) + min);
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }
}
