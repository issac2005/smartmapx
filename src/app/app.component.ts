import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {AppService} from './s-service/app.service';
import {Location} from '@angular/common';
import {HttpService} from './s-service/http.service';
import {LoginModalComponent} from './c-main/modal/login-modal.component';
import {SmxModal} from './smx-component/smx-modal/smx-modal.module';  // new
import {DataStorage, LocalStorage} from './s-service/local.storage';
import {getQueryString} from './smx-component/smx-util';
import {slideToRight} from './s-service/animations';
import * as jwt_decode from '@smx/smartmapx-jwt-decode';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles:
    [`
      .root {
        min-height: 100%;
        height: 100%;
        overflow-y: hidden;
      }
    `]
  ,
  animations: [slideToRight]
})
export class AppComponent implements OnInit {
  initStatus = false;
  config: any;
  // version: any;

  isLogin = {
    val: false
  };
  jwt: any;
  decodedJwt: boolean;
  userName: any;

  // getDataWay: boolean;
  // router跳转动画所需参数
  routerState = true;
  routerStateCode = 'active';

  constructor(public httpService: HttpService,
              public location: Location,
              public router: Router,
              public appService: AppService,
              private ngbModalService: SmxModal,
              private elementRef: ElementRef,
              private renderer: Renderer2,
              private ls: LocalStorage,
              private ds: DataStorage) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // 每次路由跳转改变状态
        this.routerState = !this.routerState;
        this.routerStateCode = this.routerState ? 'active' : 'inactive';
      }
    });
    window.onresize = () => {
      this.appService.onresizeEventEmitter.emit();
    };
  }


  ngOnInit() {
    this.renderer.listen(
      this.elementRef.nativeElement, 'click', event => {
        this.appService.mouseEventEmitter.emit(event);
      });
    this.httpService.getFile('config/config.json').subscribe((res) => {
      this.ds.set('properties', res);
      this.config = res;
      this.initStatus = true;
      this.verifyLogin();
    }, (error) => {
    });

    this.httpService.getServiceList('/map/server_list.json', false, {}).subscribe((res) => {
      // ;
      if (res.server_list) {
        this.ds.set('serverlist', res.server_list);
      } else {
        this.ds.set('serverlist', {});
      }

    }, (error) => {
    });
  }


  // 验证登录
  verifyLogin() {

    // 验证是否url登录
    // const parmas = this.getQueryString();
    const url = this.location.path(); // 获取url中"?"符后的字串
    const parmas = getQueryString(url);

    if ((parmas as any).loginType) { // 跳转登录

      // 微信登录
      if ((parmas as any).loginType === 'wechat') {
        const token = (parmas as any).id_token;

        if ((parmas as any).register && (parmas as any).register === 'true') { // 是否需要注册
          this.signIn(token);
        } else {
          // localStorage.setItem('id_token', token);
          this.ls.set('id_token', token);
          this.urlLogin();
        }
      }


      // 官网登录
      if ((parmas as any).loginType === 'website') {
        this.urlLogin('website');
      }

    } else { // 正常登陆
      this.urlLogin();
    }
  }


  // 登录
  urlLogin(type?: any) {
    this.jwt = this.ls.get('id_token');

    if (!this.jwt || this.jwt === 'null' || this.jwt === 'undefined' || this.jwt === 'false') {
      this.decodedJwt = false;
    } else {
      try {
        this.decodedJwt = this.jwt ? jwt_decode(this.jwt) : false;

        this.httpService.prejudgeToken().subscribe(res => {
          if (res.status < 0) {
            this.ls.remove('id_token');
            this.decodedJwt = false;
          }
          this.initStatus = true;
        }, error => {
          this.initStatus = true;
        });
      } catch (e) {
        this.ls.remove('id_token');
        this.decodedJwt = false;
        this.initStatus = true;
      }


    }

    this.isLogin.val = this.decodedJwt;
    if (this.decodedJwt) {
      const name = JSON.parse((this.decodedJwt as any).data).login_name || JSON.parse((this.decodedJwt as any).data).root[0].login_name;
      this.ls.set('user_id', name);
    } else {
      if (type && type === 'website') {
        this.login();
      }
    }
  }


  // // 获取url参数
  // getQueryString() {
  //
  //   const url = this.location.path(); // 获取url中"?"符后的字串
  //   const theRequest = new Object();
  //   if ((url as any).indexOf('?') !== -1) {
  //     const str = (url as any).substr(1);
  //     const strs1 = str.split('?');
  //     let strs;
  //     if (strs1[1]) {
  //       strs = strs1[1].split('&');
  //     } else {
  //       strs = strs1[0].split('&');
  //     }
  //
  //     for (let i = 0; i < strs.length; i++) {
  //       theRequest[strs[i].split('=')[0]] = strs[i].split('=')[1];
  //     }
  //   }
  //
  //   return theRequest;
  // }


  /**
   * 注册绑定弹窗
   */
  signIn(token?: any) {
    const modalRef = this.ngbModalService.open(LoginModalComponent, {
      backdrop: 'static',
      centered: true,
      keyboard: false,
      enterKeyId: 'smx-login'
    });
    modalRef.componentInstance.modalData = this.config.type;
    modalRef.componentInstance.token = token;
    modalRef.componentInstance.type = 'BindPhone';
  }


  /**
   * 登录弹窗
   */
  login() {
    const modalRef = this.ngbModalService.open(LoginModalComponent, {size: 'lg', backdrop: 'static', centered: true, enterKeyId: 'smx-login'});
    modalRef.componentInstance.type = 'Login';
  }

}
