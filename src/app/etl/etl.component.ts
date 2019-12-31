import {Component, OnInit} from '@angular/core';
import {HttpService} from '../s-service/http.service';
import {SmxModal} from '../smx-component/smx-modal/smx-modal.module';
import {EtlModalComponent} from './modal/etl-modal.component';
import {ActivatedRoute} from '@angular/router';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';

@Component({
  selector: 'app-data-grid',
  templateUrl: './etl.component.html',
  styleUrls: ['./etl.component.scss']
})

/*
* ETL组件
* */
export class EtlComponent implements OnInit {
  pageType: number; // 当前页面显示类型

  /*
  * ETL部分
  * */
  showDetail = 0;
  tastFlow = 0;

  inputData: any;
  inputName: any;
  code: any;
  outputData: any;

  outPutResult: any;
  uploadClass: any;

  // 日志信息
  logs: any[] = [];
  showLog = false;


  test1 = '';

  constructor(private activatedRoute: ActivatedRoute, private httpService: HttpService,
              private smxModalService: SmxModal, private toastService: ToastService) {
  }


  test2() {
    console.log(this.test1);
  }

  /*
   * 初始化
   * */
  ngOnInit() {

    this.tastFlow = 0;
    this.pageType = 1;
    this.outPutResult = {
      stepMeasure: []
    };

    // 进入时判断是否token过期
    this.httpService.getData({}, true, 'etl', 'getRepository ', '1')
      .subscribe(
        data => {
        },
        error => {
        }
      );
  }


  /*
  * 打开数据
  * */
  openSource() {
    if (this.tastFlow === 2) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '转换中,请稍后再试!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    const ngbModal = this.smxModalService.open(EtlModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-eltModal'});
    ngbModal.componentInstance.type = 2;
    ngbModal.componentInstance.config = {title: '添加数据'};
    ngbModal.result.then(
      (result) => {
        if (result !== 0 || result !== 1 || result !== 'cancel') {
          this.showLog = false;
          this.inputData = result.data;
          this.code = result.code;
          this.uploadClass = result.class;
          this.tastFlow = 1;
          this.inputName = result.name;
          // 打开输出
          this.openOutput();
        }

      },
      (reason) => {
      });
  }

  /*
  * 打开输出数据库
  * */
  openOutput() {
    if (this.tastFlow === 0) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请先选择数据!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    if (this.tastFlow === 2) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '转换中,请稍后再试!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    if (this.tastFlow === 3) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '数据已经输出完成!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    const outModal = this.smxModalService.open(EtlModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-eltModal'});
    outModal.componentInstance.type = 1;
    outModal.componentInstance.config = {title: '输出数据设置'};
    outModal.componentInstance.mData = {
      inputData: this.inputData,
      code: this.code,
      uploadClass: this.uploadClass,
      name: this.inputName
    };
    outModal.result.then(
      (result) => {
        if (result === 'shp') {
          this.tastFlow = 0;
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '任务已提交，请稍后查看!', 2000);
          this.toastService.toast(toastCfg);
          return;
        }
        if (result !== 0 || result !== 1 || result !== 'cancel') {
          this.outputData = result;
          this.tastFlow = 2;
          this.getResult();
        }
      },
      (reason) => {
      });
  }

  /*
  * 开始转换
  * */
  go_run() {
    if (this.tastFlow === 0) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请先选择数据!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    if (this.tastFlow === 1) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择输出数据源!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    if (this.tastFlow === 2) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '转换中,请稍后再试...', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    if (this.tastFlow === 3) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '转换完成,您可以继续操作或者退出!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
  }

  /*
  * 转换之后，轮询结果
  * */
  getResult() {
    this.showLog = true;
    this.logs = [];
    this.logs.push('转换开始');
    this.priResult();
  }


  priResult() {
    this.httpService.getData({execution_id: this.outputData}, true, 'etl', 'result', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            if ((data as any).status === -260) {
              const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 5000);
              this.toastService.toast(toastCf);
              return;
            } else {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toastCfg);
              return;
            }
          }

          this.outPutResult = (data as any).data;
          const log = this.outPutResult.log.replace('\\\\n', '<br>');
          this.logs.push(log);

          if (!(data as any).data.finished) {
            setTimeout(() => {
              this.priResult();
            }, 500);
          } else {
            this.logs.push('转换完成');
            this.tastFlow = 3;
          }

        },
        error => {
        }
      );
  }
}
