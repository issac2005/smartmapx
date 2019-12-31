import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {SmxModal} from '../../../smx-component/smx-modal/smx-modal.module';
import {HttpService} from '../../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';
import {PlatformLocation} from '@angular/common';
import {AppModalComponent} from '../../../modal/app-modal.component';
import {GridModalComponent} from '../../modal/grid-modal.component';
import {deepCopy} from '../../../smx-component/smx-util';
import {SMXNAME} from '../../../s-service/utils';


@Component({
  selector: 'et-page',
  templateUrl: './etpage.component.html',
  styleUrls: ['./etpage.component.scss']
})
export class EtPageComponent implements OnInit, OnDestroy {
  // @Input() pageType: any;   // 方案类型
  @Input() strucrtorData: any[];  // 数据参数
  @Input() operationConfig: any[];  // 数据参数
  @Input() pageConfig: any;  // 数据源相关参数
  @Input() filterConfig: any; // 过滤字段


  @Output() initializeData = new EventEmitter();
  @Output() submitSuccess = new EventEmitter();
  testUrl: any;
  searchUrl: any;
  pageType: any;
  operationType: any;

  // 原始数据
  event_data: any;
  operationSource: any[]; // 数据源操作结构

  // 接口类型
  operation: any; // 全量返回
  operationTwo: any; // key


  conjunction: string; // 查询方式
  filterArrayData: any[] = [];
  // filterConfig: any[];

  conjunctionSelect = [
    {
      label: '满足所有条件',
      value: 'and'
    }, {
      label: '任意条件',
      value: 'or'
    },
    {
      label: '不满足任意条件',
      value: 'not'
    }
  ];

  selectTwoGroup = [
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
      name: '大于',
      operator: 'rex',
      data_type_rule_id: '7a70bbfb-adc8-4478-a843-b8fca82cbd2e'
    }, {
      name: '小于',
      operator: 'rex',
      data_type_rule_id: '98d5c4e3-bf58-48d8-9421-5543244da610'
    },
    // {
    //   name: '值替换',
    //   operator: 'rex',
    //   data_type_rule_id: 'ef27a63c-5113-4e39-aa38-16918324235a'
    // }
    /*, {
            name: '区间',
            operator: 'rex',
            data_type_rule_id: '596dd14b-a9e1-4344-90c0-dce71a530c2e'
        }*/
  ];


  checkEditItemId = '';
  checkEditItemId2 = '';
  checkEditItemId3 = '';

  service_event_id: any;
  htmlEditor: any;

  loadStatus = false; // 加载数据状态

  permission: any; // 修改权限

  // 方案编辑相关
  modalTitle: any = {
    'query': '选择返回参数',
    'select': '选择返回参数',
    'selects': '选择返回参数',
    'filter': '选择动态参数',
    'delete': '选择删除依据key',
    'insert': '选择插入字段',
    'update': '选择修改字段',
    'updateKey': '选择修改依据Key',
  };

  constructor(private httpService: HttpService,
              private ngbModalService: SmxModal,
              public toastService: ToastService,
              private location: PlatformLocation) {
  }


  ngOnInit() {
    this.operationSource = [];
    for (const v of this.strucrtorData) {
      v['alias'] = v.name;
      this.operationSource.push(v);
    }

  }


  ngOnDestroy() {
    // if (this.htmlEditor) {
    //   this.htmlEditor.container.remove();
    // }
  }

  getRuleTitle(id: any) {
    for (const v of this.selectTwoGroup) {
      if (v.data_type_rule_id === id) {
        return v.name;
      }
    }
  }

  getDescTitle(id: any) {
    for (const v of this.filterConfig) {
      if (v.entity_column_id === id) {
        // ;
        return v.description ? v.description : v.description;
      }
    }
  }

  // 初始化参数
  initData(id: any, InterfaceType: any, operationType: any, permission: any) {
    this.testUrl = (this.location as any).location.origin + '/services/1.0.0/testExecute/' + id;
    this.searchUrl = (this.location as any).location.origin + '/services/1.0.0/execute/' + id;
    this.loadStatus = false;
    this.pageType = InterfaceType; // 接口类型
    this.operationType = operationType; // 操作类型
    this.service_event_id = id;
    this.permission = permission;

    // 初始化数据
    this.operation = {key: [], oldKey: []};
    this.operationTwo = {key: [], oldKey: []};
    this.conjunction = 'and';
    this.filterArrayData = [];
    if (this.operationType !== 2) {
      this.httpService.getData({service_event_id: this.service_event_id},
        true, 'execute', 'fc6cfb1a-253b-4bb6-bfe0-33a13dab9dbc', '1')
        .subscribe(
          data => {

            if ((data as any).status < 0) {
              return;
            }

            // todo  description
            this.event_data = (data as any).data.event_data;

            // 数据整理
            this.reorganizeData();
            this.setValues();

          },
          error => {
          }
        );
    } else {
      // this.operationType = 1;
      this.event_data = {
        entity_id: this.pageConfig.entity_id,
        service_event_parameters: [],
        service_event_config: [],
        type: InterfaceType
      };
      this.reorganizeData();
      this.setValues();
    }
    // setTimeout(() => {
    //   // const myTextarea = document.getElementById('htmlEditor');
    //   // ace.config.set('basePath', CDN);
    //   if (!this.htmlEditor) {
    //     this.htmlEditor = ace.edit('htmlEditor', {
    //       theme: 'ace/theme/xcode',
    //       mode: 'ace/mode/html',
    //       fontSize: 14,
    //       fontFamily: 'monospace',
    //       readOnly: true,
    //     });
    //     // this.htmlEditor = CodeMirror.fromTextArea(myTextarea, {
    //     //   mode: 'javascript',
    //     //   lineNumbers: true,
    //     //   tabSize: 4,
    //     //   indentUnit: 4,
    //     //   foldGutter: true,
    //     //   gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    //     //   scrollbarStyle: 'overlay',
    //     //   styleActiveLine: true
    //     // });
    //     this.setValues();
    //   } else {
    //     this.setValues();
    //   }
    // }, 500);


  }


  // 整理数据
  reorganizeData() {
    // 返回
    for (const v of this.event_data.service_event_config) {
      if (v.config_type === 'result' || v.config_type === 'delete' || v.config_type === 'insert' || v.config_type === 'update') {
        this.operation.key.push(v);
        this.operation.oldKey.push(v);
      } else if (v.config_type === 'filter') {
        this.operationTwo.key.push(v);
        this.operationTwo.oldKey.push(v);
      } else if (v.config_type === 'updateKey') {

        this.operationTwo.key.push(v);
        this.operationTwo.oldKey.push(v);
      } else if (v.config_type === 'filtration') {
        this.conjunction = v.conjunction;
        this.filterArrayData.push(v);
      }
    }
    this.loadStatus = true;
  }


  // 添加字段key
  insertKey(data: any, type: any) {
    const serviceEventConfig = deepCopy(this.operationSource);
    switch (type) {
      case 'query':
      case 'select':
      case 'selects':
        for (const l of  serviceEventConfig) {
          l['config_type'] = 'result';
        }
        break;
      default:
        for (const l of  serviceEventConfig) {
          l['config_type'] = type;
        }
    }


    const modalRef = this.ngbModalService.open(GridModalComponent, {
      backdrop: 'static',
      centered: true,
      keyboard: false,
      enterKeyId: 'smx-gridModal'
    });
    modalRef.componentInstance.type = 7;
    modalRef.componentInstance.config = {title: this.modalTitle[type]};
    modalRef.componentInstance.mData = {operationSource: serviceEventConfig, operationData: data.key};
    modalRef.result.then((result: any) => {
      for (const v of result) {
        if (!v.alias) {
          v.alias = v.column_name;
        }
      }
      if (data === 'operationTwo') {
        this.operationTwo.key = result;
      }

      if (data === 'operation') {
        this.operation.key = result;
      }
    }, (reason: any) => {
    });
  }

  // 删除字段Key
  deleteKey(n: any, keyData: any) {
    const index = keyData.key.indexOf(n);
    keyData.key.splice(index, 1);
  }

  // 添加请求参数
  addCondition(tag?: any) {
    this.filterArrayData.push({
      data_type: this.filterConfig[0].data_type,
      data_type_rule_id: '4f1392a2-491f-42b3-81ff-73f3f98e555b',
      entity_column_id: this.filterConfig[0].entity_column_id,
      value: '',
      service_event_id: this.filterConfig[0].service_event_id,
      conjunction: this.conjunction,
      config_type: 'filtration'
    });
  }


  // 删除请求参数
  removeCondition(v: any, data: any) {
    const index = data.indexOf(v);
    data.splice(index, 1);
  }


  // 切换操作模式
  operationMode(tag: any) {
    // ;
    if (tag === 'switch') {
      this.operationType = 1;
    } else if (tag === 'close') {
      const modalRef = this.ngbModalService.open(AppModalComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-app'});
      modalRef.componentInstance.config = {title: '退出确认', view: '是否保存尚未完成操作?'};
      modalRef.result.then((result: any) => {
        this.submit(result);
      }, (reason: any) => {
        this.submit('cancel'); // 取消修改
      });

    }
  }


  // 过滤条件切换
  filterChanged(e: any, val: any) {
    for (const v of this.filterConfig) {
      if (v.entity_column_id === e) {
        val.data_type = v.data_type;
        return;
      }
    }

  }


  transformData(tag: any, baseData: any[]) {
    let data;
    switch (tag) {
      case 'query':
      case 'delete':
      case 'insert':
      case 'update':
        this.operation.key = [];
        data = this.operation.key;
        break;
      case 'updateKey':
        this.operationTwo.key = [];
        data = this.operationTwo.key;
        break;
    }

    for (const v of baseData) {
      data.push(v);
    }
  }


  // 选择条目
  checkedItem(id: any, tag: any) {
    if (tag === 1) {
      this.checkEditItemId = id;
    } else if (tag === 2) {
      this.checkEditItemId2 = id;

    } else if (tag === 3) {
      this.checkEditItemId3 = id;

    }

  }


  // 取消条目选择
  cancelEdit() {
    this.checkEditItemId = '';
    this.checkEditItemId2 = '';
    this.checkEditItemId3 = '';
  }

  // 操作日志
  operationLog(tag: any, e: any) {
    switch (tag) {

    }
  }

  // 提交
  submit(flag: any) {

    this.event_data.service_event_config = {};
    if (flag === 'submit') {// 确认
      if (this.event_data.description) {
        const test = SMXNAME.REG.test(this.event_data.name);
        if (!test) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
          this.toastService.toast(toastCfg);
          return;
        }
      } else {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '名称不能为空!', 3000);
        this.toastService.toast(toastCfg);
        return;
      }

      if (this.pageType === 'query' || this.pageType === 'selects' || this.pageType === 'select') {
        for (let i = 0; i < this.filterArrayData.length; i++) {
          if (this.filterArrayData[i].value === null || this.filterArrayData[i].value === '') {
            this.filterArrayData.splice(i, 1);
          } else {
            this.filterArrayData[i].conjunction = this.conjunction;
          }
        }

        // for (const v of this.filterArrayData) {
        //     this.event_data.service_event_config.push(v);
        // }
        this.event_data.service_event_config = this.operation.key.concat(this.filterArrayData).concat(this.operationTwo.key);
      } else if (this.pageType === 'update') {
        this.event_data.service_event_config = this.operation.key.concat(this.operationTwo.key);
      } else {
        this.event_data.service_event_config = this.operation.key;
      }


      this.httpService.getData(this.event_data,
        true, 'etl', 'inOrUpServiceEvent', '1')
        .subscribe(
          data => {
            if ((data as any).status > 0) {
              const res = {
                data: this.event_data,
                tag: this.operationType
              };
              this.submitSuccess.emit(res); // 修改添加成功
              this.operationType = 0; // 切换查看模式
            }
          },
          error => {
          }
        );


    } else if (flag === 'cancel') { // 取消
      if (this.operationType === 1) { // 修改取消
        switch (this.pageType) {

          case 'delete':
          case 'insert':
            this.transformData('query', this.operation.oldKey);
            break;
          case 'update':
          case 'query':
          case 'selects':
          case 'select':
            this.transformData('update', this.operation.oldKey);
            this.transformData('updateKey', this.operationTwo.oldKey);
            break;

        }
      } else if (this.operationType === 2) { // 新建取消
        this.initializeData.emit();
      }

      this.operationType = 0; // 切换查看模式
    }


  }


  /**
   * 测试接口
   */
  testInterface() {


    const modalRef = this.ngbModalService.open(GridModalComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-gridModal'});
    modalRef.componentInstance.type = 5;
    modalRef.componentInstance.config = {title: '方案测试'};
    modalRef.componentInstance.strucrtorData = this.strucrtorData;


    if (this.operationType !== 0) {
      const filterArrayData = deepCopy(this.filterArrayData);
      const event_data = deepCopy(this.event_data);
      if (this.pageType === 'query' || this.pageType === 'selects' || this.pageType === 'select') {
        for (let i = 0; i < filterArrayData.length; i++) {
          if (filterArrayData[i].value === null || filterArrayData[i].value === '') {
            filterArrayData.splice(i, 1);
          } else {
            filterArrayData[i].conjunction = this.conjunction;
          }
        }
        event_data.service_event_config = this.operation.key.concat(filterArrayData).concat(this.operationTwo.key);
      } else if (this.pageType === 'update') {
        event_data.service_event_config = this.operation.key.concat(this.operationTwo.key);
      } else {
        event_data.service_event_config = this.operation.key;
      }

      modalRef.componentInstance.mData = {pageConfig: this.pageConfig, eventData: event_data};
    } else {
      modalRef.componentInstance.mData = {pageConfig: this.pageConfig, eventData: this.event_data};
    }


    // modalRef.componentInstance.pageConfig = this.pageConfig;
    // modalRef.componentInstance.eventData = this.event_data;
  }

  /*
  * 设置代码*/
  setValues() {
    const params = {
      token: '',
      tag: '1',
      data: {}
    };
    const data = this.event_data.service_event_config;
    for (let i = 0; i < data.length; i++) {
      // if (data[i].data_type === 'postgres_integer' || data[i].data_type === 'postgres_numeric' ||
      //   data[i].data_type === 'postgres_bigint' || data[i].data_type === 'postgres_smallint' ||
      //   data[i].data_type === 'postgres_double_precision') {
      // todo 判断条件待确定
      if (data[i].model === 'fm_ui_input_integer' || data[i].model === 'fm_ui_input_decimal') {
        params.data[data[i].name] = 0;
      } else {
        params.data[data[i].name] = '';
      }
    }
    if (this.pageType === 'insert') {
      delete (params.data as any).system_id;
    } else if (this.pageType === 'delete') {
      params.data = [{system_id: ''}];
    } else if (this.pageType === 'update') {

    } else {
      params.data = {
        conjunction: 'and',
        filters: [
          {
            rule: '',
            service_event_config_id: '',
            value: ''
          }
        ],
        service_event_parameters_id: this.service_event_id
      };
    }
    this.htmlEditor = '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '    <meta charset="UTF-8">\n' +
      '    <title>测试</title>\n' +
      '</head>\n' +
      '<body>\n' +
      '<script type="text/javascript" src="http://dev.smartmapx.com/map/api/js/jquery.min.js"></script>\n' +
      '<script type="text/javascript">\n' +
      '    params=' + JSON.stringify(params, null, 2) + '\n' +
      '    $.ajax({\n' +
      '        //正式环境接口\n' +
      '        // url : \'' + this.searchUrl + '\',\n' +
      '        //测试环境接口\n' +
      '        url : \'' + this.testUrl + '\',\n' +
      '        data: {"parameter": JSON.stringify(params)},\n' +
      '        dataType : \'jsonp\',\n' +
      '        success : function (response, status, xhr) {\n' +
      '            console.log(response);\n' +
      '        }\n' +
      '    });\n' +
      '</script>\n' +
      '</body>\n' +
      '</html>';
  }
}
