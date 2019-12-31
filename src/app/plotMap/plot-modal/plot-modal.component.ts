import { Component, OnInit, Input, Output } from '@angular/core';
import { SmxActiveModal } from '../../smx-component/smx-modal/directive/modal-ref';
import {AppService} from '../../s-service/app.service';
import {HttpService} from '../../s-service/http.service';
import {SmxModal} from '../../smx-component/smx-modal/directive/smx-modal';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {CreateStyleModalComponent} from './create-style-modal/create-style-modal.component';

@Component({
  selector: 'app-plot-modal',
  templateUrl: './plot-modal.component.html',
  styleUrls: ['./plot-modal.component.scss']
})
export class PlotModalComponent implements OnInit {
  @Input() type: any;
  @Input() keyConfig: any;
  @Input() modalData: any;

  styleIndex: any;
  defaultStyle: any;
  editStatus: any;
  dataList: any;
  styleArray = [];
  styleId: any;



  constructor(
    public activeModal: SmxActiveModal,
    public httpService: HttpService,
    public toastService: ToastService,
    public modalService: SmxModal,
    private appService: AppService
  ) {

  }

  ngOnInit() {
    const obj = ({} as any);
    obj['style'] = ({} as any);
    const firstStyle = this.modalData.styleList[0];
    for (const key of Object.keys(firstStyle['style'])) {
      obj['style'][key] = firstStyle['style'][key];
    }
    obj['geo_type'] = firstStyle['geo_type'];

    this.defaultStyle = obj;
    this.styleIndex = 0;
    this.styleId = firstStyle.plot_template_style_id;
    this.createStyleDetail(obj);
    this.dataList = this.modalData.styleList;
  }

  // 编辑样式
  editStyle(item: any, index: any) {
    this.styleId = item.plot_template_style_id;
    this.styleIndex = index;
    this.defaultStyle = {};
    this.defaultStyle['style'] = {};
    this.defaultStyle['geo_type'] = item.geo_type;
    for (const key of Object.keys(item.style)) {
      this.defaultStyle.style[key] = item.style[key];
    }
    this.createStyleDetail(this.defaultStyle);
  }

  // 保存样式
  saveStyle() {
    // if (this.modalData.type === 'create') { // 新增样式
    //   const postData = this.defaultStyle;
    //   this.httpService.getData(postData, true, 'execute', '4d996981-37ba-4e6a-b463-05ce94576cad', '', '').subscribe(
    //     (data: any) => {
    //       if (data.status > 0) {
    //         this.modalData.styleList[0] = data.data.root[0];
    //         this.appService.onSaveStyleEmitter.emit(this.modalData);
    //         const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '新建样式成功!', 2000);
    //         this.toastService.toast(toastCfg);
    //       } else {
    //         const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
    //         this.toastService.toast(toastCfg);
    //       }
    //     },
    //     error => {
    //       const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
    //       this.toastService.toast(toastCfg);
    //     }
    //   );
    // } else { // 修改样式
      const postData = this.defaultStyle;
      postData['plot_template_style_id'] = this.styleId;
      this.httpService.getData(postData, true, 'execute', '5da02e54-3fe7-4eba-8d1a-cacc3939dca1', '', '').subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.appService.onSelectStyleEmitter.emit({
              plot_template_style_id: this.styleId,
              type: false,
              style: postData.style,
              reviseTemplateStyle: true
            });

            this.modalData.styleList[this.styleIndex] = data.data.root[0];
            this.appService.onSaveStyleEmitter.emit(this.modalData);
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改样式成功!', 2000);
            this.toastService.toast(toastCfg);
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
    // }


  }

  // 打开删除弹框
  openDeleteModal(item: any, content: any, index: number) {
    if (this.modalData.styleList.length > 1) {
      this.modalService.open(content).result.then(
        (result) => {
          if (result !== 'Close') {
            const postData = {plot_template_style_id: item.plot_template_style_id};
            this.httpService.getData(postData, true, 'execute', '043d6fe9-ed5f-4de5-b5ca-c8fefe377ab0', '', '').subscribe(
              (data: any) => {
                if (data.status > 0) {
                  this.modalData.styleList.splice(index, 1);
                  this.appService.onSaveStyleEmitter.emit(this.modalData);
                  const obj = {};
                  for (const key of Object.keys(this.modalData.styleList[0])) {
                    obj[key] = this.modalData.styleList[0][key];
                  }
                  this.defaultStyle = obj;
                  this.createStyleDetail(obj);
                  const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 2000);
                  this.toastService.toast(toastCfg);
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
        },
        (reason) => {
        });
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '至少保留一个模板样式，不能全部删除', 2000);
      this.toastService.toast(toastCfg);
    }
  }



  // 取消
  cancel() {
    this.activeModal.dismiss('close');
  }



  // 根据默认样式创建样式左侧具体列表
  createStyleDetail(style: any) {
    let obj;
    this.httpService.getFile('config/plotStyle.json').subscribe(
      (data: any) => {
        data.manageStyles.forEach((item: any) => {
          if (item.type === style.geo_type) {
            item.properties.forEach((styleItem: any) => {
              for (const key in style.style) {
                if (styleItem.name === key) {
                  styleItem.value = style.style[key];
                }
              }
            });
            obj = item.properties;
          }
        });
        this.styleArray = obj;
      }
    );
  }

  createStyle() {
    const modalRef = this.modalService.open(CreateStyleModalComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-createStyePopule'});
    modalRef.componentInstance.keyConfig = {
      title: '新建样式'
    };
    modalRef.componentInstance.type = 'manage-create';
    // modalRef.componentInstance.saveStyle.subscribe(
    //   (data: any) => {
    //     const newStyle = JSON.parse(JSON.stringify(data));
    //     this.createStyleDetail(newStyle);
    //     this.defaultStyle['style'] = newStyle.style;
    //     this.defaultStyle['geo_type'] = newStyle.geo_type;
    //   }
    // );
    modalRef.componentInstance.modalData = {
      styleList: this.modalData.styleList,
      modeType: this.defaultStyle.geo_type
    };
  }

}
