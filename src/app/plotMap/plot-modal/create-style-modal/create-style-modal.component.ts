import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SmxActiveModal } from '../../../smx-component/smx-modal/directive/modal-ref';
import {AppService} from '../../../s-service/app.service';
import {HttpService} from '../../../s-service/http.service';
import {SmxModal} from '../../../smx-component/smx-modal/directive/smx-modal';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';


@Component({
  selector: 'app-create-style-modal',
  templateUrl: './create-style-modal.component.html',
  styleUrls: ['./create-style-modal.component.scss']
})
export class CreateStyleModalComponent implements OnInit {
  @Input() type: any;
  @Input() keyConfig: any;
  @Input() modalData: any;
  @Output() saveStyle = new EventEmitter();

  defaultStyle: any;
  styleArray = [];
  styleIndex: any;

  constructor(
    public activeModal: SmxActiveModal,
    public httpService: HttpService,
    public toastService: ToastService,
    public modalService: SmxModal,
    private appService: AppService
  ) { }

  ngOnInit() {
    this.createStyle();
  }

  // 新建样式
  createStyle() {
    this.styleIndex = 0;
    let style;
    switch (this.modalData.modeType) {
      case 'draw_point':
        style = {
          'geo_type': 'draw_point',
          'style': {
            'name': '新建点样式',
            'circle-color': '#f6b37f',
            'circle-radius': 5,
            'circle-opacity': 1,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#44ade1'
          }
        };
        this.defaultStyle = style;
        break;

      case 'draw_line':
        style = {
          'geo_type': 'draw_line',
          'style': {
            'name': '新建线样式',
            'line-color': '#090',
            'line-width': 1,
            'line-opacity': 1,
            'line-dasharray': 0
          }
        };
        this.defaultStyle = style;
        break;

      case 'draw_words':
        style = {
          'geo_type': 'draw_words',
          'style': {
            'name': '新建文本样式',
            'text-size': 16,
            'text-halo-width': 0,
            'text-color': '#090',
            'text-max-width': 20,
            'text-line-height': 20
          }
        };
        this.defaultStyle = style;
        break;

      case 'draw_box':
        style = {
          'geo_type': 'draw_box',
          'style': {
            'name': '新建矩形样式',
            'fill-color': '#090',
            'fill-outline-color': '#09c',
            'fill-outline-width': 1,
            'fill-pattern': '',
            'fill-opacity': 1
          }
        };
        this.defaultStyle = style;
        break;

      case 'draw_fill':
        style = {
          'geo_type': 'draw_fill',
          'style': {
            'name': '新建多边形样式',
            'fill-color': '#090',
            'fill-outline-color': '#09c',
            'fill-outline-width': 1,
            'fill-pattern': '',
            'fill-opacity': 1
          }
        };
        this.defaultStyle = style;
        break;

      case 'draw_circle':
        style = {
          'geo_type': 'draw_circle',
          'style': {
            'name': '新建圆形样式',
            'fill-color': '#090',
            'fill-outline-color': '#09c',
            'fill-outline-width': 1,
            'fill-pattern': '',
            'fill-opacity': 1
          }
        };
        this.defaultStyle = style;
        break;

      case 'draw_arrow':
        style = {
          'geo_type': 'draw_arrow',
          'style': {
            'name': '新建箭头样式',
            'fill-color': '#090',
            'fill-outline-color': '#09c',
            'fill-outline-width': 1,
            'fill-opacity': 1
          }
        };
        this.defaultStyle = style;
        break;

      case 'draw_photo':
        style = {
          'geo_type': 'draw_photo',
          'style': {
            'name': '新建图片样式',
            'fill-outline-color': '#09c',
            'fill-outline-width': 1,
            'fill-opacity': 1,
            'fill-color': 'transparent'
          }
        };
        this.defaultStyle = style;
        break;
    }
    this.createStyleDetail(style);
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

  submitStyle() {
    const postData = this.defaultStyle;
    this.httpService.getData(postData, true, 'execute', '4d996981-37ba-4e6a-b463-05ce94576cad', '', '').subscribe(
      (data: any) => {
        if (data.status > 0) {
          // if (this.type === 'create-style') {

            this.modalData.styleList.push(data.data.root[0]);
            this.appService.onSaveStyleEmitter.emit(this.modalData);
          // } else {
          //   this.modalData.styleList.push(data.data.root[0]);
          //   // this.saveStyle.emit(data.data.root[0]);
          // }
          this.activeModal.dismiss('close');
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '新建样式成功!', 2000);
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

}
