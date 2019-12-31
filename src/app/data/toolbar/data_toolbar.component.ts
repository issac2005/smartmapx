import {Component, Input, OnInit, OnChanges, OnDestroy} from '@angular/core';

// 导入http框架
import {HttpService} from '../../s-service/http.service';
// 导入服务
import {AppService} from '../../s-service/app.service';
import {Router} from '@angular/router';

// 吐司
import {LocalStorage} from '../../s-service/local.storage';
import {TaskManageService} from '../../c-main/task-manager/task-manage.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import * as jwt_decode from '@smx/smartmapx-jwt-decode';
import {SmxModal} from '../../smx-component/smx.module';


@Component({
  selector: 'app-data-toolbar',
  templateUrl: 'data-toolbar.component.html',
  styleUrls: ['data-toolbar.component.scss']
})

export class DataToolbarComponent implements OnInit, OnChanges, OnDestroy {

  @Input() keyConfig: any;  // 信息配置
  @Input() paddingValue: any; // 居中配置
  @Input() everyPageNum: any;
  public isShow = false;

  public mapData: any = {}; // 我的数据数据
  public searchKey: string;    // 搜索关键字
  public leftChecked = true;  // 分类选择
  public tag = 'mydata';  // 分类选择

  // 数量
  public leftNum: number;
  public rightNum: number;

  // 遮罩动画
  visableBoolean = false;
  shadeBoolean = false;

  // 分页数据
  // everyPageNum = 18;
  pageNum = 1;
  totalPage = 0;

  mapsDeleteEvent: any;

  // 是否是系统账户
  isRoot: any;

  // 服务发布--导入服务--Ljy
  inputFile: any;
  showFileName: any;
  newFile = ([] as any);
  fileData: any;
  saveUpload = false;
  appsInfo: any;
  serviceFile: any;
  serviceUser = false; // 服务发布用户权限控制导入按钮显隐
  serviceUploadTip = '请选择部署服务压缩包';

  userInfo: any;

  constructor(public httpService: HttpService,
              private appService: AppService,
              public toastService: ToastService,
              private tmService: TaskManageService,
              public ls: LocalStorage,
              private modalService: SmxModal,
              public router: Router,
              ) {
    this.mapsDeleteEvent = this.appService.mapsDeleteEventEmitter.subscribe((value: any) => {
      this.leftNum = this.leftNum - 1;

      if (value === 0) { // 数据还原
        this.searchKey = '';
        this.getSourceMapData();
      }

      if (value === 'add') { // 数据添加还原
        this.getSourceMapData('clear');
      }
    });

  }


  ngOnInit() {
    // 初始化数据
    // this.getOriginalData();

    // 服务发布--用户角色控制导入按钮显隐--Ljy
    const jwt = this.ls.get('id_token');
    if (jwt) {
      try {
        const decodedJwt = jwt ? jwt_decode(jwt) : false;
        this.userInfo = JSON.parse((decodedJwt as any).data);
        if (this.userInfo.role_id) {
          if (this.userInfo.role_id === '3a10da1f-6012-4376-b92c-fa428eb0b52b') {
            this.serviceUser = false;
          } else {
            this.serviceUser = true;
          }
        } else {
          this.serviceUser = false;
        }
      } catch (e) {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '查询信息失败!', 3000);
        this.toastService.toast(toastCfg);
        this.router.navigate(['/app/home']);
      }

    }
  }

  ngOnChanges() {
    this.getOriginalDataNum();
    this.getOriginalData();
  }

  ngOnDestroy() {
    this.mapsDeleteEvent.unsubscribe();
  }

  /**
   * 清除搜索
   */
  public clearInput() {
    this.searchKey = '';
    this.pageNum = 1;
    if (this.tag === 'mydata') {
      this.getSourceMapData('clear');
    } else {
      this.getSourceShareData('clear');
    }

  }

  /**
   * 切换分类
   * @param tag
   */
  public switchData(tag: any) {
    if (this.tag === tag) {
      return;
    }


    this.tag = tag;
    if (this.searchKey && this.searchKey !== '') {
      this.mapData.mapList = [];

      if (this.tag === 'mydata') {
        this.leftChecked = true;
      } else if (this.tag === 'sharedata') {
        this.leftChecked = false;
      }
      this.shareData();
    } else {

      this.pageNum = 1;
      this.totalPage = 0;
      this.mapData.dataList = [];


      if (this.tag === 'mydata') {
        this.leftChecked = true;
        this.getSourceMapData();

      } else if (this.tag === 'sharedata') {
        this.leftChecked = false;
        this.getSourceShareData();
      }
    }

  }


  /**
   * 查询共享数据数据
   */
  public getSourceShareData(type?: any) {
    const body = {
      start: (type && type === 'clear') || this.pageNum === 1 ? 0 : this.everyPageNum * (this.pageNum - 1),
      limit: this.everyPageNum,
      type: this.keyConfig.type === 'geo' ? 200 : this.keyConfig.type === 'sta' ? 10 : this.keyConfig.type === 'raster' ? 100 : null
    };

    this.httpService.getData(body, true, 'execute', this.keyConfig.toolbar.right.url, 'map')

      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '获取数据失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.mapData.type = 'sharedata';
          if (type && type === 'clear') {

            this.mapData.dataList = (data as any).data.root;
          } else {

            this.mapData.dataList.push.apply(this.mapData.dataList, (data as any).data.root);
          }
          this.mapData.searchKey = '共享';

          // 共享数据数量
          this.rightNum = (data as any).data.totalProperty;
          this.totalPage = (data as any).data.totalProperty;


          this.appService.mapsearchEventEmitter.emit(this.mapData);
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  /**
   * 查询我的数据数据
   */
  public getSourceMapData(type?: any) {
    let start;
    if (this.keyConfig.create) {
      start = this.everyPageNum * (this.pageNum - 1) - 1;
    } else {
      start = this.everyPageNum * (this.pageNum - 1);
    }

    // todo
    /**
     * 现请求地理专题请求参数type由0改为200*/
    const body = {
      start: (type && type === 'clear') || this.pageNum === 1 ? 0 : start,
      limit: this.pageNum === 1 && this.keyConfig.create ? this.everyPageNum - 1 : this.everyPageNum,
      type: this.keyConfig.type === 'geo' ? 200 : this.keyConfig.type === 'sta' ? 10 : this.keyConfig.type === 'raster' ? 100 : null

    };

    this.httpService.getData(body, true, 'execute', this.keyConfig.toolbar.left.url, 'map')

      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.mapData.type = 'mydata';
          if (type && type === 'clear') {
            this.mapData.dataList = (data as any).data.root;
          } else {
            this.mapData.dataList.push.apply(this.mapData.dataList, (data as any).data.root);

          }
          this.mapData.searchKey = '我的';

          // 我的数据数量
          this.leftNum = (data as any).data.totalProperty;
          this.totalPage = (data as any).data.totalProperty;
          this.isShow = true;
          this.appService.mapsearchEventEmitter.emit(this.mapData);
        },
        error => {
          console.log(error.text());
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  /**
   * 搜索
   */
  public shareData() {
    if (this.searchKey) {
      this.pageNum = 1;
      let api;
      if (this.tag === 'mydata') {
        api = this.keyConfig.toolbar.left.key;
      } else {
        api = this.keyConfig.toolbar.right.key;
      }

      const body = {
        key: this.searchKey,
        type: this.keyConfig.type === 'geo' ? 200 : this.keyConfig.type === 'sta' ? 10 : this.keyConfig.type === 'raster' ? 100 : null
      };
      this.httpService.getData(body, true, 'execute', api, 'map')
        .subscribe(
          data => {
            if ((data as any).status < 0 || (data as any).tag !== 'map') {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
              this.toastService.toast(toastCfg);
              return;
            }

            this.mapData.type = this.tag + '_search';
            this.mapData.dataList = (data as any).data.root;
            this.mapData.searchKey = this.searchKey;

            // 改变数量
            if (this.tag === 'mydata') {
              this.leftNum = this.mapData.dataList.length;
            } else {
              this.rightNum = this.mapData.dataList.length;
            }

            this.totalPage = (data as any).data.totalProperty;

            // 发送事件
            this.appService.mapsearchEventEmitter.emit(this.mapData);

          },
          error => {
            console.log(error.text());
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
          }
        );
    } else {
      this.clearInput();
    }
  }


  /**
   * 查询初始数据
   */
  public getOriginalData(): void {
    if (this.tag === 'sharedata') {
      this.ls.set('goback_share', '1');
    }
    const goback = this.ls.get('goback_share');

    // 查询数据数据
    const body = {
      start: 0,
      limit: this.keyConfig.create ? this.everyPageNum - 1 : this.everyPageNum,
      type: this.keyConfig.type === 'geo' ? 200 : this.keyConfig.type === 'sta' ? 10 : this.keyConfig.type === 'raster' ? 100 : null
    };
    this.httpService.getData(body, true, 'execute', this.keyConfig.toolbar.left.url, 'map')

      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }

          // 初始化数据
          if (goback !== '1') {
            this.ls.remove('goback_share');
            this.mapData.type = 'mydata';
            this.mapData.dataList = (data as any).data.root;
            this.mapData.searchKey = '我的';
            this.totalPage = (data as any).data.totalProperty;
            this.isShow = true;
            this.appService.mapsearchEventEmitter.emit(this.mapData);
          }


          this.httpService.getData({
            type: this.keyConfig.type === 'geo' ? 200 : this.keyConfig.type === 'sta' ?
              10 : this.keyConfig.type === 'raster' ? 100 : null
          }, true, 'execute', this.keyConfig.toolbar.right.url, 'map')
            .subscribe(
              data2 => {
                if ((data2 as any).status !== 1 || (data2 as any).tag !== 'map') {
                  return;
                }


                // 初始化数据
                if (goback === '1') {
                  this.ls.remove('goback_share');
                  this.mapData.type = 'sharedata';
                  this.mapData.dataList = (data2 as any).data.root;
                  this.mapData.searchKey = '共享';
                  this.tag = 'sharedata';
                  this.leftChecked = false;
                  this.totalPage = (data2 as any).data.totalProperty;
                  this.isShow = true;
                  this.appService.mapsearchEventEmitter.emit(this.mapData);
                }

                // 我的数据数量
                this.leftNum = (data as any).data.totalProperty;
                this.rightNum = (data2 as any).data.totalProperty;

              },
              error => {
                console.log(error);
                const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
                this.toastService.toast(toastCfg);
              }
            );
        },
        error => {
          console.log(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );

  }


  /**
   * 预先请求数量
   */
  public getOriginalDataNum(): void {

    const body = {
      start: 0,
      limit: 1,
      type: this.keyConfig.type === 'geo' ? 200 : this.keyConfig.type === 'sta' ? 10 : this.keyConfig.type === 'raster' ? 100 : null
    };
    // 查询数据数据
    this.httpService.getData(body, true, 'execute', this.keyConfig.toolbar.left.url, 'map')

      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            return;
          }


          this.httpService.getData(body, true, 'execute', this.keyConfig.toolbar.right.url, 'map')
            .subscribe(
              data2 => {
                if ((data2 as any).status !== 1 || (data2 as any).tag !== 'map') {
                  return;
                }

                // 我的数据数量
                this.leftNum = (data as any).data.totalProperty;
                this.rightNum = (data2 as any).data.totalProperty;


              },
              error => {
                console.log(error);
              }
            );
        },
        error => {
          console.log(error);
        }
      );

  }

  /**
   * 滚动加载
   */
  public scrollPageChange() {
    if (!this.searchKey || this.searchKey === '') {
      if (this.mapData.type === 'mydata') {
        // if (this.everyPageNum * this.pageNum < this.totalPage) {
        if (!this.mapData.dataList || this.mapData.dataList.length <= this.totalPage) {
          this.pageNum = this.pageNum + 1;
          this.getSourceMapData();
        }
      } else {
        // if (this.everyPageNum * this.pageNum < this.totalPage) {
        if (!this.mapData.dataList || this.mapData.dataList.length <= this.totalPage) {
          this.pageNum = this.pageNum + 1;

          this.getSourceShareData();

        }
      }

    }

  }

  // 图标发布(有遮罩动画)
  release() {
    const userId = this.ls.get('userId');
    if (userId === 'fm_system_user_root') {
      this.isRoot = true;
    } else {
      this.isRoot = false;
    }
    const body = {
      userId: userId,
      isRoot: this.isRoot
    };
    this.httpService.getData(body, true, '/handler/sprite/', 'generate', 'sprite', 'sprite').subscribe((data) => {
        this.tmService.start();
      },
      error => {
        console.log(error);
      }
    );
  }

  // 服务发布--导入服务--Ljy
  importData(content: any, flag: any) {
    if (flag === 'upload') {
      this.modalService.open(content).result.then((result) => {
      }, (reason) => {
      });
    }

  }

  // 上传-监听上传控件变化，判断文件大小
  fileChangeEvent(e: any) {
    if (e.target.files[0]) {
      if (e.target.files[0].size > (1024 * 1024 * 20)) {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '请控制文件大小在20M以内', 2000);
        this.toastService.toast(toastCfg);
        e.target.value = '';
        return;
      }
      this.inputFile = e.target.files;
      this.showFileName = e.target.files[0].name;
      this.serviceUploadTip = '正在上传...';
      this.upload();
    }
  }

  // 上传
  upload() {
    this.httpService.makeFileRequest('/upload/1.0.0/backup/c8995390-bfb8-413f-9b21-af717eef3069',
      {
        charset: 'utf-8',
        resources: 'resources',
        version: 'current'
      }, this.inputFile)
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            if (data.data && data.data.sign === 1) {
              this.serviceUploadTip = '已上传';
              this.newFile = data.data;
              // this.serviceFile = this.newFile.backup[0]; // 服务发布--导入成功后考虑取消的存值 -- Ljy
              this.saveUpload = true;
              return;
            }

            if (data.data && data.data.sign === -1) {
              this.serviceUploadTip = '上传失败';
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '您不是数据的属主，无法导入', 2000);
              this.toastService.toast(toastCfg);
              return;
            }

            if (data.data && data.data.sign === -2) {
              this.serviceUploadTip = '上传失败';
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '服务不存在', 2000);
              this.toastService.toast(toastCfg);
              return;
            }

          } else {
            this.serviceUploadTip = '上传失败';
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        }
      );
  }

  // 取消上传
  cancelUpload(close: any) {
    this.serviceUploadTip = '请选择部署服务压缩包';
    this.saveUpload = false;
    this.showFileName = null;
    if (this.serviceFile) {
      // Ljytodo -- 这里调用 服务发布-删除服务 的接口
      this.httpService.getData({backup_id: this.serviceFile.backup_id}, true, 'execute', 'cc3b01cd-275d-46fa-bb38-a1abef70ce37', 'map')
      .subscribe(
        data => {
          // if ((data as any).status < 0 || (data as any).tag !== 'map') {
          //   return;
          // }
          // for (let i = 0; i < this.dataList.length; i++) {
          //   if (this.dataList[i][n.id] === body[n.id]) {
          //     this.dataList.splice(i, 1);
          //     break;
          //   }
          // }
          // this.appService.mapsDeleteEventEmitter.emit(this.dataList.length);
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功！', 2000);
          this.toastService.toast(toastCfg);
        },
        error => {
          // toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求出错,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
      this.serviceFile = null;
    }
    close();
  }

  // 上传-确定按钮
  upploadSave(close: any) {
    this.getSourceMapData('clear'); // 服务发布-导入完成后点击确定按钮，这里是刷新我的服务列表 -- Ljy
    this.fileData = this.newFile;
    this.saveUpload = false;
    this.showFileName = null;
    this.serviceUploadTip = '请选择部署服务压缩包';
    // debugger;
    close();
    const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '上传成功！', 2000);
    this.toastService.toast(toastCfg);
  }


}
