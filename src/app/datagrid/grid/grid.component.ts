import {Component, OnInit, Input, OnChanges, Output, EventEmitter, OnDestroy} from '@angular/core';
import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {AppService} from '../../s-service/app.service';
import {GridModalComponent} from '../modal/grid-modal.component';
import {AppModalComponent} from '../../modal/app-modal.component';
import {isArray, toError, toLog, getObject, get, dateFormat, deepCopy} from '../../smx-component/smx-util';
import {isUINumber, getComponentType} from '../../s-service/utils';

const Buffer = require('buffer').Buffer;
const wkx = require('wkx');

// import {Debug} from "ng2-img-cropper/src/exif";

@Component({
  selector: 'c-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})

export class GridComponent implements OnInit, OnChanges, OnDestroy {
  @Input() btnDisabled: any;
  @Input() pageType: number; // 当前页面显示类型：1表信息、2表结构
  @Input() geoType: any;
  @Input() operationConfig: any;
  @Input() strucrtorData: any;  // 表结构原始数据
  @Input() dataStructure: any;  // 数据源结构数据
  @Input() pageConfig: any;  // 配置信息

  @Output() totalProperty: EventEmitter<number> = new EventEmitter<number>();
  @Output() updateFilterInfo = new EventEmitter();
  @Output() refreshData = new EventEmitter();   // 刷新数据

  operationDel: any; // 删除时的key，数组
  operationAdd: any; // 新增时的key，数组
  removeIdArray: any; // 删除时的id数组

  dataIndex: any;  // 删除时的index数组


  rawData: any[]; // 删除时需要使用id的原始数据
  operationUpdate: any; // 修改时的key, 数组
  // operationUpdateKey: any[];
  updateIdArray: any; // 修改时id数组

  operationShow: any[];    // 展示数据信息


  gridData: any;
  gridHeader: any;
  canChecked: boolean;
  // gridHeaderShow: any;

  postDataBody = {
    conjunctionCon: 'and',
    filtersCon: []
  };

  totalPage = 0; // 数据总数,不是总页数
  everyPageNum = 30;
  pageNum = 1; // 当前加载数据页码


  // 属性是geo的列entity_column_id
  geoEntityColumnId: any[] = [];


  // 结构数据
  structureValue: any;
  structureHeader: any;

  unDataAction: any;
  type = 'grid';

  types: any[] = [];

  // 默认数值
  conversion: any;


  isAllChecked = false;


  // 加载状态
  loading: any;
  dataLoading = true;

  constructor(private httpService: HttpService,
              private ngbModalService: SmxModal,
              public toastService: ToastService,
              private appService: AppService) {
    this.unDataAction = this.appService.dataActionEventEmitter.subscribe((value: any) => {
      if (value.type === 'addGeo') { // 新增geo事件
        this.addNewGriddata(value.value);
      } else if (value.type === 'removeGeo') { // 删除geo事件
        this.removeGridData(value.value);
      } else if (value.type === 'updateGeo') { // 修改geo事件
        this.updateGriddate(value.value);
      } else if (value.type === 'unionGeo') { // 合并geo事件
        this.unionGriddate(value.value);
      }
    });
  }

  ngOnDestroy() {
    this.unDataAction.unsubscribe();
  }

  /*
   * 初始化addSuccess
   */
  ngOnInit() {
    if (!this.pageConfig) {
      this.pageConfig = getObject('data_info');
    }

    this.canChecked = !this.pageConfig.visit_type;
    if (this.pageType === 2) {
      this.getGridStructure();
      // 下拉框的请求服务器方法
      // this.getDropDown();
    } else {
      this.initData();
    }
  }

  ngOnChanges() {
    if (this.pageType === 2) {
      this.getGridStructure();
      // 下拉框的请求服务器方法
      // this.getDropDown();
    }
  }


  initData() {
    this.loading = 0;
    this.removeIdArray = [];
    this.dataIndex = [];


    this.updateIdArray = [];

    // this.gridHeaderShow = [];    // 展示数据描述
    this.operationShow = [];    // 展示数据信息


    this.operationDel = {
      url: '',
      key: []
    };
    this.operationAdd = {
      url: '',
      key: [],
      tag: 1
    };
    this.operationUpdate = {
      url: '',
      key: [],
      tag: 1
    };


    if (this.operationConfig) {
      for (const i of this.operationConfig) {


        // url接口
        if (i.config_type === 'operation') {
          if (i.model === 'delete') {
            this.operationDel.url = i.service_event_id;
          } else if (i.model === 'insert') {
            this.operationAdd.url = i.service_event_id;
          } else if (i.model === 'update') {
            this.operationUpdate.url = i.service_event_id;
          }
        }


        if (i.config_type === 'delete') { // 删除时的接口以及索引key
          this.operationDel.key.push(i.alias);

        }


        // 插入
        if (i.config_type === 'insert') {
          const data = {
            name: i.alias,
            description: i.description,
            null_able: i.null_able,
            type: i.model ? i.model : 'fm_ui_input_text',
            content: i.content ? JSON.parse(i.content) : '',
            precision: i.precision,
            data_type: i.data_type,
            component_data_type_id: i.component_data_type_id, // todo
            service_event_id: i.service_event_id,
            config: {},
            entity_column_id: i.entity_column_id
          };

          data.config[this.structureConfig(i)[0]] = this.structureConfig(i)[1];

          // if (i.config && isArray(i.config)) {
          //   for (const v of i.config) {
          //     if (v.attr_value_type === 'boolean') {
          //       data.config[v.name] = v.component_attr_value === 'true' || v.value === true ? true : false;
          //     }
          //
          //     if (v.attr_value_type === 'number') {
          //       data.config[v.name] = Number(v.component_attr_value);
          //     }
          //
          //     if (v.attr_value_type === 'varchar') {
          //       data.config[v.name] = v.component_attr_value;
          //     }
          //
          //     if (v.attr_value_type === 'json') {
          //       data.config[v.name] = v.component_attr_value;
          //     }
          //   }
          // }

          this.operationAdd.key.push(data);

          // if (i.model === 'editor') {
          //   this.operationAdd.tag = 2;
          // }
        }

        // 修改
        if (i.config_type === 'update') {
          const data = {
            description: i.description,
            name: i.alias,
            null_able: i.null_able,
            type: i.model ? i.model : 'fm_ui_input_text',
            content: i.content ? JSON.parse(i.content) : '',
            precision: i.precision,
            data_type: i.data_type,
            component_data_type_id: i.component_data_type_id, // todo
            service_event_id: i.service_event_id,
            isId: false,
            config: {},
            entity_column_id: i.entity_column_id
          };


          data.config[this.structureConfig(i)[0]] = this.structureConfig(i)[1];

          // if (i.config && isArray(i.config)) {
          //   for (const v of i.config) {
          //     if (v.attr_value_type === 'boolean') {
          //       data.config[v.name] = v.component_attr_value === 'true' || v.value === true ? true : false;
          //     }
          //
          //     if (v.attr_value_type === 'number') {
          //       data.config[v.name] = Number(v.component_attr_value);
          //     }
          //
          //     if (v.attr_value_type === 'varchar') {
          //       data.config[v.name] = v.component_attr_value;
          //     }
          //
          //     if (v.attr_value_type === 'json') {
          //       data.config[v.name] = v.component_attr_value;
          //     }
          //
          //   }
          // }


          this.operationUpdate.key.push(data);

          // if (i.model === 'editor') {
          //   this.operationUpdate.tag = 2;
          // }
        }


        // 修改key
        if (i.config_type === 'updateKey') {
          this.operationUpdate.key.push({
            description: i.description,
            name: i.alias,
            null_able: i.null_able,
            type: i.model ? i.model : 'input',
            content: i.content ? JSON.parse(i.content) : '',
            precision: i.precision,
            data_type: i.data_type,
            component_data_type_id: i.component_data_type_id, // todo
            service_event_id: i.service_event_id,
            isId: true
          });
        }


        // 显示字段

        if (i.config_type === 'result') {
          const data = {
            alias: i.alias,
            description: i.description,
            type: i.model ? i.model : 'input',
            config: {}
          };

          data.config[this.structureConfig(i)[0]] = this.structureConfig(i)[1];

          this.operationShow.push(data);

          // this.gridHeaderShow.push(i.description);
          if (i.model === 'fm_ui_point_geo' || i.model === 'fm_ui_line_geo' || i.model === 'fm_ui_polygon_geo') {
            this.geoEntityColumnId.push(i.entity_column_id);
          }
        }

      }
    }


    this.gridData = [];
    this.rawData = [];
    this.gridHeader = [];
    this.pageNum = 1;
    if (this.operationConfig) {
      this.getGridData(this.postDataBody.conjunctionCon, this.postDataBody.filtersCon);
    }
  }


  /*
 *获取类型下拉框的服务器请求
 */
  // getDropDown() {
  //   if (this.types.length < 1) {
  //     this.httpService.getData({'parent_id': 'sys_column_type'}, true,
  //       'execute', '6a35661d-7a2c-4a75-b3f2-e3a82ed953e0', '1')
  //       .subscribe(
  //         data => {
  //           if ((data as any).status > 0) {
  //
  //             const obj = [];
  //             for (const v of (data as any).data) {
  //               obj.push({
  //                 label: v.item_name,
  //                 value: v.baseid
  //               });
  //             }
  //
  //             this.types = obj;
  //           }
  //         },
  //         error => {
  //           toError(error);
  //         }
  //       );
  //   }
  //
  // }


  /*
   *下拉框的onchange事件方法
   */
  typeChange(e: any, item: any, itemHeader: any, i: any) {
    const refModal = this.ngbModalService.open(AppModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-app'});
    refModal.componentInstance.config = {title: '类型转换', view: '操作不可逆，是否确认转换?'};
    refModal.result.then(
      (result) => {
        const body = {
          entity_column_id: item['entity_column_id'],
          data_type: e.component_data_type_id,
          component_data_type_id: e.component_data_type_id, // todo
          config: e.config
        };
        this.httpService.getData(body,
          true, 'execute', 'ca464ab6-d4b8-4e8a-abdd-206c022012c2', 'type')
          .subscribe(data => {
              if ((data as any).status > 0) {
                this.syncStructure(this.strucrtorData[i].entity_column_id, e);
                this.strucrtorData[i].component_data_type_id = e.component_data_type_id;
                this.strucrtorData[i].config = e.config;

                this.refreshData.emit();
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '类型转换成功!', 2000);
                this.toastService.toast(toastCfg);
              } else {
                // 数据源结构类型修改判断是否数据锁定
                if ((data as any).status === -260) {
                  const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 5000);
                  this.toastService.toast(toastCf);
                  return;
                } else {
                  item[itemHeader] = {
                    component_data_type_id: this.strucrtorData[i].component_data_type_id,
                    config: this.strucrtorData[i].config,
                    type: getComponentType(this.strucrtorData[i].component_data_type_id)
                  };
                }
              }
            },
            error => {
              item[itemHeader] = {
                component_data_type_id: this.strucrtorData[i].component_data_type_id,
                config: this.strucrtorData[i].config,
                type: getComponentType(this.strucrtorData[i].component_data_type_id)
              };
            }
          );

      },
      (reason) => {
        item[itemHeader] = {
          component_data_type_id: this.strucrtorData[i].component_data_type_id,
          config: this.strucrtorData[i].config,
          type: getComponentType(this.strucrtorData[i].component_data_type_id)
        };
      });


  }


  /*
  * 获取表格数据
  * */
  getGridData(conjunctionCon: string, filtersCon: any, startNum?: number) {
    for (const item of filtersCon) {
      // if (item.data_type === 'postgres_integer' || item.data_type === 'postgres_numeric' ||
      //   item.data_type === 'postgres_bigint' || item.data_type === 'postgres_smallint' ||
      //   item.data_type === 'postgres_double_precision') {
      //   item.value = Number(item.value);
      // }
      // Todo
      /**
       * 添加了关于数值类型的component_data_layer_id
       * update_user: runasong
       * */
      // if (item.component_data_type_id === 'fm_ui_input_integer' ||
      //   item.component_data_type_id === 'fm_ui_input_integer2' ||
      //   item.component_data_type_id === 'fm_ui_input_integer8' ||
      //   item.component_data_type_id === 'fm_ui_input_numeric' ||
      //   item.component_data_type_id === 'fm_ui_input_decimal8' ||
      //   item.component_data_type_id === 'fm_ui_input_decimal')
      if (isUINumber(item.component_data_type_id)) {
        item.value = Number(item.value);
      }
    }


    this.postDataBody.conjunctionCon = conjunctionCon;
    this.postDataBody.filtersCon = filtersCon;
    if (startNum !== undefined) {
      this.gridData = [];
      this.rawData = [];
      this.pageNum = 1;
    }
    const postBody = {
      filters: filtersCon,
      conjunction: conjunctionCon,
      limit: this.everyPageNum,
      start: startNum !== undefined ? startNum : this.everyPageNum * (this.pageNum - 1),
      service_event_parameters_id: this.pageConfig.service_event_parameters_id
    };
    this.httpService.getData(postBody,
      true, 'execute', this.pageConfig.service_event_id, '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }
          // this.gridData = (data as any).data.root;
          // 下面的判断是在ngchange事件会出发两次导致首次进入有60条数据，有两个组件传入数据导致
          if ((this.pageNum * this.everyPageNum) === (this.gridData.length + 30)) {
            this.rawData.push.apply(this.rawData, this.cloneObj((data as any).data.root));
            this.gridData.push.apply(this.gridData, (data as any).data.root);


            this.loading = 1; // 加载完成
            this.gridHeader = this.operationShow;
            this.totalPage = (data as any).data.totalProperty;
          }

          // 发送总数事件
          this.totalProperty.emit((data as any).data.totalProperty);
          this.dataLoading = true;
        },
        error => {
          toError(error);
        }
      );

  }


  exportData() {
    const postBody = {
      filters: this.postDataBody.filtersCon,
      conjunction: this.postDataBody.conjunctionCon,
      service_event_parameters_id: this.pageConfig.service_event_parameters_id,
      exportFileName: this.pageConfig.description + '.csv'
    };
    // const token = localStorage.getItem('id_token');
    const token = get('id_token');
    const dataUrl = '/services/1.0.0/execute/' + this.pageConfig.service_event_id + '?parameter=';
    const param = {
      tag: 'export',
      export: 'csv',
      data: postBody,
      token: token
    };
    this.httpService.open(dataUrl + JSON.stringify(param), 'window');
  }


  /*
  * 深copy
  * */
  cloneObj(obj: any) {
    let str, newobj = obj.constructor === Array ? <any>[] : <any>{};
    if (typeof obj !== 'object') {
      return;
    } else if ((window as any).JSON) {
      str = JSON.stringify(obj), // 系列化对象
        newobj = JSON.parse(str); // 还原
    } else {
      for (const i in obj) {
        if (i) {
          newobj[i] = typeof obj[i] === 'object' ?
            this.cloneObj(obj[i]) : obj[i];
        }

      }
    }
    return newobj;
  }

  /*
  * 获取表格结构
  * */
  getGridStructure() {
    if (this.types.length < 1) {
      this.structureValue = this.formatStructure(this.strucrtorData);
    }
  }


  checkAll(e: any) {
    // 修改选择
    this.dataIndex = [];
    this.removeIdArray = [];
    this.updateIdArray = [];
    if (e.target.checked) {
      this.isAllChecked = true;
      for (let i = 0; i < this.rawData.length; i++) {
        this.checkItem(i, {target: {checked: true}}, this.rawData[i]);
      }
    } else {
      this.isAllChecked = false;
      for (let i = 0; i < this.rawData.length; i++) {
        this.rawData[i].checked = false;
      }
      this.updateBtnStatus();
    }


  }


  /*
  * 选择事件
  * */
  checkItem(index: number, e: any, v: any) {
    // 修改选择
    if (e.target.checked) {
      // wb
      if (this.rawData[index].system_id) {
        v.system_id = this.rawData[index].system_id;
      }
      this.rawData[index] = v;
      // wb
      this.rawData[index].checked = true;
      this.updateIdArray.push({index: index, value: this.rawData[index]});


      const removeKeyValue: any = {};
      for (const j of this.operationDel.key) {
        removeKeyValue[j] = this.rawData[index][j];
      }
      this.dataIndex.push(index);
      this.removeIdArray.push(removeKeyValue);


    } else {
      this.isAllChecked = false;
      for (const j of this.updateIdArray) {
        if (this.cmp(j.value, this.rawData[index])) {
          this.updateIdArray.splice(this.updateIdArray.indexOf(j), 1);
        }
      }


      const removeKeyValue: any = {};
      for (const j of this.operationDel.key) {
        removeKeyValue[j] = this.rawData[index][j];
      }
      for (const j of this.removeIdArray) {
        if (this.cmp(j, removeKeyValue)) {
          this.removeIdArray.splice(this.removeIdArray.indexOf(j), 1);
        }
      }
      this.dataIndex.splice(this.dataIndex.indexOf(index), 1);


    }


    this.updateBtnStatus();

    // 修改按钮状态

  }


  updateBtnStatus() {
    if (this.updateIdArray.length !== 1) {
      this.btnDisabled.update = false;
    } else {
      this.btnDisabled.update = true;
      for (const key in this.updateIdArray[0].value) {
        if (key) {
          for (const l of this.operationUpdate.key) {
            if (key === l.name) {
              l['value'] = this.updateIdArray[0].value[key];
            }
          }
        }

      }
    }


    // 删除按钮状态
    if (this.removeIdArray.length !== 0) {
      this.btnDisabled.del = true;
    } else {
      this.btnDisabled.del = false;
    }
  }

  /*
  * 判断两个对象是否相等,在取消选中事件时使用
  * */
  cmp(x: any, y: any) {
    if (x === y) {
      return true;
    }
    if (!(x instanceof Object) || !(y instanceof Object)) {
      return false;
    }
    if (x.constructor !== y.constructor) {
      return false;
    }
    for (const p in x) {
      if (x.hasOwnProperty(p)) {
        if (!y.hasOwnProperty(p)) {
          return false;
        }
        if (x[p] === y[p]) {
          continue;
        }
        if (typeof (x[p]) !== 'object') {
          return false;
        }
        // if (!(<any>Object).equals(x[p], y[p])) {
        //     return false;
        // }
      }
    }
    for (const p in y) {
      if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
        return false;
      }
    }
    return true;
  }

  // /*
  // * 图上选取点击事件
  // * */
  // chooseImg(index: number) {
  //   const chooseMap = this.ngbModalService.open(ChooseDataModalComponent, {
  //     backdrop: 'static'
  //   });
  //
  //   chooseMap.componentInstance.geoType = this.geoType;
  //   chooseMap.result.then(
  //     (result) => {
  //       toLog(result);
  //     },
  //     (reason) => {
  //       toLog(reason);
  //     });
  // }

  /*
  * 表结构别名修改点击变成输入框
  * */
  changeEditFlag(index: number, str: string, e: any) {
    this.structureValue[index].editFlag = true;
    // this.structureValue[index].editValue = str;
    this.structureValue[index].editValue = this.structureValue[index]['别名'];
    setTimeout(() => {
      /*if (document.getElementsByClassName('right-side-box')[0].getElementsByTagName('input')[0]) {
          document.getElementsByClassName('right-side-box')[0].getElementsByTagName('input')[0].focus()
      }*/

      (<any>document.getElementsByClassName('change-name-input')[0]).focus();
    });
  }

  /*
  * 表结构别名修改失去焦点事件
  * */
  saveChangeName(e: any, index: any) {
    const targetValue = e.target.value;

    const c = new RegExp('^[\u4E00-\u9FA50-9A-Za-z_()]{1,40}$');
    if (!c.test(targetValue)) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '支持1-40个汉字 数字 字母 _ ()', 3000);
      this.toastService.toast(toastCfg);
      return false;
    }


    /**
     * 增加在前端验证别名是否重复
     * update_user: ruansong
     * */
    let otherName = false;
    for (let i = 0; i < this.structureValue.length; i++) {
      if (this.structureValue[i]['别名'] === targetValue) {
        otherName = true;
        break;
      }
    }
    this.structureValue[index].editFlag = false;
    if (targetValue === '') {
      return;
    }
    if (otherName) {
      const toastCf = new ToastConfig(ToastType.WARNING, '', '别名重复，请重新修改！', 3000);
      this.toastService.toast(toastCf);
      return;
    }
    const postData = {
      entity_column_id: this.structureValue[index].entity_column_id,
      description: targetValue,
      service_event_id: this.pageConfig.service_event_id
    };
    this.httpService.getData(postData, true,
      'execute', 'c0bd4559-6ef4-4fc3-a0d2-9f35d94a4cf9', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {  // 修改成功
            // 数据源结构别名修改判断是否数据锁定
            if ((data as any).status === -260) {
              const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 3000);
              this.toastService.toast(toastCf);
              return;
            } else {
              return;
            }
          }

          // 结构原始数据
          this.structureValue[index]['别名'] = targetValue;
          //  显示字段
          // for (let i = 0; i < this.operationShow.length; i++) {
          //   if (this.operationShow[i].alias === this.structureValue[index]['名称']) {
          //     this.gridHeaderShow[i] = targetValue;
          //     break;
          //   }
          // }

          for (let i = 0; i < this.gridHeader.length; i++) {
            if (this.gridHeader[i].alias === this.structureValue[index]['名称']) {
              this.gridHeader[i]['description'] = targetValue;
              break;
            }
          }

          // 添加弹窗
          for (let i = 0; i < this.operationAdd.key.length; i++) {
            if (this.operationAdd.key[i]['name'] === this.structureValue[index]['名称']) {
              this.operationAdd.key[i]['description'] = targetValue;
              break;
            }
          }

          // 修改弹窗
          for (let i = 0; i < this.operationUpdate.key.length; i++) {
            if (this.operationUpdate.key[i]['name'] === this.structureValue[index]['名称']) {
              this.operationUpdate.key[i]['description'] = targetValue;
              break;
            }
          }

          for (const operation of this.operationConfig) {
            if (operation.config_type === 'result') { // 显示字段
              if (operation.alias === this.structureValue[index]['名称']) {
                operation.description = targetValue;
                break;
              }
            }
          }
          // 过滤字段
          this.updateFilterInfo.emit();
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改成功!', 2000);
          this.toastService.toast(toastCfg);
        },
        error => {
          console.log(error);
        }
      );
  }

  /*
  * 输入框回车事件
  * */
  inputChangeName(e: any) {
    if (e.keyCode === 13) {
      e.target.blur();
    }
  }


  /*
  * 加载下一页事件
  * */
  loadNextPage(event: any) {
    if (event.isReachingBottom && this.dataLoading) {
      let open = true;
      this.dataLoading = false;
      this.isAllChecked = false;
      if (this.pageType === 1) {
        if (this.everyPageNum * this.pageNum < this.totalPage) {
          if (this.gridData.length !== 0) { // 防止在点击搜索按钮是加载下一页刷新第二遍
            open = false;
            this.pageNum = this.pageNum + 1;
            this.getGridData(this.postDataBody.conjunctionCon, this.postDataBody.filtersCon);
          }
        } else {
          this.dataLoading = true;
        }
      }

      if (this.gridData.length <= 30 && this.pageNum > 1 && open) {
        this.isAllChecked = false;
        this.getGridData(this.postDataBody.conjunctionCon, this.postDataBody.filtersCon);
      }
    }

    // if (event.isReachingBottom) {
    //   if (this.gridData.length <= 30 && this.pageNum > 1) {
    //     this.isAllChecked = false;
    //     this.getGridData(this.postDataBody.conjunctionCon, this.postDataBody.filtersCon);
    //   }
    // }
  }

  /* // 监听左右滑动a */
  scrollLeft(event: any) {
    /*const left = document.getElementsByClassName('grid-box')[0];
    const change = document.getElementsByTagName('thead')[0];
    console.log(document.getElementsByTagName('thead'));
    change.style.left = -left.scrollLeft + 'px';*/
    const left = event.target.scrollLeft;
    const thead = event.target.parentNode.childNodes[1];
    thead.getElementsByTagName('thead')[0].style.left = -left + 'px';
  }


  /**
   * 删除表格数据
   * @param value
   */
  removeGridData(value?: any) {


    // const odiv = document.getElementsByClassName('del-modal');
    // if (odiv.length > 0) {
    //   document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-window')[0]);
    //   document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-backdrop')[0]);
    // }


    // 地理图层删除
    if (value) {
      const delData: any = {};
      for (const j of this.operationDel.key) {
        for (const i in value) {
          if (i === j) {
            delData[i] = value[i];
          }
        }
      }

      this.removeIdArray = [delData];
    }


    if (this.removeIdArray.length > 0) {
      const refModal = this.ngbModalService.open(AppModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-app'});
      refModal.componentInstance.config = {
        title: '删除数据',
        view: '数据删除后不可恢复，确认删除?'
      };
      refModal.result.then(
        (result) => {
          // if (result === 'submit') {
          this.httpService.getData(this.removeIdArray, true,
            'execute', this.operationDel.url, '1')
            .subscribe(
              data => {
                if ((data as any).status > 0) {


                  if (value) {
                    if (this.removeIdArray.length > 0) {
                      for (let i = 0; i < this.rawData.length; i++) {
                        if (this.rawData[i].system_id === this.removeIdArray[0].system_id) {
                          this.rawData.splice(i, 1);
                          this.gridData.splice(i, 1);
                          break;
                        }
                      }
                    }

                  }


                  // 清除选择
                  this.cleanSelect();
                  // this.removeIdArray = [];
                  this.dataIndex.sort((a: any, b: any) => {
                    return b - a;
                  });

                  for (const i of this.dataIndex) {
                    this.gridData.splice(i, 1);
                    this.rawData.splice(i, 1);
                  }

                  this.dataIndex = [];

                  this.totalPage = this.totalPage - (data as any).data.length;
                  this.totalProperty.emit(this.totalPage);


                  // if (value) { // 地理图层成功
                  this.appService.dataActionEventEmitter.emit({type: 'removeSuccess'});
                  // }


                  if (this.isAllChecked) {
                    this.isAllChecked = false;
                  }

                  this.initData();
                  const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 2000);
                  this.toastService.toast(toastCfg);
                } else {
                  // 数据源数据删除时，判断数据是否锁定
                  if ((data as any).status === -260) {
                    const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 5000);
                    this.toastService.toast(toastCf);
                    return;
                  } else {
                    if (value) {// 地理图层失败
                      this.appService.dataActionEventEmitter.emit({type: 'removeFail'});
                    }
                    const toastCfg = new ToastConfig(ToastType.ERROR, '', '删除失败!', 2000);
                    this.toastService.toast(toastCfg);
                  }
                }
              },
              error => {
                if (value) { // 地理图层失败
                  this.appService.dataActionEventEmitter.emit({type: 'removeFail'});
                }
              }
            );
          // } else {
          //   if (value) { // 地理图层失败
          //     this.appService.dataActionEventEmitter.emit({type: 'removeFail'});
          //   }
          // }
        },
        (reason) => {
          if (value) {
            this.appService.dataActionEventEmitter.emit({type: 'removeFail'});
          }
        });
    }
    // }
  }

  /**
   * 新增一条数据
   * @param geoJson
   */
  addNewGriddata(geoJson?: any) {
    // const odiv = document.getElementsByClassName('add-modal');
    // if (odiv.length > 0) {
    //   document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-window')[0]);
    //   document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-backdrop')[0]);
    // }

    const refModal = this.ngbModalService.open(GridModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-gridModal'});
    // 防止新增数据时旧数据值未清空导致的bug
    for (const i of this.operationAdd.key) {
      i['value'] = null;
    }

    if (geoJson) {
      for (const i of this.operationAdd.key) {
        // if (/^select_/g.exec(i.type)) {
        if ((i.component_data_type_id === 'fm_ui_point_geo') || (i.component_data_type_id === 'fm_ui_line_geo') || (i.component_data_type_id === 'fm_ui_polygon_geo')) {
          i.value = geoJson;
        }
      }
    }

    const formConfig = deepCopy(this.operationAdd);
    refModal.componentInstance.type = 1;
    refModal.componentInstance.formConfig = formConfig;
    refModal.result.then(
      (result) => {
        if (result === 'submit') {
          const postAddData: any = {};
          /**
           * 结构变化、需用新的ui类型去处理事件
           * */
          for (const j of formConfig.key) {
            // todo
            /*postAddData[j.name] = j.type === 'fm_ui_input_integer' ? parseFloat(j.value) : j.value;*/
            // if (j.component_data_type_id === 'fm_ui_input_integer8' ||
            //   j.component_data_type_id === 'fm_ui_input_integer' ||
            //   j.component_data_type_id === 'fm_ui_input_numeric' ||
            //   j.component_data_type_id === 'fm_ui_input_integer2' ||
            //   j.component_data_type_id === 'fm_ui_input_decimal' ||
            //   j.component_data_type_id === 'fm_ui_input_decimal8') {
            if (isUINumber(j.component_data_type_id)) {
              postAddData[j.name] = parseFloat(j.value);
            } else {
              postAddData[j.name] = j.value;
            }
            // 王博 修改 增加判断boolean
            if (j.type === 'fm_ui_select_boolean') {
              if (j.value === 'true') {
                postAddData[j.name] = true;
              } else {
                postAddData[j.name] = false;
              }
            }
          }
          this.httpService.getData(postAddData, true,
            'execute', formConfig.url, '1')
            .subscribe(
              data => {
                if ((data as any).status > 0) {
                  // if (geoJson) {
                  const changeGeo = (data as any).data.root[0];
                  // for (const i of this.operationAdd.key) {
                  //     if (/^select_/g.exec(i.type)) {
                  //         changeGeo['geoJson'] = postAddData[i.name];
                  //     }
                  // }
                  // localStorage.setItem('addGeo', JSON.stringify(changeGeo));
                  this.appService.dataActionEventEmitter.emit({type: 'addSuccess', value: changeGeo});

                  // }


                  // 清除选择
                  this.cleanSelect();


                  this.totalPage = this.totalPage + 1;
                  this.totalProperty.emit(this.totalPage);

                  const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '数据添加成功!', 2000);
                  this.toastService.toast(toastCfg);


                  // 刷新数据
                  // this.getGridData(this.postDataBody.conjunctionCon,
                  //   this.postDataBody.filtersCon, (this.pageNum - 1) * 30);
                  this.getGridData(this.postDataBody.conjunctionCon,
                    this.postDataBody.filtersCon, 0);
                } else {
                  // 数据源信息的添加，判断是否处于锁定状态
                  if ((data as any).status === -260) {
                    const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 5000);
                    this.toastService.toast(toastCf);
                    return;
                  } else {
                    if (geoJson) {
                      // localStorage.setItem('addGeoFun', 'undefined');
                      // localStorage.setItem('addGeoFun', 'fail');
                      this.appService.dataActionEventEmitter.emit({type: 'addFail'});
                    }
                    const toastCfg = new ToastConfig(ToastType.ERROR, '', '添加失败,请稍后再试!', 2000);
                    this.toastService.toast(toastCfg);
                  }
                }
              },
              error => {
                toError(error);
              }
            );
        } else {
          if (geoJson) {
            // localStorage.setItem('addGeoFun', 'undefined');
            // localStorage.setItem('addGeoFun', 'fail');
            this.appService.dataActionEventEmitter.emit({type: 'addFail'});
          }
        }
      },
      (reason) => {
        // for (const i of this.operationAdd.key) {
        //   i['value'] = undefined;
        // }
        if (geoJson) {
          // localStorage.setItem('addGeoFun', 'undefined');
          // localStorage.setItem('addGeoFun', 'fail');
          this.appService.dataActionEventEmitter.emit({type: 'addFail'});
        }

      });
  }


  /**
   * 修改表格数据
   * @param geoJson
   */
  updateGriddate(geoJson?: any) {

    const updateData = JSON.parse(JSON.stringify(this.operationUpdate));


    if (geoJson) {
      const postUpdateData: any = geoJson;

      for (const j of updateData.key) {
        if (isUINumber(j.component_data_type_id)) {
          postUpdateData[j.name] = parseFloat(postUpdateData[j.name]);
        }
      }
      this.updateGriddateRequest(postUpdateData);


    } else {
      const refModal = this.ngbModalService.open(GridModalComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-gridModal'});
      refModal.componentInstance.type = 3;
      refModal.componentInstance.formConfig = updateData;
      refModal.result.then(
        (result) => {
          if (result === 'submit') {
            // 提交
            const postUpdateData: any = {};
            for (const j of updateData.key) {

              // geojson数据
              if (j.type === 'fm_ui_point_geo' || j.type === 'fm_ui_line_geo' || j.type === 'fm_ui_polygon_geo') {

                if (j.value !== '') {
                  if (typeof j.value === 'string') {
                    j.value = JSON.parse(j.value);
                  }


                  if (j.value.type === 'geometry') {
                    const wkbBuffer = new Buffer(j.value.value, 'hex');
                    j.value = wkx.Geometry.parse(wkbBuffer).toGeoJSON();
                  }
                }


                postUpdateData[j.name] = JSON.stringify(j.value);

              } else {// 非geom数据

                // 数字类型 todo
                if (isUINumber(j.component_data_type_id)) {
                  postUpdateData[j.name] = parseFloat(j.value);
                } else {
                  postUpdateData[j.name] = j.value;
                }
                // 王博 ui boolean 判断
                if (j.type === 'fm_ui_select_boolean') {
                  if (j.value === 'true') {
                    postUpdateData[j.name] = true;
                  } else {
                    postUpdateData[j.name] = false;
                  }
                }


              }

            }


            this.updateGriddateRequest(postUpdateData, updateData);
          }
        }
        ,
        (reason) => {
          toLog(reason);
        }
      );
    }
  }

  /**
   * 添加数据请求
   * @param postUpdateData   请求参数
   * @param updateData       原始修改索引
   */
  updateGriddateRequest(postUpdateData: any, updateData?: any) {
    this.httpService.getData(postUpdateData, true,
      'execute', this.operationUpdate.url, '1')
      .subscribe(
        data => {
          if ((data as any).status > 0) {
            if (updateData) {   // 数据表格修改要进行数据刷新,地图拖动不需要
              this.operationUpdate = updateData;
              const index = this.updateIdArray[0].index;
              for (const i in this.gridData[index]) {
                if (i) {
                  for (const j of this.operationUpdate.key) {
                    if (i === j.name) {
                      this.gridData[index][i] = j.value;
                    }
                  }
                }

              }
            }


            this.appService.dataActionEventEmitter.emit({type: 'updateSuccess'});
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改成功!', 2000);
            this.toastService.toast(toastCfg);
          } else {
            // 数据源过滤数据修改时，判断数据是否锁定
            if ((data as any).status === -260) {
              const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 5000);
              this.toastService.toast(toastCf);
              return;
            } else {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '修改失败!', 2000);
              this.toastService.toast(toastCfg);
              this.appService.dataActionEventEmitter.emit({type: 'updateFail'});
            }
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '修改失败!', 2000);
          this.toastService.toast(toastCfg);
          this.appService.dataActionEventEmitter.emit({type: 'updateFail'});
        });
  }

  /*
  * 合并面新增数据
  * */
  unionGriddate(geoJson?: any) {
    const odiv = document.getElementsByClassName('add-modal');
    if (odiv.length > 0) {
      document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-window')[0]);
      document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-backdrop')[0]);
    }
    const refModal = this.ngbModalService.open(GridModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-gridModal'});

    for (const i of this.operationAdd.key) {
      i['value'] = '';
    }

    if (geoJson) {
      for (const i of this.operationAdd.key) {
        if ((i.component_data_type_id === 'fm_ui_point_geo') || (i.component_data_type_id === 'fm_ui_line_geo') || (i.component_data_type_id === 'fm_ui_polygon_geo')) {
          i.value = geoJson;
        }
      }
    }

    refModal.componentInstance.type = 1;
    refModal.componentInstance.formConfig = this.operationAdd;
    refModal.componentInstance.unionInfo = geoJson.unionInfo;
    refModal.result.then(
      (result) => {
        if (result === 'submit') {
          const postAddData: any = {};
          for (const j of this.operationAdd.key) {
            // if (j.component_data_type_id === 'fm_ui_input_integer8' ||
            //   j.component_data_type_id === 'fm_ui_input_integer' ||
            //   j.component_data_type_id === 'fm_ui_input_integer2' ||
            //   j.component_data_type_id === 'fm_ui_input_decimal' ||
            //   j.component_data_type_id === 'fm_ui_input_decimal8') {
            if (isUINumber(j.component_data_type_id)) {
              postAddData[j.name] = parseFloat(j.value);
            } else {
              postAddData[j.name] = j.value;
            }
          }
          this.httpService.getData(postAddData, true,
            'execute', this.operationAdd.url, '1')
            .subscribe(
              data => {
                if ((data as any).status > 0) {
                  if (geoJson) {
                    const changeGeo = (data as any).data.root[0];
                    // for (const i of this.operationAdd.key) {
                    //     if (/^select_/g.exec(i.type)) {
                    //         changeGeo['geoJson'] = postAddData[i.name];
                    //     }
                    // }
                    // localStorage.setItem('addGeo', JSON.stringify(changeGeo));
                    this.appService.dataActionEventEmitter.emit({type: 'unionSuccess', value: changeGeo});

                  }


                  this.totalPage = this.totalPage + 1;
                  this.totalProperty.emit(this.totalPage);

                  const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '数据合并成功!', 2000);
                  this.toastService.toast(toastCfg);


                  // 刷新数据
                  // this.getGridData(this.postDataBody.conjunctionCon, this.postDataBody.filtersCon, this.pageNum);
                  this.getGridData(this.postDataBody.conjunctionCon, this.postDataBody.filtersCon, 0);
                } else {
                  if (geoJson) {
                    // localStorage.setItem('addGeoFun', 'undefined');
                    // localStorage.setItem('addGeoFun', 'fail');
                    this.appService.dataActionEventEmitter.emit({type: 'unionFail'});
                  }
                  const toastCfg = new ToastConfig(ToastType.ERROR, '', '合并失败,请稍后再试!', 2000);
                  this.toastService.toast(toastCfg);
                }
              },
              error => {
                toError(error);
              }
            );
          /*删除选取数据*/
          if (result === 'submit') {
            const delArray: any = [];
            const delData: any = {};
            for (let m = 0; m < geoJson.unionInfo.length; m++) {
              const info = geoJson.unionInfo[m].properties;
              for (const j of this.operationDel.key) {
                for (const i in info) {
                  if (i === j) {
                    delData[i] = info[i];
                    delArray.push({
                      [i]: info[i]
                    });
                  }
                }
              }
            }
            for (let i = 0; i < delArray.length; i++) {
              this.httpService.getData([delArray[i]], true,
                'execute', this.operationDel.url, '1')
                .subscribe(
                  data => {
                    if ((data as any).status > 0) {

                      this.totalPage = this.totalPage - 1;
                      this.totalProperty.emit(this.totalPage);


                      // const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 2000);
                      // this.toastService.toast(toastCfg);
                    } else {
                      // localStorage.setItem('removeGeoFun', 'undefined');
                      // localStorage.setItem('removeGeoFun', 'fail');
                      // 删除数据失败
                      this.appService.dataActionEventEmitter.emit({type: 'removeFail'});

                      const toastCfg = new ToastConfig(ToastType.ERROR, '', '删除失败,请稍后再试!', 5000);
                      this.toastService.toast(toastCfg);
                    }
                  },
                  error => {
                    toError(error);
                  }
                );
            }
          } else {
            this.appService.dataActionEventEmitter.emit({type: 'removeFail'});
          }
        } else {
          if (geoJson) {
            // localStorage.setItem('addGeoFun', 'undefined');
            // localStorage.setItem('addGeoFun', 'fail');
            this.appService.dataActionEventEmitter.emit({type: 'unionFail'});
          }
        }
      },
      (reason) => {
        if (geoJson) {
          // localStorage.setItem('addGeoFun', 'undefined');
          // localStorage.setItem('addGeoFun', 'fail');
          this.appService.dataActionEventEmitter.emit({type: 'unionFail'});
        }

      });
  }

  /**
   * 重置清除选择事假
   */
  cleanSelect() {
    this.btnDisabled.del = false;
    this.btnDisabled.update = false;
    this.updateIdArray = [];
    this.removeIdArray = [];
  }

  /**
   * 判断数组是否包含某一元素
   */
  inArray(needle: any) {
    for (const i of  this.geoEntityColumnId) {
      if (i === needle) {
        return true;
      }
    }
    return false;
  }


  /**
   * 编辑geo
   * @param e
   */
  editGeo(e: any, n: any) {
    // if (!e || e === '') {
    //     this.chooseImg(n);
    // }
  }


  /**
   * 格式化结构数据
   * @param data
   * @returns {any[]}
   */
  formatStructure(data: any) {
    const _formatData = [];
    this.structureHeader = ['名称', '类型', '长度', '精度', '别名', '允许空', '主键'];
    for (const index of data) {
      const component_data_type_id = index.component_data_type_id || 'fm_ui_input_text';
      const type = getComponentType(component_data_type_id);

      const uiBtn = index.primary_key || type === 'sys_ui_c_geo';
      _formatData.push({
        '名称': index.column_name,
        '类型': {type: type, component_data_type_id: component_data_type_id, config: index.config, disabled: uiBtn},
        '长度': index.character_maximum_length || index.NUMERIC_PRECISION || '-',
        '精度': index.numeric_scale || index.DATETIME_PRECISION || '-',
        '别名': index.description,
        '允许空': index.is_nullable,
        '主键': index.primary_key || '-',
        'entity_column_id': index.entity_column_id
      });
    }
    return _formatData;
  }


  /**
   * 同步结构
   * @param id
   * @param ui
   */
  syncStructure(id: any, ui: any) {
    for (const oa of  this.operationAdd.key) {
      if (oa.entity_column_id === id) {
        oa.type = ui.component_data_type_id;
        oa.config = ui.config;
      }
    }

    for (const ou of  this.operationUpdate.key) {
      if (ou.entity_column_id === id) {
        ou.type = ui.component_data_type_id;
        ou.config = ui.config;
      }
    }
  }


  /**
   * 结构配置时的数据类型提取
   * @param e
   */
  structureConfig(i: any) {
    let name = '';
    let result = null;
    if (i.config && isArray(i.config)) {
      for (const v of i.config) {
        name = v.name;
        if (v.attr_value_type === 'boolean') {
          result = v.component_attr_value === 'true' || v.value === true ? true : false;
        }

        if (v.attr_value_type === 'number') {
          result = Number(v.component_attr_value);
        }

        if (v.attr_value_type === 'varchar') {
          result = v.component_attr_value;
        }

        if (v.attr_value_type === 'json') {
          result = v.component_attr_value;
        }
      }
    }
    return [name, result];
  }
}
