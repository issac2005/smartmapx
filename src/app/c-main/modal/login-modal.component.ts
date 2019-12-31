///<reference path="../../../typings.d.ts"/>
import {Component, Input, ViewEncapsulation, OnInit, AfterViewInit} from '@angular/core';
import {SmxActiveModal, SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {AppModalComponent} from '../../modal/app-modal.component';
import {HttpService} from '../../s-service/http.service';
import {AppService} from '../../s-service/app.service';
import {LocalStorage, DataStorage} from '../../s-service/local.storage';
import * as jwt_decode from '@smx/smartmapx-jwt-decode';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {isArray} from '../../smx-component/smx-util';
import {SMXNAME, NICKNAME, isUINumber} from '../../s-service/utils';
import {Encrypt} from '../../s-service/smx-encrypt';

/**
 * 登录组件
 */
@Component({
  selector: 'app-signin-modal',
  templateUrl: 'login-modal.component.html',
  styleUrls: ['login-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class LoginModalComponent implements OnInit, AfterViewInit {
  @Input() type;
  @Input() token: any;


  config: any;
  tag: any;

  // 注册
  signInName: string;
  signPsword: string;
  signPswordTwo: string;
  agree: boolean;
  registerDisabled = false;


  // 错误信息
  errSigninShow: boolean;
  errText: string;
  telExist = false;

  // 验证码相关
  tel: string;
  code: string;
  codeTime = '获取验证码';
  codeStatus = true;

  // 微信绑定状态
  wechatBind: any;


  // 登录
  userName: any;
  userPasswd = '';


  // 密码
  oldPassword = '';
  newPassword = '';
  newPasswordTwo = '';


  // 修改昵称
  // userName: any;
  bindCodeTime = '验证';
  bindCodeStatus = true;

  constructor(private ngbModalService: SmxModal,
              public activeModal: SmxActiveModal,
              public httpService: HttpService,
              private toastService: ToastService,
              private appService: AppService,
              private ls: LocalStorage,
              private ds: DataStorage) {
  }

  ngOnInit() {
    // this.config = this.appService.properties;
    this.config = this.ds.get('properties');
  }


  ngAfterViewInit() {
    if (this.type === 'wechat' || this.type === 'wechatBind') {
      this.wechat();
    }
  }


  // 标题
  getTitle(v: any) {
    let title = '';
    switch (v) {
      case 'SignIn':
        title = '用户注册';
        break;
      case 'BindPhone':
        title = '绑定账户';
        break;
      case 'ForgetPs':
        title = '忘记密码';
        break;
      case 'ResetPs':
        title = '重置密码';
        break;
      case 'ChangePs':
        title = '修改密码';
        break;
      case 'inputPs':
        title = '手机号绑定';
        break;
      case 'Login':
        title = '登录';
        break;
      case 'ChangeUserName':
        title = '修改昵称';
        break;
      case 'wechat':
        title = '微信登录';
        break;
      case 'wechatBind':
        title = '微信绑定';
        break;
    }

    return title;
  }


  /*****************************************注册start**********************************************/

  /**
   * 用户注册
   * @param event
   */
  goSignin(event: Event) {
    event.preventDefault();
    event.stopPropagation();


    if (this.testInfo(1) && !this.telExist) {
      const paasword = Encrypt(this.signPsword);

      const body = this.config.type === 'saas' ? {
        login_name: this.tel,
        user_name: this.tel,
        password: paasword,
        phoneNo: this.tel,
        code: this.code
      } : {
        login_name: this.tel,
        user_name: this.tel,
        password: paasword,
      };

      this.httpService.getData(body, false, 'execute', '17dcea54-44c3-49ba-8229-0fbd22ba1194', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              return;
            }
            this.activeModal.close();
            this.login();
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '注册成功!', 3000);
            this.toastService.toast(toastCfg);
          },
          error => {
          }
        );
    }

  }


  /**
   * 微信绑定
   */
  goBind() {

    if (this.testInfo(2)) {
      if (this.wechatBind === '1') {
        const body = {
          token: this.token,
          tag: 'wechat',
          data: {
            phoneNo: this.tel,
            code: this.code
          }
        };
        this.httpService.getData(body, false, 'wechat', 'binding', 'wechat', 'wechat')
          .subscribe(
            data => {
              if ((data as any).status < 0) {
                return;
              }
              this.activeModal.close();
              this.token = (data as any).data.token;
              this.login();

            },
            error => {
            }
          );
      }
      if (this.wechatBind === '10') {
        const body = {
          token: this.token,
          tag: 'wechat',
          data: {
            phoneNo: this.tel,
            code: this.code,
            password: this.signPsword
          }
        };
        this.httpService.getData(body, false, 'wechat', 'register', 'wechat', 'wechat')
          .subscribe(
            data => {


              if ((data as any).status < 0) {
                return;
              }
              this.activeModal.close();

              this.token = (data as any).data.token;
              // 登录
              this.login();

            },
            error => {
            }
          );
      }
    }
  }


  /**
   * 绑定微信验证手机号
   */
  wechatBindTel() {
    this.bindCodeTime = '60s';
    this.bindCodeStatus = false;
    let num = 60;
    const interval = setInterval(() => {

      if (num === 0) {
        clearInterval(interval);
        this.bindCodeStatus = true;
        this.bindCodeTime = '验证';
      } else {
        num = num - 1;
        this.bindCodeTime = num + 's';
      }
    }, 1000);


    if (!this.errSigninShow || this.errSigninShow === undefined) {
      const body = {
        token: this.token,
        tag: 'wechat',
        data: {
          phoneNo: this.tel
        }
      };
      this.httpService.getData(body, false, 'wechat', 'confirmation', 'wechat', 'wechat')
        .subscribe(
          data => {

            if ((data as any).status < 0) {
              return;
            }

            if ((data as any).data.status) {
              if ((data as any).data.status === -180 || (data as any).data.status === '-180') {
                const toastCfg = new ToastConfig(ToastType.WARNING, '', '此手机号已绑定其他微信!', 3000);
                this.toastService.toast(toastCfg);
                return;
              } else {
                this.wechatBind = (data as any).data.status;
              }
            }


          },
          error => {
          }
        );

    } else {
      this.testInfo(2);
    }
  }


  /**
   * 注册登录
   */
  login() {
    try {
      const decodedJwt = this.token ? jwt_decode(this.token) : false;
      if (decodedJwt) {
        const name = JSON.parse((decodedJwt as any).data).login_name || JSON.parse((decodedJwt as any).data).root[0].login_name || this.tel;
        this.ls.set('id_token', this.token);
        this.ls.set('user_id', name);
        this.appService.loginedFlagEventEmitter.emit('logined');
      }
    } catch (e) {
      console.log('token解析失败');
    }
  }

  /**
   * 修改密码验证手机号
   //  */
  // goVerify() {
  //   if (!this.errSigninShow && this.errSigninShow !== undefined) {
  //
  //     this.activeModal.close();
  //     const modalRef = this.ngbModalService.open(ChangepswdModalComponent, {
  //       size: 'lg',
  //       backdrop: 'static',
  //       centered: true,
  //       keyboard: false
  //     });
  //     modalRef.componentInstance.type = this.type === 'BindPhone' ? 'inputPs' : 'ResetPs';
  //     modalRef.result.then((result) => {
  //
  //       //todo 处理绑定或者重置密码
  //     }, (reason) => {
  //
  //     });
  //   } else {
  //     this.testInfo(3);
  //   }
  // }


  // 获取验证码
  getCode(tag?: any) {
    if (this.tel) {
      if (tag && tag === 'ForgetPs') {
        this.sendCode(); // 发送验证码
      } else {
        this.verfyTelExist(this.tel, 'code');
      }


    } else {
      this.showErrText(2, '手机号码不能为空!');
    }


  }


  // 发送验证码
  sendCode() {
    const result = this.verifyTel(this.tel);
    if (!result) {
      return;
    }

    const body = {phoneNo: this.tel};
    this.httpService.getData(body, false, 'execute', '8c59d3f0-f3dc-4a8a-8781-1dabfdd1b21d', '1')
      .subscribe(
        res => {
          if ((res as any).status < 0) {
            return;
          }
        },
        error => {
        }
      );

    this.codeTime = '60s后重新获取';
    this.codeStatus = false;
    let num = 60;
    const interval = setInterval(() => {
      if (num === 0) {
        clearInterval(interval);
        this.codeStatus = true;
        this.codeTime = '获取验证码';
      } else {
        num = num - 1;
        this.codeTime = num + 's后重新获取';
      }
    }, 1000);
  }


  // 判断用户是否同意用户协议
  getValue(value: any) {
    this.registerDisabled = value;
  }

  agreementModal() {
    const modalRef = this.ngbModalService.open(AppModalComponent, {
      size: 'lg',
      centered: true,
      keyboard: true,
      backdrop: 'static',
      newModal: true,
      enterKeyId: 'smx-app'
    });
    modalRef.componentInstance.modalType = 'terms';

    // const modalRef2 = this.ngbModalService.open(AppModalComponent, {
    //   size: 'lg',
    //   centered: true,
    //   keyboard: true,
    //   backdrop: 'static',
    //   newModal: true,
    //   enterKeyId: 'smx-test'
    // });
    // modalRef2.componentInstance.modalType = 'terms';
  }

  /*****************************************注册start**********************************************/

  /*****************************************登录start**********************************************/
  /**
   * 登录
   * @param event
   */
  goLogin(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.userName) {
      this.showErrText(1, this.config.type === 'saas' ? '手机号码不能为空!' : '用户名不能为空!');
      return;
    } else if (!this.userPasswd) {
      this.showErrText(1, '密码不能为空!');
      return;
    }

    const paasword = Encrypt(this.userPasswd);
    const body = {
      userName: this.userName,
      userPass: paasword,
      type: 'local'
    };
    this.httpService.getData(body, false, 'login', 'login', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }

          // localStorage.setItem('id_token', (data as any).token);
          this.ls.set('id_token', (data as any).token);
          // localStorage.setItem('user_id', this.userName);
          this.ls.set('user_id', this.userName);
          this.ls.set('userId', (data as any).data.user_id);
          this.activeModal.close('success');

          this.appService.loginedFlagEventEmitter.emit('logined');
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '登录成功!', 3000);
          this.toastService.toast(toastCfg);
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', error, 1000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  /**
   * 马上注册
   * @param e
   */
  signIn(e: any) {
    this.activeModal.close();
    const modalRef = this.ngbModalService.open(LoginModalComponent, {size: 'lg', backdrop: 'static', enterKeyId: 'smx-login'});
    modalRef.componentInstance.type = 'SignIn';
  }


  /**
   * 忘记密码
   */
  forgetPswd() {
    this.activeModal.close();
    const modalRef = this.ngbModalService.open(LoginModalComponent, {
      size: 'lg',
      backdrop: 'static',
      enterKeyId: 'smx-login'
    });

    modalRef.componentInstance.type = 'ForgetPs';
    modalRef.result.then((result) => {

    }, (reason) => {
    });
  }


  /**
   * 微信扫码
   */
  wechatLogin() {
    this.activeModal.close();
    const modalRef = this.ngbModalService.open(LoginModalComponent, {size: 'lg', backdrop: 'static', enterKeyId: 'smx-login'});
    modalRef.componentInstance.type = 'wechat';
  }


  wechat() {
    const url = window.location.href;
    const rds = url.split('?');
    const rd = rds && isArray(rds) ? rds[0] : url;
    const wx_url = 'http%3A%2F%2Fwww.smartmapx.com%2FwxAuthRd?rd=' + encodeURIComponent(encodeURIComponent(rd));
    const token = this.ls.get('id_token');
    const status = this.type === 'wechat' ? 'smartmapx' : token;
    const wx = new WxLogin({
      self_redirect: false,
      id: 'wechat',
      appid: 'wx2f45d19859e04af8',
      scope: 'snsapi_login',
      redirect_uri: wx_url,
      style: 'black',
      href: 'https://www.smartmapx.com/map/assets/wechat.css',
      state: status
    });
  }

  /*****************************************登录end**********************************************/


  /*****************************************修改密码start**********************************************/

  /*
  * 确认修改密码
  * */
  goChangePs(e: any) {
    e.preventDefault();
    e.stopPropagation();

    const oldpassword = Encrypt(this.oldPassword);
    const password = Encrypt(this.newPassword);
    if (this.testInfo(3)) {
      const body = {
        oldpassword: oldpassword,
        password: password
      };
      this.httpService.getData(body, true, 'execute', '69f99ba9-eb22-4e16-a627-5a45ae11dbd3', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              return;
            }
            if ((data as any).data.count > 0) {
              this.activeModal.close();
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '密码修改成功,请重新登录!', 3000);
              this.toastService.toast(toastCfg);
            } else {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '原密码输入错误!', 3000);
              this.toastService.toast(toastCfg);
            }

          },
          error => {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', error, 3000);
            this.toastService.toast(toastCfg);
          }
        );
    }


  }

  /*****************************************修改密码end**********************************************/


  /***************************************修改昵称start*******************************************/
  /**
   * 修改昵称
   */
  goChangeUn() {
    if (!this.userName) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '昵称不能为空!', 3000);
      this.toastService.toast(toastCfg);
      return;
    }
    const test = NICKNAME.REG.test(this.userName);
    if (!test) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', NICKNAME.MSG, 5000);
      this.toastService.toast(toastCfg);
      return;
    }
    this.httpService.getData({user_name: this.userName}, true, 'execute', '81e48b36-3423-438d-bd3b-d250f23f71cf', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }
          this.activeModal.close(this.userName);

          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '昵称修改成功!', 3000);
          this.toastService.toast(toastCfg);
        },
        error => {
        }
      );
  }

  /***************************************修改昵称end*******************************************/

  /***************************************忘记密码start*******************************************/


  goForgetPs(e: any) {
    e.preventDefault();
    e.stopPropagation();


    const password = Encrypt(this.newPassword);
    if (this.testInfo(4)) {
      const body = {
        phoneNo: this.tel,
        code: this.code,
        password: password
      };
      this.httpService.getData(body, false, 'execute', '7d697034-a93e-489b-95f9-6b09791a27a0', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              return;
            }
            this.activeModal.close();
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '密码重置成功!', 3000);
            this.toastService.toast(toastCfg);
          },
          error => {
          }
        );
    }
  }

  /***************************************忘记密码end******************************************/


  /*
* 显示错误提示
* */
  showErrText(type: number, text: string) { // type为1时表示登录、2注册
    this.errText = text;
    this.errSigninShow = true;
  }


  /**
   * 信息校验
   */
  testInfo(tag: any) {
    // 注册
    if (tag === 1) {
      if (!this.verifyTel(this.tel)) {
        return;
      }


      if (this.config.type === 'saas') {
        this.verfyTelExist(this.tel);

        if (!this.verifyCode(this.code)) {
          return;
        }
      }

      // 验证密码
      if (!this.verifyPass(this.signPsword, this.signPswordTwo)) {
        return;
      }
    }


    // 绑定
    if (tag === 2) {
      if (this.wechatBind || this.type === 'ForgetPs') {
        if (!this.verifyTel(this.tel)) {
          return;
        }

        if (!this.verifyCode(this.code)) {
          return;
        }

        if (this.wechatBind === '10' || this.type === 'ForgetPs') { // 新账号绑定

          // 验证密码
          if (!this.verifyPass(this.signPsword, this.signPswordTwo)) {
            return;
          }
        }
      } else {
        this.showErrText(2, '请先验证手机号!');
      }
    }


    // 修改密码验证
    if (tag === 3) {
      if (!this.verifyPass(this.newPassword, this.newPasswordTwo, this.oldPassword)) {
        return;
      }
    }


    // 忘记密码
    if (tag === 4) {
      if (!this.verifyTel(this.tel)) {
        return;
      }

      if (!this.verifyCode(this.code)) {
        return;
      }

      // 验证密码
      if (!this.verifyPass(this.newPassword, this.newPasswordTwo)) {
        return;
      }
    }


    this.errSigninShow = false;
    return true;
  }


  /**
   * 验证手机号是否存在
   */
  verfyTelExist(tel: any, code?: any) {
    this.httpService.getData({login_name: tel}, false, 'execute', '98bbe126-0263-43bb-9902-df3db9d2239b', '1').subscribe(data => {
      if ((data as any).status < 0) {
        return;
      }
      if ((data as any).data.root.length > 0) {
        this.telExist = true;
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '此号码已经被注册,请直接登录或者找回密码!', 3000);
        this.toastService.toast(toastCfg);
      } else {
        if (code === 'code') {
          this.sendCode(); // 发送验证码
        }
      }
    }, error => {
    });


  }


  /**
   * 手机号验证
   */
  verifyTel(tel: any, exist?: any) {
    const c = this.config.type === 'saas' ? /^[a-zA-Z0-9_]{6,12}$/ : /^[\u4E00-\u9FA50-9A-Za-z_]{4,12}$/; // 手机号验证
    if (!tel) {
      this.showErrText(2, this.config.type === 'saas' ? '手机号码不能为空!' : '请输入用户名!');
      return false;
    }
    if (!c.test(tel)) {
      this.showErrText(2, this.config.type === 'saas' ? '手机号码格式不正确!' : '用户名只支持6-12个英文、数字、下划线字符组合!');
      return false;
    }

    // 验证
    if (exist && exist === 'exist') {
      this.verfyTelExist(tel);
    }

    this.errSigninShow = false;
    return true;
  }


  /**
   * 密码验证
   * @param ps
   * @param psTwo
   */
  verifyPass(ps: any, psTwo: any, psOld?: any) {

    if (psOld) { // 验证旧密码
      if (!psOld) {
        this.showErrText(2, '请输入原密码!');
        return false;
      }
    }

    if (!ps) {
      this.showErrText(2, !psOld ? '请输入密码!' : '请输入新密码');
      return false;
    }

    if (ps.length < 6 || ps.length > 12) {
      this.showErrText(2, !psOld ? '密码必须在6-12位字符之间!' : '新密码必须在6-12位字符之间!');
      return false;
    }

    if (!psTwo) {
      this.showErrText(2, !psOld ? '请确认密码!' : '请确认新密码!');
      return false;
    }

    if (ps !== psTwo) {
      this.showErrText(2, '两次输入的密码不相同!');
      return false;
    }

    this.errSigninShow = false;
    return true;
  }


  /**
   * 验证码非空判断
   * @param code
   */
  verifyCode(code: any) {
    if (!code) {
      this.showErrText(2, '验证码不能为空!');
      return false;
    }

    this.errSigninShow = false;
    return true;
  }


}
