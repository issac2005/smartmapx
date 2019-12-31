import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../s-service/http.service';
import {SmxModal} from '../smx-component/smx-modal/smx-modal.module';
import {LoginModalComponent} from '../c-main/modal/login-modal.component';
import {AppModalComponent} from '../modal/app-modal.component';
import {UserModalComponent} from './modal/user-modal.component';
import {STableComponent} from './s-table/s-table.component';
import {ActivatedRoute, Router} from '@angular/router';
import {AppService} from '../s-service/app.service';
import {Location} from '@angular/common';
import {DataStorage, LocalStorage} from '../s-service/local.storage';
import {deepCopy, getQueryString} from '../smx-component/smx-util';
import * as jwt_decode from '@smx/smartmapx-jwt-decode';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})


export class UserComponent implements OnInit {
  @ViewChild('stable', {static: false}) stable: STableComponent;
  @ViewChild(UserModalComponent, {static: false}) UserKyeType: UserModalComponent;
  platformType: any;
  info: any;

  titleInfo: any;
  leftChecked = 1; // 主体类型


  applications: any[]; // 应用管理
  userInfo: any;


  datas: any[];
  cols: any[];
  config: any;
  data_type = [];

  orderFilter: any;
  statusFilter = -1;
  payFilter = -1;
  billFilter = -1;
  statusOptions: any;
  payOptions: any;
  billOptions: any;


  productList: any[]; // 产品清单
  freeProduct = 'c4985149-6e9a-4f3b-8c8f-f35fc05dbbef';

  subDay = 0;

  appConfig = {
    title: '新建应用',
    view: [
      {
        type: 'input',
        title: '应用名称',
        value: '',
        placeholder: '请输入应用名称'
      }, {
        type: 'select',
        title: '应用类型',
        value: -1,
        options: [{name: '服务端', value: '1'}, {name: '浏览器', value: '2'},
          {name: 'Android', value: '3'}, {name: 'IOS', value: '4'}, {name: '微信小程序', value: '5'}],
        items: {
          '1': [{name: '查询方案', value: 256, checked: true}, {name: '本地搜索', value: 512, checked: true}, {
            name: '路径规划', value: 1024, checked: true
          }
            , {name: '地址匹配', value: 2048, checked: true}, {name: '逆地理编码', value: 4096, checked: true}],
          '2': [{name: 'JavaScript API', value: 16, checked: true}
            , {name: '小程序', value: 32, checked: true}, {name: '智能硬件定位', value: 64, checked: true}],
          '3': [{name: 'Android', value: 2, checked: true}],
          '4': [{name: 'IOS', value: 4, checked: true}],
          '5': [{name: '微信小程序', value: 1, checked: true}]
        }
      }]
  };
  selectKey_value = [
    {name: '查询方案', value: 256}, {name: '本地搜索', value: 512}, {name: '路径规划', value: 1024}, {name: '地址匹配', value: 2048},
    {name: '逆地理编码', value: 4096}, {name: 'JavaScript API', value: 16}, {name: '小程序', value: 32},
    {name: '智能硬件定位', value: 64}, {name: 'Android', value: 2}, {name: 'IOS', value: 4}, {name: '微信小程序', value: 1}
  ];

  constructor(public location: Location,
              private toastService: ToastService,
              public httpService: HttpService,
              public appService: AppService,
              private modalService: SmxModal,
              public router: Router,
              public activatedRoute: ActivatedRoute,
              private ls: LocalStorage,
              private ds: DataStorage) {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      const type = queryParams.type;
      if (type === 'order') {
        this.leftChecked = 4;
      }
    });
  }

  ngOnInit() {
    // 验证是否url登录
    // const parmas = this.getQueryString();
    const url = this.location.path();
    const parmas = getQueryString(url);
    if ((parmas as any).user) {
      if (!(parmas as any).status || (parmas as any).status === 'false') { // 绑定成功
        // 绑定失败
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '绑定失败,请检查此微信是否已经绑定其它账户!', 3000);
        this.toastService.toast(toastCfg);
        this.router.navigate(['/app/user']);
      }
    }


    // this.info = this.appService.properties;
    this.info = this.ds.get('properties');
    this.platformType = this.info.type;

    if (this.platformType === 'saas') {
      this.titleInfo = [{title: '账号信息', type: 1}, {title: '应用管理', type: 2}, {title: '租用方案', type: 3}, {
        title: '我的订单',
        type: 4
      }];
      this.httpService.getData({}, true, 'execute', 'd798e5ac-77c0-421a-80be-de96ebdfc327', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              return;
            }
            this.productList = (data as any).data;
            for (const v of this.productList) {
              if (v.product_options && typeof v.product_options === 'string') {
                v.product_options = JSON.parse(v.product_options);
              }
            }
            this.initInfo();
            this.initApplication();
            this.initOrder();
          },
          error => {
            console.log(error);
          }
        );


    } else {
      this.titleInfo = [{title: '账号信息', type: 1}, {title: '应用管理', type: 2}];
      this.initInfo();
      this.initApplication();
    }


  }


  /**
   * 初始化信息
   */
  initInfo() {
    // const jwt = localStorage.getItem('id_token');
    const jwt = this.ls.get('id_token');
    if (jwt) {
      try {
        const decodedJwt = jwt ? jwt_decode(jwt) : false;
        this.userInfo = JSON.parse((decodedJwt as any).data);
        if (this.userInfo.expire_time) {
          const currentTime = Math.round(new Date().getTime() / 1000);
          const subTime = this.userInfo.expire_time - currentTime;
          this.subDay = Math.floor(subTime / (24 * 3600));
        }
      } catch (e) {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '查询信息失败!', 3000);
        this.toastService.toast(toastCfg);
        this.router.navigate(['/app/home']);
      }

    }
  }

  /**
   * 初始化应用管理
   */
  initApplication() {
    // todo 查询应用
    // a14b8933-37b2-4fa5-881f-437abb79fe94
    this.httpService.getData({}, true, 'execute', 'a14b8933-37b2-4fa5-881f-437abb79fe94', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }
          this.applications = (data as any).data.root;
          // wb 用户中心中应用管理生成的key 在类型后面增加key所应用的类型 回显
          for (const k of this.applications) {
            let selectValue = '  (';
            for (const v of this.selectKey_value) {
              if ((v.value & k.type) !== 0) {
                selectValue = selectValue + v.name + ',';
              }
            }
            selectValue = selectValue + ')';
            selectValue = selectValue.substring(0, selectValue.indexOf(')') - 1);
            selectValue = selectValue + ')';
            this.data_type.push(selectValue);
          }
          // wb
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '查询应用信息失败!', 3000);
          this.toastService.toast(toastCfg);
          console.log(error);
        }
      );
  }

  /**
   * 初始化订单
   */
  initOrder() {
    // 07eca040-9987-4151-9e19-460b5a6d814f 查询
    this.config = {TClass: 'table-bordered table-hover', HClass: 'thead-dark', Halign: 'center', align: 'center'};
    this.httpService.getData({}, true, 'execute', '07eca040-9987-4151-9e19-460b5a6d814f', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }

          this.cols = [
            {field: 'order_no', header: '订单号'},
            {field: 'product_id', header: '方案类型', type: 'custom_pipe'},
            {field: 'product_options_id', header: '购买时长', type: 'custom_pipe'},
            {field: 'total_price', header: '金额(元)'},
            {field: 'create_time', header: '下单时间', type: 'time'},
            {field: 'status', header: '支付状态', type: 'pipe', pipe: {1: '待支付', 30: '已支付', 100: '已取消', 20: '已上传凭证'}},
            {field: 'trade_type', header: '支付方式', type: 'pipe', pipe: {1: '微信', 2: '支付宝', 3: '线下', d: '未支付'}},
            {field: 'invoice_status', header: '开票状态', type: 'pipe', pipe: {1: '已申请', 100: '已开票', 0: '未申请'}},
            {field: 'btn', header: '操作', type: 'button'}
          ];


          // 过滤选择
          this.statusOptions = [{title: '请选择...', value: -1}, {title: '待支付', value: 1}, {title: '已支付', value: 30}, {
            title: '已取消',
            value: 100
          }, {title: '已上传凭证', value: 20}];
          this.payOptions = [{title: '请选择...', value: -1}, {title: '微信', value: 1}, {
            title: '支付宝',
            value: 2
          }, {title: '线下', value: 3}];
          this.billOptions = [{title: '请选择...', value: -1}, {title: '已开票', value: 100}, {
            title: '已申请',
            value: 1
          }, {title: '未申请', value: 0}];


          // 数据
          this.datas = (data as any).data.root;
          // todo update
          for (const v of (data as any).data.root) {
            v.btn = [];
            if (v.products && typeof v.products === 'string') {
              v.product_id = JSON.parse(v.products)[0].product_id;
              v.product_options_id = JSON.parse(v.products)[0].product_options_id;
            }

            if (v.status === 1) {
              v.btn.push({
                  title: '去支付',
                  index: 'pay',
                  theme: {width: 'calc(50% - 10px)', bgColor: 'red', bgColorH: '#000'}
                },
                {title: '取消订单', index: 'cancel', theme: {width: 'calc(50% - 10px)', bgColor: 'unset', color: '#000'}});
            } else if (v.status === 30 || v.status === 20) {
              v.btn.push({title: '查看订单详情', index: 'watch'});
            }
          }

        },
        error => {
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '查询应用信息失败!', 3000);
          this.toastService.toast(toastCfg);
          console.log(error);
        }
      );
  }


  /**
   * 切换分类
   * @param tag
   */
  switchData(type: any) {
    if (type) {
      if (type === this.leftChecked) {
        return;
      }

      this.leftChecked = type;
    }
  }


  /**
   * 修改昵称
   */
  updateUserName() {
    const modalRef = this.modalService.open(LoginModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-login'});
    modalRef.componentInstance.type = 'ChangeUserName';
    modalRef.result.then((result) => {
      this.userInfo.user_name = result;
      // window.location.reload();
    }, (reason) => {

    });
  }

  /**
   * 修改密码
   */
  changePs() {
    const modalRef = this.modalService.open(LoginModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-login'});
    modalRef.componentInstance.type = 'ChangePs';
    modalRef.result.then((result) => {
      this.router.navigate(['/index']);
      this.appService.loginedFlagEventEmitter.emit('loginout'); // 退出登录
    }, (reason) => {

    });
  }

  /**
   * 解绑微信
   */

  unbindWechat() {
    const modalRef = this.modalService.open(AppModalComponent, {size: 'lg', centered: true, backdrop: 'static', enterKeyId: 'smx-app'});
    modalRef.componentInstance.config = {
      title: '解除绑定',
      view: '是否解除当前微信绑定状态?'
    };
    modalRef.result.then((result) => {
      this.httpService.getData({}, true, 'execute', '698be75a-4a84-4937-b349-dd1210eeaafc', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              return;
            }

            this.userInfo.source_id = '';

            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '微信解绑成功!', 3000);
            this.toastService.toast(toastCfg);
          },
          error => {
            console.log(error);
          }
        );
    }, (reason) => {
    });


  }

  /**
   * 绑定微信
   */
  bindWechat() {
    const modalRef = this.modalService.open(LoginModalComponent, {size: 'lg', backdrop: 'static', enterKeyId: 'smx-login'});
    modalRef.componentInstance.type = 'wechatBind';

  }


  copySuccess() {
    const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '复制成功！', 3000);
    this.toastService.toast(toastCfg);
  }


  /**
   * 删除应用
   */
  removeApplication(i: any) {
    const modalRef = this.modalService.open(AppModalComponent, {size: 'lg', centered: true, backdrop: 'static', enterKeyId: 'smx-app'});
    modalRef.componentInstance.config = {
      title: '删除应用',
      view: '您确定要删除此应用?'
    };
    modalRef.result.then(() => {


      // ba0f5fc6-53c0-411f-b187-1da54bde2d23
      this.httpService.getData({application_id: this.applications[i].application_id},
        true, 'execute', 'ba0f5fc6-53c0-411f-b187-1da54bde2d23', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              return;
            }
            this.applications.splice(i, 1);
            this.data_type.splice(i, 1);
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 3000);
            this.toastService.toast(toastCfg);
          },
          error => {
            console.log(error);
          }
        );
    }, (reason) => {
    });


  }

  /**
   * 添加应用
   */
  addApplication() {
    const modalRef = this.modalService.open(UserModalComponent, {size: 'lg', backdrop: 'static', enterKeyId: 'smx-user'});
    modalRef.componentInstance.type = 32;
    modalRef.componentInstance.config = deepCopy(this.appConfig);
    modalRef.result.then((result) => {
      const body = {};
      console.log(result);
      for (const v of result) {
        if (v.title === '应用名称') {
          body['name'] = v.value;
        }

        if (v.title === '应用类型') {
          let num;
          for (const app of v.items[v.value]) {
            if (app.checked) {
              if (num) {
                num = num | app.value;
              } else {
                num = app.value;
              }
            }
          }
          body['type'] = num;
        }
      }
      // e106e434-0796-4f4e-a719-51cea01ed804
      this.httpService.getData(body, true, 'execute', 'e106e434-0796-4f4e-a719-51cea01ed804', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              return;
            }

            this.applications.push((data as any).data.root[0]);
            //  wb 用户中心中应用管理生成的key 在类型后面增加key所应用的类型
            let selectItems_value = '  (';
            const data_root_type = (data as any).data.root[0].type;
            const data_root_name = (data as any).data.root[0].name;
            for (const val of this.selectKey_value) {
              if ((val.value & data_root_type) !== 0) {
                selectItems_value = selectItems_value + val.name + ',';
              }
            }
            selectItems_value = selectItems_value + ')';
            selectItems_value = selectItems_value.substring(0, selectItems_value.indexOf(')') - 1);
            selectItems_value = selectItems_value + ')';
            this.data_type.push(selectItems_value);
            // wb
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '添加成功!', 3000);
            this.toastService.toast(toastCfg);
          },
          error => {
            console.log(error);
          }
        );
    }, (reason) => {
    });
  }


  /**
   * 续期
   */
  renewal(t: any, e?: any) {

    // 升级服务
    if (t === 1) {
      this.createOrder(t);
    } else if (t === 2) { // 续期
      if (this.userInfo.product_id === this.freeProduct) {
        this.httpService.getData({}, true, 'execute', '61ea6fb8-0a62-4fdb-b7f8-7cc16992cf57', '1')
          .subscribe(
            data => {
              if ((data as any).status < 0) {
                return;
              }
              this.subDay = 90;
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '基础版续期成功!', 3000);
              this.toastService.toast(toastCfg);
            },
            error => {
              console.log(error);
            }
          );
      } else {
        this.createOrder(t);
      }
    }

  }


  /**
   * 生成订单
   */
  createOrder(t: any) {
    const modalRef = this.modalService.open(UserModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-user'});
    modalRef.componentInstance.type = 31;
    modalRef.componentInstance.config = {title: t === 1 ? '方案升级' : '方案续期'};
    modalRef.componentInstance.modalData = {
      type: t,
      productList: this.productList,
      userInfo: this.userInfo
    };
    modalRef.result.then((result) => {
      // "product_id":"10001","product_options_id":"f829de85-d277-4302-9772-5402e1e32be7","quantity":6
      this.httpService.getData({productList: [result]}, true, 'execute', 'd143b8e2-63d4-4f7c-8ade-ca266e6f5b57', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              return;
            }
            const info = (data as any).data[0];
            this.jumpOrder(info);
          },
          error => {
            console.log(error);
          }
        );

    }, (reason) => {

    });
  }


  /**
   * 跳转支付页面
   */
  jumpOrder(info: any) {
    if (info.products && typeof info.products === 'string') {
      info.products = JSON.parse(info.products);
    }


    // todo update
    const orderInfo = [{title: '订单号:', value: info.order_no},
      {title: '下单时间:', value: info.create_time, type: 'time'},
      {title: '方案类型:', value: info.products[0].product_id, type: 'custom_pipe'},
      {title: '服务期限:', value: info.products[0].product_options_id, type: 'custom_pipe'},
      {title: '应付金额:', value: info.total_price, type: 'price'}
    ];
    localStorage.setItem(info.order_id, JSON.stringify(orderInfo));
    this.router.navigate(['/app/order'], {queryParams: {order: info.order_id}});
  }

  /**
   * 过滤
   */
  setfilter() {
    const filter = ([] as any);
    this.statusFilter = Number(this.statusFilter);
    this.payFilter = Number(this.payFilter);
    this.billFilter = Number(this.billFilter);

    if (this.orderFilter) {
      filter.push({h: 'order_no', v: this.orderFilter});
    }

    if (this.statusFilter !== -1) {
      filter.push({h: 'status', v: this.statusFilter});
    }

    if (this.payFilter !== -1) {
      filter.push({h: 'trade_type', v: this.payFilter});
    }

    if (this.billFilter !== -1) {
      filter.push({h: 'invoice_status', v: this.billFilter});
    }

    this.stable.filter(filter, 'and');
  }

  /**
   * 点击事件
   */
  btnClick(e: any) {
    if (e.index === 'watch') { // 查看
      const view = ([] as any);
      for (const v of this.cols) {
        if (v.type && v.type === 'button') {
          continue;
        }

        const item = ({} as any);
        item.title = v.header;
        item.value = v.pipe ? v.pipe[e.data[v.field]] : e.data[v.field];


        if (v.field === 'product_id') {
          item.type = 'pipe';
          item.pipe = 'order';
        }


        if (v.field === 'product_options_id') {
          item.type = 'pipe';
          item.pipe = 'orderType';
        }


        if (v.field === 'create_time') {
          item.type = 'time';
        }

        if (v.field === 'status' && e.data[v.field] === 20) {
          item.type = 'button';
          item.button = ['查看支付凭证', '1'];
        }


        if (v.field === 'invoice_status' && !e.data[v.field]) {
          item.type = 'button';
          item.button = ['申请开具发票', '2'];
        }

        if (v.field === 'invoice_status' && e.data[v.field]) {
          item.type = 'button';
          item.button = ['查看开票信息', '3'];
        }

        view.push(item);
      }

      // view.push({title: '用户名', value: this.userInfo.user_name});

      const modalRef = this.modalService.open(UserModalComponent, {
        centered: true, backdrop: 'static', enterKeyId: 'smx-user'
      });
      modalRef.componentInstance.type = 35;
      modalRef.componentInstance.config = {title: '订单详情', view: view};
      // modalRef.componentInstance.outEvent.subscribe((data) => {
      //   this.invoiceEvent(data, e.data);
      // });
      modalRef.result.then((result) => {
        this.invoiceEvent(result, e.data);
      }, (reason) => {
      });
    }

    // 去支付
    if (e.index === 'pay') {
      const info = e.data;
      this.jumpOrder(info);
    }

    if (e.index === 'cancel') { // 取消订单
      const modalRef = this.modalService.open(AppModalComponent, {size: 'lg', centered: true, backdrop: 'static', enterKeyId: 'smx-app'});
      modalRef.componentInstance.config = {title: '取消订单', view: '您确定要取消此订单?'};
      modalRef.result.then((result) => {

        this.httpService.getData({order_id: e.data.order_id}, true, 'execute', '7aa57848-0768-4ffe-853c-fb6a24332d0e', '1')
          .subscribe(
            data => {
              if ((data as any).status < 0) {
                return;
              }
              e.data.status = 100;
              e.data.btn = [];

              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '订单取消成功!', 3000);
              this.toastService.toast(toastCfg);
            },
            error => {
              console.log(error);
            }
          );

      });
    }
  }


  /**
   * 订单详情相关处理
   * @param data
   * @param order
   */
  invoiceEvent(data: any, order?: any) {


    // 查看凭证
    if (data === '1') {
      this.httpService.getData({order_id: order.order_id}, true, 'execute', '7c8e1696-3241-4bc6-80c0-df5c8eca7bb6', '1')
        .subscribe(
          res => {
            if ((res as any).status < 0) {
              return;
            }
            const modal = this.modalService.open(UserModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-user'});
            modal.componentInstance.type = 33;
            modal.componentInstance.config = {title: '查看支付凭证'};
            modal.componentInstance.modalData = '/uploadfile/' + (res as any).data.img_path;
          },
          error => {
            console.log(error);
          }
        );

    }

    // 开具发票
    if (data === '2') {
      const modal = this.modalService.open(UserModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-user'});
      modal.componentInstance.type = 34;
      modal.componentInstance.config = {
        title: '发票申请',
        view: {
          user_type: 1,
          type: 1,
          invoiceInfo: [
            {title: '发票抬头', value: '', noNull: true},
            {title: '税号', value: '', noNull: true}],
          expressInfo: [
            {title: '收票人姓名', value: '', noNull: true},
            {title: '电话', value: '', noNull: true},
            {title: '地址', value: '', noNull: true},
            {title: '邮箱', value: ''}]
        }

      };
      modal.result.then((result) => {

        if (result && (result as any).tag) {
          const url = (result as any).tag === 2 ? '4133d840-0b26-4e2e-8913-b2a3a046ab5e' : '0838a9b1-794c-4a72-b373-eadff31655ce';
          result.data.order_id = order.order_id;
          this.httpService.getData(result.data, true, 'execute', url, '1')
            .subscribe(
              res => {
                if ((res as any).status < 0) {
                  return;
                }

                order.invoice_status = 1;
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '发票申请成功!', 3000);
                this.toastService.toast(toastCfg);
              },
              error => {
                console.log(error);
              }
            );
        }


      }, (reason) => {
      });
    }


    // 查看发票
    if (data === '3') {
      this.httpService.getData({order_id: order.order_id}, true, 'execute', '784f2825-92a8-4609-bc98-42ccbf2e1855', '1')
        .subscribe(
          res => {
            if ((res as any).status < 0) {
              return;
            }

            if ((res as any).data.root[0]) {
              const invoices = (res as any).data.root[0];
              const view = ([] as any);


              if (invoices['title']) {
                view.push({title: '发票抬头', value: invoices['title']});
              }
              if (invoices['tax_id_no']) {
                view.push({title: '税号', value: invoices['tax_id_no']});
              }


              if (invoices['b_address']) {
                view.push({title: '企业地址', value: invoices['b_address']});
              }

              if (invoices['phone']) {
                view.push({title: '企业电话', value: invoices['phone']});
              }
              if (invoices['deposit_bank']) {
                view.push({title: '开户银行', value: invoices['deposit_bank']});
              }
              if (invoices['account_no']) {
                view.push({title: '银行卡号', value: invoices['account_no']});
              }
              if (invoices['name']) {
                view.push({title: '收件人姓名', value: invoices['name']});
              }
              if (invoices['phoneNo']) {
                view.push({title: '收件电话', value: invoices['phoneNo']});
              }
              if (invoices['address']) {
                view.push({title: '收件地址', value: invoices['address']});
              }
              if (invoices['mail']) {
                view.push({title: '收件邮箱', value: invoices['mail']});
              }

              const modal = this.modalService.open(UserModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-user'});
              modal.componentInstance.type = 35;
              modal.componentInstance.config = {
                title: '发票信息',
                view: view
              };
            } else {
              const toastCfg = new ToastConfig(ToastType.WARNING, '', '发票信息不存在!', 3000);
              this.toastService.toast(toastCfg);
            }


          },
          error => {
            console.log(error);
          }
        );


    }
  }


  // 获取url参数
  // getQueryString() {
  //
  //   const url = this.location.path(); // 获取url中"?"符后的字串
  //   const theRequest = new Object();
  //   if (url.indexOf('?') !== -1) {
  //     const str = url.substr(1);
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
}
