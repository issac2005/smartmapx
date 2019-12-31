import {Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter, Renderer2, ElementRef} from '@angular/core';
import {HttpService} from '../../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';

@Component({
  selector: 'app-setting-panel',
  templateUrl: './setting-panel.component.html',
  styleUrls: ['./setting-panel.component.scss']
})
export class SettingPanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() index: any;
  @Input() dataInfo: any;
  @Input() mapObj: any;
  @Output() sendJsonEditorData = new EventEmitter();
  @Output() sendJsonChange = new EventEmitter();
  @Output() valueChange = new EventEmitter();
  serviceData: any;
  unGetJsService: any;
  programJson: any;
  smallProgram: any;
  editor: any;
  hasData = false;
  init = true;
  modal = false;
  booleans = true;
  label: any = '边框颜色';
  val: any = 70;
  legendValue: any;
  BooleanColseHtml = true;
  sprite: any; /* 图片地址 */
  splite: any; /* 获取的图片 */
  isEdit = false;

  constructor(private toastService: ToastService,
              private httpService: HttpService,
              private elementRef: ElementRef,
              private render2: Renderer2) {
  }

  ngOnInit() {
    if (this.dataInfo) {
      this.isEdit = !this.dataInfo.visit_type;
    }

    this.showJson();
  }

  ngOnChanges() {
    setTimeout(() => {
      const num = document.getElementsByClassName('card-header');
      for (let i = 0; i < num.length; i++) {
        const isclick = num[i].firstElementChild.getAttribute('aria-expanded');
        if (isclick === 'false') {
          num[i].getElementsByTagName('a')[0].click();
        }
      }
    }, 1000);
  }

  ngOnDestroy() {
  }


  getChangeInfo(event: any) {
    this.valueChange.emit(this.smallProgram);
  }

  // 接收组件值改变
  getValueChange(event: any) {
    this.smallProgram[event[0]] = event[1];
    this.valueChange.emit(this.smallProgram);
  }


  // 初始化小程序编辑器
  showJson() {
    const postData = {
      mini_program_id: this.dataInfo.mini_program_id,
      // version: this.dataInfo.version ? this.dataInfo.version : null
      version: 'current'
    };
    this.httpService.getData(postData, true, 'app', 'JSONshow', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            if (data.data !== '' && data.data !== undefined) {
              this.smallProgram = {};
              this.programJson = JSON.parse(data.data);
              if (this.programJson.modal) {
                this.modal = true;
                for (let i = 0; i < this.programJson.group.length; i++) {
                  const properties = this.programJson.group[i].properties;
                  for (let m = 0; m < properties.length; m++) {
                    this.smallProgram[properties[m].attribute] = properties[m].default;
                  }
                }
                this.sendJsonEditorData.emit();
              }
            }
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  beforeChange($event: any) {
    const parent = document.getElementById($event.panelId + '-header');
    if ($event.nextState) {
      this.render2.addClass(parent.children[0].children[1], 'ngb-sort-up');
    } else {
      this.render2.removeClass(parent.children[0].children[1], 'ngb-sort-up');
    }
  }
}
