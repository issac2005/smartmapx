import {Component, OnInit} from '@angular/core';
import {UserModalComponent} from '../modal/user-modal.component';
import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  info: any[];
  payType = 1;
  payMode = 'wechat';
  orderId: any;
  wechatQc: any;
  pay_status = 1;

  constructor(private toastService: ToastService, public router: Router, public httpService: HttpService,
              private modalService: SmxModal, public activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.orderId = queryParams.order;
      if (this.orderId) {
        const data = localStorage.getItem(this.orderId);
        if (data) {
          this.info = JSON.parse(data);
          this.pay_status = 0;
          // this.getWechatQc();
        }
      } else {
        history.back();
      }
    });


  }


  changePayType(e: any) {
    if (e !== this.payType) {
      this.payType = e;
    }
  }


  uploadPay() {
    const modalRef = this.modalService.open(UserModalComponent, {size: 'lg', backdrop: 'static', enterKeyId: 'smx-user'});
    modalRef.componentInstance.type = 33;
    modalRef.componentInstance.config = {
      title: '上传支付凭证',
    };
    modalRef.result.then((result) => {
      if (result.file) {
        this.httpService.makeFileRequest('/upload/1.0.0/uploadProof/3584cfad-afda-4a29-ac1c-a4e65c4864ec',
          {order_id: this.orderId}, result.file, 'mall_order_proof').subscribe(
          data => {

            if ((data as any).status > 0) {
              this.pay_status = 1;
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '凭证上传成功,将在3S后回到订单页面!', 3000);
              this.toastService.toast(toastCfg);
              setTimeout(() => {
                this.router.navigate(['/app/user'], {queryParams: {type: 'order'}});
              }, 3000);
            }

          }
        );
      } else {
        const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '凭证上传失败,请您稍后重试!', 3000);
        this.toastService.toast(toastCfg);
      }


    }, (reason) => {
    });
  }

  getWechatQc() {
    this.httpService.getData({order_id: this.orderId, trade_type: 'NATIVE'}, true, 'wechat', 'confirmOrder', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }
          if ((data as any).data && (data as any).data.code_url) {
            this.wechatQc = (data as any).data.code_url;
            this.openPay();
          } else {
            let info = '获取付款授权失败';
            if ((data as any).data.result_code = 'FAIL') {
              info = (data as any).data.err_code_des;
            }
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', info, 3000);
            this.toastService.toast(toastCfg);
          }

        },
        error => {
        }
      );
  }

  /**
   * 支付
   */
  confirmPay() {
    // 请求微信支付
    if (this.payMode === 'wechat') {
      this.getWechatQc();
    }


    // 请求支付宝支付
    if (this.payMode === 'ali') {
    }

    const modalRef = this.modalService.open(UserModalComponent, {size: 'lg', backdrop: 'static', enterKeyId: 'smx-user'});
    modalRef.componentInstance.type = 36;
    modalRef.componentInstance.config = {
      title: '订单支付',
      view: '订单支付中...'
    };
    modalRef.result.then((result) => {
      this.httpService.getData({
        order_id: this.orderId,
      }, true, 'execute', '10805e03-afde-4a31-85d7-7cfead0705e5', 'order')
        .subscribe(
          res => {
            this.pay_status = 1;
            // 1: '待支付', 30: '已支付', 100: '已取消', 20: '已上传凭证'
            if ((res as any).data.status === 30 || (res as any).data.status === '30') {
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '支付成功,将在3S后回到订单页面!', 3000);
              this.toastService.toast(toastCfg);
              setTimeout(() => {
                this.router.navigate(['/app/user'], {queryParams: {type: 'order'}});
              }, 3000);
            } else {
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '未查询到支付信息,如有疑问请联系客服!', 3000);
              this.toastService.toast(toastCfg);
            }
          },
          error => {
          }
        );

    }, (reason) => {
      window.location.href = 'http://www.smartmapx.com/about.html#contact';
    });
  }

  // 打开订单
  openPay() {
    const url = 'show/pay.html?orderId=' + this.orderId + '&code=' + this.wechatQc;
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('id', 'chatRoom');
    if (!document.getElementById('chatRoom')) {
      document.body.appendChild(a);
    }
    a.click();
  }


}
