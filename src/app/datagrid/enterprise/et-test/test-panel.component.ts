import {Component, OnInit, ViewChild, Input} from '@angular/core';

import {HttpService} from '../../../s-service/http.service';
import {FilterComponent} from '../../filter/filter.component';
import {GridComponent} from '../../grid/grid.component';


@Component({
  selector: 'test-panel',
  templateUrl: './test-panel.component.html',
  styleUrls: ['./test-panel.component.scss']
})
export class TestPanelComponent implements OnInit {
  @ViewChild('static', {static: false}) staticFilter: FilterComponent;

  @ViewChild(GridComponent, {static: false}) gridCom: GridComponent;

  @Input() pageConfig: any; // 页面配置
  @Input() eventData: any; // 测试数据
  @Input() strucrtorData: any[]; // 结构数据

  dataConfig: any;

  showFilter: boolean;

  operation = {
    add: false,
    remove: false,
    update: false
  }; // 该数据拥有的操作权限：新增、删除

  btnDisabled = {
    del: false,
    update: false
  };
  operationConfig: any; // 想下传递的操作数组
  filterConfig: any; // 查询方式可选字段
  filterArrayData: any;
  conjunction: string; // 查询方式1
  conjunctionSelect = [
    {
      key: '满足所有条件',
      value: 'and'
    }, {
      key: '任意条件',
      value: 'or'
    },
    {
      key: '不满足任意条件',
      value: 'not'
    }
  ];


  // 数据源结构信息
  // strucrtorData: any[];


  totalProperty = 0; // 表格数据总数


  geoType: any;

  constructor(private httpService: HttpService) {
  }

  /*
   * 初始化
   */
  ngOnInit() {
    // 右侧查询条件初始化
    this.filterArrayData = [];
    this.conjunction = 'and';

    this.showFilter = true;
    this.dataConfig = {geo_type: 0, description: '名称'};
    this.geoType = 0;


    // 查询数据操作方式内容
    if (this.eventData.type === 'query' || this.eventData.type === 'selects' || this.eventData.type === 'select') { // 删除

      if (this.eventData.service_event_parameters.length > 0) {
        this.dataConfig = this.eventData.service_event_parameters[0];
        this.geoType = this.dataConfig.geo_type;
      }
      if (this.eventData.service_event_config) {
        this.filterConfig = this.getOpData('filter', this.eventData.service_event_config); // 过滤字段
        this.operationConfig = this.eventData.service_event_config;  // 数据操作方式
      }


    } else {

      this.getDataSourceInfo();  // 查询过滤信息


      // 查询过滤信息
      // this.getFilterInfo();  // 查询过滤字段


      this.getDataAction();  // 查询数据操作方式
    }

  }

  // 查询数据信息
  getDataSourceInfo() {
    this.httpService.getData({'entity_id': this.pageConfig.entity_id},
      true, 'execute', 'daaf02c3-a323-4445-9446-ab3136a77f3c', '1')
      .subscribe(
        data => {
          this.dataConfig = (data as any).data;
          this.geoType = this.dataConfig.geo_type;
        },
        error => {
        }
      );
  }


  /**
   * 查询过滤信息
   */
  // getFilterInfo() {
  //     this.httpService.getData({'service_event_parameters_id': this.pageConfig.service_event_parameters_id},
  //         true, 'execute', '586bc5f4-a7c5-491b-8137-fc399a78bcad', '1')
  //         .subscribe(
  //             data => {
  //                 // ;
  //                 this.filterConfig = (data as any).data;
  //             },
  //             error => {
  //             }
  //         );
  // }


  /**
   * 查询数据操作方式内容
   */
  getDataAction() {


    this.httpService.getData({'entity_id': this.pageConfig.entity_id},
      true, 'execute', '62d3a388-c291-43cc-8a5e-7e4e35e5e7cd', '1')
      .subscribe(
        data => {
          this.operationConfig = [];
          if (this.eventData) {
            if (this.eventData.type === 'delete') { // 删除
              this.operation.remove = true;
            } else if (this.eventData.type === 'update') {
              this.operation.update = true;
            } else if (this.eventData.type === 'insert') {
              this.operation.add = true;

            }

            const result = this.getOpData('result', (data as any).data);
            this.filterConfig = this.getOpData('filter', (data as any).data);
            this.operationConfig = this.eventData.service_event_config.concat(result);
          }

        },
        error => {
        }
      );
  }


  getOpData(type: any, data: any) {
    const opdata = [];
    for (const i of data) {
      if (i.config_type === type) { // 删除时的接口以及索引key
        opdata.push(i);
      }
    }

    return opdata;
  }


  /*
  * 数据信息输入框监测回车事件
  * */
  inputName(e: any) {
    if (e.keyCode === 13) {
      e.target.blur();
    }
  }


  /*
  * 修改查询方式
  * */
  // changeConjunction(e: any) {
  //     const postBody = {
  //         expression: {
  //             filters: this.filterArrayData,
  //             conjunction: this.conjunction
  //         },
  //         service_event_parameters_id: this.pageConfig.service_event_parameters_id
  //     }
  //
  //     this.httpService.getData(postBody,
  //         true, 'execute', 'b3edb109-2a6d-4fd0-9cca-8635b6804aad', '1')
  //         .subscribe(
  //             data => {
  //                 console.log(data)
  //             },
  //             error => {
  //                 console.log(error)
  //             }
  //         );
  // }

  changeConjunction() {
    const postBody = {
      conjunction: this.conjunction,
      service_event_id: this.pageConfig.service_event_id
    };

    this.httpService.getData(postBody,
      true, 'execute', '4b0c5664-9d6b-47f5-ade9-0dd066798f63', '1')
      .subscribe(
        data => {
        },
        error => {
        }
      );
  }


  /*
  * 右侧查询条件添加
  * */
  addFilterCon() {
    this.staticFilter.addFilter();
  }

  /*
  * 右侧重置按钮查询
  * */
  removeAllFilter() {
    this.filterArrayData = [];
    this.searchFilter();
    // this.gridCom.cleanSelect();
  }

  /*
  * 右侧搜索按钮点击
  * */
  searchFilter() {
    this.gridCom.getGridData(this.conjunction, this.filterArrayData, 0);
    this.gridCom.cleanSelect();
    this.btnDisabled.del = false;
    this.btnDisabled.update = false;
  }

  /*
  * 表格数据删除按钮点击事件
  * */
  delGridData() {
    this.gridCom.removeGridData();
    // this.gridCom.cleanSelect();
  }


  /*
  * 表格数据新增按钮点击事件
  * */
  addNewData() {
    this.gridCom.addNewGriddata();
  }


  /*
  * 修改数据
  * */
  updateGridData() {
    this.gridCom.updateGriddate();
  }


  // 深copy
  deepCopy(arr: any[]) {

    const filterData = [];


    for (const i of arr) {
      filterData.push({
        service_event_config_id: i.service_event_config_id,
        rule: i.rule,
        value: i.value,
        data_type: i.data_type
      });
    }


    return filterData;
  }


  // 更新条目总数
  setTotalProperty(e: any) {
    this.totalProperty = e;
  }

  test() {
    this.geoType = 30;
  }
}
