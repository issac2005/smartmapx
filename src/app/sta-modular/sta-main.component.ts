import {Component, Input, ElementRef, Renderer2, OnChanges, OnInit, ViewChild} from '@angular/core';
import {AppService} from '../s-service/app.service';
import {GradeSetComponent} from './grade-set/grade-set.component';
import {HttpService} from '../s-service/http.service';
import {IconComponent} from './component/icon/icon.component';
import {FlowGraphComponent} from './component/flow-graph/flow-graph.component';
import {HttpClient} from '@angular/common/http';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';
import * as validateStyleMin from '@smx/smartmapx-gl-style-validate';
import * as GlSpec from '@smx/smartmapx-gl-style-validate/reference/latest.js';
import {SMXNAME} from '../s-service/utils';

@Component({
  selector: 'app-sta-main',
  templateUrl: './sta-main.component.html',
  styleUrls: ['./sta-main.component.scss']
})
export class StaMainComponent implements OnInit, OnChanges {

  // @Output() changeStyleEventEmitter = new EventEmitter;
  @ViewChild(GradeSetComponent, {static: false}) gradeSet: GradeSetComponent;
  @ViewChild(IconComponent, {static: false}) LegendSet: IconComponent;
  @ViewChild(FlowGraphComponent, {static: false}) FlowGraph: FlowGraphComponent;
  @Input() mapStyle: any; // 图层
  @Input() layer: any; // 图层
  @Input() staType: any; // 图层
  @Input() map: any; // 地图对象
  @Input() layerIndex: any; // 地图位置
  @Input() type: any; // 调用者类型
  @Input() mapType: any;
  // @Input() pageConfig: any; // 数据信息
  // @Input() totalProperty: any;  // 数据量 // todo 需要更改


  subsectionFields: any;  // 未过滤字段
  modelInfo: any;  // 组件信息
  fieldArray: any[]; // 字段
  source: any; // 数据源
  layerType: any; //

  RenderType = true;
  option = [];

  /**-----------------------------------------老统计图start--------------------------------**/

  subsectionField = '';


  // 分段方法
  subsectionMethods = <any>[];
  subsectionMethod = '';

  // 分段等级
  subsectionGrades = <any>[];
  subsectionGrade = 4;

  // 分段颜色
  subsectionColors = <any[]>[];


  // 显示类型
  subsectionType = '';

  // 半径
  radius = 10;

  // 透明度
  opacity = 100;

  // 聚合距离
  clusterRadius = 50;

  // 聚合级别
  clusterMaxZoom = 17;


  // 标题
  staTitle = '';

  // 柱状图 饼状图
  barItemWidth = 6;
  barGapWidth = 3;
  pieMaxRadius = 50;
  barMaxHeight = 100;
  sumMaxValue: number;

  // options: SelectItem[];

  selectOption = ([] as any);
  updatePermission = true;


  newSta = true;
  myTextarea: any;

  /**-----------------------------------------老统计图end--------------------------------**/

  layer_style_name: string;
  splite: any; // 雪碧图参数

  ceInconSize: any;

  unLayerNameEditor: any;


  constructor(public appService: AppService, private httpService: HttpService, public toastService: ToastService,
              private elementRef: ElementRef, private httpClient: HttpClient, private render2: Renderer2) {


    this.unLayerNameEditor = this.appService.layerNameEventEmitter.subscribe((result: any) => {
      if (result.tag === 'layer_style') {
        this.layer[0].metadata.name = result.value;
        this.layer_style_name = result.value;
      }


      if (result.tag === 'layer') {
        this.layer[0].metadata.layer_name = result.value;
        // this.layer_style_name = result.value;
      }
    });

  }

  ngOnInit() {
    /* 图例获取png和图片地址 */
    this.httpService.getFile('/handler/sprite/sprite2.json?t=' + new Date().getTime()).subscribe((data) => {
        this.splite = data;
      },
      error => {
      }
    );
    // 字段获取
    if (this.type === 'sta') {
      this.initFiled();
      this.myTextarea = JSON.stringify(this.layer[0], null, 2);
      switch (this.staType) {
        case 'b8e4c3c0-55ec-4c47-b28f-6b2572bd48cd': // 灯光
        case 'd20fb4db-484b-4408-a59b-dc96812c6d5e': // 柱状
        case 'c40527b1-c55a-4922-9e2d-351897741583': // 饼状
        case '22c8992e-9714-48cd-8795-e377a9117f36':  // 区划
          this.newSta = false;
          // this.initStaData(this.mapStyle.layers[this.mapStyle.layers.length - 1]);
          this.initStaData();
          break;
        default:
          this.newSta = true;
          // 配置文件读取
          this.getInfo();
      }
    }
    if (this.staType === '7154b538-3257-4c51-b1ec-cbfacafb05e5') {
      this.layerType = '流向图';
    } else if (this.staType === '70d9e333-a40c-49d0-a88c-fbf156a37766') {
      this.layerType = '定点符号图';
    } else if (this.staType === '1b42b204-a0a7-47a9-8ad3-934f03d2ed49') {
      this.layerType = '热力图';
    } else if (this.staType === '6a66b3a7-d49a-44a4-bd5f-374dc9a06c9c') {
      this.layerType = '等级设色';
    } else if (this.staType === '05e20d72-c000-4f59-af97-8adb31bcc522') {
      this.layerType = '聚合图';
    } else if (this.staType === 'cb1a9c12-e64a-11e8-b3e0-0242ac120002') {
      this.layerType = '图标符号图';
    } else if (this.staType === 'b8e4c3c0-55ec-4c47-b28f-6b2572bd48cd') {
      this.layerType = '灯光图';
    } else if (this.staType === 'c40527b1-c55a-4922-9e2d-351897741583') {
      this.layerType = '饼状图';
    } else if (this.staType === '22c8992e-9714-48cd-8795-e377a9117f36') {
      this.layerType = '行政区域设色';
    } else if (this.staType === 'd20fb4db-484b-4408-a59b-dc96812c6d5e') {
      this.layerType = '柱状图';
    }
    /* if (this.layer[0].type === 'circle') {
      this.layerType = '圆';
    } else if (this.layer[0].type === 'symbol') {
      this.layerType = '图标';
    } else if (this.layer[0].type === 'fill') {
      this.layerType = '面';
    } else if (this.layer[0].type === 'heatmap') {
      this.layerType = '热力图';
    } else if (this.layer[0].type === 'line') {
      this.layerType = '线';
    } */


  }


  ngOnChanges() {
    if (this.type === 'map') {
      this.initFiled();
      this.myTextarea = JSON.stringify(this.layer[0], null, 2);

      switch (this.staType) {
        case 'b8e4c3c0-55ec-4c47-b28f-6b2572bd48cd': // 灯光
        case 'd20fb4db-484b-4408-a59b-dc96812c6d5e': // 柱状
        case 'c40527b1-c55a-4922-9e2d-351897741583': // 饼状
        case '22c8992e-9714-48cd-8795-e377a9117f36':  // 区划
          this.newSta = false;
          // this.initStaData(this.mapStyle.layers[this.mapStyle.layers.length - 1]);
          this.initStaData();
          break;
        default:
          this.newSta = true;
          // 配置文件读取
          this.getInfo();
      }
    }

    this.layer_style_name = this.layer[0].metadata.name;

  }

  // 临时图标事件
  changeIconEvent(event: any) {

    switch (event.key) {
      case 'grade':
        this.gradeSet.setGradeValue(event.value.field, event.value.grade);
        break;
      case 'clusterNum':
        this.map.setLayoutProperty(this.layer[1].id, 'visibility', event.value);
        this.layer[1].layout['visibility'] = event.value;
        this.layer[0].metadata.statistics.clusterNum = event.value;
        break;
      case 'renderOpen':
        this.RenderType = event.value;
        break;
      case 'interpolation':
        this.gradeSet.interpolate(event.value);
        break;
      case 'clusterRadius':
      case 'clusterMaxZoom':
        // this.mapStyle.sources[this.mapStyle.layers[this.mapStyle.layers.length - 1].source][event.key] = event.value;
        this.mapStyle.sources[this.layer[0].source][event.key] = event.value;
        break;
    }
  }

  // 数据改变事件
  changeEvent(event: any) {
    switch (event.key) {
      case 'staLegend':
        this.LegendSet.setLegendValue(event.value.field, event.value.gradeLegend); /* staLegend 为图标符号图方法 */
        break;
      case 'grade':
        this.gradeSet.setGradeValue(event.value.field, event.value.grade);
        break;
      case 'clusterNum':
        // this.map.setLayoutProperty(this.layer[1].id, 'visibility', event.value);
        this.layer[1].layout['visibility'] = event.value;
        this.layer[0].metadata.statistics.clusterNum = event.value;
        break;
      case 'renderOpen':
        this.RenderType = event.value;
        break;
      case 'interpolation':
        this.gradeSet.interpolate(event.value);
        break;
      case 'clusterRadius':
      case 'clusterMaxZoom':
        // this.mapStyle.sources[this.mapStyle.layers[this.mapStyle.layers.length - 1].source][event.key] = event.value;
        this.mapStyle.sources[this.layer[0].source][event.key] = event.value;
        break;
      case 'name':
        this.changeName(event.value.target.value);
        break;
      case 'configLoaded':
        if (this.type === 'sta') {
          for (const v of this.layer) {
            this.map.addLayer(v);
          }

        }
        break;
    }
  }


  /**
   * 获取配置文件
   */
  getInfo() {
    this.httpService.getFile('config/staConfig.json').subscribe(res => {
      if (res) {
        for (const v of (res as any).norm) {
          if (v.id === this.staType) {
            this.modelInfo = v;
            return;
          }
        }
      }
    }, error => {
    });
  }


  // 字段处理
  dealFiled(data?: any) {
    const arr = [];
    const fileds = [];
    switch (this.staType) {
      case  '1b42b204-a0a7-47a9-8ad3-934f03d2ed49': // 热力
        arr.push({
          description: '无',
          column_name: 'noField',
          data_type: 'noField',
          entity_column_id: '01101110011011110100011001101001011011000110010101100100'
        });
        for (const item of this.subsectionFields) {
          if (item.component_data_type_id === 'fm_ui_input_decimal' || item.component_data_type_id === 'fm_ui_input_integer') {
            arr.push(item);
          }
        }
        this.fieldArray = arr;
        break;
      case 'b8e4c3c0-55ec-4c47-b28f-6b2572bd48cd': // 灯光
      case 'd20fb4db-484b-4408-a59b-dc96812c6d5e': // 柱状
      case 'c40527b1-c55a-4922-9e2d-351897741583': // 饼状
      case '70d9e333-a40c-49d0-a88c-fbf156a37766': // 定点符号
      case 'cb1a9c12-e64a-11e8-b3e0-0242ac120002': // 图标符号
      case '7154b538-3257-4c51-b1ec-cbfacafb05e5': // 流向图
      case '6a66b3a7-d49a-44a4-bd5f-374dc9a06c9c': // 等级
      case '22c8992e-9714-48cd-8795-e377a9117f36':  // 区划
        for (const item of this.subsectionFields) {
          if (item.component_data_type_id !== 'fm_ui_point_geo' && item.component_data_type_id !== 'fm_ui_line_geo' &&
            item.component_data_type_id !== 'fm_ui_polygon_geo') { // 数值类型
            arr.push(item);
          }
        }
        if (arr.length > 0) {
          this.fieldArray = arr;
        } else {
          this.updatePermission = false;
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '此数据没有可用于统计的字段(非)!', 2000);
          this.toastService.toast(toastCfg);
        }
        break;
      default:
        this.fieldArray = [];

    }

    // 字段针对处理
    switch (this.staType) {
      case 'd20fb4db-484b-4408-a59b-dc96812c6d5e':
      case 'c40527b1-c55a-4922-9e2d-351897741583':
        for (const v of data) {
          if (v.component_data_type_id === 'fm_ui_input_decimal' || v.component_data_type_id === 'fm_ui_input_integer') {
            // 王博 处理description字段为“” 的情况
            if (v.description === '') {
              v.description = v.column_name;
            }
            // 王博
            fileds.push({
              label: v.description,
              value: {label: v.description, hex: '#7dd1cd', value: v.column_name}
            });
          }
        }
        if (fileds.length > 0) {
          this.subsectionFields = fileds;
        } else {
          this.updatePermission = false;
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '此数据没有可用于统计的字段(数值)!', 2000);
          this.toastService.toast(toastCfg);
        }
        break;
      case 'b8e4c3c0-55ec-4c47-b28f-6b2572bd48cd':
      case '22c8992e-9714-48cd-8795-e377a9117f36':
        for (const v of data) {
          if (v.component_data_type_id === 'fm_ui_input_decimal' || v.component_data_type_id === 'fm_ui_input_integer') {
            // 王博 处理description字段为“” 的情况
            if (v.description === '') {
              v.description = v.column_name;
            }
            // 王博
            fileds.push({label: v.description, value: v.column_name});
          }
        }
        if (fileds.length > 0) {
          this.subsectionFields = fileds;
        } else {
          this.updatePermission = false;
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '此数据没有可用于统计的字段(数值)!', 2000);
          this.toastService.toast(toastCfg);
        }
        break;
    }

  }


  /**
   * 联动处理
   */
  saveSta(tag?: any) {
    if (this.layer.length > 1) {
      this.mapStyle.layers[this.layerIndex] = this.layer[0];
      this.mapStyle.layers[this.layerIndex + 1] = this.layer[1];
      this.mapStyle.layers[this.layerIndex + 2] = this.layer[2];
    } else {
      this.mapStyle.layers[this.layerIndex] = this.layer[0];
    }
    if (!(this.layer[0].isLegendType === 'text')) {
      const errors = validateStyleMin(this.mapStyle, GlSpec);
      if (errors.length > 0) {
        const errs = errors[0].message.indexOf('stop domain values must appear in ascending order');
        const errs1 = errors[0].message.indexOf('array must have at least one stop');
        let toastCfg;
        if (errs === -1 && errs1 === -1) {
          if (this.staType === '22c8992e-9714-48cd-8795-e377a9117f36') {
            toastCfg = new ToastConfig(ToastType.WARNING, '', '区划码要求值是唯一的', 3000);
          } else {
            const infos = errors[0].message.split(':');
            toastCfg = new ToastConfig(ToastType.ERROR, '', infos[1], 5000);
          }
        } else if (errs1 === 38) {
          toastCfg = new ToastConfig(ToastType.WARNING, '', '分段区间请勾选中至少一个属性值', 3000);
        } else {
          toastCfg = new ToastConfig(ToastType.WARNING, '', '渐变间隔类型渲染要求分段值从小到大排列', 3000);
        }
        this.toastService.toast(toastCfg);
        return;
      }
    }
    // 分段区间一个选项都不勾选 添加提示
    if ((this.layer[0].isLegendType) && (this.layer[0].isLegendType === 'text')) {
      let sta_num = 0;
      for (const v of this.layer[0].metadata.statistics.layer_info[2]) {
        if (v === false) {
          sta_num++;
        }
      }
      if (sta_num === this.layer[0].metadata.statistics.layer_info[2].length) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '分段区间请勾选中至少一个属性值', 3000);
        this.toastService.toast(toastCfg);
        return;
      }
    }
    this.myTextarea = JSON.stringify(this.layer[0], null, 2);
    this.map.setStyle(this.mapStyle, {diff: false});
    const body = {
      content: this.staType === '05e20d72-c000-4f59-af97-8adb31bcc522' ? JSON.stringify(this.layer) : JSON.stringify(this.layer[0]),
      layer_style_id: this.layer[0].metadata.layer_style_id
    };

    this.httpService.getData(body,
      true, 'execute', '4d8c1d57-60ef-495e-8bf5-d92ec16bc983', 'map')
      .subscribe(
        data => {
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '统计图生成成功！', 2000);
          this.toastService.toast(toastCfg);
        },
        error => {
        }
      );

  }


  /**
   * 统计字段初始化
   */
  initFiled() {
    this.httpService.getData({'entity_id': this.layer[0].metadata.entity_id},
      true, 'execute', '60967dd1-4ed3-49bd-abe7-fd4f272f305a', 'map')
      .subscribe(
        data => {
          this.subsectionFields = (data as any).data;
          this.dealFiled((this.subsectionFields));
        },
        error => {
        }
      );
  }


  /**------------------------------------------老统计图------------------------------------------------**/

  /**
   * 统计图数据初始化
   */
  initStaData() {
    // this.layer = [style];
    // 统计数据处理
    switch (this.staType) {
      // 灯光图
      case 'b8e4c3c0-55ec-4c47-b28f-6b2572bd48cd':
        this.subsectionMethods = ['等个数分段', '等间距分段', '自定义分段'];
        this.subsectionMethod = '等个数分段';
        this.subsectionGrades = [1, 2, 3, 4, 5];

        if (this.layer[0].paint['circle-color'].stops) {
          this.subsectionColors = this.layer[0].paint['circle-color'].stops;
          this.subsectionGrade = this.layer[0].paint['circle-color'].stops.length;
          this.subsectionType = this.layer[0].paint['circle-color'].type;
        } else {
          this.changeGrad(3);
          this.subsectionGrade = 3;
          this.subsectionType = 'categorical';
        }

        if (this.layer[0].paint['circle-color'].property !== '') {
          this.subsectionField = this.layer[0].paint['circle-color'].property;
        }

        break;

      // 行政
      case '22c8992e-9714-48cd-8795-e377a9117f36':
        this.subsectionMethods = ['等个数分段', '等间距分段', '自定义分段'];
        this.subsectionMethod = '等个数分段';
        // this.subsectionGrades = [5, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

        if (this.layer[0].paint['fill-color'].stops) {
          const stops = [];
          for (let i = 0; i < this.layer[0].paint['fill-color'].stops.length; i++) {
            stops.push({
              key: i,
              value: this.layer[0].paint['fill-color'].stops[i],
              name: this.layer[0].metadata['areaName'][i]
            });
            // [i].value = this.layer[0].paint['fill-color'].stops[i];
          }

          this.subsectionColors = stops;
          this.subsectionType = this.layer[0].paint['fill-color'].type;
          this.opacity = this.layer[0].paint['fill-opacity'] * 100;
        } else {
          this.subsectionColors = this.changeGrad4();
          this.opacity = 100;
          this.subsectionType = 'exponential';
        }

        if (this.layer[0].paint['fill-color'].property !== '') {
          this.subsectionField = this.layer[0].paint['fill-color'].property;
        }

        break;

      // 柱状图
      case 'd20fb4db-484b-4408-a59b-dc96812c6d5e':
        this.subsectionMethods = ['等个数分段', '等间距分段', '自定义分段'];
        this.subsectionMethod = '等个数分段';
        // this.subsectionGrades = [2, 3, 4, 5, 6, 7, 8];


        if (this.layer[0].paint['bar-opacity']) {
          this.opacity = this.layer[0].paint['bar-opacity'] * 100;
        } else {
          this.opacity = 100;
        }

        if (this.layer[0].layout['bar-x-labels'] && this.layer[0].layout['bar-colors']) {
          const item = [];
          for (let i = 0; i < this.layer[0].layout['bar-colors'].length; i++) {
            item.push(
              {
                label: this.layer[0].layout['bar-x-labels'][i],
                hex: this.layer[0].layout['bar-colors'][i],
                value: this.layer[0].layout['bar-data'][i],
              }
            );
          }

          // this.subsectionColors = item;
          this.selectOption = item;
          this.staTitle = this.layer[0].layout['bar-title'];
          this.subsectionGrade = this.layer[0].layout['bar-colors'].length;
          this.barGapWidth = this.layer[0].layout['bar-gap-width'];
          this.barItemWidth = this.layer[0].layout['bar-item-width'];
          this.barMaxHeight = this.layer[0].layout['bar-item-max-height'];
          this.sumMaxValue = this.layer[0].layout['bar-data-max-value'];
          // this.subsectionField = this.layer[0].layout['bar-data'].property;
        } else {
          this.changeGrad3(4);
          this.subsectionGrade = 4;
          this.barGapWidth = 3;
          this.barItemWidth = 6;
          this.barMaxHeight = 100;
        }


        break;
      // 饼状图
      case 'c40527b1-c55a-4922-9e2d-351897741583':
        // this.changeGrad3(4);
        this.subsectionMethods = ['等个数分段', '等间距分段', '自定义分段'];
        this.subsectionMethod = '等个数分段';
        // this.subsectionGrades = [2, 3, 4, 5, 6, 7, 8];
        // this.subsectionGrade = 4;
        // this.opacity = 100;


        if (this.layer[0].paint['pie-opacity']) {
          this.opacity = this.layer[0].paint['pie-opacity'] * 100;
        } else {
          this.opacity = 100;
        }

        if (this.layer[0].layout['pie-labels'] && this.layer[0].layout['pie-colors']) {
          const item = [];
          for (let i = 0; i < this.layer[0].layout['pie-colors'].length; i++) {
            item.push(
              {
                label: this.layer[0].layout['pie-labels'][i],
                hex: this.layer[0].layout['pie-colors'][i],
                value: this.layer[0].layout['pie-data'][i]
              }
            );
          }

          this.selectOption = item;
          this.staTitle = this.layer[0].layout['pie-title'];
          this.subsectionGrade = this.layer[0].layout['pie-colors'].length;
          this.pieMaxRadius = this.layer[0].layout['pie-max-radius'];
          this.sumMaxValue = this.layer[0].layout['pie-data-sum-max-value'];
          // this.subsectionField = this.layer[0].layout['pie-data'].property;
        } else {
          this.changeGrad3(4);
          this.subsectionGrade = 4;
          this.pieMaxRadius = 50;
        }

        break;
    }


    this.map.addLayer(this.layer[0]);

  }


  /**
   * 统计图默认色值
   * @param e
   */
  changeGrad(e: any) {
    switch (e) {
      case 1:
        this.subsectionColors = [[null, '#248DF9']];
        break;
      case 2:
        this.subsectionColors = [[null, '#248DF9'], [null, '#0EF3F3']];
        break;
      case 3:
        this.subsectionColors = [[null, '#248DF9'], [null, '#0EF3F3'], [null, '#FFFFFF']];
        break;
      case 4:
        this.subsectionColors = [[null, '#248DF9'], [null, '#0EF3F3'], [null, '#FFFFFF'], [null, '#FF8D3C']];
        break;
      case 5:
        this.subsectionColors = [[null, '#248DF9'], [null, '#0EF3F3'], [null, '#FFFFFF'], [null, '#FF8D3C'],
          [null, '#C579F5']];
        break;
      case 6:
        this.subsectionColors = [[null, '#248DF9'], [null, '#0EF3F3'], [null, '#FFFFFF'], [null, '#FF8D3C'],
          [null, '#C579F5'], [null, '#3DD10A']];
        break;
      case 7:
        this.subsectionColors = [[null, '#248DF9'], [null, '#0EF3F3'], [null, '#FFFFFF'], [null, '#FF8D3C'],
          [null, '#C579F5'], [null, '#3DD10A'], [null, '#FF5644']];
        break;
      case 8:
        this.subsectionColors = [[null, '#248DF9'], [null, '#0EF3F3'], [null, '#FFFFFF'], [null, '#FF8D3C'],
          [null, '#C579F5'], [null, '#3DD10A'], [null, '#FF5644'], [null, '#FFDF49']];
        break;
    }
  }

  // 柱状图 饼状图
  changeGrad3(e: any) {
    const item = [];
    for (let i = 0; i < e; i++) {
      item.push(
        {
          label: '标签' + i,
          hex: '#258CF9'
        }
      );
    }

    this.subsectionColors = item;
  }

  // 行政区域设色
  changeGrad4() {
    const stops = [
      {key: 0, value: [1, '#248DF9'], name: ''}
    ];

    return stops;
  }


  /**
   * 添加行政区域
   */
  addArea() {
    const key = this.subsectionColors.length;
    // this.subsectionColors.push({key: key, value: [1, '#248DF9'], name: ''});
    // wb 给行政区域设色 区划块添加的比上次多1
    const value = key === 0 ? 1 : this.subsectionColors[key - 1].value[0] + 1;
    this.subsectionColors.push({key: key, value: [value, '#248DF9'], name: ''});
  }

  /**
   * 删除行政区划
   */
  deleteArea(key: any) {
    for (let i = 0; i < this.subsectionColors.length; i++) {
      if (this.subsectionColors[i].key === key) {
        this.subsectionColors.splice(i, 1);
        return;
      }
    }
  }

  /**
   * 检查数据是否为null1
   */
  checkDisables(data: any) {
    try {
      for (const i of data) {
        if (i[0] === '' || i[0] === null || i[0] === undefined) {
          return false;
        }
      }
    } catch (e) {
      return false;
    }


    return true;
  }

  /**
   * 生成统计图
   * 1.请求网络,保存统计图样式
   * 2.页面更新
   */
  updateSta(e: any) {
    let style = {};

    switch (e) {
      case 'light':
        if (this.subsectionField === '' || this.subsectionField === undefined) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择统计字段！', 2000);
          this.toastService.toast(toastCfg);
        } else {

          style = {
            property: this.subsectionField,
            type: this.subsectionType,
            stops: this.subsectionColors
          };

          const disabled = this.checkDisables(this.subsectionColors);
          if (disabled) {
            this._updateStyle('light', style, '', '');
          } else {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '属性值不能为空!', 2000);
            this.toastService.toast(toastCfg);
          }


        }
        break;
      case 'regionalism':
        if (this.subsectionField === '' || this.subsectionField === undefined) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择统计字段！', 2000);
          this.toastService.toast(toastCfg);
        } else {
          const colors = [];
          const areaName = [];
          for (const v of this.subsectionColors) {
            colors.push(v.value);
            areaName.push(v.name);
          }
          style = {
            property: this.subsectionField,
            type: this.subsectionType,
            stops: colors
          };


          const disabled = this.checkDisables(colors);
          if (disabled) {
            this._updateStyle('regionalism', style, areaName, '');
          } else {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '属性值不能为空!', 2000);
            this.toastService.toast(toastCfg);
          }

        }
        break;
      case 'bar':
        if (this.selectOption.length === 0) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择统计字段！', 2000);
          this.toastService.toast(toastCfg);
        } else {
          const labels = [];
          const colors = [];
          const data = [];
          for (const v of this.selectOption) {
            labels.push((v as any).label);
            colors.push((v as any).hex);
            data.push((v as any).value);
          }


          this._updateStyle('bar', labels, colors, data);
        }
        break;
      case 'pie':
        if (this.selectOption.length === 0) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择统计字段！', 2000);
          this.toastService.toast(toastCfg);
        } else {
          const labels = [];
          const colors = [];
          const data = [];
          for (const v of this.selectOption) {
            labels.push((v as any).label);
            colors.push((v as any).hex);
            data.push((v as any).value);
          }


          this._updateStyle('pie', labels, colors, data);
        }
        break;
    }

  }

  /**
   * 拼接设置样式
   * @param tag
   * @param v1
   * @param v2
   * @private
   */
  _updateStyle(tag: any, v1: any, v2: any, v3: any) {
    // 界面更新
    switch (tag) {
      case 'light':
        this.layer[0].paint['circle-color'] = v1;

        // 保存到服务器
        // this.saveSta2(this.layer[0]);
        break;
      case 'regionalism':
        this.layer[0].paint['fill-color'] = v1;
        this.layer[0].paint['fill-opacity'] = this.opacity / 100;
        this.layer[0].metadata['areaName'] = v2;


        // 保存到服务器
        // this.saveSta2(this.layer[0]);
        break;
      case 'bar':
        this.layer[0]['paint'] = {};
        this.layer[0]['layout'] = {};
        this.layer[0].paint['bar-opacity'] = this.opacity / 100;

        //
        this.layer[0].layout['bar-data'] = v3;
        this.layer[0].layout['bar-title'] = this.staTitle;
        this.layer[0].layout['bar-x-labels'] = v1;
        this.layer[0].layout['bar-colors'] = v2;
        this.layer[0].layout['bar-item-width'] = this.barItemWidth;
        this.layer[0].layout['bar-gap-width'] = this.barGapWidth;
        this.layer[0].layout['bar-data-max-value'] = this.sumMaxValue;
        this.layer[0].layout['bar-item-max-height'] = this.barMaxHeight;


        // 保存到服务器
        // this.saveSta2(this.layer[0]);
        break;
      case 'pie':
        this.layer[0]['paint'] = {};
        this.layer[0]['layout'] = {};
        this.layer[0].paint['pie-opacity'] = this.opacity / 100;

        this.layer[0].layout['pie-data'] = v3;
        this.layer[0].layout['pie-title'] = this.staTitle;
        this.layer[0].layout['pie-labels'] = v1;
        this.layer[0].layout['pie-colors'] = v2;
        this.layer[0].layout['pie-data-sum-max-value'] = this.sumMaxValue;
        this.layer[0].layout['pie-max-radius'] = this.pieMaxRadius;

        // 保存到服务器
        // this.saveSta(this.layer[0]);
        break;
    }

    // 存储服务器
    this.saveSta();
  }

  /**------------------------------------------老统计图------------------------------------------------**/

  /*
* 修改数据名称
* */
  changeName(e: any) {
    if (SMXNAME.REG.test(e)) {
      this.httpService.getData({
        name: e,
        layer_style_id: this.layer[0].metadata.layer_style_id
      }, true, 'execute', '99fc460d-7ca8-4efb-8f1d-96e6d9ca79c6', 'map')

        .subscribe(
          data => {
            this.appService.layerNameEventEmitter.emit({tag: 'layer_style', value: e});
            this.layer[0].metadata.name = e;
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '样式名称修改成功！', 2000);
            this.toastService.toast(toastCfg);
          },
          error => {
          }
        );
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
      this.toastService.toast(toastCfg);
    }


  }

}
