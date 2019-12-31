import {Component, Input, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import {SmxActiveModal} from '../../smx-component/smx-modal/smx-modal.module';
import {HttpService} from '../../s-service/http.service';
import {AppService} from '../../s-service/app.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
@Component({
  selector: 'app-mini-program-modal',
  templateUrl: './mini-program-modal.component.html',
  styleUrls: ['./mini-program-modal.component.scss']
})
export class MiniProgramModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() type: any; // 操作类型
  @Input() keyConfig: any;  // 配置文件
  @Input() modalData: any;  // 数据
  @Input() date1 = '';
  @Input() dataInfo: any;

  value = '';
  promptBoolean = false;
  inputValue = true;
  item: any;
  index: any;
  editIndex: any;
  textareaValue: any;
  confirmType: any;
  versionNo: any;
  versionList = [];
  getVersionList: any;

  constructor(
    public activeModal: SmxActiveModal,
    private toastService: ToastService,
    private httpService: HttpService,
    private appService: AppService
  ) {

   this.getVersionList = this.appService.onGetVersionEmitter.subscribe(
      (data: any) => {
        data.forEach((item: any, index: any) => {
          if (item.type === 1) {
            const obj = {};
            obj['label'] = item.version;
            obj['value'] = item.version;
            this.versionList.push(obj);
          }
        });
      }
    );
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.getVersionList.unsubscribe();
  }

  // 版本删除
  deleteVersion (item: any, index: any) {
    this.confirmType = 'version-delete';
    this.promptBoolean = true;
    this.item = item;
    this.index = index;
  }

  // 版本删除确认弹框 -- 取消
  ButtonDisDelete () {
    this.promptBoolean = false;
  }

  // 版本删除确认弹框 -- 确认
  ButtonSuerDelete () {
    this.promptBoolean = false;

    const postData = {
      mini_program_history_id: this.item.mini_program_history_id,
      version: this.item.version // 版本号
    }

    this.httpService.getData(postData, true, 'execute', '33671f1f-a861-47a9-9782-a87771495f0a', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            // 从数组中删除该条信息
            this.modalData.splice(this.index, 1);
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功！', 2000);
            this.toastService.toast(toastCfg);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });
  }

  // 设为推荐
  setRecomd(item: any, index: any) {
    const postData = {
      mini_program_id: this.keyConfig.mini_program_id, // 小程序id 字段待确认
      version: item.version
    };
    this.httpService.getData( postData , true, 'execute', '43a2bbc6-0947-4071-999d-2f82597e1f4c', '')
      .subscribe(
        (data: any) => {
          if ((data as any).status > 0) {
            this.modalData.forEach((versionItem: any, oind: any) => {
              // 将选中的版本信息置为推荐状态
              if (index === oind) {
                versionItem.recommend = true;
                this.appService.onSetRecdEventEmitter.emit(versionItem.version);
              } else {
                // 将原来数据中的推荐置为发布状态
                if (versionItem.type) {
                  versionItem.recommend = false;
                }
              }
            });
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功！', 2000);
            this.toastService.toast(toastCfg);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', (data as any).msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });

  }

  // 编辑
  edit(v: any, index: any) {
    this.item = v;
    this.editIndex = index;
    // js和json都已修改未保存弹框提示
    if (this.keyConfig.jsNotChanged !== 'default' || this.keyConfig.jsonNotChanged !== 'default') {
      this.confirmType = 'before-edit';
      this.promptBoolean = true;
      return;
    }
    // 点击编辑时获取该版本下的app.js app.json 资源文件回显在当前的编辑器中
    // 需要考虑切换版本后的文件保存、运行、提交代码、发布所用到的参数改变
    this.modalData.forEach((item: any, oind: any) => {
      if (index === oind) {
        item.current = true;
      } else {
        if (item.current) {
          item.current = false;
        }
      }
    });

    this.editConfirm();
  }

  // 编辑-代码丢失提示--确认功能
  editConfirm() {
    this.modalData.forEach((item: any, oind: any) => {
      if (this.editIndex === oind) {
        item.current = true;
      } else {
        if (item.current) {
          item.current = false;
        }
      }
    });

    this.promptBoolean = false;
    // 代码丢失提示弹框出现，用户点击确认后，不再给弹框提示
    this.keyConfig.jsNotChanged = 'default';
    this.keyConfig.jsonNotChanged = 'default';
    this.appService.onEditEventEmitter.emit(this.item);
    // 发起后台切换版本请求
    const postData = {
      mini_program_id: this.keyConfig.mini_program_id,
      version: this.item.version
    };
    this.httpService.getData(postData, true, 'execute', '628bd398-1d97-4eaf-ba2b-129bac635810', '', '').subscribe(
      (data: any) => {
        if (data.status > 0) {
          this.getAppjs(this.item.version);
          this.getAppjson(this.item.version);
          this.getResources(this.item.version);
        } else {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
          this.toastService.toast(toastCfg);
        }
      },
      error => {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
        this.toastService.toast(toastCfg);
      }
    );
  }

  // 编辑-获取app.js
  getAppjs(version: any) {
    const postData = {
      mini_program_id: this.keyConfig.mini_program_id,
      version: version
    };
    this.httpService.getData(postData, true, 'app', 'JSshow', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.appService.onJsChangeEventEmitter.emit(data.data);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });
  }

  // 编辑-获取app.json
  getAppjson(version: any) {
    const postData = {
      mini_program_id: this.keyConfig.mini_program_id,
      version: version
    };
    this.httpService.getData(postData, true, 'app', 'JSONshow', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.appService.onJsonChangeEventEmitter.emit(data.data);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });
  }

  // 编辑-获取资源文件
  getResources(version: any) {
    const postData = {
      mini_program_id: this.keyConfig.mini_program_id,
      version: version
    };
    this.httpService.getData(postData, true, 'file', 'fileSearch', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.appService.onResourceChangeEventEmitter.emit({data: data.data, version: this.item.version});
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });
  }


  // 发布--确认功能
  publishConfirm() {
    const reg = /^[\u4E00-\u9FA50-9A-Za-z_()\.]{1,40}$/;
    if (!this.versionNo) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请输入版本号', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    if (!reg.test(this.versionNo)) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '支持1-40个汉字 数字 字母 _ ()', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    let chooseHistoryVersion = false;
    this.versionList.forEach((item: any) => {
      if (item.value === this.versionNo) {
        chooseHistoryVersion = true;
      }
    });

    if (chooseHistoryVersion) {
      this.confirmType = 'version-choose';
      this.promptBoolean = true;
    } else {
      this.appService.onConfirmPublishEventEmitter.emit({textarea: this.textareaValue, version: this.versionNo, recomd: this.inputValue});
    }
  }

  // 发布--版本覆盖提示确认功能
  versionChooseConfirm() {
    this.appService.onConfirmPublishEventEmitter.emit({textarea: this.textareaValue, version: this.versionNo, recomd: this.inputValue});
  }

  // 提交代码（确定）
  submit() {
    this.appService.onConfirmSubmitEventEmitter.emit({description: this.value });
  }


  // 退出小程序--确认
  quitConfirm() {
    this.activeModal.dismiss('close');
    window.history.go(-1);
  }



}


