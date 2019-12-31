/**
 *专题列表界面组件
 */
import {Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {DataToolbarComponent} from './toolbar/data_toolbar.component';
// import {DataHomeComponent} from './show/data-home.component';
import {ActivatedRoute, Data, Router} from '@angular/router';
import {AppService} from '../s-service/app.service';
import {HttpService} from '../s-service/http.service';
import {SmxModal} from '../smx-component/smx-modal/directive/smx-modal';
import {PopueComponent} from './modal/data-popue.component';
import {DataStorage} from '../s-service/local.storage';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';
import {debug} from 'util';

@Component({
  selector: 'app-data-management',
  templateUrl: './dataManagement.component.html',
  styleUrls: ['./dataManagement.component.scss']
})


export class DataManagementComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(DataToolbarComponent, {static: false}) searchData: DataToolbarComponent;
  @ViewChild('raster_map_calibration', {static: false}) rmc: ElementRef;   // 地图校准
  @ViewChild('raster_image_upload', {static: false}) riu: ElementRef;   // 图片上传
  // @ViewChild(DataHomeComponent, {static: false}) dataHome: DataHomeComponent;
  everyPageNum = 18;
  paddingValue = 80;
  public searchKey: string;

  // 信息配置
  config: any;

  onresizeEvent: any;


  // 界面寬高
  clientW: number;
  clientH: number;

  module: any;

  properties: any; // 配置文件
  constructor(
    public httpService: HttpService,
    public router: Router,
    private ds: DataStorage,
    private modalService: SmxModal,
    public toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private appService: AppService) {

    activatedRoute.data.subscribe((data) => {
      if (data && data.module) {
        this.module = data.module;
        // this.initConfig(data.module);
      }

    });

    // 搜索回调
    activatedRoute.queryParams.subscribe(queryParams => {
        if (queryParams && queryParams.module) {
          this.initConfig(queryParams.module);
        }
        // 调用子组件的查找方法
        if (queryParams && queryParams.gobackKey) {
          this.searchKey = queryParams.gobackKey;
          setTimeout(() => {
            this.searchData.searchKey = queryParams.gobackKey;
            this.searchData.shareData();
          }, 100);
        }

      }
    );


    this.onresizeEvent = this.appService.onresizeEventEmitter.subscribe((value: string) => {
      this.resetWH();
    });

  }


  ngOnInit() {
    // this.resetWH();
    this.properties = <any> this.ds.get('properties');
  }

  addNum() {
    this.searchData.leftNum = this.searchData.leftNum + 1;
  }

  ngAfterViewInit(): void {
    this.initConfig(this.module);
    this.resetWH();
  }


  ngOnDestroy() {
    this.onresizeEvent.unsubscribe();
  }

  /**
   6d59fc74-0374-4c39-8298-428f8d24ea8b 关键字查询我的图层(地理、统计、栅格）
   c3bf17e0-50fe-4d5f-8838-060bf6c1ab05 查询我的图层(地理、统计、栅格）
   f7454fb9-a6fa-4127-897f-3549bd26eeb0 关键字查询共享我的图层(地理、统计、栅格）
   dd82e857-7367-4b30-ae04-8b61a4a5fada 查询共享我的图层(地理、统计、栅格）
   1cbfa3b4-05cb-45df-a8af-702d270f3a7f 查询专题图层(地理、统计、栅格）
   473c2477-2eb8-4303-bd02-3f7bab9cad51 关键字查询专题图层(地理、统计、栅格）
   */
  // 初始化配置
  initConfig(pageType: any) {
    switch (pageType) {
      case 'da': // 数据
        this.config = {
          type: 'da',
          id: 'entity_id',  // 必须
          action: {
            view: '查看',
            edit: '编辑',
            name: 'description'
          },
          toolbar: {
            left: {
              title: '我的数据',
              url: '9d0f80c8-1fd5-46de-b859-f54f12b8e335',
              key: 'ca9b7bff-7b9c-451a-b8b9-d7c86a923803'
            },
            right: {
              title: '共享数据',
              url: 'c2a6527a-c3ae-4db9-a68f-3eedf743e3d9',
              key: '9536e580-dd24-4993-a7b8-42b357bf6feb'
            }
          },
          create: {
            title: '创建数据源',
            type: 0,
            url: '',
            modal: {
              type: 17,
              config: {
                title: '创建数据源',
                tag: 'cds',
                view: {
                  element: 'radio',
                  alias: 'action',
                  value: 1,
                  options: [
                    {label: '自定义数据源', value: 1},
                    {label: 'csv', value: 2}
                  ],
                  children: {
                    1: [
                      {
                        element: 'input',
                        title: '数据源名称',
                        alias: 'name',
                        value: '',
                        type: 'text',
                        isNull: false,
                        isPass: 1,
                        placeholder: '最多输入40个字符',
                        maxLength: 40
                      }, {
                        element: 'radio',
                        title: '数据源类型',
                        alias: 'type',
                        value: 1,
                        options: [
                          {label: '点', value: 1},
                          {label: '线', value: 2},
                          {label: '面', value: 3},
                          {label: '属性数据', value: 4}]
                      }
                    ], 2: [
                      {
                        element: 'upload',
                        title: '导入文件',
                        alias: 'upload',
                        value: '',
                        isNull: false,
                        isPass: 0,
                        size: 20,
                        tip: '上传最大文件限制为20M'
                      },
                      {
                        element: 'select',
                        title: '选择编码',
                        alias: 'description',
                        value: 'GBK',
                        options: [
                          {label: 'GBK', value: 'GBK'},
                          {label: 'UTF8', value: 'UTF8'},
                          {label: 'GB2312', value: 'GB2312'}
                        ],
                        isNull: true,
                        isPass: 0
                      }
                    ]
                  }
                }
              }
            }
          },
          delete: {
            id: 'entity_id',
            title: '删除数据源',
            type: 0,
            url: 'a11fc10a-7399-4669-a0b3-5abe36bccb1b',
            modal: {
              type: 11,
              config: {
                title: '删除数据源',
                view: '该数据被删除后,由该数据创建的图层和地图中的图层也将被删除!'
              }
            }
          },
          update: {
            id: 'entity_id',
            title: '修改数据源信息',
            url: '431f4042-16dd-41dd-9cff-69024084c3ca',
            type: 0,
            modal: {
              types: ['name', 'description'],
              info: {
                name: {label: '数据源名称:'},
                description: {label: '数据源描述:'},
              }
            },
            params: [['entity_id', 'entity_id'],
              ['description', 'description'], ['remark', 'remark']]

          },
          shareAccess: {
            id: 'entity_id',
            share_id: 'entity_share_id',
            title: '分享列表',
            interface: {
              queryUser: '8063f39e-f88d-4222-bbba-c94a84f73c2f', // 查询共享用户
              updatePermission: 'a3d1ced4-c8bd-4e71-91eb-207da1763595', // 修改用户共享权限
              deleteUser: 'c7327c98-7924-404a-a18d-c74df8ff6b5a', // 取消指定用户共享
              addUser: '3b9f8ee5-137c-4e30-9138-516abdad623f', // 添加共享用户
            },
            params: [['entity_id', 'entity_id']]
          },
          viewInfo: {
            title: '数据源信息',
            type: 0,
            modal: {
              type: 13,
              config: {
                title: '数据源信息',
                type: 0,
                view: [
                  {title: '数据源名称', alias: 'description', type: 1, color: 'green'},
                  {title: '数据源描述', alias: 'remark', type: 1, color: 'green'},
                  {title: '空间属性', alias: 'geo_type', type: 7, pipe: 'dataType', color: 'green'},
                  {title: '数据源类型', alias: 'geo_type', type: 7, pipe: 'geoType', color: 'green'},
                  {title: '创建者', alias: 'create_user', type: 6, color: 'white'},
                  {title: '创建日期', alias: 'create_time', type: 2, color: 'white'},
                  {title: '修改日期', alias: 'update_time', type: 2, color: 'white'},
                  {title: '浏览次数', alias: 'visit_count', type: 1, color: 'white'}
                ]
              }
            }
          },
          visitCount: true,
          container: {
            width: 180,
            height: 175,
            margin: 5
          }
        };
        break;
      case 'ap': // 小程序
        this.config = {
          type: 'ap',
          id: 'mini_program_id',
          pubCheck: '此小程序未发布',
          action: {
            edit: '编辑',
            view: '查看',
            name: 'name'
          },
          toolbar: {
            left: {
              title: '我的小程序',
              url: '60e3357c-097c-457b-8f1a-e13bfa017854',
              key: '6dedafc9-6dcf-4812-b852-003a45443a5e'
            },
            right: {
              title: '共享小程序',
              url: '86241ac9-a07e-4630-83d1-e83803c06bed',
              key: '836d72ec-595a-4078-af84-0cec52ba7ac1'
            }
          },
          delete: {
            id: 'mini_program_id',
            title: '删除小程序',
            type: 0,
            url: '45807b63-991f-47da-a5af-0571a563a1a5',
            modal: {
              type: 11,
              config: {
                title: '删除小程序',
                view: '您确定要删除选定小程序?'
              }
            }
          },
          chooseMap: {
            action: 2, // 1 有自定义 // 2 无自定义
            independence: 2, // 1 独立性  2 有关联
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
          },
          create: {
            title: '创建小程序',
            type: 1,
            url: '0e16a018-117f-43e9-98ac-dd57341a1b00',
            modal: {
              type: 'chooseMap',
              types: ['name', 'description', 'type'],
              info: {
                name: {label: '小程序名称:'},
                description: {label: '小程序描述:'},
                type: {
                  label: '小程序类型:',
                  values: [1, 2, 3, 4]
                }
              }
            },
            params: {default_map_id: 'map_id', name: 'name', description: 'description', type: 'type', icon: 'icon'}
          },
          update: {
            id: 'mini_program_id',
            title: '修改小程序信息',
            url: '39b0298f-bc7c-46e0-b330-230c30673e9b',
            type: 0,
            modal: {
              types: ['name', 'description', 'type'],
              info: {
                name: {label: '小程序名称:'},
                description: {label: '小程序描述:'},
                type: {
                  label: '小程序类型:',
                  values: [1, 2, 3, 4]
                }
              }
            },
            params: [['mini_program_id', 'mini_program_id'], ['name', 'name'], ['description', 'description'],
              ['type', 'type'], ['icon', 'icon']]
          },
          share: {
            title: '分享列表',
            type: 0,
            modal: {
              type: 14,
              config: {
                title: '分享列表',
                url: {
                  query: '2f3f6b76-954b-4c1e-ae18-6b12d6449bd8',
                  update: '200df0d6-4b3e-4473-9abd-f9a8eae4d907',
                  delete: '7d9a3780-2a20-409e-b666-9dd7556dc6cf',
                  insert: 'f7bb9e62-f8db-49c1-9ae1-74c5fdde31c1'
                },
                view: {
                  id: 'mini_program_id',
                  share_id: 'mini_program_share_id'
                }
              }

            }

          },
          viewInfo: {
            title: '小程序信息',
            type: 0,
            modal: {
              type: 13,
              config: {
                title: '小程序信息',
                type: 0,
                view: [
                  {title: '小程序名称', alias: 'name', type: 1, color: 'green'},
                  {title: '小程序描述', alias: 'description', type: 1, color: 'green'},
                  {title: '创建者', alias: 'create_user', type: 6, color: 'white'},
                  {title: '创建日期', alias: 'create_time', type: 2, color: 'white'},
                  {title: '修改日期', alias: 'update_time', type: 2, color: 'white'},
                  {title: '调用次数', alias: 'visit_count', type: 1, color: 'white'},
                  {title: '推荐版本', alias: '           ', type: 8, color: 'white'},
                  {title1: '版本号', title2: '版本描述', alias: '', type: 9, color: 'white'}
                ]
              }
            }
          },
          visitCount: true,
          container: {
            width: 180,
            height: 175,
            margin: 5
          }
        };
        break;
      case 'en': // 数据查询方案
        this.config = {
          type: 'en',
          id: 'service_event_id',
          action: {
            view: '查看',
            edit: '编辑',
            name: 'description'
          },
          toolbar: {
            left: {
              title: '我的方案',
              url: '1ab70284-f540-4d0e-8589-ed7ce28221e5',
              key: '5925a68e-b0b5-4b1a-8ad8-e2830b5afb63'
            },
            right: {
              title: '共享方案',
              url: 'd0f48fcb-a934-498a-898e-962f3f0d8cce',
              key: 'c681ca6c-ea46-4f32-bf8f-cb5d6ebebbb3'
            }
          },
          delete: {
            id: 'service_event_id',
            title: '删除数据方案',
            type: 0,
            url: 'ab59f817-0838-4c98-9510-8f7fe0c490db',
            modal: {
              type: 11,
              config: {
                title: '删除数据方案',
                view: '您确定要删除此数据方案?'
              }
            }
          },
          update: {
            id: 'service_event_parameters_id',
            title: '修改方案信息',
            url: 'e81c5e06-8991-404c-925a-db868f5947c9',
            type: 0,
            modal: {
              types: ['name', 'description'],
              info: {
                name: {label: '方案名称:'},
                description: {label: '方案描述:'}
              },
            },
            params: [['service_event_id', 'service_event_id'], ['description', 'description'], ['remark', 'remark']]
          },
          create: {
            title: '新增方案',
            type: 2,
            url: '0e16a018-117f-43e9-98ac-dd57341a1b00'
          },
          shareAccess: {
            id: 'service_event_parameters_id',
            share_id: 'service_event_share_id',
            title: '分享列表',
            interface: {
              queryUser: 'b6a76045-87f7-4ace-84f4-dceb6e21b8aa', // 查询共享用户 // do
              updatePermission: 'd450f849-ddd3-42a4-8095-1059f19d49cf', // 修改用户共享权限 // do
              deleteUser: '2f42c61d-850c-4791-8159-88c9eee3e750', // 取消指定用户共享 // do
              addUser: '9433fef2-5d20-47a7-8f88-24566ab38652', // 添加共享用户 // do
            },
            params: [['service_event_parameters_id', 'service_event_id'], ['service_event_id', 'service_event_id']]
          },
          viewInfo: {
            title: '数据方案信息',
            type: 0,
            modal: {
              type: 13,
              config: {
                title: '数据方案信息',
                type: 0,
                view: [
                  {title: '方案名称', alias: 'description', type: 1, color: 'green'},
                  {title: '方案描述', alias: 'remark', type: 1, color: 'green'},
                  {title: '方案ID', alias: 'service_event_id', type: 3, color: 'green'},
                  {title: '创建者', alias: 'create_user', type: 6, color: 'white'},
                  {title: '创建日期', alias: 'create_time', type: 2, color: 'white'},
                  {title: '修改日期', alias: 'update_time', type: 2, color: 'white'},
                  {title: '浏览次数', alias: 'visit_count', type: 1, color: 'white'}
                ]
              }
            }
          },
          visitCount: true,
          container: {
            width: 180,
            height: 175,
            margin: 5
          }
        };
        break;
      case 'icon': // 系统符号库
        this.config = {
          type: 'icon',
          id: 'entity_id',  // 必须
          action: {
            name: 'description'
          },
          toolbar: {
            left: {
              title: '专属符号库',
              url: '85d2d6d0-6290-4f66-802b-10e2bbe97815',
              key: '5cdc57c3-6500-4c2f-92fd-ee8fc85c633a'
            },
            right: {
              title: '系统符号库',
              url: 'db190f9a-7542-4b11-8f70-1b6d7db24d02',
              key: 'dabab2fe-30c5-4ca4-af36-f0400315008d'
            }
          },
          create: {
            title: '创建图标',
            type: 0,
            url: '6273985c-7315-4a42-a9b2-ec35628cc197',
            modal: {
              type: 10,
              config: {
                title: '图标符号上传',
                tag: 'icon_upload',
                view: [
                  {
                    element: 'icon_upload',
                    title: '图标',
                    alias: 'icon_upload',
                    size: 0.5,
                    value: '',
                    isNull: false,
                    isPass: 0
                  },
                  {
                    element: 'input',
                    title: '名称',
                    alias: 'description',
                    value: '',
                    type: 'text',
                    isNull: false,
                    isPass: 1,
                    placeholder: '请输入名称'
                  },
                  {
                    element: 'input',
                    title: '编号',
                    alias: 'name',
                    value: '等待系统分配',
                    type: 'number',
                    isNull: false,
                    isPass: 2,
                    disabled: true,
                    placeholder: '等待系统分配'
                  }],
              }
            }
          },
          delete: {
            id: 'icon_id',
            title: '删除图标',
            type: 0,
            url: '052792d4-0d01-44da-a45a-836858c03afd',
            modal: {
              type: 11,
              config: {
                title: '删除图标',
                view: '是否确定删除此图标?'
              }
            }
          },
          update: {
            title: '上传图标',
            type: 1,
            url: '9ad139dd-47a9-442b-97f9-62b550d338de',
            modal: {
              type: 12,
              config: {
                title: '上传图标',
                type: 1,
                view: [{title: '图标', alias: 'icon_upload'},
                  {title: '名称', alias: 'description', type: 'text', isNull: false, isPass: 1, placeholder: '请输入名称'},
                  {
                    title: '编号',
                    alias: 'name',
                    type: 'number',
                    isNull: false,
                    isPass: 2,
                    disabled: true,
                    placeholder: '请输入7位数字编号'
                  }],
              }
            }
          },
          iconNum: true,
          container: {
            width: 180,
            height: 175,
            margin: 5
          }
        };
        break;
      case 'map':
        this.config = {
          type: 'map',
          id: 'map_id',  // 必须
          pubCheck: '此地图未发布',
          action: {
            view: '查看地图',
            edit: '编辑地图',
            qc: '扫一扫 查看地图',
            name: 'name',
            time: true
          },
          toolbar: {
            left: {
              title: '我的地图',
              url: '71c21c45-39eb-49f6-ac2d-8e75089f3078',
              key: 'c562da8b-7f07-4729-80da-f2ea696842d4'
            },
            right: {
              title: '共享地图',
              url: '4f1edbbe-5e06-4c1e-83f5-57b76e9c3aa3',
              key: 'f539702a-276b-4d80-be5d-1a8ea827a5dd'
            }
          },
          create: {
            title: '创建地图',
            type: 0,
            url: 'c562da8b-7f07-4729-80da-f2ea696842d1',
            modal: {
              type: 15,
              config: {
                title: '创建地图',
                independence: 2,
                url: {
                  queryLeft: 'fa20136d-a6b2-40da-b8c5-29b3a361c42b',
                  searchLeft: '5878e037-1c61-4c9a-9f4a-653e70c2d5c4',
                  searchRight: '8b6f180d-63ee-44f9-99b6-334159fcc124',
                  queryRight: '31a835e5-8e55-439a-9b63-3886cb08390e',
                },
                view: {
                  action: 1,
                  leftTitle: '系统底图',
                  rightTitle: '用户底图',
                  id: 'map_id',
                  name: 'name',
                  description: 'description',
                  img: 'thumbnail'
                },
                modal: {
                  type: 10,
                  config: {
                    title: '创建地图',
                    independence: 3,
                    type: 0,
                    view: [
                      {
                        element: 'input',
                        title: '地图名称',
                        alias: 'name',
                        value: '',
                        type: 'text',
                        isNull: false,
                        isPass: 1,
                        placeholder: '最多输入40个字符',
                        maxLength: 40
                      },
                      {
                        element: 'textarea',
                        title: '地图描述',
                        alias: 'description',
                        value: '',
                        type: 'text',
                        isNull: true,
                        isPass: 0,
                        placeholder: '最多输入256个字符',
                        maxLength: 256
                      }
                    ],
                  }
                }
              }
            }
          },
          update: {
            id: 'map_id',
            title: '修改地图信息',
            type: 1,
            url: 'c562da8b-7f07-4729-80da-f2ea696842d2',
            modal: {
              type: 12,
              config: {
                title: '修改地图信息',
                type: 0,
                view: [
                  {
                    title: '地图名称',
                    alias: 'name',
                    type: 'text',
                    isNull: false,
                    isPass: 1,
                    placeholder: '请输入名称',
                    maxlength: 40
                  },
                  {
                    title: '地图描述',
                    alias: 'description',
                    type: 'text',
                    isNull: true,
                    isPass: 0,
                    placeholder: '请输入描述',
                    maxlength: 256
                  }],
              }
            },
            params: [['name', 'name'], ['description', 'description']]
          },
          delete: {
            id: 'map_id',
            title: '删除地图',
            type: 0,
            url: 'c562da8b-7f07-4729-80da-f2ea696842d3',
            modal: {
              type: 11,
              config: {
                title: '删除地图',
                view: '确定要删除选定地图?'
              }
            }
          },
          viewInfo: {
            title: '地图信息',
            type: 0,
            modal: {
              type: 13,
              config: {
                title: '地图信息',
                type: 0,
                view: [
                  {title: '地图名称', alias: 'name', type: 1, color: 'green'},
                  {title: '地图描述', alias: 'description', type: 1, color: 'green'},
                  {title: '地图ID', alias: 'map_id', type: 3, color: 'green'},
                  {title: 'URL', alias: 'url', type: 4, color: 'green', label: 'map_id'},
                  {title: 'iframe', alias: 'iframe', type: 5, color: 'green', label: 'map_id'},
                  {title: '创建者', alias: 'create_user', type: 6, color: 'white'},
                  {title: '创建日期', alias: 'cteate_time', type: 2, color: 'white'},
                  {title: '修改日期', alias: 'update_time', type: 2, color: 'white'},
                  {title: '浏览次数', alias: 'visit_count', type: 1, color: 'white'}
                ]
              }
            }

          },
          share: {
            title: '分享列表',
            type: 0,
            modal: {
              type: 14,
              config: {
                title: '分享列表',
                url: {
                  query: '19cce284-4a6c-4422-8475-2c7bb8d69d3b',
                  update: 'f988e15a-8c6b-423c-b66b-6902ab18041d',
                  delete: '217e7971-f60a-4bd1-b4e1-565b1d8e4a2b',
                  insert: '70249c31-9b33-4099-b452-ef0caa8601ec'
                },
                view: {
                  id: 'map_id',
                  share_id: 'map_instance_share_id'
                }
              }

            }

          },
          visitCount: true,
          container: {
            width: 275,
            height: 270,
            margin: 5
          }
        };
        break;
      case 'geo':
        this.config = {
          type: 'geo',
          id: 'layer_id',  // 必须
          pubCheck: '此图层未发布',
          action: {
            view: '查看图层',
            edit: '编辑图层',
            name: 'name'
          },
          toolbar: {
            left: {
              title: '我的地理图层',
              url: 'c3bf17e0-50fe-4d5f-8838-060bf6c1ab05',
              key: '6d59fc74-0374-4c39-8298-428f8d24ea8b'
            },
            right: {
              title: '共享地理图层',
              url: 'dd82e857-7367-4b30-ae04-8b61a4a5fada',
              key: 'f7454fb9-a6fa-4127-897f-3549bd26eeb0'
            }
          },
          create: {
            title: '创建图层',
            type: 0,
            url: '89ae7869-4904-4c78-a80e-69815e924de3',
            modal: {
              type: 15,
              config: {
                title: '创建图层',
                independence: 2,
                url: {
                  queryLeft: '33c1174f-ff51-49f9-a635-7777cf503917',
                  searchLeft: '03b5b9bc-f8de-4397-a594-d45731eac97d',
                  searchRight: '3c744ced-c950-4bd8-b5d4-ab5547b0cd8d',
                  queryRight: '66925d61-1b9d-46f8-9867-4f9c204f4f5e',
                },
                view: {
                  action: 2, // 1自定义
                  list: 2,
                  leftTitle: '我的数据',
                  rightTitle: '共享数据',
                  id: 'service_event_id',
                  name: 'description',
                  description: 'description',
                  img: 'thumbnail'
                },
                modal: {
                  type: 10,
                  config: {
                    title: '创建地理图层',
                    independence: 3,
                    type: 0,
                    view: [
                      {
                        element: 'input',
                        title: '图层名称',
                        alias: 'name',
                        value: '',
                        type: 'text',
                        isNull: false,
                        isPass: 1,
                        placeholder: '最多输入40个字符',
                        maxLength: 40
                      },
                      {
                        element: 'textarea',
                        title: '图层描述',
                        alias: 'description',
                        value: '',
                        type: 'text',
                        isNull: true,
                        isPass: 0,
                        placeholder: '最多输入256个字符',
                        maxLength: 256
                      }
                    ],
                  }
                }
              }
            }
          },
          update: {
            title: '修改地图信息',
            type: 1,
            url: '8e2a7de2-fe0c-404a-86fc-f9554f4f552e',
            modal: {
              type: 12,
              config: {
                title: '修改图层信息',
                type: 0,
                view: [
                  {
                    title: '图层名称',
                    alias: 'name',
                    type: 'text',
                    isNull: false,
                    isPass: 1,
                    placeholder: '请输入名称',
                    maxlength: 40
                  },
                  {
                    title: '图层描述',
                    alias: 'description',
                    type: 'text',
                    isNull: true,
                    isPass: 0,
                    placeholder: '请输入描述',
                    maxlength: 256
                  }],
              }
            }
          },
          delete: {
            id: 'layer_id',
            old_id: 'layer_style_id',
            title: '删除图层',
            type: 0,
            url: '36d13b62-6afe-4357-b54a-3a2797065deb',
            modal: {
              type: 11,
              config: {
                title: '删除图层',
                view: '图层删除后,与此相关的所有数据引用将会失效,确定要删除选定图层?'
              }
            }
          },
          viewInfo: {
            title: '图层信息',
            type: 0,
            modal: {
              type: 13,
              config: {
                title: '图层信息',
                type: 0,
                view: [ // 1 普通 2 时间 3 普通复制 4 url 5 ifram  6 创建者  7 管道
                  {title: '图层名称', alias: 'name', type: 1, color: 'green'},
                  {title: '图层描述', alias: 'description', type: 1, color: 'green'},
                  {title: '图层ID', alias: 'layer_id', type: 3, color: 'green'},
                  {title: '数据源名称', alias: 'entity_desc', type: 1, color: 'green'},
                  {title: '图层类型', alias: 'geo_type', type: 7, pipe: 'geoType', color: 'green'},
                  {title: '创建者', alias: 'create_user', type: 6, color: 'white'},
                  {title: '创建日期', alias: 'create_time', type: 2, color: 'white'},
                  {title: '修改日期', alias: 'update_time', type: 2, color: 'white'},
                  {title: '浏览次数', alias: 'visit_count', type: 1, color: 'white'}
                ]
              }
            }

          },
          share: {
            title: '分享列表',
            type: 0,
            modal: {
              type: 14,
              config: {
                title: '分享列表',
                url: {
                  query: '97d2de31-f0ba-415f-8c68-c8d56bde10b5',
                  update: '5d856188-f924-4946-bd12-8e970d9a3c93',
                  delete: 'bcab3fd7-0e89-40e4-a95d-3a9d691f5abb',
                  insert: 'fa02b154-9db2-434a-89f1-4af010644c8f'
                },
                view: {
                  id: 'layer_id',
                  share_id: 'layer_share_id'
                }
              }

            }

          },
          visitCount: true,
          container: {
            width: 275,
            height: 270,
            margin: 5
          }
        };
        break;
      case 'sta':
        this.config = {
          type: 'sta',
          id: 'layer_id',  // 必须
          pubCheck: '此图层未发布',
          action: {
            view: '查看图层',
            edit: '编辑图层',
            name: 'name'
          },
          toolbar: {
            left: {
              title: '我的统计图层',
              url: 'c3bf17e0-50fe-4d5f-8838-060bf6c1ab05',
              key: '6d59fc74-0374-4c39-8298-428f8d24ea8b'
            },
            right: {
              title: '共享统计图层',
              url: 'dd82e857-7367-4b30-ae04-8b61a4a5fada',
              key: 'f7454fb9-a6fa-4127-897f-3549bd26eeb0'
            }
          },
          create: {
            title: '创建图层',
            type: 0,
            url: '89ae7869-4904-4c78-a80e-69815e924de3',
            modal: {
              type: 15,
              config: {
                title: '创建图层',
                independence: 2,
                url: {
                  queryLeft: '33c1174f-ff51-49f9-a635-7777cf503917',
                  searchLeft: '03b5b9bc-f8de-4397-a594-d45731eac97d',
                  searchRight: '3c744ced-c950-4bd8-b5d4-ab5547b0cd8d',
                  queryRight: '66925d61-1b9d-46f8-9867-4f9c204f4f5e',
                },
                view: {
                  action: 2, // 1自定义
                  list: 2,
                  leftTitle: '我的数据',
                  rightTitle: '共享数据',
                  id: 'service_event_id',
                  name: 'description',
                  description: 'description',
                  img: 'thumbnail'
                },
                modal: {
                  type: 20,
                  config: {
                    title: '选择统计类型',
                    modal: {
                      type: 101,
                      config: {
                        title: '创建统计图层',
                        independence: 3,
                        type: 0,
                        view: [
                          {
                            element: 'input',
                            title: '图层名称',
                            alias: 'name',
                            value: '',
                            type: 'text',
                            isNull: false,
                            isPass: 1,
                            placeholder: '最多输入40个字符',
                            maxLength: 40
                          },
                          {
                            element: 'textarea',
                            title: '图层描述',
                            alias: 'description',
                            value: '',
                            type: 'text',
                            isNull: true,
                            isPass: 0,
                            placeholder: '最多输入256个字符',
                            maxLength: 256
                          }
                        ],
                      }
                    }
                  }
                }
              }
            }
          },
          update: {
            title: '修改地图信息',
            type: 1,
            url: '8e2a7de2-fe0c-404a-86fc-f9554f4f552e',
            modal: {
              type: 12,
              config: {
                title: '修改图层信息',
                type: 0,
                view: [
                  {
                    title: '图层名称',
                    alias: 'name',
                    type: 'text',
                    isNull: false,
                    isPass: 1,
                    placeholder: '请输入名称',
                    maxlength: 40
                  },
                  {
                    title: '图层描述',
                    alias: 'description',
                    type: 'text',
                    isNull: true,
                    isPass: 0,
                    placeholder: '请输入描述',
                    maxlength: 256
                  }],
              }
            }
          },
          delete: {
            id: 'layer_id',
            old_id: 'layer_style_id',
            title: '删除图层',
            type: 0,
            url: '36d13b62-6afe-4357-b54a-3a2797065deb',
            modal: {
              type: 11,
              config: {
                title: '删除图层',
                view: '图层删除后,与此相关的所有数据引用将会失效,确定要删除选定图层?'
              }
            }
          },
          viewInfo: {
            title: '图层信息',
            type: 0,
            modal: {
              type: 13,
              config: {
                title: '图层信息',
                type: 0,
                view: [
                  {title: '图层名称', alias: 'name', type: 1, color: 'green'},
                  {title: '图层描述', alias: 'description', type: 1, color: 'green'},
                  {title: '图层ID', alias: 'layer_id', type: 3, color: 'green'},
                  {title: '数据源名称', alias: 'entity_desc', type: 1, color: 'green'},
                  {title: '专题类型', alias: 'layer_statistics_id', type: 7, pipe: 'staType', color: 'green'},
                  {title: '创建者', alias: 'create_user', type: 6, color: 'white'},
                  {title: '创建日期', alias: 'create_time', type: 2, color: 'white'},
                  {title: '修改日期', alias: 'update_time', type: 2, color: 'white'},
                  {title: '浏览次数', alias: 'visit_count', type: 1, color: 'white'}
                ]
              }
            }

          },
          share: {
            title: '分享列表',
            type: 0,
            modal: {
              type: 14,
              config: {
                title: '分享列表',
                url: {
                  query: '97d2de31-f0ba-415f-8c68-c8d56bde10b5',
                  update: '5d856188-f924-4946-bd12-8e970d9a3c93',
                  delete: 'bcab3fd7-0e89-40e4-a95d-3a9d691f5abb',
                  insert: 'fa02b154-9db2-434a-89f1-4af010644c8f'
                },
                view: {
                  id: 'layer_id',
                  share_id: 'layer_share_id'
                }
              }

            }

          },
          visitCount: true,
          container: {
            width: 275,
            height: 270,
            margin: 5
          }
        };
        break;
      case 'raster':
        this.config = {
          type: 'raster',
          id: 'layer_id',  // 必须
          pubCheck: '此图层未发布',
          action: {
            view: '查看图层',
            edit: '编辑图层',
            name: 'name'
          },
          toolbar: {
            left: {
              title: '我的栅格图层',
              url: 'c3bf17e0-50fe-4d5f-8838-060bf6c1ab05',
              key: '6d59fc74-0374-4c39-8298-428f8d24ea8b'
            },
            right: {
              title: '共享栅格图层',
              url: 'dd82e857-7367-4b30-ae04-8b61a4a5fada',
              key: 'f7454fb9-a6fa-4127-897f-3549bd26eeb0'
            }
          },
          create: {
            title: '创建图层',
            type: 0,
            url: '89ae7869-4904-4c78-a80e-69815e924de3',
            modal: {
              type: 17,
              tag: 'create-raster',
              template: {'url': this.riu, 'rmc': this.rmc},
              config: {
                title: '创建图层',
                tag: 'raster',
                view: {
                  element: 'radio',
                  alias: 'action',
                  value: 1,
                  options: [
                    {label: '栅格影像', value: 1},
                    {label: 'WMS服务', value: 2},
                    {label: 'WMTS服务', value: 3},
                    {label: '图片', value: 4},
                  ],
                  children: {
                    1: [
                      {
                        element: 'input',
                        title: 'URL',
                        alias: 'name',
                        value: '',
                        type: 'text',
                        placeholder: '栅格影像路径',
                        tag: 'url',
                        isNull: false,
                        tip: '请填写XYZ瓦片图层URL，{x}{y}{z}将被替换为实际瓦片坐标。http://example.com/{z}/{x}/{y}.png',
                        selectType: 101,
                      },
                    ],
                    2: [
                      {
                        element: 'input',
                        title: 'URL',
                        alias: 'name',
                        value: '',
                        type: 'text',
                        placeholder: 'WMS路径',
                        tag: 'url',
                        isNull: false,
                        selectType: 105,
                      }, {
                        element: 'input',
                        title: 'tile Size',
                        alias: 'name',
                        value: '',
                        placeholder: '瓦片尺寸，建议填写256~512之间的数值',
                        type: 'number',
                        tag: 'tileSize',
                        isNull: false
                      }
                    ],
                    3: [
                      {
                        element: 'input',
                        title: 'URL',
                        alias: 'name',
                        value: '',
                        placeholder: 'WMTS路径',
                        type: 'text',
                        tag: 'url',
                        isNull: false,
                        selectType: 106,
                      }, {
                        element: 'input',
                        title: 'tile Size',
                        alias: 'name',
                        value: '',
                        placeholder: '瓦片尺寸，建议填写256~512之间的数值',
                        type: 'number',
                        tag: 'tileSize',
                        isNull: false
                      }],
                    4: [
                      {
                        element: 'c-control',
                        title: 'URL',
                        alias: 'url',
                        control: 'url',
                        value: '',
                        tag: 'image',
                        isNull: false,
                        selectType: 109,
                      }, {
                        element: 'input',
                        title: '左上经纬度',
                        alias: 'name',
                        placeholder: 'lng,lat(必须)',
                        value: '',
                        type: 'text',
                        tag: 'leftTop',
                        isNull: false
                      }, {
                        element: 'input',
                        title: '右上经纬度',
                        alias: 'name',
                        placeholder: 'lng,lat',
                        value: '',
                        type: 'text',
                        tag: 'rightTop',
                        isNull: true
                      }, {
                        element: 'input',
                        title: '右下经纬度',
                        alias: 'name',
                        placeholder: 'lng,lat(必须)',
                        value: '',
                        type: 'text',
                        tag: 'rightBottom',
                        isNull: false
                      }, {
                        element: 'input',
                        title: '左下经纬度',
                        alias: 'name',
                        placeholder: 'lng,lat',
                        value: '',
                        type: 'text',
                        tag: 'leftBottom',
                        isNull: true
                      },
                      {
                        element: 'c-control',
                        alias: 'rmc',
                        control: 'rmc',
                        value: '23423',
                      }]
                  }
                }
              },
              modal: {
                type: 10,
                config: {
                  title: '创建栅格图层',
                  independence: 3,
                  type: 0,
                  view: [
                    {
                      element: 'input',
                      title: '图层名称',
                      alias: 'name',
                      value: '',
                      type: 'text',
                      isNull: false,
                      isPass: 1,
                      placeholder: '最多输入40个字符',
                      maxLength: 40
                    },
                    {
                      element: 'textarea',
                      title: '图层描述',
                      alias: 'description',
                      value: '',
                      type: 'text',
                      isNull: true,
                      isPass: 0,
                      placeholder: '最多输入256个字符',
                      maxLength: 256
                    }
                  ],
                }
              }
            }
          },
          update: {
            title: '修改图层信息',
            type: 1,
            url: '8e2a7de2-fe0c-404a-86fc-f9554f4f552e',
            modal: {
              type: 12,
              config: {
                title: '修改图层信息',
                type: 0,
                view: [
                  {
                    title: '图层名称',
                    alias: 'name',
                    type: 'text',
                    isNull: false,
                    isPass: 1,
                    placeholder: '请输入名称',
                    maxlength: 40
                  },
                  {
                    title: '图层描述',
                    alias: 'description',
                    type: 'text',
                    isNull: true,
                    isPass: 0,
                    placeholder: '请输入描述',
                    maxlength: 256
                  }],
              }
            }
          },
          delete: {
            id: 'layer_id',
            old_id: 'layer_style_id',
            title: '删除图层',
            type: 0,
            url: '36d13b62-6afe-4357-b54a-3a2797065deb',
            modal: {
              type: 11,
              config: {
                title: '删除图层',
                view: '图层删除后,与此相关的所有数据引用将会失效,确定要删除选定图层?'
              }
            }
          },
          viewInfo: {
            title: '图层信息',
            type: 0,
            modal: {
              type: 13,
              config: {
                title: '图层信息',
                type: 0,
                view: [ // 1 普通 2 时间 3 普通复制 4 url 5 ifram  6 创建者  7 管道
                  {title: '图层名称', alias: 'name', type: 1, color: 'green'},
                  {title: '图层描述', alias: 'description', type: 1, color: 'green'},
                  {title: '图层ID', alias: 'layer_id', type: 3, color: 'green'},
                  {title: '数据源名称', alias: 'entity_desc', type: 1, color: 'green'},
                  {title: '图层类型', alias: 'geo_type', type: 7, pipe: 'geoType', color: 'green'},
                  {title: '创建者', alias: 'create_user', type: 6, color: 'white'},
                  {title: '创建日期', alias: 'create_time', type: 2, color: 'white'},
                  {title: '修改日期', alias: 'update_time', type: 2, color: 'white'},
                  {title: '浏览次数', alias: 'visit_count', type: 1, color: 'white'}
                ]
              }
            }

          },
          share: {
            title: '分享列表',
            type: 0,
            modal: {
              type: 14,
              config: {
                title: '分享列表',
                url: {
                  query: '97d2de31-f0ba-415f-8c68-c8d56bde10b5',
                  update: '5d856188-f924-4946-bd12-8e970d9a3c93',
                  delete: 'bcab3fd7-0e89-40e4-a95d-3a9d691f5abb',
                  insert: 'fa02b154-9db2-434a-89f1-4af010644c8f'
                },
                view: {
                  id: 'layer_id',
                  share_id: 'layer_share_id'
                }
              }

            }

          },
          visitCount: true,
          container: {
            width: 275,
            height: 270,
            margin: 5
          }
        };
        break;
      case 'plot':
        this.config = {
          type: 'plot',
          id: 'plot_id',  // 必须
          pubCheck: '此地图未发布',
          action: {
            view: '查看地图',
            edit: '编辑地图',
            qc: '扫一扫 查看地图',
            name: 'name',
            time: true
          },
          toolbar: {
            left: {
              title: '我的标绘地图',
              url: '375840c9-fe23-4a53-9095-46c4715890c6',
              key: 'c317a956-1e1c-4510-a13d-8dcf2bbfb0eb'
            },
            right: {
              title: '共享标绘地图',
              url: '7256f8bd-333e-4a77-8d3b-b122f3f441ad',
              key: '69ebb721-513b-41f2-9211-5bf2957f4538'
            }
          },
          create: {
            title: '创建标绘地图',
            type: 0,
            url: '8851aa6f-6f3d-4d5d-a279-5d475d7a5424',
            modal: {
              type: 15,
              config: {
                title: '创建标绘地图',
                independence: 2,
                url: {
                  queryLeft: 'fa20136d-a6b2-40da-b8c5-29b3a361c42b',
                  searchLeft: '5878e037-1c61-4c9a-9f4a-653e70c2d5c4',
                  searchRight: '8b6f180d-63ee-44f9-99b6-334159fcc124',
                  queryRight: '31a835e5-8e55-439a-9b63-3886cb08390e',
                },
                view: {
                  action: 2,
                  leftTitle: '系统底图',
                  rightTitle: '用户底图',
                  id: 'map_id',
                  name: 'name',
                  description: 'description',
                  img: 'thumbnail'
                },
                modal: {
                  type: 10,
                  config: {
                    title: '创建标绘地图',
                    independence: 3,
                    type: 0,
                    view: [
                      {
                        element: 'input',
                        title: '地图名称',
                        alias: 'name',
                        value: '',
                        type: 'text',
                        isNull: false,
                        isPass: 1,
                        placeholder: '最多输入40个字符',
                        maxLength: 40
                      },
                      {
                        element: 'textarea',
                        title: '地图描述',
                        alias: 'description',
                        value: '',
                        type: 'text',
                        isNull: true,
                        isPass: 0,
                        placeholder: '最多输入256个字符',
                        maxLength: 256
                      }
                    ],
                  }
                }
              }
            }
          },
          update: {
            title: '修改地图信息',
            type: 1,
            url: '65bfde1e-f460-4e5e-9e0c-4f23c27f698a',
            modal: {
              type: 12,
              config: {
                title: '修改地图信息',
                type: 0,
                view: [
                  {
                    title: '地图名称',
                    alias: 'name',
                    type: 'text',
                    isNull: false,
                    isPass: 1,
                    placeholder: '请输入名称',
                    maxlength: 40
                  },
                  {
                    title: '地图描述',
                    alias: 'description',
                    type: 'text',
                    isNull: true,
                    isPass: 0,
                    placeholder: '请输入描述',
                    maxlength: 256
                  }],
              }
            }
          },
          delete: {
            id: 'plot_id',
            title: '删除地图',
            type: 0,
            url: '0087e600-2a92-4162-900b-1a81a846ef0b',
            modal: {
              type: 11,
              config: {
                title: '删除地图',
                view: '确定要删除选定地图?'
              }
            }
          },
          viewInfo: {
            title: '地图信息',
            type: 0,
            modal: {
              type: 13,
              config: {
                title: '地图信息',
                type: 0,
                view: [
                  {title: '地图名称', alias: 'name', type: 1, color: 'green'},
                  {title: '地图描述', alias: 'description', type: 1, color: 'green'},
                  {title: '地图ID', alias: 'plot_id', type: 3, color: 'green'},
                  {title: 'URL', alias: 'url', type: 4, color: 'green', label: 'plot_id'},
                  {title: 'iframe', alias: 'iframe', type: 5, color: 'green', label: 'plot_id'},
                  {title: '创建者', alias: 'create_user', type: 6, color: 'white'},
                  {title: '创建日期', alias: 'create_time', type: 2, color: 'white'},
                  {title: '修改日期', alias: 'update_time', type: 2, color: 'white'},
                  {title: '浏览次数', alias: 'visit_count', type: 1, color: 'white'}
                ]
              }
            }

          },
          share: {
            title: '分享列表',
            type: 0,
            modal: {
              type: 14,
              config: {
                title: '分享列表',
                url: {
                  query: '854438a5-58f8-452a-a651-42184c7c4893',
                  update: 'd18c820b-8d19-4f28-956c-29353d4319aa',
                  delete: '3b3fe8a3-8da2-44df-bafa-b07f4cf17165',
                  insert: '0d1e5c0c-aa4f-4766-8d37-7d7b92630f37'
                },
                view: {
                  id: 'plot_id',
                  share_id: 'plot_share_id'
                }
              }

            }

          },
          visitCount: true,
          container: {
            width: 275,
            height: 270,
            margin: 5
          }
        };
        break;
      case 'service':
        this.config = {
          type: 'service',
          id: '',
          // pubCheck: '此小程序未发布',
          action: {
            deploy: '部署',
            redeploy: '重新部署',
            name: 'name'
          },
          toolbar: {
            left: {
              title: '我的服务',
              url: '06b992d7-b0c5-438e-89d1-9196a2808db5',
              key: 'c0028b0e-1880-4052-a57a-7c7aae3dad1b'
            },
            right: {
              title: '共享服务',
              url: '960ebfea-c654-415f-8b18-c3026d4af2b0',
              key: 'd3659f3f-00f8-480e-95bd-9f5f22c93350'
            }
          },
          delete: {
            id: 'backup_id',
            title: '删除服务',
            type: 0,
            url: 'cc3b01cd-275d-46fa-bb38-a1abef70ce37',
            modal: {
              type: 11,
              config: {
                title: '删除服务',
                view: '您确定要删除选定的服务?'
              }
            }
          },
          create: {
            title: '创建部署服务',
            type: 0,
            url: 'a180f974-24e2-4376-8e40-548a117e76c2',
            modal: {
              type: 23,
              config: {
                title: '创建部署服务',
                independence: 2,
                url: {
                  mapQuery: '46459014-e7aa-4a4f-82f7-cb5fb84336fa',
                  mini_programQuery: 'c011253a-89d6-4221-9ea2-5038bc8e1198',
                  layerQuery: '5de8eb4d-44f2-4038-a618-9d59c6787548',
                  data_sourceQuery: 'a39b0258-2d47-4c1d-8092-ad9aaba2669e',
                  data_query_schemeQuery: '689de619-3d59-4c7e-9e2e-0180718cfaab',
                  secret_keyQuery: 'a14b8933-37b2-4fa5-881f-437abb79fe94',
                },
                view: {
                  action: 1,
                  mapTitle: '地图',
                  layerTitle: '图层',
                  miniProTitle: '小程序',
                  datasoruceTitle: '数据源',
                  checkTitle: '数据查询方案',
                  keyTitle: '秘钥',
                  id: 'map_id',
                  name: 'name',
                  description: 'description',
                  img: 'thumbnail'
                },
                modal: {
                  type: 10,
                  config: {
                    title: '创建部署服务',
                    independence: 3,
                    type: 0,
                    view: [
                      {
                        element: 'input',
                        title: '服务名称',
                        alias: 'name',
                        value: '',
                        type: 'text',
                        isNull: false,
                        isPass: 1,
                        placeholder: '最多输入40个字符',
                        maxLength: 40
                      },
                      {
                        element: 'textarea',
                        title: '服务描述',
                        alias: 'description',
                        value: '',
                        type: 'text',
                        isNull: true,
                        isPass: 0,
                        placeholder: '最多输入256个字符',
                        maxLength: 256
                      }
                    ],
                  }
                }
              }
            }
          },
          // 服务发布
          download: {
            title: '下载服务',
            modal: {
              user: 'Ljy',
              type: 'service_download',
              url: ''
            }
          },
          update: {
            title: '修改服务信息',
            type: 1,
            url: '989f6acf-91a2-4a01-bc34-68ba25af2623', // 修改服务名称的接口--Ljy
            modal: {
              type: 12,
              config: {
                title: '修改服务信息',
                type: 0,
                view: [
                  {
                    title: '服务名称',
                    alias: 'name',
                    type: 'text',
                    isNull: false,
                    isPass: 1,
                    placeholder: '请输入名称',
                    maxlength: 40
                  },
                  {
                    title: '服务描述',
                    alias: 'description',
                    type: 'text',
                    isNull: true,
                    isPass: 0,
                    placeholder: '请输入描述',
                    maxlength: 256
                  }],
              }
            }
          },
          share: {
            title: '分享列表',
            type: 0,
            modal: {
              type: 14,
              config: {
                // 判断是否是服务发布的分享 -- Ljy
                type: 'service',

                title: '分享列表',
                url: {
                  query: '49a578ed-d4e7-4dab-a7ea-2e68e7867e53',
                  update: '7b974de8-cf2a-40ca-af31-64063cc5e764',
                  delete: 'b6957330-7444-4c0a-9bf3-938e9e8bfd9e',
                  insert: 'fc00d5bf-dd2f-4ab1-bac2-893d0911b45f'
                },
                view: {
                  // 分享请求的参数
                  id: 'backup_id',
                  share_id: 'backup_share_id'
                }
              }

            }

          },
          viewInfo: {
            title: '元数据信息',
            type: 0,
            modal: {
              type: 13,
              config: {
                title: '元数据信息',
                type: 0,
                view: [
                  {title: '服务名称', alias: 'name', type: 1, color: 'green'},
                  {title: '服务描述', alias: 'description', type: 1, color: 'green'},
                  {title: '创建者', alias: 'create_user', type: 6, color: 'white'},
                  {title: '创建日期', alias: 'create_time', type: 2, color: 'white'},
                  {title: '修改日期', alias: 'update_time', type: 2, color: 'white'},
                  {title: '浏览次数', alias: 'visit_count', type: 1, color: 'white'},
                  // {title: '推荐版本', alias: '           ', type: 8, color: 'white'},
                  {title1: '名称', title2: 'ID', title3: '创建日期', alias: '', type: 10, color: 'white'}
                ]
              }
            }
          },
          visitCount: true,
          container: {
            width: 275,
            height: 270,
            margin: 5
          }
        };
        break;
      default:
        this.router.navigate(['']);
    }

  }


  // 重置宽高
  resetWH() {
    this.clientW = document.body.clientWidth;
    this.clientH = document.body.clientHeight;
    this.paddingValue = 80;
    const w = Math.floor((this.clientW - 180) / (this.config.container.width + 2 * this.config.container.margin));
    const h = Math.ceil((this.clientH - 183) / this.config.container.height);
    this.everyPageNum = w * h;
    this.paddingValue = this.paddingValue + ((this.clientW - 180) -
      w * (this.config.container.width + 2 * this.config.container.margin)) / 2;
  }


  // 瀑布流加载
  scrollLoad() {
    this.searchData.scrollPageChange();
  }


  // 栅格自定义图片上传
  uploadImage(e: any, item: any) {
    this.httpService.makeFileRequest('/upload/1.0.0/layer/img', {forceDelete: true}, [e.file[0]])
      .subscribe(
        data => {
          const url = '/uploadfile/' + (data as any).data.upload_file.uploads;
          item.value = url;
        }, error => {

        }
      );
  }


  mapCalibration(e: any, value: any) {
    let url = '';
    let leftTop = '';
    let rightTop = '';
    let rightBottom = '';
    let leftBottom = '';
    for (const v of value) {
      if (typeof v.isNull === 'boolean' && !v.isNull && !v.value) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', v.title + '不能为空!', 3000);
        this.toastService.toast(toastCfg);
        return;
      }

      if (v.tag === 'image') {
        url = v.value;
      }

      if (v.tag === 'leftTop') {
        leftTop = v.value;
      }

      if (v.tag === 'rightBottom') {
        rightBottom = v.value;
      }


      if (v.tag === 'rightTop') {
        rightTop = v.value;
      }

      if (v.tag === 'leftBottom') {
        leftBottom = v.value;
      }
    }

    if (leftTop === rightBottom) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '坐标不能相等', 3000);
      this.toastService.toast(toastCfg);
      return;
    }

    const lt = leftTop.split(',');
    const rb = rightBottom.split(',');
    let rt, lb;
    if (!rightTop || !leftBottom) {
      rt = [rb[0], lt[1]];
      lb = [lt[0], rb[1]];
    } else {
      rt = rightTop.split(',');
      lb = leftBottom.split(',');
    }

    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.type = 22;
    modalRef.componentInstance.modalData = {
      mapOptions: {
        mapId: this.properties.serviceIP.default_map_id || 'map_id_1',
        center: [(Number(lt[0]) + Number(rb[0])) / 2, (Number(lt[1]) + Number(rb[1])) / 2],
        zoom: 10
      },
      mapBase: this.properties.serviceIP.basemap,
      url: url,
      coordinates: [[Number(lt[0]), Number(lt[1])], [Number(rt[0]), Number(rt[1])], [Number(rb[0]),
        Number(rb[1])], [Number(lb[0]), Number(lb[1])]]
    };
    modalRef.componentInstance.keyConfig = {title: '地图校准'};
    modalRef.result.then(result => {

      for (const v of value) {
        if (v.tag === 'leftTop') {
          v.value = result.leftTop;
        }

        if (v.tag === 'rightBottom') {
          v.value = result.rightBottom;
        }


        if (v.tag === 'rightTop') {
          v.value = result.rightTop;
        }

        if (v.tag === 'leftBottom') {
          v.value = result.leftBottom;
        }
      }
    }, reson => {
    });
  }

}
