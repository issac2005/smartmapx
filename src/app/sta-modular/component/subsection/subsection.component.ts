import {Component, OnInit, Output, Input, OnDestroy, EventEmitter, OnChanges} from '@angular/core';
import {AppService} from '../../../s-service/app.service';
import {HttpService} from '../../../s-service/http.service';
import {isUINumber} from '../../../s-service/utils';

@Component({
  selector: 'sta-subsection',
  templateUrl: './subsection.component.html',
  styleUrls: ['./subsection.component.scss']
})
export class SubsectionComponent implements OnInit, OnDestroy, OnChanges {
  @Output() changeEvent = new EventEmitter();
  @Input() config: any;
  @Input() modelInfo: any; // 总配置文件
  @Input() style: any;


  totalProperty: any; // 数据量

  // 字段
  @Input() fieldArray: any;  // 字段
  fieldType: any; // 字段类型


  // 升级
  gradeLegend: any; // 分级图例数组
  grades: any; // 级数分组
  fieldDataGrade: any; // 字段分组
  subsectionColors = [
    {
      id: 1,
      label: './assets/source-img/colorLine/rainbow.jpg',
      value: ['#0000ff', '#0085f0', '#06fcfc', '#4dea21', '#00ff00', '#dbf70f', '#fff000', '#fe9700', '#ef4b0a', '#ff0000']
    },
    {
      id: 2,
      label: './assets/source-img/colorLine/green.jpg',
      value: ['#e3f2b8', '#cce2a4', '#b5d18f', '#9dc17b', '#86b066', '#6fa052', '#588f3d', '#407f29', '#296e14', '#125e00']
    },
    {
      id: 3,
      label: './assets/source-img/colorLine/purple.jpg',
      value: ['#fffdcd', '#eae3c4', '#d6cabc', '#c1b0b3', '#ad96ab', '#987da2', '#84639a', '#6f4991', '#5b3089', '#461680']
    },
    {
      id: 4,
      label: './assets/source-img/colorLine/blue.jpg',
      value: ['#f6fbf2', '#daf1d7', '#c8ecc2', '#afdbb1', '#7fc9c8', '#50b1d6', '#2490bd', '#08599e', '#0a5389', '#094a72']
    },
    {
      id: 5,
      label: './assets/source-img/colorLine/red.jpg',
      value: ['#fffdcd', '#ffec99', '#f9db7e', '#ffb440', '#ff883d', '#f25527', '#f41116', '#aa0324', '#8e0425', '#7f0528']
    },
    {
      id: 6,
      label: './assets/source-img/colorLine/temple.jpg',
      value: ['#d93e32', '#e0644e', '#e78a6b', '#efb087', '#fdfcc0', '#d8e1bf', '#b4c6bd', '#8faabc', '#6b8fba', '#4674b9']
    }
  ]; // 配色方案分组


  // 配色方案
  colorLineStatus = false;


  grade: any;  // 选定级数
  colorLine: any; // 色带
  field: any; // 选中字段值

  mouseEvent: any;

  constructor(public appService: AppService, public httpService: HttpService) {
    this.mouseEvent = this.appService.mouseEventEmitter.subscribe((value: any[]) => {
      this.colorLineStatus = false;
    });
  }

  ngOnInit() {
  }


  ngOnChanges() {
    this.initGrades(this.config.stop); // 初始化默认区间

    // 分段级数回显
    if (this.style.metadata.statistics && this.style.metadata.statistics.grade) {
      this.grade = this.style.metadata.statistics.grade;
    } else {
      this.grade = this.config.default;
    }


    // 色带回显
    if (this.style.metadata.statistics && this.style.metadata.statistics.colorLineNum) {
      for (const v of this.subsectionColors) {
        if (v.id === this.style.metadata.statistics.colorLineNum) {
          this.colorLine = v;
          break;
        }
      }
    } else {
      this.colorLine = this.subsectionColors[0];
    }


    // 字段值回显
    if (this.config.componentType === 1) {  // 需要统计字段
      if (this.fieldArray.length > 0) {
        if (this.style.metadata.statistics &&
          this.style.metadata.statistics.field && this.style.metadata.statistics.fieldDataGrade) {  // 非第一次进入

          // 热力图没有字段回显
          if (this.style.metadata.statistics.field === '01101110011011110100011001101001011011000110010101100100') {
            this.fieldDataGrade = this.style.metadata.statistics.fieldDataGrade;
            this.field = this.fieldArray[0];
            this.fieldType = 'hot-map';


          } else { // 正常字段流程
            for (const v of this.fieldArray) {
              if (v.entity_column_id === this.style.metadata.statistics.field) {
                this.field = v;
                // if (v.data_type === 'postgres_integer' || v.data_type === 'postgres_numeric' ||
                //   v.data_type === 'postgres_bigint' || v.data_type === 'postgres_smallint' ||
                //   v.data_type === 'postgres_double_precision') { // 数值类型
                // if (v.component_data_type_id === 'fm_ui_input_decimal' || v.component_data_type_id === 'fm_ui_input_integer') {
                if (isUINumber(v.component_data_type_id)) {
                  this.fieldType = 'number';
                  this.changeEvent.emit({key: 'renderOpen', value: true});
                } else {

                  this.fieldType = 'text';
                  this.changeEvent.emit({key: 'renderOpen', value: false});
                }

                this.fieldDataGrade = this.style.metadata.statistics.fieldDataGrade;

                if (this.fieldDataGrade.length < 10) {
                  this.initGrades(this.fieldDataGrade.length);
                }
                break;
              }
            }
          }

          this.changeEvent.emit({key: 'configLoaded', value: true});
        } else {
          this.checkedField(this.fieldArray[0]); // 第一次进入默认触发
        }
      }

    } else if (this.config.componentType === 2) { // 不需要统计字段 聚合

      // 查询数据信息
      this.httpService.getData({service_event_id: this.style.metadata.service_event_id},
        true, 'execute', '1b872d20-df80-4f9c-9ffb-101ca9b1a0b3', '1')
        .subscribe(
          data => {
            this.totalProperty = (data as any).data.totalProperty;
            const count = this.totalProperty / 10;
            const err = [];
            for (let i = 1; i <= 10; i++) {
              err.push(Math.ceil(count * i));
            }
            this.fieldDataGrade = err;
            this.field = {column_name: 'point_count'};
            this.fieldType = 'number';


            if (!this.style.metadata.statistics || this.style.metadata.statistics.colorLineNum) { // 聚合图首次进入
              this.style.metadata.statistics = {colorLineNum: this.colorLine.id};
              // 处理分段
              this.dealStopValue();
            }

            this.changeEvent.emit({key: 'configLoaded', value: true});

          },
          error => {
          }
        );


    }
  }

  ngOnDestroy() {
    this.mouseEvent.unsubscribe();
  }


  // 字段选择
  checkedField(item: any) {


    // 热力图
    if (this.modelInfo.id === '1b42b204-a0a7-47a9-8ad3-934f03d2ed49' &&
      item.entity_column_id === '01101110011011110100011001101001011011000110010101100100') { // 热力图不需要字段

      // 查询数据信息
      this.httpService.getData({service_event_id: this.style.metadata.service_event_id},
        true, 'execute', '1b872d20-df80-4f9c-9ffb-101ca9b1a0b3', '1')
        .subscribe(
          data => {
            this.field = item;
            this.fieldType = 'hot-map';
            this.totalProperty = (data as any).data.totalProperty;
            const count = this.totalProperty / 10;
            const err = [];
            for (let i = 1; i <= 10; i++) {
              err.push(Math.ceil(count * i));
            }

            this.fieldDataGrade = err;
            this.initGrades(this.config.stop);
            if (this.style.metadata.statistics) {
              this.style.metadata.statistics.field = item.entity_column_id;
              this.style.metadata.statistics.fieldDataGrade = err;
            } else {
              this.style.metadata.statistics = {
                field: item.entity_column_id,
                fieldDataGrade: err
              };
            }

            this.dealStopValue();
            this.changeEvent.emit({key: 'configLoaded', value: true});

          },
          error => {
          }
        );


      // this.dealStopValue();
    } else { // 其他非热力图
      this.field = item;
      // if (item.data_type === 'postgres_integer' || item.data_type === 'postgres_numeric' ||
      //   item.data_type === 'postgres_bigint' || item.data_type === 'postgres_smallint' ||
      //   item.data_type === 'postgres_double_precision') { // 数值类型
      // if (item.component_data_type_id === 'fm_ui_input_decimal' || item.component_data_type_id === 'fm_ui_input_integer') {
      if (isUINumber(item.component_data_type_id)) {
        this.changeEvent.emit({key: 'renderOpen', value: true});

        // 查询数据信息
        this.httpService.getData({
            'entity_column_id': item.entity_column_id,
            service_event_id: this.style.metadata.service_event_id
          },
          true, 'etl', 'getMaxMinValue', '1')
          .subscribe(
            data => {
              this.fieldType = 'number';
              const value = ((data as any).data.maxvalue - (data as any).data.minvalue) / 10;
              const arr = [];
              for (let i = 1; i <= 10; i++) {
                // arr.push((data as any).data.minvalue + Math.ceil(value * i));
                arr.push((data as any).data.minvalue + (value * i));
              }

              this.fieldDataGrade = arr;
              this.initGrades(this.config.stop);

              // 赋回显值
              if (this.style.metadata.statistics) {
                this.style.metadata.statistics.field = item.entity_column_id;
                this.style.metadata.statistics.fieldDataGrade = arr;
              } else {
                this.style.metadata.statistics = {
                  field: item.entity_column_id,
                  fieldDataGrade: arr
                };
              }

              this.dealStopValue();

              this.changeEvent.emit({key: 'configLoaded', value: true});
            },
            error => {
            }
          );
      } else {
        this.changeEvent.emit({key: 'renderOpen', value: false});

        // 查询数据信息
        this.httpService.getData({
            'entity_column_id': item.entity_column_id,
            service_event_id: this.style.metadata.service_event_id
          },
          true, 'etl', 'getCountValue', '1')
          .subscribe(
            data => {
              this.fieldType = 'text';
              const arr = [];
              for (const v of (data as any).data) {
                arr.push(v[item.column_name]);
              }


              this.fieldDataGrade = arr;


              // 等级
              if (arr.length < 10) { // 字段可选值低于默认级数
                this.initGrades(arr.length);
                if (arr.length < this.grade) { // 当前等级低于可选
                  this.grade = arr.length;

                  // 赋回显值
                  if (this.style.metadata.statistics) {
                    this.style.metadata.statistics.grade = arr.length;
                  } else {
                    this.style.metadata.statistics = {grade: arr.length};
                  }

                }
              } else {
                this.initGrades(this.config.stop);
              }


              // 赋回显值
              if (this.style.metadata.statistics) {
                this.style.metadata.statistics.field = item.entity_column_id;
                this.style.metadata.statistics.fieldDataGrade = arr;
              } else {
                this.style.metadata.statistics = {
                  field: item.entity_column_id,
                  fieldDataGrade: arr
                };
              }

              // 处理分段

              this.dealStopValue();
              this.changeEvent.emit({key: 'configLoaded', value: true});

            },
            error => {
            }
          );
      }
    }


  }


  // 等级选择
  checkedGrade(item: any) {
    this.grade = item;

    // 赋回显值
    if (this.style.metadata.statistics) {
      this.style.metadata.statistics.grade = item;
    } else {
      this.style.metadata.statistics = {grade: item};
    }

    // 处理分段
    this.dealStopValue();
  }


  // 色带选择
  checkedColor(v: any) {
    this.colorLineStatus = !this.colorLineStatus;
    this.colorLine = v;

    // 赋回显值
    if (this.style.metadata.statistics) {
      this.style.metadata.statistics.colorLineNum = v.id;
    } else {
      this.style.metadata.statistics = {colorLineNum: v.id};
    }


    // 处理分段
    this.dealStopValue();
  }


  /**
   * 处理分段
   */
  dealStopValue() {
    // 颜色处理
    const colors = this.dealColors();
    const fields = this.dealGrades();

    const arr = ([] as any);
    for (let i = 0; i < this.grade; i++) {
      arr.push([fields[i], colors[i]]);
    }
    // 增加图例ID数组
    const LegendArr = ([] as any);
    for (let i = 0; i < this.grade; i++) {
      LegendArr.push([fields[i], 'G20101']);
    }

    // 渲染类型
    let renderType = 'exponential';
    if (this.style.metadata.statistics && this.style.metadata.statistics.RenderType) {
      renderType = this.style.metadata.statistics.RenderType;
    }
    // 图标符号图默认渲染类型
    let legendType = 'categorical';
    if (this.style.metadata.statistics && this.style.metadata.statistics.legendType) {
      legendType = this.style.metadata.statistics.legendType;
    }
    const stop = {
      field: {field: this.field.column_name, type: this.fieldType, renderType: renderType, legendType: legendType},
      grade: arr,
      gradeLegend: LegendArr
    };
    this.changeEvent.emit({key: this.config.attribute, value: stop});
  }


  // 颜色分段
  dealColors() {
    const num = 10 / this.grade;
    const colors = [];
    for (let i = 1; i <= this.grade; i++) {
      const tab = Math.ceil(num * i) - 1;
      colors.push(this.colorLine.value[tab]);
    }

    return colors;
  }


  // 字段分段
  dealGrades() {
    const num = this.grades.length / this.grade;
    const fields = [];
    for (let i = 1; i <= this.grade; i++) {
      const tab = Math.ceil(num * i) - 1;
      if (this.fieldDataGrade[tab]) {
        fields.push(this.fieldDataGrade[tab]);

      } else {
        const value = this.fieldType === 'text' ? '' : 0;
        fields.push(value);
      }
    }

    return fields;
  }


  // 默认区间
  initGrades(num: any) {
    const obj = [];
    for (let i = this.config.start; i <= num; i++) {
      obj.push(i);
    }
    this.grades = obj;
  }


  /**
   * 打开色带
   * @param e
   */
  openLegend(e: any) {
    e.stopPropagation(); // 阻止冒泡
    this.colorLineStatus = !this.colorLineStatus;
  }
}
