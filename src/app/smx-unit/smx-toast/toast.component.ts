import {Component, OnInit, Input, Output, EventEmitter, AfterViewChecked} from '@angular/core';
import {ToastConfig, ToastType} from './toast-model';
import {AppModalComponent} from '../../modal/app-modal.component';
import {SmxModal} from '../../smx-component/smx.module';
import {HttpClient} from '@angular/common/http';
import {DataStorage} from '../../s-service/local.storage';
import * as QRCode from '@smx/smartmapx-qrcode';

/**
 * toast组件
 */
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast-box-component.scss']
})
export class ToastComponent implements OnInit, AfterViewChecked {

  @Input() config = new ToastConfig(ToastType.INFO, '', '');

  @Output() dismissed = new EventEmitter();


  code: any; // 激活码
  accessCode: any; // 激活码
  error: any; // 错误信息
  success: any; // 成功状态
  time: any; // 成功状态

  qr: any;

  constructor(private modalService: SmxModal, private http: HttpClient, private ds: DataStorage) {

  }

  ngOnInit() {
    // 自动关闭
    if (this.config.isAutoDismissing()) {
      setTimeout(() => this.dismiss(), this.config.getAutoDismissTime());
    }


  }


  ngAfterViewChecked(): void {
    const properties = <any>this.ds.get('properties');
    this.code = this.config.text;
    if (this.config.toastType && this.config.toastType === 4 && !this.qr) {
      this.qr = new QRCode('active-qrcode-img', {
        text: properties.serviceIP.active + '?serial=' + this.code,
        width: 128,
        height: 128,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  }

  /**
   * 判断是成功
   */
  public isSuccess() {
    return this.config.getToastType() === ToastType.SUCCESS;
  }

  /**
   * 判断是信息
   */
  public isInfo() {
    return this.config.getToastType() === ToastType.INFO;
  }

  /**
   * 判断是警告
   */
  public isWarning() {
    return this.config.getToastType() === ToastType.WARNING;
  }

  /**
   * 判断是错误
   */
  public isError() {
    return this.config.getToastType() === ToastType.ERROR;
  }


  /**
   * 解除
   */
  public dismiss() {
    this.dismissed.emit();
  }

  /**
   * 是否启用关闭按钮
   */
  public isDismissEnabled() {
    return this.config.isDismissable();
  }


  public watchError() {
    this.dismiss();
    const modalRef = this.modalService.open(AppModalComponent, {size: 'lg', centered: true, backdrop: 'static', enterKeyId: 'smx-app'});
    modalRef.componentInstance.config = {title: '错误详情', body: 1, view: this.config.describe, footer: 1};
    modalRef.result.then((result) => {
    }, (error) => {

    });
  }

  /**
   * 验证激活码
   */
  submit() {
    if (this.accessCode) {
      this.error = null;
      this.http.post('/em/License', {sn: this.accessCode}).subscribe((res) => {
        if ((res as any).status > 0) {
          this.time = (res as any).config.expiry.replace('T', ' ').replace('Z', ' ');

          this.error = null;
          this.success = true;
        } else {
          // alert((res as any).msg);
          this.error = (res as any).msg;
        }
      }, (err) => {

      });
    } else {
      // alert('请输入激活码!');
      this.error = '激活码不能为空,请输入您的激活码或者联系商务获取激活码!';
      // this.error = '您已开启Sm@rtMapX敏捷GIS开发平台全部功能,如果在使用中有任何疑问,请及时联系我们!';
      // this.toastService.toast(new ToastConfig(ToastType.ERROR, '', '请输入激活码!', 20000000));
      // alert('请输入激活码!');
    }
  }

  goSystem() {
    window.location.reload();
  }
}
