import {Component, OnInit, ViewChild, Input, OnDestroy, ViewChildren, ElementRef} from '@angular/core';
import {HttpService} from '../s-service/http.service';
import {FilterComponent} from './filter/filter.component';
import {GridComponent} from './grid/grid.component';
import {SmxModal} from '../smx-component/smx-modal/smx-modal.module';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';
import {ActivatedRoute, Router} from '@angular/router';
import {PopueComponent} from '../data/modal/data-popue.component';
import {AppService} from '../s-service/app.service';
import {GridModalComponent} from './modal/grid-modal.component';
import {DataStorage, LocalStorage} from '../s-service/local.storage';
import {TaskManageService} from '../c-main/task-manager/task-manage.service';
import {deepCopy, toError, toLog} from '../smx-component/smx-util';
import {SMXNAME} from '../s-service/utils';
import {addMapControl, getMapInstance} from '../s-service/smx-map';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-body.component.html',
  styleUrls: ['./data-body.component.scss']
})
export class DataGridComponent implements OnInit, OnDestroy {
  @ViewChild('filter', {static: false}) filterCom: FilterComponent;
  @ViewChild('filter2', {static: false}) filterCom2: FilterComponent;
  @ViewChild(GridComponent, {static: false}) gridCom: GridComponent;
  @Input() pageConfig: any; // 页面配置

  addressFilter1: any []; // 临时接收地址匹配过滤条件
  addressFilter2: any []; // 临时接收地址匹配过滤条件

  midFilter: any; // 用于回显地址匹配和逆地理编码上一步的过滤条件

  componentType: any; // 组件类型


  pageType: number; // 当前页面显示类型：1表信息、2表结构
  dataConfig: any;

  showFilter: boolean;

  filterConfig: any; // 过滤下拉可选数据


  filterArrayData: any; // 数据源数据过滤
  conjunction: string; // 数据源查询方式

  filterArrayDataTwo: any; // 本地数据过滤
  conjunction2: string; // 本地查询方式

  staBestVision: any = false; // 统计专题添加最佳视野

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

  conjunctionSelect = [
    {
      key: '满足所有条件',
      value: 'and'
    }, {
      key: '任意条件',
      value: 'or'
    }, {
      key: '不满足任意条件',
      value: 'not'
    }
  ];

  totalProperty = 0; // 表格数据总数

  // *************************************数据拆分合并start****************************************** //

  filterData: any[] = [];
  filterDataByAnd: any[] = [];
  filterDataByOr: any[] = [];
  filterDataByNot: any[] = [];


  strucrtorData: any[]; // 数据源结构原始信息

  sc_strucrtorData: any[]; // 拆分合并数据源结构信息
  c_strucrtorData: any[]; // 合并目标数据结构信息


  // 合并数据信息
  combineSourceInfo: any;


  combineBtn: any;

  geoType: any;


  // ******************************************************************************************** //
  closeResult: string;
  maploaded = false;  // 地图加载状态


  mapStyle: any; // 地图样式

  layerStyle: any; // 统计图层样式
  staType: any;
  bounds: any;     // 最佳视野范围
  panelShow: any = false;

  // 切换底图
  postData: any;


  layerIndex: any; // 统计图索引

  map: any; // 地图对象

  statisticsEvent: any;
  unDataAction: any;

  // 逆地理编码点数据标识
  reverseGeocodingBtn: any;

  // 地址匹配点数据和属性数据标识
  geocodingBtn: any;

  // ------------------------------------------------------数据结构----------------------------------------//
  // dataStructure: any = [];


  // 修改数据源信息加载方式
  entity_id: any;

  smxData: any[];
  serverlist = {};
  geoTooltip = '';
  regeoTooltip = '';
  @ViewChild('dataFilter', {static: false}) dfTemplate: ElementRef;   // 数据过滤
  @ViewChild('dataAction', {static: false}) daTemplate: ElementRef;   // 数据操作
  constructor(private httpService: HttpService,
              private ngbModalService: SmxModal,
              private toastService: ToastService,
              private activatedRoute: ActivatedRoute,
              public router: Router,
              private appService: AppService,
              private tmService: TaskManageService,
              private ds: DataStorage,
              private ls: LocalStorage) {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      const pageType = queryParams.type;
      this.entity_id = queryParams.entity_id;
      this.pageConfig = null;
      this.operationConfig = null;

      switch (pageType) {
        case '4':
        case '5':
        case '6':
          this.componentType = pageType;
          break;
        default:
          this.router.navigate(['']);
      }

      // 重新初始化数据
      this.initCnfig();
    });

    this.statisticsEvent = this.appService.statisticsEventEmitter.subscribe((value: any) => {
      this.map.setStyle(this.mapStyle, {diff: true});
    });

    // 统计图地图geojson刷新
    this.unDataAction = this.appService.dataActionEventEmitter.subscribe((value: any) => {
      if (value && this.map) {
        if (value.type === 'addSuccess' || value.type === 'updateSuccess' || value.type === 'removeSuccess') {
          this.map.getSource(this.layerStyle[0].source).setData(this.mapStyle.sources[this.layerStyle[0].source].data);
          if (this.staType === '7154b538-3257-4c51-b1ec-cbfacafb05e5') {
            this.map.setStyle(this.mapStyle, {diff: false});
          }


        }

      }
    });

  }

  /*
   * 初始化
   */
  ngOnInit() {
    this.serverlist = this.ds.get('serverlist'); // 获取服务列表
    // ;
    if (!(this.serverlist as any).geo) {
      this.geoTooltip = '需要购买地址匹配服务';
    }

    if (!(this.serverlist as any).regeo) {
      this.regeoTooltip = '需要购买逆地理编码服务';
    }
  }


  // 初始化配置
  initCnfig(): void {
    if (this.entity_id) {
      this.httpService.getData({entity_id: this.entity_id}, true, 'execute', '4e253571-1b01-4a5c-b6be-e916cc753da5', 'data').subscribe(
        data => {
          this.pageConfig = (data as any).data;
          this.pageConfig.visit_type = 0;
          this.pageConfig['entity_type'] = this.pageConfig.geo_type === 0 ? 1 : 2;
          this.pageConfig['data_type'] = 'mydata';
          this.init();
        }, error => {

        }
      );
    } else {
      this.pageConfig = this.ls.getObject('data_info');
      this.init();
    }

  }


  ngOnDestroy() {
    this.statisticsEvent.unsubscribe();
    if (this.map) {
      this.map.remove();
    }
  }


  /**
   * 初始化
   */
  init() {
    this.staBestVision = false;
    this.filterArrayDataTwo = [];
    this.conjunction2 = 'and';

    this.showFilter = true;
    this.pageType = 1;


    // 获取数据
    this.getDataSourceInfo();
    this.getDataAction();
    this.getGridStructure();
    this.dataConfig = {geo_type: 0, description: '名称', isedte: 1};
    switch (this.componentType) {
      case '4':
        this.initData();
        break;
      case '5':
        this.staType = this.pageConfig.sta_type; // 统计图类型
        this.staBestVision = true;
        this.initMap();
        break;
    }
  }


  /**
   * 面板初始化
   */
  panelInit() {
    switch (this.componentType) {
      case '4':
        this.smxData = [
          {
            title: '数据源信息',
            active: true,
            view: [
              {
                title: '名称',
                value: this.dataConfig.description,
                input: this.pageConfig.visit_type === 0 && this.pageConfig.data_type === 'mydata' ? (event) => {
                  this.changeName(event);  // 修改名称
                } : false
              },
              {
                title: '类型',
                value: this.dataConfig.geo_type,
                pipe: 'dataType',
                btn: this.dataConfig.geo_type <= 0 && this.dataConfig.type !== 'view' && this.pageConfig.visit_type === 0 ? {
                    btnClick: () => {
                      this.openTransform(); // 转换空间数据
                    }, label: '转空间数据'
                  } :
                  false
              },
              {title: '空间属性', value: this.dataConfig.geo_type, pipe: 'geoType'},
              {title: '表类型', value: this.dataConfig.type, pipe: 'tableType'},
            ]
          }
        ];

        if (this.pageConfig.visit_type === 0) {
          this.smxData.push({
            title: '数据源过滤',
            active: true,
            type: 'custom',
            view: this.dfTemplate
          });
          this.smxData.push({
            title: '数据源应用',
            active: true,
            type: 'custom',
            view: this.daTemplate
          });
        }
        break;
      case '5':
        this.smxData = [
          {
            title: '图层信息',
            active: true,
            view: [
              {
                title: '样式名称',
                value: this.pageConfig.layer_style_name,
                input: this.pageConfig.visit_type === 0 ? (event) => {
                  this.changeName(event, 'layer_style'); // 修改样式名称
                } : false
              },
              {
                title: '图层名称',
                value: this.pageConfig.name,
                input: this.pageConfig.visit_type === 0 ? (event) => {
                  this.changeName(event, 'layer');  // 修改图层名称
                } : false
              },
              {
                title: '数据源名称',
                value: this.dataConfig.description,
                icon: this.dataConfig.type === 'view' || (this.dataConfig.isedit === 1 ? false : true)
              },
              {title: '空间属性', value: this.dataConfig.geo_type, pipe: 'geoType'}
            ]
          }
        ];
        break;
      case '6':
        this.smxData = [
          {
            title: '图层信息',
            active: true,
            view: [
              {
                title: '样式名称',
                value: this.pageConfig.layer_style_name,
                input: this.pageConfig.visit_type === 0 ? (event) => {
                  this.changeName(event, 'layer_style'); // 修改样式名称
                } : false
              },
              {
                title: '图层名称',
                value: this.pageConfig.name,
                input: this.pageConfig.visit_type === 0 ? (event) => {
                  this.changeName(event, 'layer');  // 修改图层名称
                } : false
              },
              {
                title: '数据源名称',
                value: this.dataConfig.description,
                icon: this.dataConfig.type === 'view' || (this.dataConfig.isedit === 1 ? false : true)
              },
              {title: '空间属性', value: this.dataConfig.geo_type, pipe: 'geoType'}
            ]
          }
        ];
        break;
    }

  }

  // 数据初始化
  initData() {
    if (this.pageConfig.geo_type === '') {
      this.combineBtn = true;
    } else {
      this.combineBtn = false;
    }

    // 点数据判断
    if (this.pageConfig.geo_type === 'POINT') {
      this.reverseGeocodingBtn = true;
    } else {
      this.reverseGeocodingBtn = false;
    }

    // 点数据和属性数据判断
    if (this.pageConfig.geo_type === 'POINT' || this.pageConfig.geo_type === '') {
      this.geocodingBtn = true;
    } else {
      this.geocodingBtn = false;
    }
  }


  /**
   * 查询数据源过滤相关配置
   */
  getDataSourceInfo() {
    this.httpService.getData({'service_event_id': this.pageConfig.service_event_id},
      true, 'execute', '79af7c82-059f-43ab-9551-18342593a74e', 'filter')
      .subscribe(
        data => {
          if ((data as any).data && (data as any).data.length > 0) {
            this.conjunction = (data as any).data[0].conjunction;
            this.filterArrayData = (data as any).data;
          } else {
            this.conjunction = 'and';
            this.filterArrayData = [];
          }
        },
        error => {
          toError(error);
        }
      );


    this.httpService.getData({'entity_id': this.pageConfig.entity_id},
      true, 'execute', 'daaf02c3-a323-4445-9446-ab3136a77f3c', '1')
      .subscribe(
        data => {
          this.dataConfig = (data as any).data;
          this.geoType = this.dataConfig.geo_type;
          if (this.dataConfig.isedit === 0) {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '您没有此图层数据的编辑权限,所以您将无法操作数据!', 5000);
            this.toastService.toast(toastCfg);
          }

          this.panelInit();
        },
        error => {
          toError(error);
        }
      );
  }


  /**
   * 查询过滤信息
   */
  getFilterInfo() {
    this.httpService.getData({'entity_id': this.pageConfig.entity_id},
      true, 'execute', '586bc5f4-a7c5-491b-8137-fc399a78bcad', '1')
      .subscribe(
        data => {
          this.filterConfig = (data as any).data;
        }, error => {
        }
      );
  }


  /**
   * 查询数据配置(增删改查)
   */
  getDataAction() {
    this.httpService.getData({'entity_id': this.pageConfig.entity_id},
      true, 'execute', '62d3a388-c291-43cc-8a5e-7e4e35e5e7cd', '1')
      .subscribe(
        data => {

          // this.conjunction = 'and';
          const filterData = [];
          for (const i of (data as any).data) {
            if (i.config_type === 'operation') { // 表格操作权限
              if (i.model === 'delete') {
                this.operation.remove = true;
              } else if (i.model === 'insert') {
                this.operation.add = true;
              } else if (i.model === 'update') {
                this.operation.update = true;
              }
            } else if (i.config_type === 'filtration') {
              this.conjunction = i.conjunction;
            } else if (i.config_type === 'filter') {
              filterData.push(i);
            }
          }

          this.filterConfig = filterData;
          this.operationConfig = (data as any).data;

        },
        error => {
        }
      );
  }


  /**
   * 查询数据源结构相关配置
   */
  getGridStructure(id?: any) {
    const body = ({} as any);
    if (id) {
      body.service_event_id = id;
    } else {
      body.service_event_id = this.pageConfig.service_event_id;
      body.entity_id = this.pageConfig.entity_id;
    }

    this.httpService.getData(body, true, 'execute', '7d334f95-fe30-4bd1-a184-5706947c8160', '1')
      .subscribe(
        data => {

          if ((data as any).status < 0) {
            return;
          }
          const filedData = [];
          // whx修改了name，description，column_desc,因为这3个字段undifined
          for (const i of (data as any).data) {
            filedData.push({
              name: i.column_name,
              description: i.description,
              use: false,
              ispk: false,
              column_desc: i.description,
              entity_column_id: i.entity_column_id,
              column_name: i.column_name,
              entity_id: i.entity_id
            });
          }
          if (id) {
            this.c_strucrtorData = filedData;
            this._dataCombine();
          } else {
            this.strucrtorData = (data as any).data;
            this.sc_strucrtorData = filedData;
          }

        },
        error => {
          toError(error);
        }
      );
  }

  /*
  * 格式化表格结构数据
  * */
  // formatStructure(data: any) {
  //   const _formatData = [];
  //   for (const index of data) {
  //     _formatData.push({
  //       '名称': index.name,
  //       '类型': index.data_type,
  //       '长度': index.precision,
  //       '精度': index.scale,
  //       '别名': index.description,
  //       '允许空': index.null_able,
  //       '主键': index.primary_key
  //     });
  //   }
  //   return _formatData;
  // }


  /*
  * 修改数据名称
  * */
  changeName(e: any, tag?: any) {
    const changedName = e;
    if (this.componentType === '4') {
      if (changedName === this.dataConfig.description) {
        return;
      }


      if (SMXNAME.REG.exec(changedName) == null) {
        // alert('输入有误，请重新输入！');
        const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
        this.toastService.toast(toastCfg);

        this.dataConfig.description = this.dataConfig.description + ' ';
        setTimeout(() => this.dataConfig.description = this.dataConfig.description.substring(0, this.dataConfig.description.length - 1));
        return false;
      }
      this.httpService.getData({
        'entity_id': this.pageConfig.entity_id,
        'description': changedName
      }, true, 'execute', '431f4042-16dd-41dd-9cff-69024084c3ca', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              // const toastCfg = new ToastConfig(ToastType.ERROR, '', '修改失败,请稍后再试!', 2000);
              // this.toastService.toast(toastCfg);
              this.dataConfig.description = this.dataConfig.description + ' ';
              setTimeout(() => this.dataConfig.description = this.dataConfig.description.substring(0, this.dataConfig.description.length - 1));
              return;
            }
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '数据源名称修改成功!', 2000);
            this.toastService.toast(toastCfg);
            this.dataConfig.description = changedName;
          },
          error => {
          }
        );
    }


    if (this.componentType === '5' || this.componentType === '6') {
      let url = '';
      let body: any;
      if (tag === 'layer') {
        if (changedName === this.pageConfig.name) {
          return;
        }

        url = '8e2a7de2-fe0c-404a-86fc-f9554f4f552e';
        body = {layer_id: this.pageConfig.layer_id, name: e, description: this.pageConfig.description};


      } else if (tag === 'layer_style') {
        if (changedName === this.pageConfig.layer_style_name) {
          return;
        }

        url = '99fc460d-7ca8-4efb-8f1d-96e6d9ca79c6';
        body = {name: e, layer_style_id: this.pageConfig.layer_style_id};


      }


      if (SMXNAME.REG.test(e)) {
        this.httpService.getData(body, true, 'execute', url, 'map')

          .subscribe(
            data => {

              if ((data as any).status < 0) {
                const toastCfg = new ToastConfig(ToastType.ERROR, '', '修改失败,请稍后再试！', 2000);
                this.toastService.toast(toastCfg);
                return;
              }

              if (tag === 'layer') {
                this.pageConfig.name = e;
                this.appService.layerNameEventEmitter.emit({tag: 'layer', value: e});
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '图层名称修改成功！', 2000);
                this.toastService.toast(toastCfg);
              }

              if (tag === 'layer_style') {
                this.pageConfig.layer_style_name = e;
                this.appService.layerNameEventEmitter.emit({tag: 'layer_style', value: e});
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '样式名称修改成功！', 2000);
                this.toastService.toast(toastCfg);
              }

              this.ls.setObject('data_info', this.pageConfig);

            },
            error => {
              toError(error);
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
              this.toastService.toast(toastCfg);
            }
          );
      } else {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
        this.toastService.toast(toastCfg);
        if (tag === 'layer') {
          e = this.pageConfig.name;
        } else if (tag === 'layer_style') {
          e = this.pageConfig.layer_style_name;
        }
      }
    }


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
  * 新增过滤点击事件
  * */
  toAddFilter() {
    this.filterCom.addFilter();
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
  //             },
  //             error => {
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
          toLog(data);
        },
        error => {
          toError(error);
        }
      );
  }


  changeConjunction2(e: any) {
    this.conjunction2 = e;
  }

  /*
  * 右侧查询条件添加
  * */
  addFilterCon() {
    this.filterCom2.addFilter();
  }

  /*
  * 右侧重置按钮查询
  * */
  removeAllFilter() {
    this.filterArrayDataTwo = [];
    this.searchFilter();
  }


  /*
  * 右侧搜索按钮点击
  * */
  searchFilter() {
    this.gridCom.checkAll({target: {checked: false}});
    this.gridCom.getGridData(this.conjunction2, this.filterArrayDataTwo, 0);
    this.gridCom.cleanSelect();
    this.btnDisabled.del = false;
    this.btnDisabled.update = false;
  }

  searchFilterLeft() {
    setTimeout(() => {
      this.searchFilter();
    }, 200);
  }

  /*
  * 表格数据删除按钮点击事件
  * */
  delGridData() {
    this.gridCom.removeGridData();
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


  /*
  *  返回按钮点击事件
  * */
  goBack(tag: any) {
    const goback = this.ls.get('goback_share');
    if (goback === '0') {
      this.ls.set('goback_share', '1');
    }


    if (tag === 'sta') {
      this.router.navigate(['/app/showstasf']);
    } else if (tag === 'geo') {
      this.router.navigate(['/app/showgeosf']);
    } else {
      this.router.navigate(['/app/showdata']);
      // history.go(-1);
    }
  }


  // ***************************************数据管理******************************************  //


  /*
  * 打开属性数据转空间数据modal
  * */
  openTransform() {
    const transformUseData = [];
    for (const i of this.operationConfig) {
      if (i.config_type === 'result') { // 显示字段
        transformUseData.push(i);
      }
    }
    const transformData = this.ngbModalService.open(GridModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-gridModal'});
    transformData.componentInstance.type = 4;
    transformData.componentInstance.displayData = transformUseData;
    transformData.componentInstance.mData = this.pageConfig;
    transformData.result.then(
      (result) => {
        this.pageConfig.entity_type = 2;

        switch (result) {
          case '10':
          case 10:
            this.pageConfig.geo_type = 'POINT';
            break;
          case '20':
          case 20:
            this.pageConfig.geo_type = 'LINESTRING';
            break;
          case '30':
          case 30:
            this.pageConfig.geo_type = 'POLYGON';
            break;
        }
        // this.combineBtn = false;

        // 重新初始化
        this.refreshData();
        // this.gridCom.initData();

      },
      (reason) => {
        toLog(reason);
      });
  }


  /**
   * 初始化页面
   */
  refreshData() {
    // 重新初始化
    this.operationConfig = null;
    this.init();
  }


  // 数据拆分
  // todo 数据拆分   v2.7.4需求改动
  dataSplit() {
    // if (this.conjunction === 'and') {
    //   if (this.conjunction2 === 'and') {
    //     this.filterDataByAnd = deepCopy(this.filterArrayDataTwo);
    //   } else {
    //     this.filterDataByAnd = deepCopy(this.filterArrayData);
    //     this.filterDataByOr = deepCopy(this.filterArrayDataTwo);
    //   }
    //
    // } else {
    //   if (this.conjunction2 === 'and') {
    //     this.filterDataByAnd = deepCopy(this.filterArrayDataTwo);
    //     this.filterDataByOr = deepCopy(this.filterArrayData);
    //   } else {
    //     this.filterDataByOr = deepCopy(this.filterArrayDataTwo);
    //   }
    // }

    this.filterData = deepCopy(this.filterArrayDataTwo);


    const refModal = this.ngbModalService.open(GridModalComponent, {backdrop: 'static', enterKeyId: 'smx-gridModal'});

    refModal.componentInstance.type = 8;
    refModal.componentInstance.config = {title: '拆分过滤设置'};
    refModal.componentInstance.mData = {
      filterConfig: this.filterConfig,
      filterData: this.filterData,
      conjunction: this.conjunction2
    };
    refModal.result.then(
      (result) => {
        if (result === 'next') {
          this._dataSplit();
        }
      },
      (reason) => {
        toLog(reason);
      });
  }


  // 数据拆分2
  _dataSplit() {
    const refModal = this.ngbModalService.open(GridModalComponent, {backdrop: 'static', enterKeyId: 'smx-gridModal'});
    refModal.componentInstance.type = 9;
    if (this.sc_strucrtorData.length > 0) {
      refModal.componentInstance.config = {title: '输出数据设置'};
      refModal.componentInstance.mData = {
        splitFileds: JSON.parse(JSON.stringify(this.sc_strucrtorData))
      };


      refModal.componentInstance.outEvent.subscribe((result) => {
        if (result.body.splitFileds.length > 0) {
          const data = [];
          for (const i of result.body.splitFileds) {
            if (i.use) {
              data.push({
                name: i.name,
                column_desc: i.column_desc,
              });
            }
          }
          this.postSplit(data, result.body.splitName, result.activeModal);
        }
      });
    }

  }


  /**
   * 数据拆分请求
   * @param {any[]} data
   */
  postSplit(data: any[], name = '', activemodal: any) {
    let filterDataByAnd = [];
    let filterDataByOr = [];
    let filterDataByNot = [];

    if (this.conjunction2 === 'and') {
      filterDataByAnd = this.filterData;
    }
    if (this.conjunction2 === 'or') {
      filterDataByOr = this.filterData;
    }
    if (this.conjunction2 === 'not') {
      filterDataByNot = this.filterData;
    }
    const postBody = {
      and: filterDataByAnd,
      or: filterDataByOr,
      not: filterDataByNot,
      fields: data,
      entity_desc: name,
      service_event_parameters_id: this.pageConfig.service_event_parameters_id,
      entity_id: this.pageConfig.entity_id
      // service_event_id: this.pageConfig.service_event_id
    };


    this.httpService.getData(postBody,
      true, 'etl', 'split', 'split')
      .subscribe(
        res => {
          if ((res as any).status < 0) {
            // 数据拆分提交时判断数据是否处于锁定状态
            if ((res as any).status === -260) {
              const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 5000);
              this.toastService.toast(toastCf);
              return;
            }
            activemodal.close();
            return;
          } else {

            activemodal.close();
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '数据拆分成功!', 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          toError(error);
        }
      );
  }


  /**
   * 数据合并(选择数据)
   */
  dataCombine() {
    const refModal = this.ngbModalService.open(GridModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-gridModal'});
    refModal.componentInstance.type = 10;
    refModal.componentInstance.config = {title: '选择合并数据源'};
    refModal.componentInstance.mData = {
      createMap: {
        querySystemMap: '33c1174f-ff51-49f9-a635-7777cf503917', // 查询我的数据  u
        searchUserMap: '3c744ced-c950-4bd8-b5d4-ab5547b0cd8d', // 关键字搜索共享数据 u
        searchSystemMap: '03b5b9bc-f8de-4397-a594-d45731eac97d', // 关键字搜索查询我的数据 u
        queryUserMap: '66925d61-1b9d-46f8-9867-4f9c204f4f5e', // 查询共享数据   // u
      }
    };
    refModal.result.then(
      (result) => {
        if (result) {
          this.combineSourceInfo = result;
          this.getGridStructure(result.service_event_parameters_id);
        }
      },
      (reason) => {
        toLog(reason);
      });
  }


  // 数据合并(过滤条件)
  // todo 数据合并   v2.7.4需求改动
  _dataCombine() {


    // if (this.conjunction === 'and') {
    //   if (this.conjunction2 === 'and') {
    //     // this.filterDataByAnd = deepCopy(this.filterArrayData.concat(this.filterArrayDataTwo));
    //     this.filterDataByAnd = deepCopy(this.filterArrayDataTwo);
    //   } else {
    //     this.filterDataByAnd = deepCopy(this.filterArrayData);
    //     this.filterDataByOr = deepCopy(this.filterArrayDataTwo);
    //   }
    //
    // } else {
    //   if (this.conjunction2 === 'and') {
    //     this.filterDataByAnd = deepCopy(this.filterArrayDataTwo);
    //     this.filterDataByOr = deepCopy(this.filterArrayData);
    //   } else {
    //     // this.filterDataByOr = deepCopy(this.filterArrayData.concat(this.filterArrayDataTwo));
    //     this.filterDataByOr = deepCopy(this.filterArrayDataTwo);
    //   }
    // }
    this.filterData = deepCopy(this.filterArrayDataTwo);

    const refModal = this.ngbModalService.open(GridModalComponent, {backdrop: 'static', enterKeyId: 'smx-gridModal'});

    refModal.componentInstance.type = 8;
    refModal.componentInstance.config = {title: '合并过滤设置'};
    refModal.componentInstance.mData = {
      filterConfig: this.filterConfig,
      filterData: this.filterData,
      conjunction: this.conjunction2
    };
    // refModal.componentInstance.type = 'filter';

    // refModal.componentInstance.filterConfig = this.filterConfig;
    // refModal.componentInstance.filterDataByAnd = this.filterDataByAnd;
    // refModal.componentInstance.filterDataByOr = this.filterDataByOr;

    refModal.result.then(
      (result) => {
        if (result === 'next') {
          this._dataCombine2();
        }
      },
      (reason) => {
        toLog(reason);
      });
  }


  /**
   * 数据合并(字段处理)
   * @private
   */
  _dataCombine2() {
    const refModal = this.ngbModalService.open(GridModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-gridModal'});
    refModal.componentInstance.type = 11;
    if (this.sc_strucrtorData.length > 0 && this.c_strucrtorData.length > 0) {
      refModal.componentInstance.config = {title: '输出数据设置'};
      refModal.componentInstance.mData = {
        combineFileds: JSON.parse(JSON.stringify(this.sc_strucrtorData)),
        c_combineFileds: JSON.parse(JSON.stringify(this.c_strucrtorData))
      };

      refModal.componentInstance.outEvent1.subscribe((result) => {
        const data = [];
        for (const i of result.body.combineFileds) {
          if (i.use) {
            data.push(i);
          }
        }
        for (const j of result.body.keySourceData) {
          if (j.use) {
            data.push(j);
          }
        }

        this.postCombine(data, result.body.combineName, result.activeModal);
      });
    } else {
    }
  }


  /**
   * 数据合并请求
   * @param {any[]} data
   */
  postCombine(data: any[], name = '', activemodal: any) {

    let filterDataByAnd = [];
    let filterDataByOr = [];
    let filterDataByNot = [];

    if (this.conjunction2 === 'and') {
      filterDataByAnd = this.filterData;
    }
    if (this.conjunction2 === 'or') {
      filterDataByOr = this.filterData;
    }
    if (this.conjunction2 === 'not') {
      filterDataByNot = this.filterData;
    }


    const postBody = {
      and: filterDataByAnd,
      or: filterDataByOr,
      not: filterDataByNot,
      fields: data,
      entity_desc: name,
      entity_id: this.pageConfig.entity_id,
      service_event_parameters_id: this.pageConfig.service_event_parameters_id,
      // service_event_id: this.pageConfig.service_event_id,
      relation_service_event_parameters_id: this.combineSourceInfo.service_event_parameters_id,
      relation_entity_id: this.combineSourceInfo.entity_id
    };

    this.httpService.getData(postBody,
      true, 'etl', 'unite', 'split')
      .subscribe(
        res => {
          if ((res as any).status < 0) {
            // 数据合并判断是否锁定状态
            if ((res as any).status === -260) {
              const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 5000);
              this.toastService.toast(toastCf);
              return;
            }
            activemodal.close();
            return;
          } else {
            activemodal.close();
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '数据合并成功!', 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          toError(error);
        }
      );
  }

  // 更新条目总数
  setTotalProperty(e: any) {
    this.totalProperty = e;
  }

  /**
   * 导出数据
   */
  exportData() {
    this.gridCom.exportData();
  }

  test() {
    this.geoType = 30;
  }


  // ***********************************************地理图层*******************************************//
  /*
* 两个专题地图新增数据事件
* */
  addNewGeo(geoJson: any) {
    this.gridCom.addNewGriddata(geoJson);
  }

  /*
  * 两个专题地图删除数据事件
  * */
  removeGeo(id: any) {
    this.gridCom.removeGridData(id);
  }

  /**
   * 地图修改事件
   */
  updateGeo(geoJson: any) {
    this.gridCom.updateGriddate(geoJson);
  }


  // ***********************************************统计图层*******************************************//
  closePanel() {
    this.panelShow = !this.panelShow;
  }

  /**
   * 地图初始化
   */
  initMap() {
    const postBody = {
      version: this.pageConfig.version,
      layerStyleID: this.pageConfig.layer_style_id,
      sta_type: this.pageConfig.sta_type
    };
    this.httpService.getData(postBody,
      true, 'execute', 'getGeographyLayerStyle', 'em', 'em')
      .subscribe(
        response => {
          if ((response as any).data && (response as any).data !== '') {
            // setTimeout(() => {

            this.httpService.getFile((response as any).data).subscribe(
              result => {
                this.mapStyle = result;
                const style = deepCopy(result);
                if (this.staType === '05e20d72-c000-4f59-af97-8adb31bcc522') { // 聚合图
                  style.layers.splice(style.layers.length - 3, 3);
                  this.layerIndex = this.mapStyle.layers.length - 3;
                  this.layerStyle = [
                    this.mapStyle.layers[this.mapStyle.layers.length - 3],
                    this.mapStyle.layers[this.mapStyle.layers.length - 2],
                    this.mapStyle.layers[this.mapStyle.layers.length - 1]
                  ];
                } else { // 其他
                  style.layers.splice(style.layers.length - 1, 1);
                  this.layerIndex = this.mapStyle.layers.length - 1;
                  this.layerStyle = [this.mapStyle.layers[this.mapStyle.layers.length - 1]];
                }


                // 加载地图
                this.map = getMapInstance('sta_map', {style: style});
                addMapControl(this.map, 'fullscreen');
                addMapControl(this.map, 'navigation');
                addMapControl(this.map, 'scale', 'bottom-left');


                this.map.on('load', (e: any) => {
                  // 发布按钮
                  this.maploaded = true;


                  // liuchao-切换底图-将地图样式json文件全局化
                  // self.mapStyle = self.map.getStyle();
                  // self.initStaData(self.mapStyle.layers[self.mapStyle.layers.length - 1]);

                  // localStorage.setItem('smartmapx:style:' + self.pageConfig.layer_style_id, JSON.stringify(self.mapStyle));
                  this.panelShow = true;
                  if (this.mapStyle.center[0] === 104.94064811833391) {
                    const layer_style_id = this.mapStyle.layers[this.mapStyle.layers.length - 1].metadata.layer_style_id;
                    this.bestCenter(layer_style_id);
                  }
                  // wb 统计专题 初始化添加最佳视野
                  if (this.staBestVision === true && this.mapStyle.metadata.basemap_config.lock_bounds === 0) {
                    this.getBestCenter();
                  }
                });

              },
              error => {
                console.error(error);
              }
            );


            // }, 500);


          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据请求失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试', 2000);
          this.toastService.toast(toastCfg);
        }
      );

  }


  /**
   * 统计图发布上传
   * @param imgUrl
   */
  releaseSta(imgUrl: any) {
    const file = this.dataURLtoFile(imgUrl, this.pageConfig.layer_style_id + '.jpg'); // 添加图片名称
    // this.httpService.uploadFileRequest({forceDelete: true}, [file], 'layer', 'img', 'fb')
    this.httpService.makeFileRequest('/upload/1.0.0/layer/img', {forceDelete: true}, [file])
      .subscribe(
        data => {
          if ((data as any).data && (data as any).data.upload_file && (data as any).data.upload_file.uploads) {
            this.publicStyle({
              version: 'release',
              layerStyleID: this.pageConfig.layer_style_id,
              thumbnail: (data as any).data.upload_file.uploads
            }, 'getGeographyLayerStyle');
          }

        }, error => {

        }
      );
  }


  /**
   * 发布
   */
  publicStyle(body: any, url: any) {
    this.httpService.getData(body, true, 'execute', url, 'em', 'em')
      .subscribe(
        response => {
          if ((response as any).data) {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '图层发布成功！', 2000);
            this.toastService.toast(toastCfg);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '发布失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
          }
        },

        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '发布失败,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  /**
   * base 转 file
   * @param dataurl
   * @param filename
   */
  dataURLtoFile(dataurl, filename) { // 将base64转换为文件
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let nl = bstr.length;
    const u8arr = new Uint8Array(nl);
    while (nl--) {
      u8arr[nl] = bstr.charCodeAt(nl);
    }
    return new File([u8arr], filename, {type: mime});
  }


  /**
   * 发布预览
   */
  release() {
    const style = this.mapStyle;
    const zoom = this.map.getZoom();
    const center = this.map.getCenter();
    const bearing = this.map.getBearing();
    const pitch = this.map.getPitch();


    const refModal = this.ngbModalService.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
    refModal.componentInstance.type = 16;
    refModal.componentInstance.keyConfig = {title: '发布预览'};
    refModal.componentInstance.modalData = {
      style: style,
      zoom: zoom,
      center: center,
      bearing: bearing,
      pitch: pitch
    };

    refModal.result.then(
      (result) => {
        console.log(result);
        this.releaseSta(result);
      },
      (reason) => {
      });
  }

  /*--刘超-统计专题-切换底图-开始--*/
  /* --王博 添加对流向图的判定--切换底图 -- */

  // 切换底图
  toggleMap() {
    const key_config = {
      chooseMap: {
        action: 2, // 1 有自定义 // 2 无自定义
        independence: 1, // 1 独立性  2 有关联
        title: '选择底图',
        modal: {
          leftTitle: '系统底图',
          rightTitle: '用户底图',
          id: 'map_id',
          name: 'name',
          description: 'description',
          img: 'thumbnail'
        },
        interface: {
          queryLeft: 'fa20136d-a6b2-40da-b8c5-29b3a361c42b', // 查询系统地图 do
          searchLeft: '5878e037-1c61-4c9a-9f4a-653e70c2d5c4', // 关键字搜索系统底图 do
          searchRight: '8b6f180d-63ee-44f9-99b6-334159fcc124', // 关键字搜索用户地图 do
          queryRight: '31a835e5-8e55-439a-9b63-3886cb08390e', // 查询用户地图 do
        }
      }
    };

    const modalRef = this.ngbModalService.open(PopueComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.keyConfig = key_config;
    modalRef.componentInstance.type = 'chooseMap';

    modalRef.result.then((result) => {
    }, (reason) => {
      if (reason && reason !== 'close') {
        const mapid = reason.checkedItem.map_id,
          version = reason.checkedItem.release_time;
        this.postData = {
          mapID: mapid,
          version: version

        };
        this.httpService.getData(this.postData, true, 'execute', 'getMapStyle', 'em', 'em')
          .subscribe(
            (data: any) => {
              this.getJson(data.data);

              // 传参:编辑的地理专题图层ID 选择的地图id

              // this.saveData();  //-- 王博 把保存方法移到getJson()方法内 --

            }
          );
      }
    });
  }


  // 将json地址转换成json
  getJson(url: any) {
    let OriginalNum_new = 0;
    this.httpService.getFile(url).subscribe(res => {
      const mapData = res;
      for (const v of (mapData as any).layers) {
        if (v.metadata.flowgraph) {
          // 有流向图的底图
          OriginalNum_new = OriginalNum_new + 1;
        }
      }
      if (this.map.hasEcharts() && OriginalNum_new > 0) {
        const toastCf = new ToastConfig(ToastType.WARNING, '', '无法切换带有流向图的底图', 5000);
        this.toastService.toast(toastCf);
        return;
      } else {
        // 替换地理专题底图图层
        // 没有流向图的底图
        this.changeMap(mapData);
        this.saveData();
      }
    }, error => {

    });
    // return this.http.get(url)
    //   .toPromise()
    //   .then((res: any) => {
    //     const mapData = JSON.parse(res._body);
    //     // 替换地理专题底图图层
    //     this.changeMap(mapData);
    //   })
    //   .catch(this.handleError);
  }


  /**
   * 切换地图
   * v2.6 切换后保持当前中心点和缩放级别
   * @param mapData
   */
  changeMap(mapData: any) {
    // 1.替换原地图图层
    // 原地图删除与no_default_id不匹配的图层
    const self = this;
    const keepLayerId = this.mapStyle.metadata.no_default_id;
    const keepLayerSourceId = ([] as any[]);
    const keepLayerSource = ({} as any);
    const newMapLayers = ([] as any[]);
    const zoom = this.map.getZoom();
    const center = this.map.getCenter();

    keepLayerId.map(function (item: any, ind: any) {
      self.mapStyle.layers.map(function (value: any, index: any) {
        if (item === value.id) {
          newMapLayers.push(value);
          keepLayerSourceId.push(value.source);
        }
      });
    });
    // 将原地图保留下来的图层与新地图的图层合并
    this.mapStyle.layers = mapData.layers.concat(newMapLayers);

    // 2.替换原地图数据源
    keepLayerSourceId.map(function (value, index) {
      for (const key in self.mapStyle.sources) {
        if (value === key) {
          keepLayerSource[key] = self.mapStyle.sources[key];
        }
      }
    });


    // 将原地图保留下来的数据源与新地图的数据源合并
    this.mapStyle.sources = Object.assign(keepLayerSource, mapData.sources);
    this.mapStyle.metadata = Object.assign(this.mapStyle.metadata, mapData.metadata);
    this.map.setStyle(this.mapStyle);
    this.map.setZoom(zoom);
    this.map.setCenter(center);


    if (this.componentType === '5') {
      if (this.staType === '05e20d72-c000-4f59-af97-8adb31bcc522') { // 聚合图

        this.layerIndex = this.mapStyle.layers.length - 3;
        this.layerStyle = [
          this.mapStyle.layers[this.mapStyle.layers.length - 3],
          this.mapStyle.layers[this.mapStyle.layers.length - 2],
          this.mapStyle.layers[this.mapStyle.layers.length - 1]
        ];
      } else { // 其他
        this.layerIndex = this.mapStyle.layers.length - 1;
        this.layerStyle = [this.mapStyle.layers[this.mapStyle.layers.length - 1]];
      }
    }
  }

  saveData() {
    const data = {
      map_id: this.postData.mapID,
      layer_style_id: this.pageConfig.layer_style_id
    };
    this.httpService.getData(data, true, 'execute', '85e43597-c9e7-40f2-b99a-ba237b25743f', '').subscribe((res) => {
      console.log(res);
    });
  }

  // 异常
  private handleError(error: any):
    Promise<any> {
    return Promise.reject(error.message || error);
  }

  /*--刘超-切换底图-结束--*/


  saveWindow() {
    if (this.map) {
      const zoom = this.map.getZoom();
      const center = this.map.getCenter();
      // const token_id = localStorage.getItem('id_token');
      const postBody = {
        id: this.pageConfig.layer_style_id,
        center: center.lng + ',' + center.lat,
        zoom: zoom,
        type: 'layer_style',
      };
      this.httpService.getData(postBody, true, 'execute', 'reviseMapCenter', 'em', 'em')
        .subscribe(
          response => {
            if ((response as any).status > 0) {
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '保存成功！', 2000);
              this.toastService.toast(toastCfg);
            }
          },
          error => {
            toError(error);
          }
        );
    }
  }

  /*切换格式*/
  switchShow(index: any) {
    this.pageType = index;
  }


  /*最佳视野+++++++++++++++++++*/
  bestCenter(layer_style_id: any) {
    const postData = {layer_style_id: layer_style_id};
    this.httpService.getData(postData, true, 'execute', 'getDataBox', 'em', 'em')// 1.请求的参数 2.是否带token值 3，模块分类 4，路径方式
      .subscribe(
        (data: any) => {
          const box = data.data.slice(4, -1).split(',');
          this.bounds = [box[0].split(' '), box[1].split(' ')];
          if (this.getLayerZoom()[0] > this.getBestZoom(this.bounds)[0]) {
            const lng = (Number(this.bounds[0][0]) + Number(this.bounds[1][0])) / 2;
            const lat = (Number(this.bounds[0][1]) + Number(this.bounds[1][1])) / 2;
            this.map.jumpTo({center: [lng, lat], zoom: this.getLayerZoom()[0]});
          } else {
            this.map.fitBounds(this.bounds, {
              padding: {top: 50, bottom: 50, left: 50, right: 50},
              animate: false
            });
          }
        },
        error => {
          toError(error);
        }
      );
  }

  getBestCenter() {
    // todo
    // 最佳视野不做存储， 实时获取
    const layer_style_id = this.mapStyle.layers[this.mapStyle.layers.length - 1].metadata.layer_style_id;
    this.bestCenter(layer_style_id);
    /*if (this.bounds) {
      if (this.getLayerZoom()[0] > this.getBestZoom(this.bounds)[0]) {
        const lng = (Number(this.bounds[0][0]) + Number(this.bounds[1][0])) / 2;
        const lat = (Number(this.bounds[0][1]) + Number(this.bounds[1][1])) / 2;
        this.map.jumpTo({center: [lng, lat], zoom: this.getLayerZoom()[0]});
      } else {
        this.map.fitBounds(this.bounds, {
          padding: {top: 50, bottom: 50, left: 50, right: 50},
          animate: false
        });
      }
    } else {
      const layer_style_id = this.mapStyle.layers[this.mapStyle.layers.length - 1].metadata.layer_style_id;
      this.bestCenter(layer_style_id);
    }*/
  }

  getBestZoom(bound: any) {
    const grade = [];
    let zoom = [];
    for (let m = 0; m < 23; m++) {
      grade.push(((85.05113 + 85.05113) / 512) * Math.pow(2, -m));
    }
    const dimensions = this.map._containerDimensions();
    const width = dimensions[0];
    const height = dimensions[1];
    const dissX = Math.abs(bound[0][0] - bound[1][0]) / width;
    const dissY = Math.abs(bound[0][1] - bound[1][1]) / height;
    const grade1 = Math.min(dissX, dissY);
    for (let i = 0; i < grade.length; i++) {
      if (grade[i] > grade1 && grade1 > grade[i + 1]) {
        zoom = [i, Number(i + 1)];
      }
    }
    return zoom;
  }

  getLayerZoom() {
    const min = this.mapStyle.layers[this.mapStyle.layers.length - 1].minzoom;
    const max = this.mapStyle.layers[this.mapStyle.layers.length - 1].maxzoom;
    return [min ? min : 0, max ? max : 24];
  }


  /**
   * 地址匹配
   */

  addressMatching() {
    if (this.conjunction === 'and') {
      if (this.conjunction2 === 'and') {
        // this.filterDataByAnd = deepCopy(this.filterArrayData.concat(this.filterArrayDataTwo));
        this.filterDataByAnd = deepCopy(this.filterArrayDataTwo);
      } else {
        this.filterDataByAnd = deepCopy(this.filterArrayData);
        this.filterDataByOr = deepCopy(this.filterArrayDataTwo);
      }

    } else {
      if (this.conjunction2 === 'and') {
        this.filterDataByAnd = deepCopy(this.filterArrayDataTwo);
        this.filterDataByOr = deepCopy(this.filterArrayData);
      } else {
        // this.filterDataByOr = deepCopy(this.filterArrayData.concat(this.filterArrayDataTwo));
        this.filterDataByOr = deepCopy(this.filterArrayDataTwo);
      }
    }
    const arr = [];
    const modalRef = this.ngbModalService.open(GridModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      enterKeyId: 'smx-gridModal'
    });
    // 回显地址匹配上一步时的过滤条件
    if (this.midFilter) {
      this.filterDataByAnd = this.midFilter;
    }

    modalRef.componentInstance.type = 12;
    modalRef.componentInstance.config = {title: '地址匹配'};
    modalRef.componentInstance.mData = {filterConfig: this.filterConfig, filterData: this.filterDataByAnd};
    // 回显地址匹配上一步时的过滤条件
    this.midFilter = this.filterDataByAnd;
    modalRef.result.then((result) => {
      const filter = {
        service_event_config_id: '',
        rule: '',
        value: '',
        data_type: ''
      };

      for (let i = 0; i < result.filterData.length; i++) {
        filter.service_event_config_id = result.filterData[i].service_event_config_id;
        filter.rule = result.filterData[i].rule;
        filter.value = result.filterData[i].value;
        filter.data_type = result.filterData[i].data_type; // todo
        const q = JSON.stringify(filter);
        const p = JSON.parse(q);
        arr.push(p);
      }
      this.addressFilter1 = arr;
      this.checkInputField();
    }, (reason) => {
      this.midFilter = null;
    });
  }


  /**
   * 选择输入字段
   */
  checkInputField() {
    const modal = this.ngbModalService.open(GridModalComponent, {centered: true, backdrop: 'static', keyboard: false, enterKeyId: 'smx-gridModal'});
    modal.componentInstance.type = 13;
    modal.componentInstance.config = {title: '地址匹配'};
    modal.componentInstance.mData = {
      filterConfig: this.filterConfig,
      filed: null,
      province: null,
      city: null,
      country: null
    };
    modal.componentInstance.outEventAddress.subscribe((result) => {
      if (result.mData.filed === null) {
        const toastCf = new ToastConfig(ToastType.WARNING, '', '请选择地址字段', 5000);
        this.toastService.toast(toastCf);
      } else {
        const body = {
          conjunction: 'and',
          filters: this.addressFilter1,
          column_province: result.mData.province,
          column_city: result.mData.city,
          column_district: result.mData.country,
          column_address: result.mData.filed
        };
        this.httpService.getData(body, true, 'dataconvert', 'geocoding', '1').subscribe(data => {
            if ((data as any).status < 0) {
              if ((data as any).status === -260) {
                const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 5000);
                this.toastService.toast(toastCf);
                return;
              }
              result.activeModal.close();
            } else {
              result.activeModal.close();
              this.tmService.start();
              this.midFilter = null;
            }
          },
          error => {
            toError(error);
          }
        );
      }
    });

    modal.componentInstance.outEventBeforeAddress.subscribe((result) => {
      result.activeModal.dismiss();
      this.addressMatching();
    });
  }


  /**
   *逆地理编码
   */
  reverseGeocoding() {
    if (this.conjunction === 'and') {
      if (this.conjunction2 === 'and') {
        // this.filterDataByAnd = deepCopy(this.filterArrayData.concat(this.filterArrayDataTwo));
        this.filterDataByAnd = deepCopy(this.filterArrayDataTwo);
      } else {
        this.filterDataByAnd = deepCopy(this.filterArrayData);
        this.filterDataByOr = deepCopy(this.filterArrayDataTwo);
      }

    } else {
      if (this.conjunction2 === 'and') {
        this.filterDataByAnd = deepCopy(this.filterArrayDataTwo);
        this.filterDataByOr = deepCopy(this.filterArrayData);
      } else {
        // this.filterDataByOr = deepCopy(this.filterArrayData.concat(this.filterArrayDataTwo));
        this.filterDataByOr = deepCopy(this.filterArrayDataTwo);
      }
    }
    const arr = [];
    const modalRef = this.ngbModalService.open(GridModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      enterKeyId: 'smx-gridModal'
    });
    // 回显逆地理编码上一步时的过滤条件
    if (this.midFilter) {
      this.filterDataByAnd = this.midFilter;
    }
    modalRef.componentInstance.type = 12;
    modalRef.componentInstance.config = {title: '逆地理编码'};
    modalRef.componentInstance.mData = {filterConfig: this.filterConfig, filterData: this.filterDataByAnd};
    // 回显逆地理编码上一步时的过滤条件
    this.midFilter = this.filterDataByAnd;
    modalRef.result.then((result) => {
      const filter = {
        service_event_config_id: '',
        rule: '',
        value: '',
        data_type: ''
      };
      for (let i = 0; i < result.filterData.length; i++) {
        filter.service_event_config_id = result.filterData[i].service_event_config_id;
        filter.rule = result.filterData[i].rule;
        filter.value = result.filterData[i].value;
        filter.data_type = result.filterData[i].data_type; // todo
        const q = JSON.stringify(filter);
        const p = JSON.parse(q);
        arr.push(p);
      }
      this.addressFilter2 = arr;
      this.checkInputField1();
    }, (reason) => {
      this.midFilter = null;
    });
  }

  /**
   *输入字段
   */
  checkInputField1() {
    const modalRef = this.ngbModalService.open(GridModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      enterKeyId: 'smx-gridModal'
    });
    modalRef.componentInstance.type = 15;
    modalRef.componentInstance.config = {title: '逆地理编码'};
    modalRef.componentInstance.mData = {
      filterConfig: this.filterConfig, province: null, city: null, country: null, filed: null, poi: null, street: null
    };

    modalRef.componentInstance.outEventReAddress.subscribe((result) => {
      if (result.mData.filed === null) {
        const toastCf = new ToastConfig(ToastType.WARNING, '', '请选择地址字段', 5000);
        this.toastService.toast(toastCf);
      } else {
        const body = {
          conjunction: 'and',
          filters: this.addressFilter2,
          column_province: result.mData.province,
          column_city: result.mData.city,
          column_district: result.mData.country,
          column_street: result.mData.street,
          column_poi: result.mData.poi,
          column_address: result.mData.filed,
        };
        this.httpService.getData(body, true, 'dataconvert', 'regeocoding', '1').subscribe(data => {
            if ((data as any).status < 0) {
              if ((data as any).status === -260) {
                const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 5000);
                this.toastService.toast(toastCf);
                return;
              }
              result.activeModal.close();
              return;
            } else {
              result.activeModal.close();
              this.tmService.start();
              this.midFilter = null;
            }
          },
          error => {
            toError(error);
          }
        );
      }
    });
    modalRef.componentInstance.outEventBeforeReAddress.subscribe((result) => {
      result.activeModal.dismiss();
      this.reverseGeocoding();
    });
  }


}
