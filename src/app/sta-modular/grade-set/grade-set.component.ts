import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ToastConfig, ToastType} from '../../smx-unit/smx-toast/toast-model';
import {ToastService} from '../../smx-unit/smx-toast/toast.service';
import {debug} from 'util';

@Component({
    selector: 'app-grade-set',
    templateUrl: './grade-set.component.html',
    styleUrls: ['./grade-set.component.scss']
})
export class GradeSetComponent implements OnInit, OnChanges {
    @Input() config: any;
    @Input() style: any;
    @Input() staType: any;
    public fieldType: string;
    public isArray: boolean;
    field: any;
    public nofield: string;
    public renderType: string;
    constructor(public toastService: ToastService) {
    }

    ngOnInit() {
    }

    ngOnChanges() {
        if (this.config.componentType === 2) {
            if (this.style.metadata.statistics.layer_info.length < 2) {
                this.style.metadata.statistics.layer_info.push([[0, 0], [0, 0.5], [0, 1]]);
            }
            if (!this.style.metadata.statistics.nofield) {
                this.style.metadata.statistics.nofield = 'noField';
            }
        } else if (this.config.componentType === 1) {
            this.isArray = Array.isArray(this.style.paint[this.config.attribute[0]]);
            if (this.isArray) {
                this.fieldType = 'text';
            } else {
                this.fieldType = 'number';
            }
        }

        // if (this.style.metadata.statistics.otherValueStatus) {
        //     this.otherValueStatus = this.style.metadata.statistics.otherValueStatus;
        // }
        if (!this.style.metadata.statistics.otherValue) {
            this.style.metadata.statistics.otherValue = ['#cccccc', 10, '#ffffff'];
        }

        if (this.style.metadata.statistics.field) {
            this.field = this.style.metadata.statistics.field;
        }
        if (!this.style.metadata.statistics.interpolate) {
            this.style.metadata.statistics.interpolate = ['linear'];
        }
        /*this.interpolates = this.style.metadata.statistics.interpolate*/
    }

    checkbox(event: any, index: any) {
      this.style.metadata.statistics.layer_info[2][index] = event.target.checked;
      if (this.fieldType === 'number') {
          this.gradeCommon(index);
      } else {
          this.fieldChange(1);
      }
    }

    // checkOther(event: any, index: any) {
    //     this.style.metadata.statistics.otherValueStatus = event.target.checked ? 'lists' : 'hidden';
    //     if (this.fieldType === 'number') {
    //         this.gradeCommon(index);
    //     } else {
    //         this.fieldChange(1);
    //     }
    // }

    interpolate(value: any) {
        if (value === 0) {
            this.style.metadata.statistics.interpolate = ['linear'];
        } else {
            this.style.metadata.statistics.interpolate = ['exponential', 200];
        }
        this.colorChange();
    }

    colorCommon(index: any) {
        this.style.metadata.statistics.layer_info[1][index][1] = this.style.metadata.statistics.layer_info[0][index][0];
    }

    colorChange() {
        this.style.paint[this.config.attribute[0]] = ['interpolate', this.style.metadata.statistics.interpolate, ['heatmap-density']];
        for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
            this.style.paint[this.config.attribute[0]] = this.style.paint[this.config.attribute[0]]
                .concat(this.style.metadata.statistics.layer_info[0][i]);
        }

    }

    weightChange() {
        if (this.style.metadata.statistics.nofield !== 'noField') {
            this.style.paint[this.config.attribute[1]] = {
                'property': this.field,
                'type': 'exponential',
                'stops': this.style.metadata.statistics.layer_info[1]
            };
        } else {
            this.style.paint[this.config.attribute[1]] = 1;
        }
    }

    fieldChange(value: any) {
        if (value === 1) {
            this.style.paint[this.config.attribute[0]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
                this.style.metadata.statistics.layer_info[1][i][0] = this.style.metadata.statistics.layer_info[0][i][0];
                if (this.style.metadata.statistics.layer_info[2][i]) {
                    this.style.paint[this.config.attribute[0]] = this.style.paint[this.config.attribute[0]]
                        .concat(this.style.metadata.statistics.layer_info[0][i]);
                }
            }
            this.style.paint[this.config.attribute[0]] = this.style.paint[this.config.attribute[0]]
                .concat(this.style.metadata.statistics.otherValue[0]);
            /*1233333333333333*/
            this.style.paint[this.config.attribute[1]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
                if (this.style.metadata.statistics.layer_info[2][i]) {
                    this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                        .concat(this.style.metadata.statistics.layer_info[1][i]);
                }
            }
            if (this.style.type === 'fill') {
                this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                    .concat(this.style.metadata.statistics.otherValue[2]);
            } else {
                // 其他值可选
                // if (this.otherValueStatus === 'lists') {
                this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                    .concat(this.style.metadata.statistics.otherValue[1]);

                // } else {
                //     this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                //         .concat(0);
                // }
            }
        } else {
            this.style.paint[this.config.attribute[1]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
                if (this.style.metadata.statistics.layer_info[2][i]) {
                    this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                        .concat(this.style.metadata.statistics.layer_info[1][i]);
                }
            }
            if (this.style.type === 'fill') {
                this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                    .concat(this.style.metadata.statistics.otherValue[2]);
            } else {

                // if (this.otherValueStatus === 'lists') {
                this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                    .concat(this.style.metadata.statistics.otherValue[1]);

                // } else {
                //     this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                //         .concat(0);
                // }
            }
        }
    }


    gradeCommon(index: any) {
        this.style.metadata.statistics.layer_info[1][index][0] = this.style.metadata.statistics.layer_info[0][index][0];
        this.style.paint[this.config.attribute[0]].stops = [];
        this.style.paint[this.config.attribute[1]].stops = [];
        for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
            if (this.style.metadata.statistics.layer_info[2][i]) {
                this.style.paint[this.config.attribute[0]].stops.push(this.style.metadata.statistics.layer_info[0][i]);
            }
        }
        for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
            if (this.style.metadata.statistics.layer_info[2][i]) {
                this.style.paint[this.config.attribute[1]].stops.push(this.style.metadata.statistics.layer_info[1][i]);
            }
        }
        /*this.style.paint[this.config.attribute[0]].stops = this.style.metadata.statistics.layer_info[0];
        this.style.paint[this.config.attribute[1]].stops = this.style.metadata.statistics.layer_info[1];*/
        /*this.style.paint[this.config.attribute[1]].stops[index][0] = this.style.paint[this.config.attribute[0]].stops[index][0];*/
    }


    setGradeValue(obj: any, arr: any) {
      this.field = obj.field;
      this.fieldType = obj.type;
      this.renderType = obj.renderType;
     /* if (obj.type === 'text') {
        this.style.metadata.statistics.RenderType = 'categorical';
      }*/
      if (this.config.componentType === 1) {
          this.style.metadata.statistics.layer_info = [[], [], []];
          this.style.metadata.statistics.layer_info[0] = arr;

          for (let i = 0; i < arr.length; i++) {
              if (this.style.type === 'fill') {
                  this.style.metadata.statistics.layer_info[1].push([arr[i][0], '#ffffff']);
              } else {
                  this.style.metadata.statistics.layer_info[1].push([arr[i][0], 12]);
              }
              this.style.metadata.statistics.layer_info[2].push(true);
          }
          if (this.fieldType === 'text') {
              this.style.paint[this.config.attribute[0]] = ['match', ['to-string', ['get', this.field]]];
              for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
                  this.style.metadata.statistics.layer_info[1][i][0] = this.style.metadata.statistics.layer_info[0][i][0];
                  this.style.paint[this.config.attribute[0]] = this.style.paint[this.config.attribute[0]]
                      .concat(this.style.metadata.statistics.layer_info[0][i]);
              }
              this.style.paint[this.config.attribute[0]] = this.style.paint[this.config.attribute[0]]
                  .concat(this.style.metadata.statistics.otherValue[0]);
              /*1233333333333333*/
              this.style.paint[this.config.attribute[1]] = ['match', ['to-string', ['get', this.field]]];
              for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
                  this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                      .concat(this.style.metadata.statistics.layer_info[1][i]);
              }
              if (this.style.type === 'fill') {
                  this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                      .concat(this.style.metadata.statistics.otherValue[2]);
              } else {
                  this.style.paint[this.config.attribute[1]] = this.style.paint[this.config.attribute[1]]
                      .concat(this.style.metadata.statistics.otherValue[1]);
              }
          } else {
              this.style.paint[this.config.attribute[0]] = {
                  property: this.field,
                  stops: this.style.metadata.statistics.layer_info[0],
                  default: this.style.metadata.statistics.otherValue[0],
                  type: obj.renderType
              };
              if (this.style.type === 'fill') {
                  this.style.paint[this.config.attribute[1]] = {
                      property: this.field,
                      stops: this.style.metadata.statistics.layer_info[1],
                      default: this.style.metadata.statistics.otherValue[2],
                      type: obj.renderType
                  };
              } else {
                  this.style.paint[this.config.attribute[1]] = {
                      property: this.field,
                      stops: this.style.metadata.statistics.layer_info[1],
                      default: this.style.metadata.statistics.otherValue[1],
                      type: obj.renderType
                  };
              }
          }
          /*this.style.metadata.statistics.layer_info = [this.colorArray, this.radiusArray];*/
      } else if (this.config.componentType === 2) {
          this.style.metadata.statistics.nofield = obj.field;
          this.style.metadata.statistics.layer_info = [[], []];
          const weight = [];
          for (let i = 0; i < arr.length; i++) {
              if (this.style.metadata.statistics.nofield !== 'noField') {
                  weight.push([arr[i][0], Number((i / arr.length).toFixed(2))]);
              } else {
                  weight.push(['', Number((i / arr.length).toFixed(2))]);
              }
              arr[i][0] = Number((i / arr.length).toFixed(2));
          }
          this.style.metadata.statistics.layer_info[0] = arr;
          this.style.metadata.statistics.layer_info[1] = weight;
          this.colorChange();
          this.weightChange();
      }
    }

    /*其他值改变事件*/
    otherChange() {
        if (this.fieldType === 'number') {
            this.style.paint[this.config.attribute[0]].default = this.style.metadata.statistics.otherValue[0];
            if (this.style.type === 'fill') {
                this.style.paint[this.config.attribute[1]].default = this.style.metadata.statistics.otherValue[2];
            } else {
                // 其他值多选
                // if (this.otherValueStatus === 'lists') {
                this.style.paint[this.config.attribute[1]].default = this.style.metadata.statistics.otherValue[1];
                // } else {
                //     this.style.paint[this.config.attribute[1]].default = 0;
                // }
            }
        } else {
            this.fieldChange(1);
        }
    }
}
