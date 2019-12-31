import {Component, Input, ViewChild, OnChanges, OnInit, HostListener, QueryList, ViewChildren, EventEmitter, AfterViewInit, ElementRef, Renderer2, Output} from '@angular/core';

import {AppService} from '../../../s-service/app.service';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../s-service/http.service';
import { ExpressionComponent } from '../expression/expression.component';

@Component({
  selector: 'app-input-pattern',
  templateUrl: './input-pattern.component.html',
  styleUrls: ['./input-pattern.component.scss']
})
export class InputPatternComponent implements OnInit, OnChanges {
  @ViewChild(ExpressionComponent, {static: false}) ExpressionSon: ExpressionComponent;
  @Input() layer: any;
  @Input() patemter: any;
  @Input() splite: any;
  @Input() sprite: any;
  @Input() mapObj: any;
  @Input() ServiceEventId: any;

  BooleanHtmlFalse = false;  /* 图例需要显示的HTML的boolean */
  BooleanHtmlTrue = false ;
  bottonIshave = true;
  FilGFillIcon = 'isFill_GFill';
  Tagtyle = 'firstLayer';
  Tagtyle_more = 'morefirst';
  layerInfo: any;
  attribute: any;
  showStyle: any;
  pattern: any;
  defau: any;
  title: any;
  model: any;
  tooltip: any;
  type: any;
  opacity: any = [];
  isCollapsed: any = true;
  iconPosition: any;
  iconClass: any;
  iconList: any;
  iconIndex: any;
  iconChange: any;
  styleNumDisplay: any = false;
  layerInfomation: any;
  layerEditCheckNumber: any = true;
  styleInStatus: any = false; //是否点击输入框
  Thisattribute: any; //确定是哪个属性字段
  chooseIndex: any; //确定选择的序号
  isChecked: any = false;
  isClickAdd: any = false;
  ExpressionEdite: any; //表达式 绑定的值
  firstValue: any; //记录表达式刚开始的值
  EX_one: any;
  EX_two: any;
  isShow: any;
  isCheck: any;
  showStyles: any;
  checkoutEXboolean: any=false;
  constructor(private mapEditorService: AppService,
              private elementRef: ElementRef,
              private renderer: Renderer2,
              private httpService: HttpService,
              private httpClient: HttpClient) {
  }

  ngOnInit() {
    this.attribute = this.patemter.attribute;
    //判断是否有formulaOptons属性
    if ( this.patemter.EXtype === 0 ) {
      if ( this.layer.metadata.formulaOptons[this.attribute] ) {
          this.ExpressionEdite = this.layer.metadata.formulaOptons[this.attribute];
      } else {
          if ( this.layerInfo[this.attribute] ) {
            this.showStyles = typeof this.layerInfo[this.attribute];
            if (this.showStyles === 'object') {
               this.layer.metadata.formulaOptons[this.attribute] = [];
               for ( let stop of this.layerInfo[this.attribute].stops) {
                  var num = stop[0];
                  var val = stop[1].toString();
                  this.layer.metadata.formulaOptons[this.attribute].push([ num , val ]);
               }
            } else {
              this.ExpressionEdite = this.layerInfo[this.attribute].toString();
            }
          } else {
            this.ExpressionEdite = this.patemter.default;
          }
      }
    }


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
    this.type = this.patemter.type;
    if ( this.patemter.EXtype === 0 ) {
      if ( this.layer.metadata.formulaOptons[this.attribute] ) {
          this.ExpressionEdite = this.layer.metadata.formulaOptons[this.attribute];
      } else {
          if ( this.layerInfo[this.attribute] ) {
            this.showStyles = typeof this.layerInfo[this.attribute];
            if (this.showStyles === 'object') {
               this.layer.metadata.formulaOptons[this.attribute] = [];
               for ( let stop of this.layerInfo[this.attribute].stops) {
                  var num = stop[0];
                  var val = stop[1].toString();
                  this.layer.metadata.formulaOptons[this.attribute].push([ num , val ]);
               }
            }else {
              this.ExpressionEdite = this.layerInfo[this.attribute].toString();
            }
          } else {
            this.ExpressionEdite = this.patemter.default;
          }
      }
    }


    if ( this.patemter.EXtype === 0) {
      this.showStyle = typeof this.layer.metadata.formulaOptons[this.attribute];
    }else {
      this.showStyle = typeof this.layerInfo[this.attribute];
    }
    if (this.type === 2) {
      this.model = this.model * 100;
      this.opacity = [];
      const self = this;
      if (this.showStyle === 'object') {
        this.layerInfo[this.attribute].stops.forEach(function (value: any, index: any, array: any) {
          self.opacity.push(value[1] * 100);
        });
      }
    }
     if (this.attribute === 'icon-image' ||
     this.attribute === 'fill-pattern' ||
     this.attribute === 'fill-extrusion-pattern') {
      this.iconPosition = this.splite;
      this.iconClass = [[], [], [], [], [], [], [], [], []];
      for (const i in this.iconPosition) {
        if (i.length === 7) {
          this.iconClass[8].push({
            id: i,
            position: this.iconPosition[i]
          });

        } else {
          switch (i.substr(0, 1)) {
            case '1':
              this.iconClass[0].push({
                id: i,
                position: this.iconPosition[i]
              });
              break;
            case '2':
              this.iconClass[1].push({
                id: i,
                position: this.iconPosition[i]
              });
              break;
            case '3':
              this.iconClass[2].push({
                id: i,
                position: this.iconPosition[i]
              });
              break;
            case '4':
              this.iconClass[3].push({
                id: i,
                position: this.iconPosition[i]
              });
              break;
            case '5':
              this.iconClass[4].push({
                id: i,
                position: this.iconPosition[i]
              });
              break;
            case '7':
              this.iconClass[5].push({
                id: i,
                position: this.iconPosition[i]
              });
              break;
            case '8':
              this.iconClass[6].push({
                id: i,
                position: this.iconPosition[i]
              });
              break;
            default:
              this.iconClass[7].push({
                id: i,
                position: this.iconPosition[i]
              });
          }
        }

      }
    }
  }
  clicks(event: any, index: any) {
    this.isCollapsed = !this.isCollapsed;
    const iconChange = this.elementRef.nativeElement.getElementsByClassName('iconStyle')[0];
    iconChange.style.position = 'fixed';
    iconChange.style.top = (event.clientY - event.offsetY + event.target.clientHeight - 91) + 'px';
    iconChange.style.left = (event.clientX - event.offsetX + event.target.clientWidth + 25) + 'px';

    this.chooseClass(0);
    if (index !== undefined) {
      this.iconIndex = index;
    }
  }

  chooseClass(value: any) {
    this.iconList = this.iconClass[value];
  }

  selectIcon(iconClass: any, index: any) {
    if (this.showStyle === 'object') {
      this.layerInfo[this.attribute].stops[this.iconIndex][1] = iconClass[index].id;
    } else {
      this.model = iconClass[index].id;
      this.layerInfo[this.attribute] = iconClass[index].id;
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  clickAdd(Attribute: any) {
    /* 图标 单级变多级按钮 */
    if (Attribute === 'fill-pattern' || Attribute === 'background-pattern' ||
          Attribute === 'line-pattern' || Attribute === 'icon-image' || Attribute === 'fill-extrusion-pattern') {
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
            this.opacity.push(this.layerInfo[this.attribute].stops[0][1] * 100);
            this.opacity.push(this.layerInfo[this.attribute].stops[1][1] * 100);
          }
          if (this.layer.metadata.sprite.length > 0) {
            const middleValue = this.layer.metadata.sprite[0];

            this.layer.metadata.sprite.push(middleValue);
          }
          this.showStyle = typeof this.layerInfo[this.attribute];
          this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
          return;
    }
    /* 非图标 */
    if (Attribute === 'line-round-limit' && this.layer.layout['line-join'] === 'miter' ||
        Attribute === 'line-miter-limit' && this.layer.layout['line-join'] === 'round' ||
        Attribute === 'symbol-spacing' && this.layer.layout['symbol-placement'] !== 'line' ||
        Attribute === 'text-max-width' && this.layer.layout['symbol-placement'] !== 'point' ||
        Attribute === 'text-max-angle' && this.layer.layout['symbol-placement'] !== 'line') {
        return;
    } else {
          let value ;
          if ( this.patemter.EXtype === 0) {
            if (this.layerInfo[this.attribute] === undefined) {
              this.layerInfo[this.attribute] = this.ExpressionSon.ExamplesOneFunction(this.layer.metadata.formulaOptons[Attribute]);
            }
            if (this.layer.metadata.formulaOptons[Attribute]) {
               value = this.layer.metadata.formulaOptons[Attribute]
            } else {
               value = this.ExpressionEdite;
            }
              this.layerInfo[this.attribute] = [
                "interpolate",
                ["linear"],
                ["zoom"],
                6,
                this.layerInfo[this.attribute],
                10,
                this.layerInfo[this.attribute]
              ]
              this.showStyle = typeof this.layerInfo[this.attribute];
              //const value = this.layer.metadata.formulaOptons[Attribute];
              this.layer.metadata.formulaOptons[Attribute] = [ [6 , value] , [10 , value]  ];
              this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
              this.styleNumDisplay = !this.styleNumDisplay;
        }else {
              /* 没有表达式属性 单级变多级 */
              if (this.layerInfo[this.attribute] === undefined) {
                if (this.type === 2) {
                  this.layerInfo[this.attribute] = {
                    'stops': [
                      [6, (this.model / 100)], [10, (this.model / 100)]
                    ]
                  };
                  this.opacity.push(this.layerInfo[this.attribute].stops[0][1] * 100);
                  this.opacity.push(this.layerInfo[this.attribute].stops[1][1] * 100);
                } else {
                  this.layerInfo[this.attribute] = {
                    'stops': [
                      [6, this.model], [10, this.model]
                    ]
                  };
                }
              } else {
                this.layerInfo[this.attribute] = {
                  'stops': [
                    [6, this.layerInfo[this.attribute]], [10, this.layerInfo[this.attribute]]
                  ]
                };
                this.opacity.push(this.layerInfo[this.attribute].stops[0][1] * 100);
                this.opacity.push(this.layerInfo[this.attribute].stops[1][1] * 100);
              }
              this.showStyle = typeof this.layerInfo[this.attribute];
              this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
        }




    }


  }

  remove(Attribute: any,index: any) {
    /* 表达式删除处理 */
      if ( this.patemter.EXtype === 0) {
        this.layer.metadata.formulaOptons[this.attribute].splice(index, 1);
        const length = this.layer.metadata.formulaOptons[this.attribute].length;
        const value = this.layer.metadata.formulaOptons[this.attribute][length-1];
        this.showStyle = typeof this.layer.metadata.formulaOptons[this.attribute];
        if ( length <= 1 ) {
          this.layer.metadata.formulaOptons[this.attribute] = value[1];
          this.ExpressionEdite = value[1];
          this.showStyle = typeof this.layer.metadata.formulaOptons[this.attribute];
        }
        this.changeNumEXStyle();
        this.styleNumDisplay = false;
    } else {
          /* 非表达式 */
          this.layerInfo[this.attribute].stops.splice(index, 1);
          this.opacity.splice(index, 1);
          if (this.attribute === 'fill-pattern' || this.attribute === 'background-pattern' ||
          this.attribute === 'line-pattern' || this.attribute === 'icon-image' || this.attribute === 'fill-extrusion-pattern')  {
            this.layer.metadata.sprite.splice(index , 1);
          }
          if (this.layerInfo[this.attribute].stops.length <= 1) {
            const value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
            if (this.type === 1) {
              this.layerInfo[this.attribute] = value;
              this.model = value;
              if (this.layerInfo[this.attribute] === '') {
                delete this.layerInfo[this.attribute];
              }
            } else if (this.type === 0) {
              this.layerInfo[this.attribute] = Number(value);
              this.model = Number(value);
            } else {
              this.layerInfo[this.attribute] = Number(value);
              this.model = Number(value) * 100;
            }
            this.opacity = [];
            this.showStyle = typeof this.layerInfo[this.attribute];
          }
          this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }



  }
/* 多多图标 */
  buttomAdds(Attribute: any){
    if (Attribute === 'fill-pattern' || Attribute === 'background-pattern' ||
    Attribute === 'line-pattern' || Attribute === 'icon-image' || Attribute === 'fill-extrusion-pattern') {
      const num = this.layerInfo[this.attribute].stops.length - 1;
      const value = this.layerInfo[this.attribute].stops[num][1];
      const index = this.layerInfo[this.attribute].stops[num][0];
      this.layerInfo[this.attribute].stops.push([Number(index) + 1, value]);
      if (this.layer.metadata.sprite.length > 0 ) {
        const IconJson = this.layer.metadata.sprite[0];
        this.layer.metadata.sprite.push(IconJson);
      }
    } else {
      const num = this.layerInfo[this.attribute].stops.length - 1;
      const value = this.layerInfo[this.attribute].stops[num][1];
      const index = this.layerInfo[this.attribute].stops[num][0];
      this.layerInfo[this.attribute].stops.push([Number(index) + 1, value]);
      this.opacity.push(value * 100);
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }
  buttomAdd() {
    if ( this.patemter.EXtype === 0) {
      const num = this.layer.metadata.formulaOptons[this.attribute].length - 1 ;
      const value = this.layer.metadata.formulaOptons[this.attribute][num][1];
      const index = this.layer.metadata.formulaOptons[this.attribute][num][0];
      this.layer.metadata.formulaOptons[this.attribute].push([Number(index) + 1 , value]);
      // this.changeStyle();
      this.changeNumEXStyle();
    } else {
      const num = this.layerInfo[this.attribute].stops.length - 1;
      const value = this.layerInfo[this.attribute].stops[num][1];
      const index = this.layerInfo[this.attribute].stops[num][0];
      this.layerInfo[this.attribute].stops.push([Number(index) + 1, value]);
      this.opacity.push(value * 100);
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }
  }
  /* 单图标事件 */
  change(event: any) {
    if (this.type === 1) {
      this.model = event.iconId;
      this.layerInfo[this.attribute] = this.model;
      if (this.layerInfo[this.attribute] === '' || this.layerInfo[this.attribute] === undefined) {
        delete this.layerInfo[this.attribute];
      }
      this.layer.metadata.sprite = event ? [event] : [];
    } else {
      this.layerInfo[this.attribute] = Number(this.model);
    }
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }
  /* 多图标事件 */
  changesMore(event: any, index: any) {
    this.layerInfo[this.attribute].stops[index][1] = event.iconId ;
    this.layer.metadata.sprite[index] = event;
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }


  changes() {
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  slideEnd(event: any) {
    this.layerInfo[this.attribute] = this.model / 100;
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  slideEndStops(event: any, index: any) {
    this.layerInfo[this.attribute].stops[index][1] = this.opacity[index] / 100;
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  test(event: any,Attribute: any,index: any) {
    const pattern = /^((\d)|(1\d)|(2[0-4]))$/;
    const fall = pattern.test(event.target.value);
      if ( this.patemter.EXtype === 0) {
        this.EX_one = undefined;
        if (!fall) {
          let min = 0;
          let max = 0;
          if (index === 0) {
            min = 0;
            max = this.layer.metadata.formulaOptons[Attribute][index + 1][0];
          } else if (index === (this.layer.metadata.formulaOptons[Attribute].length) - 1) {
            min = this.layer.metadata.formulaOptons[Attribute][index - 1][0];
            max = 24;
          }
          this.layer.metadata.formulaOptons[Attribute][index][0] = Math.floor(Math.random() * (max - min) + min);
          this.changeNumEXStyle();
        }
        this.changeNumEXStyle();
    } else {
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
  @ViewChildren('smx-Allen-EXNUM') unclick: QueryList<ElementRef>;
  @HostListener('document:click', ['$event']) bodyClick(e) {
      if ( !this.isShow && !getTrigger(this.unclick, 'smx-Allen-EXNUM') ) {
          if (this.checkoutEXboolean) {
            this.layerEditCheckNumber = false;
          } else {
            this.layerEditCheckNumber = true;
          }
      }
      if ( this.isShow === true ) {
        this.layerEditCheckNumber = false;
        this.isShow = false;
        return;
      } else if ( this.isShow === false && getTrigger(this.unclick, 'smx-Allen-EXNUM') ) {
        this.layerEditCheckNumber = true;
      }
      if (getTrigger(this.unclick, 'smx-Allen-EXNUM')) {
        this.isCheck = false;
        this.checkoutEXboolean = false;
      }
      if (this.isCheck === false) {
        if (getTrigger(this.unclick, 'smx-Allen-EXNUM')) {
            this.styleNumDisplay = false;
            this.layerEditCheckNumber = true;
            /* if (this.styleInStatus) {
              this.changeNumEXStyle();
            } */
            this.styleInStatus = false;
        }
      }
    function getTrigger(queryList, className?) {
      let flag = true;
      (<HTMLElement[]>e.path).forEach(i => {
        flag && queryList.forEach(el => {
          i.isEqualNode && i.isEqualNode(el.nativeElement) && (flag = false);
        })
        flag && i.className && i.className.indexOf && i.className.indexOf(className) > -1 && (flag = false);
      })
      return flag;
    }
  }

  //改变样式方法 失去焦点的时候
  changeNumEXStyle() {
    if (this.showStyle === 'string' || this.showStyle === 'undefined' || this.showStyle === 'number' ) {

        this.layer.metadata.formulaOptons[this.attribute] = this.ExpressionEdite;
        this.layerInfo[this.attribute] = this.ExpressionSon.ExamplesOneFunction(this.layer.metadata.formulaOptons[this.attribute]);
        this.mapEditorService.changeStyleEventEmitter.emit(this.layer);


    }else{

        this.layerInfo[this.attribute] = [
            "interpolate",
            ["linear"],
            ["zoom"]

        ];
        let endStringArr = this.ExpressionSon.ExamplesMoreFunction(this.layer.metadata.formulaOptons[this.attribute]);
        this.layerInfo[this.attribute] = this.layerInfo[this.attribute].concat(endStringArr);
        this.mapEditorService.changeStyleEventEmitter.emit(this.layer);

    }

  }


  changEXstyle(){
    setTimeout(() => {
      this.changeNumEXStyle();
    }, 500);
  }
  //input聚焦触发
  focusOne(Attribut: any){
    this.styleNumDisplay = true ;
    this.styleInStatus = true;
  }
  focusMore(Attribut: any,index: any){

    this.chooseIndex = index;
    this.styleNumDisplay = true ;
    this.styleInStatus = true;
  }
  //加号按钮 方法
  chageNumEvent(event: any){
        this.isShow = true;
        this.isClickAdd = true;
        this.styleInStatus = true;
        this.layerEditCheckNumber = !this.layerEditCheckNumber;
        const iconChange = this.elementRef.nativeElement.getElementsByClassName('layerEditNum-smartMapX-select-checkAll')[0];
        iconChange.style.position = 'fixed';
        iconChange.style.top = (event.clientY - event.offsetY + event.target.clientHeight - 110) + 'px'; // width = 182
        iconChange.style.left = (event.clientX - event.offsetX + event.target.clientWidth + 55) + 'px';
  }
  chageNumEventMore(event: any,index: any){
        this.isShow = true;
        this.styleInStatus = true;
        this.isClickAdd = true;
        this.chooseIndex = index;
        this.layerEditCheckNumber = !this.layerEditCheckNumber;
        const iconChange = this.elementRef.nativeElement.getElementsByClassName('layerEditNum-smartMapX-select-checkAll')[0];
        iconChange.style.position = 'fixed';
        iconChange.style.top = (event.clientY - event.offsetY + event.target.clientHeight - 110) + 'px'; // width = 182
        iconChange.style.left = (event.clientX - event.offsetX + event.target.clientWidth + 55) + 'px';
  }
  changeExampleF(event: any){
    if (event.isUse === 1 ) {
      if (event.type === 1) {
        this.ExpressionEdite = event.value;
        if (event.isvalue) {
          this.changeNumEXStyle();
        }
        if (event.number !== 0 ) {
          this.layerEditCheckNumber = event.number;
        }
      } else {
        if (event.number !== 0 ) {
          this.layerEditCheckNumber = event.number;
        }
      }
    } else {
      this.layer.metadata.formulaOptons[this.attribute] = event.format;
      if (event.isvalue) {
        this.changeNumEXStyle();
      }
    }
    this.checkoutEXboolean = event.boolean;
  }

}
