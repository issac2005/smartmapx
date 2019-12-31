import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../s-service/http.service';
import {SmxModal} from '../smx-component/smx-modal/smx-modal.module';
import {AppService} from '../s-service/app.service';


import {LoginModalComponent} from './modal/login-modal.component';


import {Location} from '@angular/common';
import {DataStorage, LocalStorage} from '../s-service/local.storage';
import * as jwt_decode from '@smx/smartmapx-jwt-decode';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';

/**
 * 主体组件
 */
@Component({
  selector: 'app-c-main',
  templateUrl: './c-main.component.html',
  styleUrls: ['./c-main.component.scss']
})

export class MainComponent implements OnInit, OnDestroy {
  config: any[];

  jwt: any;
  decodedJwt: boolean;

  classModule: any[] = [];
  classModuleShow: any = {};
  classThis: string;
  userName: any;

  getDataWay: boolean;

  isLogin = {
    val: false
  };

  productId: string;

  version: any; // 版本号
  platformType: any; // 平台类型

  loginedFlagEvent: any;
  onresizeEvent: any;
  httpEvent: any;

  httpLoading = false;

  constructor(public location: Location,
              private router: Router,
              private ngbModalService: SmxModal,
              private toastService: ToastService,
              private appService: AppService,
              public httpService: HttpService,
              private routerIonfo: ActivatedRoute,
              private ls: LocalStorage,
              private ds: DataStorage) {

    // 登录事件
    this.loginedFlagEvent = this.appService.loginedFlagEventEmitter.subscribe((value: string) => {
      if (value) {
        if (value === 'logined') {
          this.userName = this.ls.get('user_id');
          this.isLogin.val = true;
        } else if (value === 'loginout') {
          this.ls.remove('id_token');
          this.isLogin.val = false;
          this.ngbModalService.dismissAll();
        }
      }
    });


    // 屏幕缩放比例改变
    this.onresizeEvent = this.appService.onresizeEventEmitter.subscribe((value: string) => {
      this.isScale();
    });


    // http 事件
    this.httpEvent = this.appService.httpEventEmitter.subscribe((value: boolean) => {
      this.httpLoading = value;
    });
  }

  /**
   * 初始化
   */
  ngOnInit() {
    this.showLogin();
    this.isScale();
    const config = <any>this.ds.get('properties');
    this.version = config.version; // 版本号
    this.platformType = config.type; // 平台类型

    // 获取配置
    this.getScreenConfig();
  }


  // 显示登录信息
  showLogin() {
    this.jwt = this.ls.get('id_token');
    if (!this.jwt || this.jwt === 'null' || this.jwt === 'undefined' || this.jwt === 'false') {
      this.decodedJwt = false;
    } else {
      try {

        this.decodedJwt = this.jwt ? jwt_decode(this.jwt) : false;
      } catch (e) {
        this.ls.remove('id_token');
        this.decodedJwt = false;
      }
    }
    this.isLogin.val = this.decodedJwt;
    this.userName = this.decodedJwt ? this.ls.get('user_id') : '';
  }

  // 判断当前缩放级别
  detectZoom() {
    let ratio = 0;
    const screen = window.screen;
    const ua = navigator.userAgent.toLowerCase();

    if (window.devicePixelRatio !== undefined) {
      ratio = window.devicePixelRatio;
    } else if (ua.indexOf('msie')) {
      if ((screen as any).deviceXDPI && (screen as any).logicalXDPI) {
        ratio = (screen as any).deviceXDPI / (screen as any).logicalXDPI;
      }
    } else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
      ratio = window.outerWidth / window.innerWidth;
    }

    if (ratio) {
      ratio = Math.round(ratio * 100);
    }

    return ratio;
  }


  // 判断PC端浏览器缩放比例不是100%时的情况
  isScale() {
    const rate = this.detectZoom();
    if (rate !== 200 && rate !== 100) {
      if (this.appService.scale !== rate) {
        this.appService.scale = rate;
        const toastCfg = new ToastConfig(ToastType.INFO, '', '当前显示比例不是100%，如影响使用请置为默认比例.', -1);
        this.toastService.toast(toastCfg);
      }
    } else {
      this.appService.scale = 100;
    }
  }


  ngOnDestroy() {
    this.loginedFlagEvent.unsubscribe();
    this.onresizeEvent.unsubscribe();
    this.httpEvent.unsubscribe();
  }

  getScreenConfig() {
    this.productId = this.routerIonfo.snapshot.queryParams['id'];

    this.httpService.getData({}, this.getDataWay, 'execute', 'fm_system_query_screen', '1')
      .subscribe(
        data => {
          this.classModule = this.forMatdata((data as any).data).sort(function (a, b) {
            return a.sort - b.sort;
          });

          const titleNowChooseId = this.ls.get('titleNowChooseId');
          if (titleNowChooseId) {
            for (const i in this.classModule) {
              if (
                titleNowChooseId === this.classModule[i].menu_id) {
                this.appService.mainListEventEmitter.emit(this.classModule[i]);
                this.classThis = this.classModule[i].name;
                this.appService.titleNowChoose = this.classThis;
              }
            }
          } else {
            let _useNum = 0;
            for (const i in this.classModule) {
              if (this.productId === this.classModule[i].menu_id) {
                _useNum = parseInt(i, 10);
              }
            }

            this.appService.mainListEventEmitter.emit(this.classModule[_useNum]);
            this.classThis = this.classModule[_useNum].name;
            this.appService.titleNowChoose = this.classThis;
          }
        },
        error => {
        }
      );
  }

  /*
  * 将返回的数据格式化为树形结构
  * */
  forMatdata(data: any) {
    const formatD = [];
    for (const i of data) {
      if (i.content) {
        i.content = JSON.parse(i.content);
      }
      if (i.parent_id === '') {
        formatD.push(i);
      }
    }
    for (const i of data) {
      for (const j of formatD) {
        if (i.parent_id === j.menu_id) {
          if (!j.child) {
            j.child = [];
          }
          j['child'].push(i);
        }
      }
    }
    return formatD;
  }

  // 标题点击事件
  changeClass(e: any) {
    let _thisuse: any;
    for (const i of this.classModule) {
      if (i.name === e.target.innerText) {
        this.classThis = i.name;
        this.appService.titleNowChoose = this.classThis;
        // localStorage.setItem('titleNowChooseId', i.menu_id);
        this.ls.set('titleNowChooseId', i.menu_id);
        if (this.router.url.match(/^(\/app\/home).*$/) !== null) {
          this.appService.mainListEventEmitter.emit(i);
        } else {
          _thisuse = i;
          this.router.navigate(['/app/home']);
          setTimeout(() => {
            this.appService.mainListEventEmitter.emit(i);
          }, 50);
          // this.getScreenConfig();
        }

      }
    }

  }

  // 点击登录按钮弹出登录框
  login() {
    const modalRef = this.ngbModalService.open(LoginModalComponent, {size: 'lg', backdrop: 'static', enterKeyId: 'smx-login'});
    modalRef.componentInstance.type = 'Login';
    modalRef.result.then((result) => {
      if (result === 'success') {
        this.appService.mainListEventEmitter.emit('login');
      }
    }, (reason) => {

    });
  }


  /*
  * 用户登出
  * */
  logout() {
    this.httpService.getData({}, true, 'logout', 'logout', '1')
      .subscribe(data => {
          // localStorage.removeItem('id_token');
          this.ls.remove('id_token');
          // this.router.navigate(['/app/home']);
          this.router.navigate(['/index']);
          // this.userName = '';
          this.isLogin.val = false;
          this.ngbModalService.dismissAll();
        },
        error => {
        }
      );
  }

  /*
  * 注册按钮点击事件
  * */
  signIn() {
    const modalRef = this.ngbModalService.open(LoginModalComponent, {enterKeyId: 'smx-login', size: 'lg', backdrop: 'static'});
    modalRef.componentInstance.type = 'SignIn';

  }


  /**
   * 用户中心
   */
  userCenter() {
    this.router.navigate(['/app/user']);
  }
}
