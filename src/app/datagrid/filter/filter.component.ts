import {Component, OnInit, Input, OnChanges, EventEmitter, Output} from '@angular/core';
import {isUINumber} from '../../s-service/utils';
import {HttpService} from '../../s-service/http.service';
import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {toLog} from '../../smx-component/smx-util';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {AppModalComponent} from '../../modal/app-modal.component';
import {LocalStorage} from '../../s-service/local.storage';

@Component({
  selector: 'c-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnChanges {
  @Input() filterArray: any[] = [];
  @Input() conjunction: any;
  @Input() filterData: any; // select1的下拉选项
  @Input() filterWay: any; // 'left'、'right'删除以及改变事件的不同处理方式
  @Input() style: any; // 样式
  @Input() disabled = false; // 样式

  selectOneNow: any;
  selectTwoNow: any;
  selectTwoGroup: any[];
  selectTwoGroup1 = [
    {
      name: '等于',
      operator: '=',
      data_type_rule_id: '4f1392a2-491f-42b3-81ff-73f3f98e555b'
    }, {
      name: '包含',
      operator: 'like',
      data_type_rule_id: '22c85efb-357e-4336-a31a-cc28921c26de'
    }, {
      name: '以开头',
      operator: 'start',
      data_type_rule_id: '138dff59-787a-4ca5-a3e2-cbfdeebabd0d'
    }, {
      name: '以结尾',
      operator: 'end',
      data_type_rule_id: 'f702c1c8-9c4f-498c-8079-9e902a4ad340'
    }, {
      name: '正则匹配',
      operator: 'rex',
      data_type_rule_id: '5b0c8b8e-c8b3-4285-97a4-ed7ae83c92e6'
    }, {
      name: '小于',
      operator: 'rex',
      data_type_rule_id: '7a70bbfb-adc8-4478-a843-b8fca82cbd2e'
    }, {
      name: '大于',
      operator: 'rex',
      data_type_rule_id: '98d5c4e3-bf58-48d8-9421-5543244da610'
    }
    // , {
    //   name: '值替换',
    //   operator: 'rex',
    //   data_type_rule_id: 'ef27a63c-5113-4e39-aa38-16918324235a'
    // }
  ];
  selectTwoGroup2 = [
    {
      name: '等于',
      operator: '=',
      data_type_rule_id: '4f1392a2-491f-42b3-81ff-73f3f98e555b'
    }, {
      name: '小于',
      operator: 'rex',
      data_type_rule_id: '7a70bbfb-adc8-4478-a843-b8fca82cbd2e'
    }, {
      name: '大于',
      operator: 'rex',
      data_type_rule_id: '98d5c4e3-bf58-48d8-9421-5543244da610'
    },
    // {
    //   name: '值替换',
    //   operator: 'rex',
    //   data_type_rule_id: 'ef27a63c-5113-4e39-aa38-16918324235a'
    // }
  ];
  pageConfig: any;


  // 参数


  constructor(private httpService: HttpService,
              private ngbModalService: SmxModal,
              public toastService: ToastService,
              private ls: LocalStorage) {
  }

  /*
   * 初始化
   */
  ngOnInit() {
    /*setTimeout(() => {
      for (let i = 0; i < this.filterArray.length; i ++) {
        if (this.filterArray[i].data_type === 'postgres_integer' || this.filterArray[i].data_type === 'postgres_numeric' ||
          this.filterArray[i].data_type === 'postgres_bigint' || this.filterArray[i].data_type === 'postgres_smallint' ||
          this.filterArray[i].data_type === 'postgres_double_precision') {
          this.filterArray[i].selectTwoGroup = this.selectTwoGroup2;
        } else {
          this.filterArray[i].selectTwoGroup = this.selectTwoGroup1;
        }
      }
    }, 500)*/
    this.selectTwoGroup = this.selectTwoGroup1;
    // const info = localStorage.getItem('data_info') || '';
    // this.pageConfig = JSON.parse(info);

    this.pageConfig = this.ls.getObject('data_info');
    this.selectTwoNow = this.selectTwoGroup[0].data_type_rule_id;
  }

  ngOnChanges() {
    if (this.filterArray && this.filterArray.length > 0) {
      for (const i of this.filterArray) {
        for (const j of this.filterData) {
          if (j.entity_column_id === i.entity_column_id) {
            // if (j.component_data_type_id === 'fm_ui_input_integer' ||
            //   j.component_data_type_id === 'fm_ui_input_integer2' ||
            //   j.component_data_type_id === 'fm_ui_input_integer8' ||
            //   j.component_data_type_id === 'fm_ui_input_numeric' ||
            //   j.component_data_type_id === 'fm_ui_input_decimal' ||
            //   j.component_data_type_id === 'fm_ui_input_decimal8' ||
            //   j.component_data_type_id === 'fm_ui_input_decimal') {
            if (isUINumber(j.component_data_type_id)) {
              i.selectTwoGroup = this.selectTwoGroup2;
            } else {
              i.selectTwoGroup = this.selectTwoGroup1;
            }
          }
        }
      }
      // for (let i = 0; i < this.filterArray.length; i++) {
      //   // if (this.filterArray[i].data_type === 'postgres_integer' || this.filterArray[i].data_type === 'postgres_numeric' ||
      //   //   this.filterArray[i].data_type === 'postgres_bigint' || this.filterArray[i].data_type === 'postgres_smallint' ||
      //   //   this.filterArray[i].data_type === 'postgres_double_precision') {
      //   // Todo
      //   if (this.filterArray[i].component_data_type_id === 'fm_ui_input_integer' || this.filterArray[i].component_data_type_id === 'fm_ui_input_decimal') {
      //     this.filterArray[i].selectTwoGroup = this.selectTwoGroup2;
      //   } else {
      //     this.filterArray[i].selectTwoGroup = this.selectTwoGroup1;
      //   }
      // }
    }
  }

  /*
  * 删除过滤条件
  * */
  remove(index: any) {
    if (this.filterWay === 'left') {
      const ngbModal = this.ngbModalService.open(AppModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-app'});
      ngbModal.componentInstance.config = {
        title: '删除过滤条件',
        view: '过滤条件删除后不可恢复，确认删除?'
      };

      ngbModal.result.then(
        (result) => {
          this.removeFilter(index);
        },
        (reason) => {
          toLog(reason);
        });
    } else {
      this.filterArray.splice(index, 1);
    }
  }

  /*
  * 新增过滤条件
  * */
  addFilter() {
    if (this.filterArray.length >= 20) {
      const toast = new ToastConfig(ToastType.WARNING, '', '最多添加20个查询条件', 2000);
      this.toastService.toast(toast);
      return;
    }


    if (this.filterData.length > 0) {
      // todo jkf判断数据类型加载不同匹配类型
      // if (this.filterData[0].data_type === 'postgres_integer' || this.filterData[0].data_type === 'postgres_numeric' ||
      //   this.filterData[0].data_type === 'postgres_bigint' || this.filterData[0].data_type === 'postgres_smallint' ||
      //   this.filterData[0].data_type === 'postgres_double_precision') {
      // if (this.filterData[0].component_data_type_id === 'fm_ui_input_integer' ||
      //   this.filterData[0].component_data_type_id === 'fm_ui_input_integer2' ||
      //   this.filterData[0].component_data_type_id === 'fm_ui_input_integer8' ||
      //   this.filterData[0].component_data_type_id === 'fm_ui_input_numeric' ||
      //   this.filterData[0].component_data_type_id === 'fm_ui_input_decimal' ||
      //   this.filterData[0].component_data_type_id === 'fm_ui_input_decimal8' ||
      //   this.filterData[0].component_data_type_id === 'fm_ui_input_decimal') {
      if (isUINumber(this.filterData[0].component_data_type_id)) {
        // this.selectTwoGroup = this.selectTwoGroup2;
        if (this.filterWay === 'left') {
          this.filterArray.push({
            entity_column_id: this.filterData[0].entity_column_id,
            data_type_rule_id: this.selectTwoGroup[0].data_type_rule_id,
            value: '',
            // data_type: this.filterData[0].data_type,
            component_data_type_id: this.filterData[0].component_data_type_id,
            selectTwoGroup: this.selectTwoGroup2
          });
        } else {
          this.filterArray.push({
            service_event_config_id: this.filterData[0].service_event_config_id,
            rule: this.selectTwoGroup[0].data_type_rule_id,
            value: '',
            // data_type: this.filterData[0].data_type,
            component_data_type_id: this.filterData[0].component_data_type_id,
            selectTwoGroup: this.selectTwoGroup2
          });
        }
      } else {
        // this.selectTwoGroup = this.selectTwoGroup1;
        if (this.filterWay === 'left') {
          this.filterArray.push({
            entity_column_id: this.filterData[0].entity_column_id,
            data_type_rule_id: this.selectTwoGroup[0].data_type_rule_id,
            value: '',
            // data_type: this.filterData[0].data_type,
            component_data_type_id: this.filterData[0].component_data_type_id,
            selectTwoGroup: this.selectTwoGroup1
          });
        } else {
          this.filterArray.push({
            service_event_config_id: this.filterData[0].service_event_config_id,
            rule: this.selectTwoGroup[0].data_type_rule_id,
            value: '',
            // data_type: this.filterData[0].data_type,
            component_data_type_id: this.filterData[0].component_data_type_id,
            selectTwoGroup: this.selectTwoGroup1
          });
        }
      }
    }
  }


  /**
   * 修改事件
   * @param e
   * @param v
   * @param index
   */
  changeFilter(e: any, v: any, index: any, tag?: any) {
    // 数据源过滤
    if (this.filterWay === 'left') {
      if (tag === 1) { // 字段更换
        for (const item of this.filterData) {
          if (e === item.entity_column_id) {
            // todo
            // v.data_type = item.data_type;
            v.component_data_type_id = item.component_data_type_id;
          }
        }
      }
      // todo
      // if (v.data_type === 'postgres_integer' || v.data_type === 'postgres_numeric' ||
      //   v.data_type === 'postgres_bigint' || v.data_type === 'postgres_smallint' ||
      //   v.data_type === 'postgres_double_precision') {
      /**
       * 添加了关于数值类型的component_data_layer_id
       * update_user: runasong
       * */
      // if (v.component_data_type_id === 'fm_ui_input_integer' ||
      //   v.component_data_type_id === 'fm_ui_input_integer2' ||
      //   v.component_data_type_id === 'fm_ui_input_integer8' ||
      //   v.component_data_type_id === 'fm_ui_input_numeric' ||
      //   v.component_data_type_id === 'fm_ui_input_decimal8' ||
      //   v.component_data_type_id === 'fm_ui_input_decimal') {
      if (isUINumber(v.component_data_type_id)) {
        v.value = Number(v.value);
        // this.selectTwoGroup = this.selectTwoGroup2;
        v.selectTwoGroup = this.selectTwoGroup2;
        // 如果字符切换回数值,数值不匹配类型切回等于
        if (v.data_type_rule_id === '22c85efb-357e-4336-a31a-cc28921c26de' ||
          v.data_type_rule_id === '138dff59-787a-4ca5-a3e2-cbfdeebabd0d' ||
          v.data_type_rule_id === 'f702c1c8-9c4f-498c-8079-9e902a4ad340' ||
          v.data_type_rule_id === '5b0c8b8e-c8b3-4285-97a4-ed7ae83c92e6') {
          v.data_type_rule_id = '4f1392a2-491f-42b3-81ff-73f3f98e555b';
        }

      } else {
        v.value = v.value.toString();
        // this.selectTwoGroup = this.selectTwoGroup1;
        v.selectTwoGroup = this.selectTwoGroup1;
      }

      // 值为空 ,默认不添加不修改
      if (!v.value && v.value !== 0) {
        return;
      }

      if (v.service_event_config_id) {
        this.updateFilter(v, index);
      } else {
        this.insertFilter(v, index);
      }

    } else {
      for (const item of this.filterData) {
        if (e === item.service_event_config_id) {
          // v.data_type = item.data_type;
          // todo
          v.component_data_type_id = item.component_data_type_id;
        }
      }

      // todo
      // if (v.data_type === 'postgres_integer' || v.data_type === 'postgres_numeric' ||
      //   v.data_type === 'postgres_bigint' || v.data_type === 'postgres_smallint' ||
      //   v.data_type === 'postgres_double_precision') {
      // if (v.component_data_type_id === 'fm_ui_input_integer' ||
      //   v.component_data_type_id === 'fm_ui_input_integer2' ||
      //   v.component_data_type_id === 'fm_ui_input_integer8' ||
      //   v.component_data_type_id === 'fm_ui_input_numeric' ||
      //   v.component_data_type_id === 'fm_ui_input_decimal8' ||
      //   v.component_data_type_id === 'fm_ui_input_decimal') {
      if (isUINumber(v.component_data_type_id)) {
        v.value = Number(v.value);
        // this.selectTwoGroup = this.selectTwoGroup2;
        v.selectTwoGroup = this.selectTwoGroup2;
        // 如果字符切换回数值,数值不匹配类型切回等于
        if (v.rule === '22c85efb-357e-4336-a31a-cc28921c26de' || v.rule === '138dff59-787a-4ca5-a3e2-cbfdeebabd0d' ||
          v.rule === 'f702c1c8-9c4f-498c-8079-9e902a4ad340' || v.rule === '5b0c8b8e-c8b3-4285-97a4-ed7ae83c92e6') {
          v.rule = '4f1392a2-491f-42b3-81ff-73f3f98e555b';
        }


      } else {
        v.value = v.value.toString();
        // this.selectTwoGroup = this.selectTwoGroup1;
        v.selectTwoGroup = this.selectTwoGroup1;
      }
    }
  }


  // 添加
  insertFilter(item: any, index: any) {
    const postBody = {
      entity_column_id: item.entity_column_id,
      value: item.value,
      data_type_rule_id: item.data_type_rule_id,
      conjunction: this.conjunction,
      service_event_id: this.pageConfig.service_event_id
    };


    this.httpService.getData(postBody,
      true, 'execute', '4b0c5664-9d6b-47f5-ade9-0dd066798f61', 'filter')
      .subscribe(
        data => {
          if ((data as any).status > 0) {
            const data_type = this.filterArray[index].selectTwoGroup;
            this.filterArray[index] = (data as any).data.root[0];
            this.filterArray[index].selectTwoGroup = data_type;

            for (const v of this.filterData) {
              if (this.filterArray[index].entity_column_id === v.entity_column_id) {
                // todo
                // this.filterArray[index].data_type = v.data_type;
                this.filterArray[index].component_data_type_id = v.component_data_type_id;
              }
            }
            this.toastService.toast(new ToastConfig(ToastType.SUCCESS, '', '添加成功!', 3000));
            // const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '添加成功!', 3000);
            // this.toastService.toast(toastCfg);
          }
        },
        error => {
        }
      );

  }

  // 修改
  updateFilter(item: any, index: any) {
    const postBody = {
      entity_column_id: item.entity_column_id,
      value: item.value,
      data_type_rule_id: item.data_type_rule_id,
      conjunction: this.conjunction,
      service_event_config_id: item.service_event_config_id
    };
    this.httpService.getData(postBody,
      true, 'execute', '4b0c5664-9d6b-47f5-ade9-0dd066798f62', 'filter')
      .subscribe(
        data => {
          if ((data as any).status > 0) {
            this.filterArray[index].entity_column_id = item.entity_column_id;
            this.filterArray[index].value = item.value;
            this.filterArray[index].data_type_rule_id = item.data_type_rule_id;
            this.toastService.toast(new ToastConfig(ToastType.SUCCESS, '', '修改成功!', 3000));
          }
        },
        error => {
        }
      );
  }

  // 删除
  removeFilter(index: any) {

    if (!this.filterArray[index].service_event_config_id) {
      this.filterArray.splice(index, 1);
      return;
    }


    const postBody = {
      service_event_config_id: this.filterArray[index].service_event_config_id
    };

    this.httpService.getData(postBody,
      true, 'execute', '8d090b07-bbec-414c-8ae4-92dc2f917f41', 'filter')
      .subscribe(
        data => {
          if ((data as any).status > 0) {
            this.filterArray.splice(index, 1);
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 3000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
        }
      );
  }


  // getZZZ(v: any) {
  //   if (v.data_type) {
  //     if (v.data_type === 'postgres_integer' || v.data_type === 'postgres_numeric' ||
  //       v.data_type === 'postgres_bigint' || v.data_type === 'postgres_smallint' ||
  //       v.data_type === 'postgres_double_precision') {
  //       return this.selectTwoGroup2;
  //     } else {
  //       return this.selectTwoGroup1;
  //     }
  //   }
  //
  // }
}
