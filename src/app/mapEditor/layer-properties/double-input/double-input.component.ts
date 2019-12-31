import {Component, Input, ViewChild, OnChanges, OnInit, HostListener, QueryList, ViewChildren, EventEmitter, ElementRef, Renderer2, Output} from '@angular/core';

// import {InputPatternComponent} from '../input-pattern/input-pattern.component';
// import {MapEditorService} from '../../mapEditor.service';
import {AppService} from '../../../s-service/app.service';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../s-service/http.service';
import { ExpressionComponent } from '../expression/expression.component';


@Component({
  selector: 'app-double-input',
  templateUrl: './double-input.component.html',
  styleUrls: ['./double-input.component.scss']
})
export class DoubleInputComponent implements OnInit, OnChanges {
  @Input()
  layer: any;
  @Input()
  patemter: any;
  layerInfo: any;
  attribute: any;
  showStyle: any;
  isArray: any;
  pattern: any;
  title: any;
  model: any;
  defs: any;
  type: any;
  one: any;
  two: any;
  three: any;
  four: any;
  tooltip: any;
  layerInfomation: any;

  DoubleStyNumDisplay: any; //加号显隐
  layerEditCheckNum: any = true;
  chooseOne: any; //选择哪个输入框

  constructor(private mapEditorService: AppService,
              private elementRef: ElementRef,
              private renderer: Renderer2,
              private httpService: HttpService,
              private httpClient: HttpClient
              ) {
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
      this.type = this.patemter.type;
      this.tooltip = this.patemter.tooltip;
    } else {
      this.pattern = this.patemter.pattern;
      this.title = this.patemter.title;
      this.model = this.layerInfo[this.attribute];
      this.type = this.patemter.type;
      this.tooltip = this.patemter.tooltip;
    }
    if (this.type === 0) {
      this.one = this.model[0];
    } else if (this.type === 2) {
      this.one = this.model[0];
      this.two = this.model[1];
      this.three = this.model[2];
      this.four = this.model[3];
    } else {
      if (this.patemter.EXtype !== 1 ) {
        this.one = this.model[0];
        this.two = this.model[1];
      }
    }
    this.showStyle = typeof this.layerInfo[this.attribute];
    this.isArray = this.layerInfo[this.attribute] instanceof Array;
  }

  clickAdd() {
    if (this.layerInfo[this.attribute] === undefined) {
      if (this.type === 0) {
        this.layerInfo[this.attribute] = {
          'stops': [
            [6, [this.one]], [10, [this.one]]
          ]
        };
      } else if (this.type === 2) {
        this.layerInfo[this.attribute] = {
          'stops': [
            [6, [this.one, this.two, this.three, this.four]], [10, [this.one, this.two, this.three, this.four]]
          ]
        };
      } else {
        this.layerInfo[this.attribute] = {
          'stops': [
            [6, [this.one, this.two]], [10, [this.one, this.two]]
          ]
        };
      }
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    } else {
      if (this.type === 0) {
        this.layerInfo[this.attribute] = {
          'stops': [
            [6, [this.layerInfo[this.attribute][0]]],
            [10, [this.layerInfo[this.attribute][0]]]
          ]
        };
      } else if (this.type === 2) {
        this.layerInfo[this.attribute] = {
          'stops': [
            [6, [this.layerInfo[this.attribute][0], this.layerInfo[this.attribute][1],
              this.layerInfo[this.attribute][2], this.layerInfo[this.attribute][3]]],
            [10, [this.layerInfo[this.attribute][0], this.layerInfo[this.attribute][1],
              this.layerInfo[this.attribute][2], this.layerInfo[this.attribute][3]]]
          ]
        };
      } else {
        this.layerInfo[this.attribute] = {
          'stops': [
            [6, [this.layerInfo[this.attribute][0], this.layerInfo[this.attribute][1]]],
            [10, [this.layerInfo[this.attribute][0], this.layerInfo[this.attribute][1]]]
          ]
        };
      }
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }
    this.isArray = this.layerInfo[this.attribute] instanceof Array;
    this.showStyle = typeof this.layerInfo[this.attribute];
  }

  remove(index: any) {
    this.layerInfo[this.attribute].stops.splice(index, 1);
    if (this.layerInfo[this.attribute].stops.length <= 1) {
      const value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
      this.layerInfo[this.attribute] = value;
      if (this.type === 0) {
        this.one = value[0];
      } else if (this.type === 2) {
        this.one = Number(value[0]);
        this.two = Number(value[1]);
        this.three = Number(value[2]);
        this.four = Number(value[3]);
      } else {
        this.one = Number(value[0]);
        this.two = Number(value[1]);
      }

      this.isArray = this.layerInfo[this.attribute] instanceof Array;
      this.showStyle = typeof this.layerInfo[this.attribute];
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  buttomAdd() {
    const num = this.layerInfo[this.attribute].stops.length - 1;
    const value = this.layerInfo[this.attribute].stops[num][1];
    const index = this.layerInfo[this.attribute].stops[num][0];
    if (this.type === 0) {
      this.layerInfo[this.attribute].stops.push([Number(index) + 1, [value[0]]]);
    } else if (this.type === 2) {
      this.layerInfo[this.attribute].stops.push([Number(index) + 1, [value[0], value[1], value[2], value[3]]]);
    } else {
      this.layerInfo[this.attribute].stops.push([Number(index) + 1, [value[0], value[1]]]);
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  change(event: any, index: any) {
    if (event.target.value === '') {
      event.target.value = 0;
    }
    if (this.type === 0) {
      this.layerInfo[this.attribute] = [this.one];
    } else if (this.type === 2) {
      this.layerInfo[this.attribute] = [Number(this.one), Number(this.two), Number(this.three), Number(this.four)];
    } else {
      this.layerInfo[this.attribute] = [Number(this.one), Number(this.two)];
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  changes(event: any, index1: any, index2: any) {
    if (event.target.value === '') {
      event.target.value = 0;
      this.layerInfo[this.attribute].stops[index1][1][index2] = 0;
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
