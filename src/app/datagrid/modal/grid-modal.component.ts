import {
  Component,
  Input,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';
import {SmxActiveModal, SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {AppService} from '../../s-service/app.service';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {FilterComponent} from '../filter/filter.component';
import {toError, toLog} from '../../smx-component/smx-util';
import {SMXNAME} from '../../s-service/utils';

const Buffer = require('buffer').Buffer;
const wkx = require('wkx');
import {getMapInstance, addMapControl} from '../../s-service/smx-map';
import {DataStorage} from '../../s-service/local.storage';
import {TaskManageService} from '../../c-main/task-manager/task-manage.service';

@Component({
  selector: 'app-grid-modal',
  templateUrl: './grid-modal.component.html',
  styleUrls: ['grid-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GridModalComponent implements OnInit, OnDestroy, AfterViewInit {
  // 配置信息
  @Input() type: any;  // 分类
  @Input() config: any; // 配置
  @Input() mData: any; // 数据
  @Input() strucrtorData: any; // 数据

  // 添加数据
  @Input() formConfig: any;
  @Input() unionInfo: any;

  @Output() outEvent = new EventEmitter();
  @Output() outEvent1 = new EventEmitter();
  @Output() outEventAddress = new EventEmitter();
  @Output() outEventReAddress = new EventEmitter();
  @Output() outEventBeforeAddress = new EventEmitter();
  @Output() outEventBeforeReAddress = new EventEmitter();

  canSubmit: boolean;
  infoList: any = [];
  cities: any[]; // 单选框组件原始数据
  haveGeom: boolean;


  // 选择地图
  @Input() geoType: number; // 传入的数据类型 0 非空间表、10 点空间 、20 线空间、 30 面空间
  @Input() geom: any;
  lastItem: any;
  geomInfo: any;
  map: any;


  // 更新数据
  options = {
    debug: 'info',
    modules: {
      toolbar: '#toolbar'
    },
    placeholder: 'Compose an epic...',
    readOnly: true,
    theme: 'snow'
  };


  // 转换
  @Input() displayData: any[] = [];
  transformType = '1';

  // 数据格式
  nowDataStyleSelect: any;

  // 下面三个字段选择
  nowColumnSelect: any;
  nowColumnX: any;
  nowColumnY: any;
  nowGeoTypeSelect: any;
  // 转换空间数据数据格式
  nowGeoType: any; //
  nowGeoTypes: any[] = [
    {label: 'geojson', value: 'geojson'},
    {label: 'wkb', value: 'wkb'},
    {label: 'wkt', value: 'wkt'}
  ];


  // 添加方案
  types = [
    {label: '全量返回', value: 'query'},
    {label: '详情查询', value: 'select'},
    {label: '分页查询', value: 'selects'},
    {label: '数据添加', value: 'insert'},
    {label: '数据删除', value: 'delete'},
    {label: '数据修改', value: 'update'}
  ];
  selectedType = 'query';


  // 编辑方案
  cities1: any[] = [];
  selectedCities1: any[] = []; // 查询字段

  // 拆分
  @ViewChild('filter', {static: false}) filterCom: FilterComponent;
  @ViewChild('filter2', {static: false}) filterCom2: FilterComponent;

  splitName: string;
  // splitFileds: any[];

  // pkStatus = false;
  useStatus = false;


  // 合并
  // @Input() mData.createMap: any;
  // @Input() createInfo: any;
  searchKey: any;
  tag = 'mymap';  // 分类选择
  checkedMapId = '';
  mymapChecked = true;
  baseMapList: any[];

  sourceInfo: any;


  // 过滤字段
  // @Input() filterDataByAnd: any;
  // @Input() filterDataByOr: any;
  // @Input() filterConfig: any;


  // 关联数据
  // @Input() combineFileds: any[];
  // @Input() c_combineFileds: any[];
  checkRelation: any[] = [];
  keySoureData: any[] = [];


  c_cities: any[] = [];
  combineName: any;

  // 分页数据
  everyPageNum = 12;
  pageNum = 1;
  totalPage = 0;


  allChecked = false;
  cAllChecked = false;


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
  conjunction = 'and';


  geoOptions: any[] = [
    {label: '点', value: 10},
    {label: '线', value: 20},
    {label: '面', value: 30},
  ];

  test = 2;
  properties: any; // 配置文件
  constructor(public activeModal: SmxActiveModal,
              private appService: AppService,
              private httpService: HttpService,
              private toastService: ToastService,
              private ngbModalService: SmxModal,
              private ds: DataStorage,
              private tmService: TaskManageService) {
  }

  ngOnInit() {
    this.properties = <any>this.ds.get('properties');
  }

  ngAfterViewInit() {
    switch (this.type) {
      case 1:
        this.initAddModale();
        break;
      case 2:
        this.initMap();
        break;
      case 3:
        this.initUpdateModal();
        break;
      case 7:
        if (this.mData.operationSource) {
          for (const v of this.mData.operationSource) {
            this.cities1.push({
              label: v.description,
              value: v
            });
          }
        }

        if (this.mData.operationData) {
          this.selectedCities1 = this.mData.operationData;
        }
        break;
      case 10:
        this.getSystemMapList();
        break;
      case 11:
        for (let j = 0; j < this.mData.c_combineFileds.length; j++) {
          this.c_cities.push({
            label: this.mData.c_combineFileds[j].description,
            value: this.mData.c_combineFileds[j]
          });

          this.keySoureData.push(this.mData.c_combineFileds[j]);
        }
        break;
      case 12:
        toLog(this.mData);
        break;
      case 13:
        toLog(this.mData);
        break;
    }
  }


  initAddModale() {
    this.haveGeom = true;
    this.canSubmit = false;
    for (const i of this.formConfig.key) {
      i.content = [];
      if (i.type === 'select_event') {
        this.postSelectData(i, '1');
      }
      if (i.type === 'selects_event') {
        i.value = [];
        this.postSelectData(i, '2');
      }
    }
    if (this.unionInfo) {
      for (let i = 0; i < this.unionInfo.length; i++) {
        const arr = [];
        for (const j of this.formConfig.key) {
          for (const m in this.unionInfo[i].properties) {
            if (m === j.name) {
              if (j.component_data_type_id === 'fm_ui_polygon_geo') {
                arr.push('*');
                this.haveGeom = false;
              } else {
                arr.push(this.unionInfo[i].properties[m]);
              }
            }
          }
        }
        this.infoList.push(arr);
      }
      if (this.haveGeom) {
        for (let j = 0; j < this.infoList.length; j++) {
          this.infoList[j].splice(1, 0, '*');
        }
      }
    }
  }

  initUpdateModal() {
    this.canSubmit = false;
    for (const i of this.formConfig.key) {
      i.content = [];
      if (i.type === 'select_event') {
        this.postSelectData(i, '1');
      }
      if (i.type === 'selects_event') {
        i.value = [];
        this.postSelectData(i, '2');
      }
    }

    this.checkNull();
  }

  initMap() {
    let center = [116.39738, 39.90579];
    if (this.geom) {
      try {
        if (typeof this.geom === 'string') {
          this.geom = JSON.parse(this.geom);
        }

        if (this.geom.value) {
          const wkbBuffer = new Buffer(this.geom.value, 'hex');
          this.geomInfo = wkx.Geometry.parse(wkbBuffer).toGeoJSON();
        } else {
          this.geomInfo = this.geom;
        }


        if (this.geomInfo.type === 'Point') {
          center = [this.geomInfo.coordinates[0], this.geomInfo.coordinates[1]];
        } else if (this.geomInfo.type === 'LineString') {
          const index = Math.ceil(this.geomInfo.coordinates.length / 2);
          center = this.geomInfo.coordinates[index];
        } else {
          const index = Math.ceil(this.geomInfo.coordinates[0].length / 2);
          center = this.geomInfo.coordinates[0][index];
        }

      } catch (e) {
        center = [116.39738, 39.90579];
        this.geomInfo = null;
      }

    }


    this.map = getMapInstance('choose_map', {
      mapId: this.properties.serviceIP.default_map_id,
      center: center,
    });


    this.map.on('load', () => {

      let controlWay: any;
      switch (this.geoType) {
        case 10:
          controlWay = {
            displayControlsDefault: false,
            controls: {point: true},
            defaultMode: this.geomInfo ? 'simple_select' : 'draw_point'
          };
          break;
        case 20:
          controlWay = {
            displayControlsDefault: false,
            controls: {line_string: true},
            defaultMode: this.geomInfo ? 'simple_select' : 'draw_line_string'
          };
          break;
        case 30:
          controlWay = {
            displayControlsDefault: false,
            controls: {polygon: true},
            defaultMode: this.geomInfo ? 'simple_select' : 'draw_polygon'
          };
          break;
      }
      const drawControl = addMapControl(this.map, 'draw', 'top-right', controlWay);


      if (this.geomInfo) {
        const id = drawControl.add(this.geomInfo)[0];
        this.lastItem = drawControl.get(id);
        drawControl.set({type: 'FeatureCollection', features: [this.lastItem]});
      }


      // 新增geo事件
      this.map.on('draw.create', (e: any) => {
        if (this.lastItem) {
          drawControl.delete(this.lastItem.id);
        }
        this.lastItem = e.features[0];
      });
      // 删除geo事件
      this.map.on('draw.delete', (e: any) => {
        this.lastItem = undefined;
      });
      // 移动geo事件
      this.map.on('draw.update', (e: any) => {
        this.lastItem = e.features[0];
      });
    });

  }


  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  selectInfo(index: any) {
    for (let i = 0; i < this.formConfig.key.length; i++) {
      if (this.formConfig.key[i].component_data_type_id !== 'fm_ui_polygon_geo') {
        this.formConfig.key[i].value = this.infoList[index][i];
      } else {
      }
    }
    this.canSubmit = true;
  }

  /**
   * 获取下拉框选项
   */
  postSelectData(i: any, tag: any) {
    if (i.service_event_id) {
      this.httpService.getData({}, true,
        'execute', i.service_event_id, '1')
        .subscribe(
          data => {
            if ((data as any).status > 0) {
              if (tag === '1') {
                i.content = (data as any).data;
              } else if (tag === '2') {
                const ls = [];

                for (const l of (data as any).data) {
                  ls.push({
                    label: l.k,
                    value: l.v
                  });
                }

                i.content = ls;
              }

            }
          },
          error => {
            toError(error);
          }
        );
    }

  }

  /*
  * 确定事件
  * */
  goAdd(str: string) {
    this.checkNull();
    if (this.canSubmit) {
      this.activeModal.close(str);
    }
  }

  /*
  * 检查是否有未填写的必填项
  * */
  checkNull() {
    for (const i of this.formConfig.key) {
      if (i.type !== 'editor') {
        if (i.null_able === 0) {
          if (!i.value) {
            this.canSubmit = false;
            return;
          }
        }
      }
    }
    this.canSubmit = true;
  }

  checkSelect(e: any) {
    this.checkNull();
  }

  /*
  * 图上选取
  * */
  goCheck(type: string, index: number, geom?: any) {
    const chooseMap = this.ngbModalService.open(GridModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-gridModalMap'});

    chooseMap.componentInstance.type = 2;
    chooseMap.componentInstance.geoType = type === 'fm_ui_polygon_geo' ? 30 : (type === 'fm_ui_line_geo' ? 20 : 10);
    chooseMap.componentInstance.geom = geom;
    chooseMap.result.then(
      (result) => {
        if (result !== 0 || result !== 1 || result !== 'cancel') {
          this.formConfig.key[index].value = result;
          this.checkNull();
        }
      },
      (reason) => {
        toLog(reason);
      });
  }


  myUploader(e: any, item: any) {
    const imgFile = new FileReader();
    imgFile.readAsDataURL(e.files[0]);
    imgFile.onload = function () {
      const imgData = this.result;
      item.value = imgData;
    };
  }


  submitChoose() {
    this.activeModal.close(this.lastItem.geometry);
  }


  clicks() {

  }

  /**
   * 获取下拉框选项
   */
  // postSelectData(i: any, tag: any) {
  //   if (i.service_event_id) {
  //     this.httpService.getData({}, true,
  //       'execute', i.service_event_id, '1')
  //       .subscribe(
  //         data => {
  //           if ((data as any).status > 0) {
  //             // ;
  //             if (tag === '1') {
  //               i.content = (data as any).data;
  //             } else if (tag === '2') {
  //               const ls = [];
  //               for (const l of (data as any).data) {
  //                 ls.push({
  //                   label: l.k,
  //                   value: l.v
  //                 });
  //               }
  //
  //               i.content = ls;
  //             }
  //
  //           }
  //         },
  //         error => {
  //           console.log(error);
  //         }
  //       );
  //   }
  // }

  /*
  * 确定事件
  * */
  // goAdd(str: string) {
  //   this.activeModal.close(str);
  // }

  /*
  * 检查是否有未填写的必填项
  * */
  // checkNull() {
  //   for (const i of this.formConfig.key) {
  //     if (i.type !== 'editor') {
  //       if (i.null_able === 0) {
  //         if (i.value === '') {
  //           this.canSubmit = false;
  //           return;
  //         }
  //       }
  //     }
  //
  //   }
  //   this.canSubmit = true;
  // }


  // checkSelect(e: any) {
  //   this.checkNull();
  // }


  /*
  * 图上选取
  * */
  // goCheck(type: string, geom: any, index: number) {
  //
  //   const chooseMap = this.ngbModalService.open(GridModalComponent, {centered: true, backdrop: 'static'});
  //   chooseMap.componentInstance.type = 2;
  //   chooseMap.componentInstance.geoType = type === 'select_point' ? 10 : (type === 'select_line' ? 20 : 30);
  //   chooseMap.componentInstance.geom = geom;
  //   chooseMap.result.then(
  //     (result) => {
  //       // console.log(result);
  //       if (result !== 0 || result !== 1 || result !== 'cancel') {
  //         // ;
  //         this.formConfig.key[index].value = result;
  //         this.checkNull();
  //       }
  //     },
  //     (reason) => {
  //       console.log(reason);
  //     });
  // }


  getValue(key: any) {
    return this.formConfig.value[key];
  }


  // myUploader(e: any, item: any) {
  //   const imgFile = new FileReader();
  //   imgFile.readAsDataURL(e.files[0]);
  //   imgFile.onload = function () {
  //     const imgData = this.result;
  //     item.value = imgData;
  //   };
  // }


  changeColumnSelect() {
    if (this.transformType === '1') {
      if (this.nowColumnSelect && this.nowGeoTypeSelect && this.nowGeoType) {
        this.canSubmit = true;
        return;
      }
    }

    if (this.transformType === '2') {
      this.nowGeoTypeSelect = 10;
      if (this.nowColumnX && this.nowColumnY && this.nowGeoTypeSelect) {
        this.canSubmit = true;
        return;
      }
    }
    this.canSubmit = false;
  }

  /*
  * 确认操作
  * */
  goTransform() {
    this.canSubmit = false;
    // tslint:disable-next-line:radix
    const geotype = parseInt(this.nowGeoTypeSelect, 10);
    let postBody = {};
    if (this.transformType === '1') {
      postBody = {
        operation_type: 'changeToGeometry',
        geo_type: geotype,
        entity_column_id: this.nowColumnSelect,
        original: this.nowGeoType,
        entity_id: this.mData.entity_id
      };
    } else if (this.transformType === '2') {
      postBody = {
        operation_type: 'createGeometry', // 还有一个类型,暂时不添加 convertToGeometry
        geo_type: geotype,
        x: this.nowColumnX,
        y: this.nowColumnY,
        entity_id: this.mData.entity_id
      };
    }
    this.httpService.getData(postBody, true, 'etl', 'convertGeo', '1')
      .subscribe(
        data => {
          if ((data as any).status > 0) {
            this.tmService.start();
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '转换成功!', 2000);
            this.toastService.toast(toastCfg);
            this.activeModal.close(this.nowGeoTypeSelect);
            return;
          }

          this.canSubmit = true;
        },
        error => {
          this.canSubmit = true;
        }
      );
  }


  /**
   * 选择字段
   */
  checkFileds(e: any, item: any, tag?: any) {
    item.use = e.target.checked;


    if (tag) {// 合并
      if (tag === '1') { // 原始数据
        if (!e.target.check) {
          this.allChecked = false;
        }
        for (const i of this.mData.combineFileds) {
          if ((i as any).use) {
            this.useStatus = true;
            return;
          }
        }
        this.useStatus = false;

      } else {
        if (!e.target.check) {
          this.cAllChecked = false;
        }
      }
    } else { // 拆分
      if (!e.target.check) {
        this.allChecked = false;
      }
      for (const i of this.mData.splitFileds) {
        if (i.use) {
          this.useStatus = true;
          return;
        }
      }
      this.useStatus = false;
    }
  }


  // /**
  //  * 选择字段
  //  */
  // checkFileds(e: any, item: any, tag: any) {
  //   if (tag === '1') {
  //     item.use = e.target.checked;
  //     for (const i of this.mData.combineFileds) {
  //
  //       if ((i as any).use) {
  //         this.useStatus = true;
  //         return;
  //       }
  //     }
  //     this.useStatus = false;
  //   } else {
  //     item.use = e.target.checked;
  //   }
  //
  // }

  /**
   * 全选
   * @param e
   */
  checkedAll(e: any, tag?: any) {
    if (!tag) {
      this.allChecked = e.target.checked;
      if (e.target.checked) {
        for (const i of this.mData.splitFileds) {
          i.use = true;
        }
        this.useStatus = true;
      } else {
        for (const i of this.mData.splitFileds) {
          i.use = false;
        }
        this.useStatus = false;
      }
    } else {
      if (tag === '1') {
        this.allChecked = e.target.checked;
        if (e.target.checked) {
          for (const i of this.mData.combineFileds) {
            i.use = true;
          }
          this.useStatus = true;
        } else {
          for (const i of this.mData.combineFileds) {
            i.use = false;
          }
          this.useStatus = false;
        }

      } else {
        this.cAllChecked = e.target.checked;
        if (e.target.checked) {
          for (const i of this.keySoureData) {
            i.use = true;
          }
        } else {
          for (const i of this.keySoureData) {
            i.use = false;
          }
        }
      }
    }

  }


  /**
   * 提交
   * @param activeModal
   */
  submit(activeModal: any, tag?: any) {
    if (this.splitName || this.combineName) {
      const test = !tag ? SMXNAME.REG.test(this.splitName) : SMXNAME.REG.test(this.combineName);
      if (test) {
        const body = !tag ? {
          splitFileds: this.mData.splitFileds,
          splitName: this.splitName
        } : {
          combineFileds: this.mData.combineFileds,
          keySourceData: this.keySoureData,
          combineName: this.combineName
        };
        // wb 数据合并 添加提示 原始数据至少选择一个关联字段
        if (body.keySourceData) {
          if (body.combineFileds) {
            let isHave_rela = false;
            for (let v of body.combineFileds) {
              if (v.relation_desc || v.relation_entity_column_id || v.relation_entity_id || v.relation_name) {
                isHave_rela = true;
              }
            }
            if (isHave_rela) {
              this.outEvent.emit({activeModal, body});
              this.outEvent1.emit({activeModal, body});
            } else {
              const toastCfg = new ToastConfig(ToastType.WARNING, '', '原始数据至少选择一个关联字段', 5000);
              this.toastService.toast(toastCfg);
            }
          }
        } else {
          this.outEvent.emit({activeModal, body});
          this.outEvent1.emit({activeModal, body});
        }
        // wb
        // this.outEvent.emit({activeModal, body});
        //this.outEvent1.emit({activeModal, body});
        // activeModal.close(body);
      } else {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
        this.toastService.toast(toastCfg);
      }
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '名称不能为空!', 5000);
      this.toastService.toast(toastCfg);
    }


  }


  // 滚动条判断
  public handleScroll(event: any) {
    if (event.isReachingBottom) {

      if (!this.searchKey || this.searchKey === '') {
        if (this.everyPageNum * this.pageNum < this.totalPage) {
          this.pageNum = this.pageNum + 1;
          if (this.tag === 'mymap') {
            this.getSystemMapList();
          } else if (this.tag === 'sharemap') {
            this.getUserMapList();
          }

        }
      }
    }

  }

  /**
   * 切换分类
   * @param tag
   */
  public switchData() {
    if (this.searchKey && this.searchKey !== '') {
      if (this.tag === 'mymap') {
        this.mymapChecked = true;
      } else if (this.tag === 'sharemap') {
        this.checkedMapId = '';
        this.mymapChecked = false;
      }
      this.searchMap();
    } else {
      this.checkedMapId = '';
      this.everyPageNum = 12;
      this.pageNum = 1;
      this.totalPage = 0;
      if (this.tag === 'mymap') {
        this.mymapChecked = true;
        this.getSystemMapList();
      } else if (this.tag === 'sharemap') {
        this.mymapChecked = false;
        this.getUserMapList();
      }
    }

  }

  /**
   * 清除搜索
   */
  public clearInput() {
    this.searchKey = '';
    if (this.tag === 'mymap') {
      this.getSystemMapList();
    } else {
      this.getUserMapList();
    }
  }


  /**
   * 搜索
   */
  public searchMap() {
    if (this.searchKey) {
      let api;
      this.checkedMapId = '';
      if (this.tag === 'mymap') {
        api = this.mData.createMap.searchSystemMap;
      } else {
        api = this.mData.createMap.searchUserMap;
      }
      this.httpService.getData({key: this.searchKey}, true, 'execute', api, 'map')

        .subscribe(
          (data: any) => {
            if ((data as any).status < 0 || (data as any).tag !== 'map') {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
              this.toastService.toast(toastCfg);
              return;
            }
            this.baseMapList = (data as any).data.root;
            if (this.baseMapList[0]) {
              this.checkedMapId = this.baseMapList[0].service_event_id;
              this.sourceInfo = this.baseMapList[0];
            } else {
              this.checkedMapId = '';
            }

          },
          (error: any) => {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
          }
        );
    } else {
      if (this.tag === 'mymap') {
        this.getSystemMapList();
      } else {
        this.getUserMapList();
      }
    }
  }


  // 得到系统底图
  getSystemMapList() {
    // document.getElementById('list').addEventListener('scroll', this.onScrollHandle(this));
    const body = {
      start: 0,
      limit: this.everyPageNum * this.pageNum
    };
    this.httpService.getData(body, true, 'execute', this.mData.createMap.querySystemMap, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.totalPage = (data as any).data.totalProperty;
          this.baseMapList = (data as any).data.root;
          if (this.baseMapList[0]) {
            this.checkedMapId = this.baseMapList[0].service_event_id;
            this.sourceInfo = this.baseMapList[0];
          } else {
            this.checkedMapId = '';
          }
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  // 得到用户底图
  getUserMapList() {
    const body = {
      start: 0,
      limit: this.everyPageNum * this.pageNum
    };
    this.httpService.getData(body, true, 'execute', this.mData.createMap.queryUserMap, 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.totalPage = (data as any).data.totalProperty;
          this.baseMapList = (data as any).data.root;
          if (this.baseMapList[0]) {
            this.checkedMapId = this.baseMapList[0].service_event_id;
            this.sourceInfo = this.baseMapList[0];
          } else {
            this.checkedMapId = '';
          }
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  /**
   * 选中底图
   * @param e
   */
  public checkedBaseMap(e: any) {
    this.sourceInfo = e;
    this.checkedMapId = e.service_event_id;
  }


  /**
   * 背景图url
   */
  getUrl(type: any) {
    let url = '';
    switch (type) {
      case 0 :
        url = './assets/img/point.png';
        break;
      case 10 :
        url = './assets/img/point.png';
        break;
      case 20:
        url = './assets/img/line.png';
        break;
      case 30:
        url = './assets/img/poygon.png';
        break;
    }
    return url;
  }


  addFilterConOr() {
    this.filterCom2.addFilter();
  }


  addFilterConAnd() {
    this.filterCom.addFilter();
  }

  // 选择关联key
  checkKey(e: any, item: any) {
    if (item.relation_entity_column_id !== '' && item.relation_entity_column_id !== undefined) {
      for (let i = 0; i < this.checkRelation.length; i++) {
        if (this.checkRelation[i].entity_column_id === item.relation_entity_column_id) {
          this.checkRelation.splice(i, 1);
        }
      }
    }
    // TODO（简单处理--后续跟踪） 数据合并 原始数据 关联字段 无法取消问题
    if (e.value) {
      item['relation_entity_column_id'] = e.value.entity_column_id ? e.value.entity_column_id : undefined;
      item['relation_entity_id'] = e.value.entity_id ? e.value.entity_id : undefined;
      item['relation_name'] = e.value.name ? e.value.name : undefined;
      item['relation_desc'] = e.value.description ? e.value.description : undefined;
    } else {
      item['relation_entity_column_id'] = e.value ? e.value.entity_column_id : undefined;
      item['relation_entity_id'] = e.value ? e.value.entity_id : undefined;
      item['relation_name'] = e.value ? e.value.name : undefined;
      item['relation_desc'] = e.value ? e.value.description : undefined;
    }
    //
    if (e.value) {
      this.checkRelation.push(e.value);
    }

    // 处理数据源
    this.dealKeySource();
  }


  // 获取新数据源
  dealKeySource() {
    this.keySoureData = [];
    this.c_cities = [];
    const setOfWords = new Set(this.checkRelation);
    for (const i of this.mData.c_combineFileds) {
      if (!setOfWords.has(i)) {
        this.keySoureData.push(i);
        this.c_cities.push({
          label: i.description,
          value: i
        });
      }
    }
  }


  /**
   * 全选反选
   * @param e
   * @param tag
   */
  // checkedAll(e: any, tag: any) {
  //   if (tag === 1) {
  //     if (e.target.checked) {
  //       for (const i of this.combineFileds) {
  //         i.use = true;
  //       }
  //       this.useStatus = true;
  //     } else {
  //       for (const i of this.combineFileds) {
  //         i.use = false;
  //       }
  //       this.useStatus = false;
  //     }
  //
  //   } else {
  //     if (e.target.checked) {
  //       for (const i of this.keySoureData) {
  //         i.use = true;
  //       }
  //     } else {
  //       for (const i of this.keySoureData) {
  //         i.use = false;
  //       }
  //     }
  //   }
  // }


  /**
   * 地址匹配选择
   */
  conjunctionChange(e: any) {

  }

  /**
   * 地址匹配提交表单
   */
  submitAddress(mData: any, activeModal: any) {
    this.outEventAddress.emit({mData, activeModal});
  }

  submitReAddress(activeModal: any, mData: any) {
    this.outEventReAddress.emit({mData, activeModal});
  }

  beforeAddress(activeModal: any) {
    this.outEventBeforeAddress.emit({activeModal});
  }

  beforeReAddress(activeModal: any) {
    this.outEventBeforeReAddress.emit({activeModal});
  }


  /**
   * 上传图片
   * @param e
   */
  uploadImages(e: any, item: any) {
    this.httpService.makeFileRequest('/upload/1.0.0/layer/img', {forceDelete: true}, e.file).subscribe(result => {
      item.value = '/upload/' + (result as any).data.upload_file.uploads;
      this.checkNull();
    }, error => {

    });
  }


  /**
   * 选中条目
   */
  clickItem(v: any) {
    this.selectedType = v;
  }
}
