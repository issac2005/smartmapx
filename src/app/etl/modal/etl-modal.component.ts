import {Component, Input, ViewEncapsulation, OnInit} from '@angular/core';
import {SmxActiveModal, SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {HttpService} from '../../s-service/http.service';
import {AppService} from '../../s-service/app.service';
import {SMXNAME} from '../../s-service/utils';
import {AppModalComponent} from '../../modal/app-modal.component';
import {TaskManageService} from '../../c-main/task-manager/task-manage.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {toLog} from '../../smx-component/smx-util';

@Component({
  selector: 'app-etl-modal',
  templateUrl: './etl-modal.component.html',
  styleUrls: ['./etl-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EtlModalComponent implements OnInit {
  @Input() type: any;
  @Input() config: any;
  @Input() mData: any = {};
  // @Input() inputData: any;
  // @Input() code: any;
  // @Input() uploadClass: any;
  outputType: any; // 输出表格方式 1、已有数据源 2、创建新的数据源

  tableList: any;
  outputTableSelect: any; // 选择已有数据源时，选中的数据源

  outputData: any; // 输出字段列表
  createTableName: any;
  createTableNameStatus = false;
  shpList: any;
  charset: any;
  sourceName: any = [];
  sourceSelect: any = [];
  createType = []; // etl上传文件数据类型数组
  shpSource: any = true;
  shpStacks: any = true;


  inputType: any;

  canSubmit: boolean;
  databaseArray: any;

  nowDatabaseSelect: any;
  nowDatabaseName: any;

  // tableList: any;
  selectTable: any; // 数据选中表格
  inputColumns: any; // 数据字段
  sqlText: any;
  inputFile: any;
  inputName: any;
  bianmaModel = 'GBK';
  bianmas = [
    {label: 'UTF-8', value: 'UTF-8'},
    {label: 'GBK', value: 'GBK'},
    {label: 'GB2312', value: 'GB2312'}];
  isCollapsed = false;

  // uploadClass: any;


  // canSubmit: boolean;

  databaseType: any;
  methodType: any;
  newDatabaseSelect: any; // 当前选中数据库类型
  newMethodSelect: any;

  testConfig: any;

  connectName = '';


  allChecked = true;


  // 输出按钮
  outputBtn = true;

  constructor(
    private smxModalService: SmxModal,
    public activeModal: SmxActiveModal,
    public httpService: HttpService,
    private appService: AppService,
    private toastService: ToastService,
    private ngbModalService: SmxModal,
    public taskManageService: TaskManageService) {
  }


  ngOnInit() {
    this.initModal();
  }


  /**
   * 初始化
   */
  initModal() {
    switch (this.type) {
      case 1:
        if (this.mData.uploadClass === 1) {
          // 获取数据信息
          for (const i of this.mData.inputData.inputColumns) {
            i['use'] = true;
            i['output'] = i.name;
            i['ispk'] = false;
          }
          if (this.mData.inputData.upload_file) {
            for (const i of this.mData.inputData.inputColumns) {
              i['type'] = 'text';
              i['control'] = 'input';
            }
          }

          // this.getSelectType(); // 从服务器获取类型字段
        } else {
          this.shpList = this.mData.inputData.file_list;
          this.charset = this.mData.inputData.charset;
          for (let i = 0; i < this.shpList.length; i++) {
            if (this.shpList[i].length > 16) {
              this.sourceName.push({
                file_name: this.shpList[i],
                entity_desc: this.shpList[i].substr(0, 12),
                charset: this.mData.inputData.charset
              });
            } else {
              this.sourceName.push({
                file_name: this.shpList[i],
                entity_desc: this.shpList[i].substr(0, this.shpList[i].length - 4),
                charset: this.mData.inputData.charset
              });
            }
            this.sourceSelect.push(true);
          }
        }
        break;
      case 2:
        this.canSubmit = false;
        this.bianmaModel = 'GBK';

        // 查询连接
        this.searchDatabase();
        break;
      case 3:
        this.canSubmit = false;
        // 获取数据库类型
        this.httpService.getData({}, true, 'etl', 'getDatabaseType ', '1')
          .subscribe(
            data => {
              if ((data as any).status < 0) {
                return;
              }
              this.databaseType = (data as any).data;
              if (this.databaseType.length > 0) {
                this.newDatabaseSelect = this.databaseType[0];
              }
            },
            error => {
            }
          );
        break;
    }
  }


  /*
  * 修改输出方式: 已有 新建
  * */
  changeOutputtype(e: any) {
    if (this.outputType === '1') { // 选择已有
      this.outputTableSelect = undefined;
      this.createTableName = undefined;
      this.createTableNameStatus = false;
      const ccc = {
        node_id: 'table',
        operation_type: 'res'  // res/repository
      };
      // 获取输出数据实体表格
      this.httpService.getData(ccc, true, 'etl', 'getEntity', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              return;
            }
            this.tableList = (data as any).data;
          },
          error => {
          }
        );
    } else { // 选择新建
      this.outputTableSelect = undefined;
      this.createTableName = this.mData.name || undefined;
      if (this.createTableName) {
        this.createTable();
      }
    }
  }


  /*
  * 已有数据源选中事件
  * */
  changeOutputSelect(e: any) {
    let postData: any;
    postData = {
      operation_type: 'res',
      entity_id: e
    };
    // 获取数据实体字段
    this.httpService.getData(postData, true, 'etl', 'getEntityColumns', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.outputData = (data as any).data;
        },
        error => {
        }
      );
  }

  /*
  * 输入字段选取事件
  * */
  checkInputData(e: any) {
    if (e.target.checked) {

    } else {
      this.allChecked = false;
    }
  }

  /**
   * 全选全不选
   * @param e
   */
  changeChecked(e: any) {
    this.allChecked = e.target.checked;
    for (const v of this.mData.inputData.inputColumns) {
      v.use = e.target.checked;
    }
  }


  /*
  * 创建新表时选择主键
  * */
  checkIspk(e: any, index: number) {
    if (e.target.checked) {
      this.mData.inputColumns[index].ispk = true;
    }
  }

  // 判断是否显示列表
  createTable() {
    // this.outputTableSelect = undefined;
    if (this.createTableName !== '' && this.createTableName !== undefined) {
      const test = SMXNAME.REG.test(this.createTableName);

      if (!test) {
        this.createTableNameStatus = false;
        const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
        this.toastService.toast(toastCfg);
      } else {
        this.createTableNameStatus = true;
      }
    } else {
      this.createTableNameStatus = false;
    }
  }

  selectSource(e: any, index: number) {
    this.sourceSelect[index] = e.target.checked;
    const postData: any = [];
    for (let i = 0; i < this.sourceSelect.length; i++) {
      if (this.sourceSelect[i]) {
        postData.push(this.sourceName[i]);
      }
    }
    if (postData.length < 1) {
      this.shpStacks = false;
    } else {
      this.shpStacks = true;
    }
  }

  /*
  * 设置实体字段
  * */
  submitOutput() {
    if (!this.outputTableSelect && this.outputType === '1') {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择数据源!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }


    if ((!this.createTableName || this.createTableName === '') && this.outputType === '2') {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请输入新的数据源名称!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }


    if (!this.shpStacks) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请至少选择一个shp文件!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    if (!this.shpSource) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '数据源名称格式错误', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    if (this.outputType === '2') {
      const test = SMXNAME.REG.test(this.createTableName);
      if (!test) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
        this.toastService.toast(toastCfg);
        return;
      }
    }

    let postData: any;
    if (this.outputType === '1') {  // 已有数据源
      postData = this.createOldDataTable();
      /**
       * 对选中字段的关联字段做判定
       * update_user: ruansong
       * */
      let concatFields = false;
      for (let m = 0; m < postData.fields.length; m++) {
        if (!postData.fields[m].column_name) {
          concatFields = true;
          break;
        }
      }
      if (concatFields) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '选中字段中有未关联字段！', 3000);
        this.toastService.toast(toastCfg);
        return;
      }
    }
    if (this.outputType === '2') { // 创建新的数据源
      postData = this.createNewDataTable();
      /**
       * 对别名重复进行处理
       * update_user: ruansong
       * */
      if (postData) {
        const otherName = [];
        let otherCom = false;
        for (let m = 0; m < postData.fields.length; m++) {
          if (otherName.indexOf(postData.fields[m].column_desc) > -1) {
            otherCom = true;
          } else {
            otherName.push(postData.fields[m].column_desc);
          }
        }
        if (otherCom) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '别名不能重复，请重新修改！', 3000);
          this.toastService.toast(toastCfg);
          return;
        }
      } else {
        return;
      }
    }
    // 设置实体字段, 创建输出数据源
    this.outputBtn = false;
    if (this.mData.uploadClass === 2) {
      const postDatas: any = [];
      const object2: any = this.mData.inputData.data;
      for (let i = 0; i < this.sourceSelect.length; i++) {
        if (this.sourceSelect[i]) {
          postDatas.push(this.sourceName[i]);
        }
      }
      object2.source = postDatas;
      this.httpService.getData(object2, true, 'ShpfileService', 'readShpfile', '1')
        .subscribe(
          data => {
            this.outputBtn = true;
            if ((data as any).status < 0) {
              return;
            }
            // todo 开启任务中心
            this.taskManageService.start();
            this.activeModal.close('shp');
          },
          error => {
          }
        );
    } else {
      this.httpService.getData(postData, true, 'etl', this.outputType === '1' ? 'setEntityRelation' : 'setEntityColumns', '1')
        .subscribe(
          data => {
            this.outputBtn = true;
            if ((data as any).status < 0) {
              return;
            }

            // todo 开启任务中心
            this.taskManageService.start();

            this.activeModal.close((data as any).data.execution_id);
          },
          error => {
          }
        );
    }
  }

  /*shp修改数据源名称*/
  updateSource(index: any) {
    const test = SMXNAME.REG.test(this.sourceName[index].entity_desc);
    if (!test) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 3000);
      this.toastService.toast(toastCfg);
      this.shpSource = false;
    } else {
      this.shpSource = true;
    }
  }


  // 输入数据
  /**
   * 查询连接
   */
  searchDatabase() {
    this.httpService.getData({}, true, 'etl', 'getRepository ', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            // this.activeModal.close('0');
            return;
          }
          this.databaseArray = (data as any).data;
        },
        error => {
        }
      );
  }

  /*
  * 确定事件
  * */
  goAdd(str: string) {
    if (this.inputType === '1') { // 数据库迁移
      let postData: any;
      if (this.sqlText) {
        postData = {
          operation_type: 'repository_sql',
          id_database: this.nowDatabaseSelect,
          sql: this.sqlText
        };
      } else {
        postData = {
          operation_type: 'repository',
          id_database: this.nowDatabaseSelect,
          table: this.selectTable
        };
      }

      // 获取数据实体字段
      this.httpService.getData(postData, true, 'etl', 'getEntityColumns', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toastCfg);
              return;
            }
            if ((data as any).data.length === 0) {
              const toastCfg = new ToastConfig(ToastType.WARNING, '', '没有有效字段，请重新选择!', 2000);
              this.toastService.toast(toastCfg);
              return;
            }
            this.inputColumns = (data as any).data;
            const inputData = {
              inputColumns: this.inputColumns,
              id_database: this.nowDatabaseSelect
            };
            if (this.sqlText) {
              inputData['sql'] = this.sqlText;
            } else {
              inputData['table'] = this.selectTable;
            }

            this.mData.uploadClass = 1;
            this.activeModal.close({data: inputData, code: this.bianmaModel, class: this.mData.uploadClass});
          },
          error => {
          }
        );
    } else if (this.inputType === '2') { // 文件上传导入
      this.httpService.makeFileRequest('/upload/1.0.0/etl/getEntityColumns',
        {charset: this.bianmaModel}, this.inputFile).subscribe(
        data => {
          if ((data as any).status < 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          const inputData = {
            inputColumns: (data as any).data.fields,
            upload_file: (data as any).data.upload_file.uploads
          };
          this.mData.uploadClass = 1;
          this.activeModal.close({
            data: inputData,
            code: this.bianmaModel,
            class: this.mData.uploadClass,
            name: this.inputName
          });
        }
      );
    } else if (this.inputType === '3') { // shp文件上传导入
      toLog('shp文件导入');
      this.httpService.makeFileRequest('/upload/1.0.0/ShpfileService/shpfileSearch',
        {charset: this.bianmaModel}, this.inputFile).subscribe(
        data => {
          if ((data as any).status < 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }

          const inputData = {
            data: (data as any).data,
            charset: (data as any).data.charset,
            file_list: (data as any).data.file_list,
            upload_file: (data as any).data.upload_file.uploads
          };
          this.mData.uploadClass = 2;
          this.activeModal.close({
            data: inputData,
            code: this.bianmaModel,
            class: this.mData.uploadClass,
            name: this.inputName
          });
        }
      );
    }
  }

  /*
  * sql语句输入事件
  * */
  sqlChange() {
    if (!this.sqlText || !this.nowDatabaseSelect) {
      this.canSubmit = false;
      return;
    }
    this.canSubmit = true;
  }

  /*
  * 打开添加数据库modal
  * */
  openAddDatabase() {
    const ngbModal = this.ngbModalService.open(EtlModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-eltModal'});
    ngbModal.componentInstance.type = 3;
    ngbModal.componentInstance.config = {title: '添加数据库'};
    ngbModal.result.then(
      (result) => {
        if (result === 'add') {
          this.searchDatabase();
        }
      },
      (reason) => {
        toLog(reason);
      });
  }

  /*
  * 当前选中数据库事件，加载对应模式
  * */
  changeDatabaseSelect(e: any) {
    this.isCollapsed = !this.isCollapsed;
    this.nowDatabaseSelect = e.id_database;
    this.nowDatabaseName = e.name;

    this.changeOutputType();

    const ccc = {
      node_id: 'table',
      id_database: e.id_database,
      operation_type: 'repository'  // res/repository
    };
    // 获取数据库实体表格
    this.httpService.getData(ccc, true, 'etl', 'getEntity', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }
          this.tableList = (data as any).data;
        },
        error => {
        }
      );
  }


  /**
   * 删除连接
   */
  removeDatabase(e: any, item: any) {
    e.stopPropagation();
    const modalRef = this.ngbModalService.open(AppModalComponent, {size: 'lg', centered: true, backdrop: 'static', enterKeyId: 'smx-app'});
    modalRef.componentInstance.config = {title: '删除连接', view: '您确定要删除此数据库连接吗?'};
    modalRef.result.then(
      (result) => {
        this.changeOutputType();
        this.httpService.getData({id_database: item.id_database}, true, 'etl', 'delRepository', '1')
          .subscribe(
            data => {
              if ((data as any).status < 0) {
                return;
              }

              /**
               * 删除当前选定
               */
              if (this.nowDatabaseSelect = item.id_database) {
                this.tableList = [];
                this.nowDatabaseName = null;
              }


              /**
               * 删除下拉框内容
               */
              for (let i = 0; i < this.databaseArray.length; i++) {
                if (this.databaseArray[i] === item) {
                  this.databaseArray.splice(i, 1);
                  if (this.databaseArray.length === 0) {
                    this.isCollapsed = !this.isCollapsed;
                  }
                  return;
                }
              }


            },
            error => {
            }
          );

      },
      (reason) => {
        toLog(reason);
      });

  }

  /*
  * 选中事件
  * */
  changeTableSelect() {
    this.canSubmit = true;
  }

  /*
  * 文件修改事件
  * */
  fileChangeEvent(e: any) {
    // const AllImgExt = '.csv|.zip|';
    // const extName = e.file[0].name.substring(e.file[0].name.lastIndexOf('.')).toLowerCase(); // 把路径中的所有字母全部转换为小写
    //
    // if (AllImgExt.indexOf(extName + '|') === -1) {
    //   const toastCfg = new ToastConfig(ToastType.ERROR, '', '目前只支持csv,zip(shp包)格式的文件,其它文件正在陆续开放中...', 2000);
    //   this.toastService.toast(toastCfg);
    //   e.target.value = '';
    //   return;
    // }
    //
    //
    // // if (e.file[0].type === 'application/vnd.ms-excel' || e.file[0].type === 'text/csv'
    // // || e.file[0].type === 'application/x-zip-compressed') {
    // if (e.file[0].size > (1024 * 1024 * 20)) {
    //   const toastCfg = new ToastConfig(ToastType.ERROR, '', '文件大小超出限制(20M)!', 2000);
    //   this.toastService.toast(toastCfg);
    //   e.target.value = '';
    //   return;
    // }

    this.inputFile = e.file;
    this.inputName = e.name;
    this.canSubmit = true;
    // } else {
    //     const toastCfg = new ToastConfig(ToastType.ERROR, '', '目前只支持csv和zip格式的文件,其它文件正在陆续开放中...', 2000);
    //     this.toastService.toast(toastCfg);
    //     e.target.value = '';
    //     return;
    // }

  }


  // 连接数据库
  /*
 * 输入源类型选择事件： 数据库 文件
 * */
  changeInputType(e: any) {
  }


  /**
   * 改变输出方式
   */
  changeOutputType() {
    this.sqlText = null;
    this.selectTable = null;
    this.canSubmit = false;
  }


  /*
* 新增数据库选择数据库事件
* */
  changeDatabase(e: any) {
    // 获取连接类型
    this.httpService.getData({}, true, 'etl', 'getAccessMethod', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }
          this.methodType = (data as any).data;

          if (this.methodType.length > 0) {
            this.newMethodSelect = this.methodType[0];
          }
        },
        error => {
        }
      );
  }

  /*
  * 新增数据库选择类型事件
  * */
  changeMethod(e: any) {
    // 通过链接类型获取表单内容
    this.httpService.getData({
      code: this.newDatabaseSelect,
      type: this.newMethodSelect
    }, true, 'etl', 'getAccessSetting', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }

          if ((data as any).data.content) {
            this.testConfig = JSON.parse((data as any).data.content.replace(/'/g, '"'));
          }
          /*
          console.log( JSON.parse( (data as any).data.content.replace(/\n/g, '').replace(/'/g, '"').replace(/\btext\b/g, '"text"')
              .replace(/\btype\b/g, '"type"').replace(/\bname\b/g, '"name"').replace(/\bvalue\b/g, '"value"') ) )
          */

        },
        error => {
        }
      );
  }

  /*
  * 测试数据库连接以及新增
  * */
  testConnect(operation: any) {
    /*const postData = {
        'access': '', // 连接类型
        'operation_type': operation,
        'databaseName': 'ltmap',  // 数据库名称
        'type': 'POSTGRESQL',
        'hostname': '127.0.0.1', // 主机名称
        'password': '123456',
        'port': '5432',
        'name': '127.0.0.1', // 连接名称
        'username': 'postgres'
    };*/
    const postData = ({
      'access': this.newMethodSelect,
      'operation_type': operation,
      'type': this.newDatabaseSelect,
      'name': this.connectName // 连接名称
    } as any);
    for (const i of this.testConfig) {
      postData[i.name] = i.value;
    }
    this.httpService.getData(postData, true, 'etl', 'setRepository', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }
          if (operation === 'test') {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '连接成功!', 2000);
            this.toastService.toast(toastCfg);
          } else {
            this.activeModal.close('add');
          }
        },
        error => {
        }
      );
  }

  /*
  * 修改测试以及确定按钮可点击状态
  * */
  checkValue() {
    if (!this.newMethodSelect || !this.newMethodSelect || !this.connectName) {
      this.canSubmit = false;
      return;
    }
    for (const i of this.testConfig) {
      if (!i.value) {
        this.canSubmit = false;
        return;
      }
    }
    this.canSubmit = true;
  }


  /**
   * 导出创建新数据源
   */

  createNewDataTable() {
    let postData;
    if (this.mData.inputData.sql) {
      postData = {
        'operation_type': 'create_entity_sql',
        'id_database': this.mData.inputData.id_database,
        'entity_id': this.outputTableSelect,
        'sql': this.mData.inputData.sql,
        'fields': [],
        'entity_desc': this.createTableName
      };
    } else if (this.mData.inputData.upload_file) {
      postData = {
        'operation_type': 'create_entity_csv',
        'upload_file': this.mData.inputData.upload_file,
        'entity_desc': this.createTableName,
        'charset': this.mData.code,
        'fields': []
      };
    } else {
      postData = {
        'operation_type': 'create_entity_table',
        'id_database': this.mData.inputData.id_database,
        'entity_id': this.outputTableSelect,
        'table': this.mData.inputData.table,
        'fields': [],
        'entity_desc': this.createTableName
      };
    }

    for (const i of this.mData.inputData.inputColumns) {
      if (i.use) {
        if (!i.output) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '请输入已选择的字段描述!', 2000);
          this.toastService.toast(toastCfg);
          return;
        }
        // if (this.mData.inputData.upload_file) {

        const columnFileds = i;
        columnFileds['column_desc'] = i.output; // ?
        postData.fields.push(columnFileds);
        // } else {
        //   postData.fields.push({
        //     'name': i.name,
        //     'column_desc': i.output,
        //     'ispk': i.ispk
        //   });
        // }
      }
    }


    for (const j of postData.fields) {
      j['isunique'] = j['ispk'];
      // 删除原来的键
      delete j['ispk'];
    }


    if (postData.fields && postData.fields.length === 0) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '至少选择一条导出数据!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }


    return postData;
  }


  /**
   * 导出已有数据源
   */
  createOldDataTable() {
    let postData;
    if (this.mData.inputData.sql) {
      postData = {
        'operation_type': 'entity_sql',
        'id_database': this.mData.inputData.id_database,
        'entity_id': this.outputTableSelect,
        'sql': this.mData.inputData.sql,
        'fields': []
      };
    } else if (this.mData.inputData.upload_file) {
      postData = {
        'operation_type': 'entity_csv',
        'upload_file': this.mData.inputData.upload_file,
        'charset': this.mData.code,
        'entity_id': this.outputTableSelect,
        'fields': []
      };
    } else {
      postData = {
        'operation_type': 'entity_table',
        'id_database': this.mData.inputData.id_database,
        'entity_id': this.outputTableSelect,
        'table': this.mData.inputData.table,
        'fields': []
      };
    }

    for (const i of this.mData.inputData.inputColumns) {
      if (i.use) {
        if (!i.output) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '请输入完整已选择的输出字段!', 2000);
          this.toastService.toast(toastCfg);
          return;
        }

        const columnFileds = i;
        let tableName = '';
        columnFileds['entity_column_id'] = i.output; // ?
        // whx修改 给每个勾选的字段添加对应的column_name
        for (let m = 0; m < this.outputData.length; m++) {
          if (this.outputData[m].entity_column_id === i.output) {
            columnFileds['column_name'] = this.outputData[m].column_name;
            tableName = this.outputData[m].table_name;
          }
        }
        postData['table_name'] = tableName;
        // whx
        postData.fields.push(columnFileds);
      }
    }


    if (postData.fields && postData.fields.length === 0) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '至少选择一条导出数据!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    return postData;
  }


  disabledEnter(e: any) {
    e.stopPropagation();
  }
}
