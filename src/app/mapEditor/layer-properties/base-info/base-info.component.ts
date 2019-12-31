import {Component, Input, OnDestroy, OnChanges, OnInit} from '@angular/core';
import {HttpService} from '../../../s-service/http.service';
import {AppService} from '../../../s-service/app.service';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';
import {LocalStorage} from '../../../s-service/local.storage';
import {isUINumber} from '../../../s-service/utils';

@Component({
  selector: 'app-base-info',
  templateUrl: './base-info.component.html',
  styleUrls: ['./base-info.component.scss']
})
export class BaseInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() layerInfo: any;
  @Input() patemter: any;
  @Input() layerIndex: any;
  @Input() layerEditor: any;
  @Input() ServiceEventId: any;
  @Input() type: any;
  @Input() mapType: any;
  condition: any;
  newFilter: any = [];
  filterType: any = [];
  myTextarea: any;
  editor: any;
  container: any;
  options: any;
  defau: any;
  rangeValues: number[];
  unsubscribe: any;
  unlayerEditor: any;
  unLayerNameEditor: any;
  changeType: any;      //
  changeTypeInfo: any;
  localInfo: any;
  /* 个别提示信息 */
  tooltipCombinationFilter = '新增并设置过滤条件，图层上会显示符合过滤条件的地图数据的效果';
  tooltipLayerlevel = '该图层在地图上的显示级别范围';
  tooltipLayerName = '创建图层时填写的名称';
  tooltipLayerType = '图层类型包括：背景、点（图标/圆）、线、面（面、高程面），不同的图层显示不同的分类';
  tooltipTypeName = '一份数据可以创建多个样式，显示在面板上的名称是样式的名称,样式名称和图层初始名称一致，可各自修改';
  /* 面保存属性数组 */
  lastLayout: any = [];
  lastPaint: any = [];

  /* 高程面保存属性数组 */
  lastLayout1: any = [];
  lastPaint1: any = [];

  /* 线保存属性方法 */
  lastLayout_line: any = [];
  lastPaint_line: any = [];

  changeIndex: any = [];
  changeIndex_fill: any;

  /* 面 高程面 线 转换前标记 */
  thisType: any;
  mouseEvent: any;

  test = false;

  constructor(private appService: AppService,
              private toastService: ToastService,
              private httpService: HttpService,
              private ls: LocalStorage) {
    this.unsubscribe = this.appService.changeStyleEventEmitter.subscribe((value: any) => {
      this.myTextarea = JSON.stringify(this.layerInfo, null, 2);
    });
    this.unlayerEditor = this.appService.layerEditorEventEmitter.subscribe((value: any) => {
      this.myTextarea = JSON.stringify(this.layerInfo, null, 2);
    });
    this.unLayerNameEditor = this.appService.layerNameEventEmitter.subscribe((result: any) => {
      if (result.tag === 'layer_style') {
        this.layerInfo.metadata.name = result.value;
      }


      if (result.tag === 'layer') {
        this.layerInfo.metadata.layer_name = result.value;
      }
    });

    /**
     * 鼠标监听事件
     */
    this.mouseEvent = this.appService.mouseEventEmitter.subscribe((value: any[]) => {
      if (this.test) {
        this.test = false;
        document.getElementById('test').blur();
        this.change(this.layerInfo.metadata.name);
      }
    });
  }

  ngOnInit() {
    // this.localInfo = JSON.parse(localStorage.getItem('visitInfo') || '');
    this.localInfo = this.ls.getObject('visitInfo');
  }

  ngOnDestroy() {
    this.unlayerEditor.unsubscribe();
    this.unsubscribe.unsubscribe();
    this.unLayerNameEditor.unsubscribe();
  }

  ngOnChanges() {
    this.thisType = this.layerInfo.type;
    this.defau = [];
    this.rangeValues = [this.layerInfo['minzoom'], this.layerInfo['maxzoom']];
    /*this.minIndex = this.layerInfo['maxzoom'];*/
    this.condition = ['==', '!=', '>', '>=', '<', '<=', 'in', '!in', 'has', '!has'];
    if (this.layerInfo.filter === undefined) {
      this.layerInfo.filter = ['all'];
      return;
    } else if (this.layerInfo.filter[0] === 'all' || 'any' || 'none') {
      this.newFilter = this.layerInfo.filter.slice(1);
    }
    this.myTextarea = JSON.stringify(this.layerInfo, null, 2);
    if (this.patemter.attribute === 'filter') {
      this.loadFilterData();
    }
  }


  /**
   * jkf 加载过滤字段,若失败则0.5S尝试重新加载
   */
  loadFilterData() {
    if (this.ServiceEventId.length > 0) {
      const id = this.layerInfo.metadata.service_event_id;
      for (let i = 0; i < this.ServiceEventId.length; i++) {
        if (id === this.ServiceEventId[i].id) {
          for (let m = 0; m < this.ServiceEventId[i].name.length; m++) {
            this.defau = this.ServiceEventId[i];
            /*this.change_type();*/
          }
        }
      }
    } else {
      setTimeout(() => {
        this.loadFilterData();
      }, 500);
    }
  }

  addFilter() {
    if (this.layerInfo.filter.length >= 10) {
      // alert('最多添加10个过滤！');
      const toast = new ToastConfig(ToastType.WARNING, '', '最多添加10个过滤', 2000);
      this.toastService.toast(toast);
      return;
    } else {
      this.layerInfo.filter.push(
        ['==', 'name', '']
      );
      this.newFilter = this.layerInfo.filter.slice(1);
    }
    // this.appService.changeStyleEventEmitter.emit(this.layerInfo);
  }

  slideEnds(event: any) {
    this.layerInfo['minzoom'] = this.rangeValues[0];
    this.layerInfo['maxzoom'] = this.rangeValues[1];
    this.appService.changeStyleEventEmitter.emit(this.layerInfo);
  }

  remove(index: any) {
    this.layerInfo.filter.splice(index + 1, 1);
    this.newFilter = this.layerInfo.filter.slice(1);
    if (this.layerInfo.filter.length < 2) {
      this.layerInfo.filter[0] = 'all';
    }
    /*this.change_type();*/
    // this.appService.changeStyleEventEmitter.emit(this.layerInfo);
    this.appService.changeStyleEventEmitter.emit({flag: 'diff', layerInfo: this.layerInfo});
  }

  change(event: any, tag?: any, index?: any, value?: any) {
    this.change_type();
    if (tag === 'diff') {
      this.appService.changeStyleEventEmitter.emit({flag: 'diff', layerInfo: this.layerInfo});
    } else if (tag === 'filter') {
      if (event[0] === 'in' || event[0] === '!in') {
        if (value !== 'in') {
          const filter = value.target.value.split(',');
          this.newFilter[index] = this.newFilter[index].slice(0, 2).concat(filter);
          this.layerInfo.filter[index + 1] = this.newFilter[index];
        } else if (value === 'in') {
          this.layerInfo.filter[index + 1] = event;
        }
      } else if (event[0] === 'has' || event[0] === '!has') {
        this.layerInfo.filter[index + 1] = this.newFilter[index].slice(0, 2);
      } else {
        this.layerInfo.filter[index + 1] = this.newFilter[index].slice(0, 3);
      }
      if ((event[2] && event[2] !== '') || event[0] === 'has' || event[0] === '!has') {
        this.appService.changeStyleEventEmitter.emit({flag: 'diff', layerInfo: this.layerInfo});
      }
    } else {

      this.appService.changeStyleEventEmitter.emit(this.layerInfo);
    }
  }

  change_type() {
    console.log(this.defau);
    for (let i = 0; i < this.newFilter.length; i++) {
      const indexs = this.defau.name.indexOf(this.newFilter[i][1]);
      // if (this.defau.type[indexs] === 'fm_ui_input_integer' || this.defau.type[indexs] === 'fm_ui_input_integer2' ||
      //   this.defau.type[indexs] === 'fm_ui_input_integer8' || this.defau.type[indexs] === 'fm_ui_input_decimal' ||
      //   this.defau.type[indexs] === 'fm_ui_input_decimal8') {
      if (isUINumber(this.defau.type[indexs])) {
        this.filterType[i] = 1;
        this.newFilter[i][2] = Number(this.newFilter[i][2]);
      } else {
        this.filterType[i] = 2;
      }
    }
  }

  // getData(url: any): Promise<any> {
  //   return this.http.get(url)
  //     .toPromise()
  //     .then((res) => {
  //       const mapData = JSON.parse((res as any)._body);
  //       this.changeTypeInfo = mapData.layers[mapData.layers.length - 1];
  //     });
  // }

  changeLayerType() {
    if (this.layerInfo.type === 'circle') {
      this.lastLayout[this.layerIndex] = this.layerInfo.layout;
      this.lastPaint[this.layerIndex] = this.layerInfo.paint;
    } else {
      this.lastLayout1[this.layerIndex] = this.layerInfo.layout;
      this.lastPaint1[this.layerIndex] = this.layerInfo.paint;
    }
    this.changeAttribute();
    this.appService.changeStyleEventEmitter.emit(this.layerInfo);
    setTimeout(() => {
      const num = document.getElementsByClassName('card-header');
      for (let i = 0; i < num.length; i++) {
        const isclick = num[i].firstElementChild.getAttribute('aria-expanded');
        if (isclick === 'false') {
          num[i].getElementsByTagName('a')[0].click();
        }
      }
    }, 50);
  }

  changeAttribute() {
    if (!this.changeIndex[this.layerIndex]) {
      if (this.layerInfo.type === 'circle') {
        this.layerInfo.paint = {
          'circle-color': 'rgba(69,213,195,0.72)'
        };
        this.layerInfo.layout = {};
      } else {
        this.layerInfo.paint = {};
        this.layerInfo.layout = {
          'icon-image': 'G40101',
          'text-font': [
            'Microsoft YaHei Regular'
          ],
          'text-anchor': 'top'
        };
      }
      this.changeIndex[this.layerIndex] = 1;
    } else {
      if (this.layerInfo.type === 'circle') {
        this.layerInfo.layout = this.lastLayout1[this.layerIndex];
        this.layerInfo.paint = this.lastPaint1[this.layerIndex];
      } else {
        this.layerInfo.layout = this.lastLayout[this.layerIndex];
        this.layerInfo.paint = this.lastPaint[this.layerIndex];
      }
    }
  }

  /*修改面和高程面的方法 */
  changeFillType(typel: any) {
    /* ;
    if (this.layerInfo.type === 'fill') {
      this.lastLayout[this.layerIndex] = this.layerInfo.layout;
      this.lastPaint[this.layerIndex] = this.layerInfo.paint;
    } else if (this.layerInfo.type === 'fill-extrusion') {
      this.lastLayout1[this.layerIndex] = this.layerInfo.layout;
      this.lastPaint1[this.layerIndex] = this.layerInfo.paint;
    } else {
      this.lastLayout_line[this.layerIndex] = this.layerInfo.layout;
      this.lastPaint_line[this.layerIndex] = this.layerInfo.paint;
    } */
    if (this.thisType) {
      if ((this.thisType === 'fill' && this.layerInfo.type === 'fill-extrusion') ||
        (this.thisType === 'fill' && this.layerInfo.type === 'line')) {
        /* 面转换成高程面-线 保存面属性 */
        this.lastLayout[this.layerIndex] = this.layerInfo.layout;
        this.lastPaint[this.layerIndex] = this.layerInfo.paint;
        this.thisType = this.layerInfo.type;
      } else if ((this.thisType === 'fill-extrusion' && this.layerInfo.type === 'fill') ||
        (this.thisType === 'fill-extrusion' && this.layerInfo.type === 'line')) {
        /* 高程面转换成面-线 保存高程面属性 */
        this.lastLayout1[this.layerIndex] = this.layerInfo.layout;
        this.lastPaint1[this.layerIndex] = this.layerInfo.paint;
        this.thisType = this.layerInfo.type;
      } else if ((this.thisType === 'line' && this.layerInfo.type === 'fill-extrusion') ||
        (this.thisType === 'line' && this.layerInfo.type === 'fill')) {
        /* 线转换成高程面-面 保存线属性 */
        this.lastLayout_line[this.layerIndex] = this.layerInfo.layout;
        this.lastPaint_line[this.layerIndex] = this.layerInfo.paint;
        this.thisType = this.layerInfo.type;
      }
    }
    this.changeAttribute_fill();
    this.appService.changeStyleEventEmitter.emit(this.layerInfo);

    setTimeout(() => {
      const num = document.getElementsByClassName('card-header');
      for (let i = 0; i < num.length; i++) {
        const isclick = num[i].firstElementChild.getAttribute('aria-expanded');
        if (isclick === 'false') {
          num[i].getElementsByTagName('a')[0].click();
        }
      }
    }, 50);

  }

// -------------------面和高程面转换保留修改属性---------------------------------
  changeAttribute_fill() {
    if (!this.changeIndex[this.layerIndex]) {
      if (this.layerInfo.type === 'fill') {
        /* 面初始属性 */
        this.layerInfo.paint = {};
        this.layerInfo.layout = {};
      } else if (this.layerInfo.type === 'fill-extrusion') {
        /* 高程面初始属性 */
        this.layerInfo.paint = {};
        this.layerInfo.layout = {};
      } else if (this.layerInfo.type === 'line') {
        /* 线初始属性 */
        this.layerInfo.paint = {};
        this.layerInfo.layout = {};
      }
      this.changeIndex[this.layerIndex] = 1;
    } else {
      /*this.layerInfo.paint = this.lastPaint[0];
      this.layerInfo.layout = this.lastLayout[0];*/
      if (this.layerInfo.type === 'fill') {
        this.layerInfo.layout = this.lastLayout[this.layerIndex];
        this.layerInfo.paint = this.lastPaint[this.layerIndex];
        /* 判断是否为undefault */
        this.setNovalue(this.layerInfo.layout, this.layerInfo.paint);
      } else if (this.layerInfo.type === 'fill-extrusion') {
        this.layerInfo.layout = this.lastLayout1[this.layerIndex];
        this.layerInfo.paint = this.lastPaint1[this.layerIndex];
        this.setNovalue(this.layerInfo.layout, this.layerInfo.paint);
      } else if (this.layerInfo.type === 'line') {
        this.layerInfo.layout = this.lastLayout_line[this.layerIndex];
        this.layerInfo.paint = this.lastPaint_line[this.layerIndex];
        this.setNovalue(this.layerInfo.layout, this.layerInfo.paint);
      }
    }
  }

// ----------------------------------------------------------------------------

  /* 空值赋值 */
  setNovalue(layout: any, paint: any) {
    if (!layout) {
      this.layerInfo.layout = {};
    }
    if (!paint) {
      this.layerInfo.paint = {};
    }
  }

  changeLayer(string: any) {
    const oldtype = this.layerInfo.type;
    this.layerInfo = JSON.parse(string);
    const newtype = this.layerInfo.type;
    if (oldtype !== newtype) {
      this.layerInfo.paint = {};
      this.layerInfo.layout = {};
    }
    this.layerEditor[this.layerIndex] = this.layerInfo;
    this.appService.changeStyleEventEmitter.emit(this.layerInfo);
    this.appService.layerEditorEventEmitter.emit([this.layerInfo, this.layerIndex]);
  }
}
