import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {HttpService} from '../../../s-service/http.service';
import {SmxModal} from '../../../smx-component/smx-modal/smx-modal.module';
import {LocalStorage} from '../../../s-service/local.storage';
import {AppService} from '../../../s-service/app.service';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';

@Component({
  selector: 'app-source-panel',
  templateUrl: './source-panel.component.html',
  styleUrls: ['./source-panel.component.scss']
})

export class SourcePanelComponent implements OnInit, OnDestroy{

  @Input() index: any;
  @Input() dataInfo: any;

  fileData: any;
  oindex: any;
  appsInfo: any;
  fileValue: any;
  uploader: any;
  bianmaModel: any;
  inputFile: any;
  resouceChange: any;
  newFile = ([] as any);
  filename: any;
  isEdit = false;
  version: any;
  resoruceStatus = 'default';
  saveUpload = false;
  itemIndex: any;
  showFileName: any;

  constructor(private toastService: ToastService,
              private httpService: HttpService,
              private appService: AppService,
              private modalService: SmxModal,
              private ls: LocalStorage) {
    this.resouceChange = this.appService.onResourceChangeEventEmitter.subscribe((data) => {
      this.fileData = data.data;
      this.version = data.version;
    });
  }

  ngOnInit() {
    this.appsInfo = this.ls.getObject('appsInfo');

    if (this.appsInfo) {
      this.isEdit = !this.appsInfo.visit_type;
    }

    this.bianmaModel = 'UTF-8';
    // 加载数据库中已上传的文件资源
    this.fileResearch();
  }

  ngOnDestroy() {
    this.resouceChange.unsubscribe();
  }

  // 选中数据
  onCheck(data: any, index: any) {
    this.itemIndex = index;
    this.filename = data.name;
  }


  // 删除选中数据
  fileDelete(close: any) {
    const deleteData = {
      mini_program_id: this.appsInfo.mini_program_id,
      fileName: this.filename,
      version: 'current'
    };
    this.httpService.getData(deleteData, true, 'file', 'fileDelete', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.fileData.map( (res: any, ind: any) => {
              if (res.name === this.filename) {
                this.fileData.splice(ind, 1);
                this.filename = undefined;
                this.itemIndex = undefined;
              }
            });

            this.resoruceStatus = 'changed';
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功！', 2000);
            this.toastService.toast(toastCfg);
            close();
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        }
      );
  }


  // 上传-打开上传弹窗
  open(content: any, flag: any) {
    if (flag === 'delete') {
      if (this.filename) {
        this.modalService.open(content).result.then((result) => {
        }, (reason) => {
        });
      } else {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择要删除的文件', 2000);
        this.toastService.toast(toastCfg);
      }
    }
    if (flag === 'upload') {
      this.modalService.open(content).result.then((result) => {
      }, (reason) => {
      });
    }
  }

  // 上传
  upload() {
    this.httpService.makeFileRequest('upload/1.1.0/file/fileSearch',
      {
        charset: this.bianmaModel,
        mini_program_id: this.appsInfo.mini_program_id,
        resources: 'resources',
        version: 'current'
      }, this.inputFile)
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.newFile = data.data;
            if (this.newFile.length === this.fileData.length) {
              const toastCfg = new ToastConfig(ToastType.WARNING, '', '文件已经上传过了', 2000);
              this.toastService.toast(toastCfg);
              return;
            } else {
              this.saveUpload = true;
              this.resoruceStatus = 'changed';
            }
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        }
      );
  }


  // 上传-确定按钮
  upploadSave(close: any) {
    this.fileData = this.newFile;
    this.saveUpload = false;
    this.showFileName = null;
      close();
    const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '上传成功！', 2000);
    this.toastService.toast(toastCfg);
  }

  // 取消上传
  cancelUpload(close: any) {
    this.saveUpload = false;
    this.showFileName = null;
    close();
    if (this.fileData.length !== this.newFile.length && this.newFile > 0) {
      const deleteData = {
        mini_program_id: this.appsInfo.mini_program_id,
        fileName: this.newFile[this.newFile.length - 1].name,
        version: 'current'
      };
      this.httpService.getData(deleteData, true, 'file', 'fileDelete', '')
        .subscribe(
          (data: any) => {
            if (data.status > 0) {
              close();
            } else {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
              this.toastService.toast(toastCfg);
            }
          },
          error => {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '取消请求发送失败，请检查网络', 2000);
            this.toastService.toast(toastCfg);
          }
        );
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
      this.upload();
    }
  }

  // 下载
  download() {
    if (this.filename) {
      const self = this;
      this.httpService.open('/downloadfile/miniprogram/' + this.appsInfo.user_id + '/' + self.appsInfo.mini_program_id + '/current/resources/' + this.filename);
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择要下载的文件', 2000);
      this.toastService.toast(toastCfg);
    }
  }

  // 资源-请求服务器

  fileResearch() {
    const postData = {
      mini_program_id: this.appsInfo.mini_program_id
    };
    this.httpService.getData(postData, true, 'file', 'fileSearch', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.fileData = data.data;
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


}
