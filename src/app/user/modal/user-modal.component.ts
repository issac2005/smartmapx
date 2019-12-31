import {Component, Input, OnInit, AfterViewInit, Output, EventEmitter} from '@angular/core';

import {SmxActiveModal} from '../../smx-component/smx-modal/smx-modal.module';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {SMXNAME} from '../../s-service/utils';

@Component({
  selector: 'user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.scss']
})

export class UserModalComponent implements OnInit, AfterViewInit {
  @Input() modalType: any;  // 模态框类型
  @Input() type: any; // 操作类型
  @Input() config: any;  // 配置文件
  @Input() modalData: any; // 数据
  @Output() outEvent = new EventEmitter();

  selectApp: any;


  inputFile: any;
  imgFile: any;

  /**
   * 31 升级方案
   */
  price: any; // 价格
  reduced_price: any; // 优惠价格


  productList: any[];

  product_id: any; // 方案类型
  products = [];

  // buyType = 'mouth'; // 购买类型
  product_option_id: any; // 购买时长
  productOptions = [];

  maturedTime: any; // 到期时间


  billType = 1; // 发票状态
  invoiceBase1 = [
    {title: '发票抬头', value: '', noNull: true},
    {title: '税号', value: '', noNull: true}];
  invoiceBase2 = [
    {title: '发票抬头', value: '', noNull: true},
    {title: '税号', value: '', noNull: true},
    {title: '单位地址', value: '', noNull: true},
    {title: '电话号码', value: '', noNull: true},
    {title: '开户银行', value: '', noNull: true},
    {title: '银行账号', value: '', noNull: true}];
  invoiceBase3 = [
    {title: '发票抬头', value: '', noNull: true}];


  remainingBalance: any; // 余额

  constructor(public activeModal: SmxActiveModal,
              public httpService: HttpService,
              public toastService: ToastService) {

  }


  ngOnInit() {
  }


  /**
   * 模态框初始化配置
   */
  ngAfterViewInit() {
    switch (this.type) {
      case 31: // 产品类型
        this.productList = this.modalData.productList;
        let tag = false;

        if (this.modalData.type === 1) { // 升级
          for (let i = 0; i < this.productList.length; i++) {

            // 确定当前版本产品
            if (this.productList[i].product_id === this.modalData.userInfo.product_id ||
              this.modalData.userInfo.product_id === 'c4985149-6e9a-4f3b-8c8f-f35fc05dbbef') {
              tag = true;
            }


            if (tag && this.productList[i].price !== 0) {
              const body = {
                label: this.productList[i].name,
                value: this.productList[i].product_id,
                title: this.productList[i].description,
                product: this.productList[i].product_options ? this.productList[i].product_options : []
              };

              this.products.push(body);
            }

          }

          const index = this.products.length < 1 || this.modalData.userInfo.product_id === 'c4985149-6e9a-4f3b-8c8f-f35fc05dbbef' ? 0 : 1;
          this.product_id = this.products[index].value;
          this.productOptions = this.products[index].product ? this.products[index].product : [];
          this.product_option_id = this.products[index].product ? this.products[index].product[0].product_options_id : '';
          this.modalData.userInfo.product_id === 'c4985149-6e9a-4f3b-8c8f-f35fc05dbbef' ? this.remainingBalance = 0 : this.calculateTime();
          this.calculatePrice(this.products[index].product[0]);


        } else {// 续费
          for (const v of this.modalData.productList) {
            if (v.price !== 0 && v.product_id === this.modalData.userInfo.product_id) {
              const body = {
                label: v.name,
                value: v.product_id,
                title: v.description,
                product: v.product_options ? v.product_options : []
              };

              // 当前版本产品
              this.productOptions = v.product_options ? v.product_options : [];
              this.product_option_id = v.product_options ? v.product_options[0].product_options_id : '';


              // 版本
              this.product_id = this.modalData.userInfo.product_id;
              this.products.push(body);
              // 计算价格
              this.calculatePrice(v.product_options[0]);
            }
          }
        }


        break;
    }
  }

  /**
   * 选择产品
   */
  checkedProduct(e: any) {
    this.product_id = e.value;
    this.productOptions = e.product;
    this.product_option_id = e.product[0].product_options_id;
    this.calculatePrice(e.product[0]);
  }


  /**
   * 31 升级方案计算价格
   */
  calculatePrice(e: any) {
    this.price = e.compare_at_price; // 价格
    this.reduced_price = (e.price - e.compare_at_price); // 价格
    const unitPrice = e.compare_at_price / e.ext_arr;
    const durationTime = (this.remainingBalance / unitPrice) * 86400;
    this.maturedTime = Math.round(new Date().getTime() / 1000) + durationTime + (e.ext_arr * 86400);

  }

  /**
   * 计算时间
   */
  calculateTime() {
    const time = this.modalData.userInfo.expire_time;
    const currentTime = Math.round(new Date().getTime() / 1000);
    const day = ((time - currentTime) / 86400);

    for (const v of this.productOptions) {

      if (v.product_options_id === this.modalData.userInfo.product_options_id) {
        const price = v.compare_at_price / v.ext_arr;
        this.remainingBalance = price * day;
        return;
      }

    }
  }

  /**
   * 上传图片
   * @param event
   */
  fileChangeEvent(e: any) {
    this.inputFile = e.target.files;
    const reader = new FileReader();


    // 为文件读取成功设置事件
    reader.onload = (res) => {
      this.imgFile = (res as any).target.result;
    };

    // 正式读取文件
    reader.readAsDataURL(this.inputFile[0]);
  }


  /**
   * 取消图片上传
   */
  cancelFileChange() {
    this.imgFile = null;
    this.inputFile = null;
  }


  changeRadio(d: any, e: any) {
    if (d === 'user') {
      this.config.view.user_type = e;
    }

    if (d === 'bill') {
      this.config.view.type = e;
    }


    if (this.config.view.user_type === 1) {
      if (this.config.view.type === 1) {
        this.billType = 1;
        this.config.view.invoiceInfo = this.invoiceBase1;
      } else {
        this.billType = 2;
        this.config.view.invoiceInfo = this.invoiceBase2;
      }
    } else {
      this.config.view.type = 1;
      this.billType = 3;
      this.config.view.invoiceInfo = this.invoiceBase3;
    }


  }


  /**
   *发票校验
   * @param data
   */
  verifyData(data: any) {
    for (const v of data.invoiceInfo) {
      if (v.noNull && !v.value) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', v.title + '不能为空！', 3000);
        this.toastService.toast(toastCfg);
        return;
      }
    }

    for (const v of data.expressInfo) {
      if (v.noNull && !v.value) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', v.title + '不能为空！', 3000);
        this.toastService.toast(toastCfg);
        return;
      }
    }


    const body = ({
      user_type: Number(data.user_type),
      type: Number(data.type)
    } as any);

    for (const v of data.invoiceInfo) {
      switch (v.title) {
        case '发票抬头':
          body['title'] = v.value;
          break;
        case '税号':
          body['tax_id_no'] = v.value;
          break;
        case '单位地址':
          body['b_address'] = v.value;
          break;
        case '电话号码':
          body['phone'] = v.value;
          break;
        case '开户银行':
          body['deposit_bank'] = v.value;
          break;
        case '银行账号':
          body['account_no'] = Number(v.value);
          break;
      }

    }

    for (const l of data.expressInfo) {
      switch (l.title) {
        case '收票人姓名':
          body['name'] = l.value;
          break;
        case '电话':
          body['phoneNo'] = l.value;
          break;
        case '地址':
          body['address'] = l.value;
          break;
        case '邮箱':
          body['mail'] = l.value;
          break;
      }
    }

    this.activeModal.close({data: body, tag: this.billType});
  }


  sbmit() {
    for (const v of this.config.view) {
      if (v.type === 'input') {

        if (!v.value || v.value === '') {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '应用名称不能为空！', 3000);
          this.toastService.toast(toastCfg);
          return;
        }


        const c = /^[\u4E00-\u9FA50-9A-Za-z_()]{1,12}$/;
        const test = SMXNAME.REG.test(v.value);
        if (!test) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
          this.toastService.toast(toastCfg);
          return;
        }

      }


      if (v.type === 'select' && (!v.value || v.value === -1)) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '应用类型不能为空！', 3000);
        this.toastService.toast(toastCfg);
        return;
      }
    }


    this.activeModal.close(this.config.view);
  }

  submitOrder() {
    const data = {
      product_id: this.product_id,
      product_options_id: this.product_option_id,
      quantity: 1,
    };
    this.activeModal.close(data);
  }

  checkApp(e: any, v: any, m: any) {
    v.checked = e.target.checked;
    for (const app of m.items[this.selectApp]) {
      if (app.checked) {
        return;
      }
    }
    v.checked = true;
    e.target.checked = true;
    const toastCfg = new ToastConfig(ToastType.WARNING, '', '不能全部为空！', 3000);
    this.toastService.toast(toastCfg);

  }

}
