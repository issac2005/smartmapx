/**
 * @author  keiferju
 * @time    2019-05-22 09:39
 * @title   UI类型选择框,涉及到http服务请求结构
 * @description
 *
 */
import {Component, Input, OnInit, AfterViewChecked} from '@angular/core';
import {SmxActiveModal} from '../../../smx-component/smx-modal/directive/modal-ref';
import {SmxModal} from '../../../smx-component/smx-modal/directive/smx-modal';
import {SettingModalComponent} from '../setting-modal/setting-modal.component';
import {deepCopy, transData, toError} from '../../../smx-component/smx-util';
import {HttpService} from '../../../s-service/http.service';

@Component({
  selector: 'app-ui-setting',
  templateUrl: './ui-setting-modal.component.html',
  styleUrls: ['./ui-setting-modal.component.scss']
})

export class UiSettingModalComponent implements OnInit, AfterViewChecked {
  @Input() smxType: any;
  @Input() smxConfig: any;
  @Input() smxData: any;

  componentId: any;  // 类型ID
  controls: any;     // 组件集
  component_id: any;     // 组件ID
  controlConfig = {};  // 组件配置

  uiComponents: any;

  // 文本
  defaultHtml = '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '    <title>html</title>\n' +
    '</head>\n' +
    '<body>\n' +
    '</body>\n' +
    '</html>';
  defaultText = '文本输入';
  defaultTextarea = '多行文本输入\n' + '多行文本输入';

  defaultDt = new Date().getTime();
  hiddenDT: any;


  // 选定组件
  constructor(public activeModal: SmxActiveModal, private smxModalService: SmxModal, private http: HttpService) {
  }

  ngOnInit() {
    this.http.getData({baseid: 'sys_ui_component'}, true, 'execute', 'de6423c9-85f0-406e-9634-5ac7241e9297', 'ui').subscribe(
      result => {

        const data = transData((result as any).data, 'baseid', 'parent_id', 'children');

        if (data[0] && data[0]['children']) {
          this.uiComponents = data[0]['children'].reverse();
          this.initConfig();
        } else {
          toError('未查询到配置文件');
        }

      }, error => {
        console.error('ui:' + error);
      }
    );
  }

  ngAfterViewChecked(): void {

  }


  initConfig() {
    if (this.smxData && this.smxData.type && this.smxData.component_id) {
      this.componentId = this.smxData.type;
      this.component_id = this.smxData.component_id;

      // 处理配置
      if (this.smxData.config) {
        for (const v of this.smxData.config) {
          this.controlConfig[v.name] = v.component_attr_value;
        }
      }


    } else {
      this.componentId = 'sys_ui_c_text';
      this.component_id = 'fm_ui_input_text';
      this.controlConfig = {
        options: [],
      };
    }

    for (const v of this.uiComponents) {
      if (v.baseid === this.componentId) {
        this.controls = v.children;
        return;
      }
    }
  }


  checkcomponent(component: any) {
    this.controls = component['children'] || [];
    this.componentId = component.baseid;
    this.controlConfig = null;
    switch (this.componentId) {
      case 'sys_ui_c_text':
        this.component_id = 'fm_ui_input_text';
        break;
      case 'sys_ui_c_date':
        this.component_id = 'fm_ui_pick_date';
        break;
      case 'sys_ui_c_time':
        this.component_id = 'fm_ui_pick_time';
        break;
      case 'sys_ui_c_datetime':
        this.component_id = 'fm_ui_pick_datetime';
        break;
      case 'sys_ui_c_boolean':
        this.component_id = 'fm_ui_select_boolean';
        this.controlConfig = {options: [{label: true, value: true}, {label: false, value: false}]};
        break;
      case 'sys_ui_c_integer':
        this.component_id = 'fm_ui_input_integer';
        this.controlConfig = {smxPrecision: 9, smxStep: 1, smxThousands: false};
        break;
      case 'sys_ui_c_decimal':
        this.component_id = 'fm_ui_input_decimal';
        this.controlConfig = {smxDecimalPrecision: 2, smxPrecision: 10, smxStep: 1, smxThousands: false};
        break;
      case 'sys_ui_c_json':
        this.component_id = 'fm_ui_select_json';
        break;
      case 'sys_ui_c_upload':
        this.component_id = 'fm_ui_image_upload';
        break;
      case 'sys_ui_c_geo':
        this.component_id = 'fm_ui_point_geo';
        break;
    }
  }

  checkControl(value: any) {
    this.component_id = value.target.value;
  }


  // 打开设置面板
  openSetPanel(tag: string) {
    const smxModal = this.smxModalService.open(SettingModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-setModal'});
    switch (tag) {
      case 'date':
        smxModal.componentInstance.smxType = 'date';
        smxModal.componentInstance.smxConfig = {title: '格式设置'};
        smxModal.componentInstance.smxData = deepCopy(this.controlConfig) || null;
        smxModal.result.then((result) => {
          this.controlConfig = result;
          this.hiddenDT = true;
          setTimeout(() => {
            this.hiddenDT = false;
          }, 50);


        }, (reson) => {
          console.log(reson);
        });
        break;
      case 'date_time':
        smxModal.componentInstance.smxType = 'dt';
        smxModal.componentInstance.smxConfig = {title: '格式设置'};
        smxModal.componentInstance.smxData = deepCopy(this.controlConfig);
        smxModal.result.then((result) => {
          this.controlConfig = result;
          this.hiddenDT = true;
          setTimeout(() => {
            this.hiddenDT = false;
          }, 50);


        }, (reson) => {
          console.log(reson);
        });
        break;
      case 'time':
        smxModal.componentInstance.smxType = 'time';
        smxModal.componentInstance.smxConfig = {title: '格式设置'};
        smxModal.componentInstance.smxData = deepCopy(this.controlConfig);
        smxModal.result.then((result) => {
          this.controlConfig = result;
          this.hiddenDT = true;
          setTimeout(() => {
            this.hiddenDT = false;
          }, 50);
        }, (reson) => {
          console.log(reson);
        });
        break;
      case 'text':
        smxModal.componentInstance.smxType = 'text';
        smxModal.componentInstance.smxConfig = {title: '选项设置'};
        smxModal.componentInstance.smxData = deepCopy(this.controlConfig);
        smxModal.result.then((result) => {
          this.controlConfig = result;
        }, (reson) => {
          console.log(reson);

        });
        break;

      case 'boolean':
        smxModal.componentInstance.smxType = 'boolean';
        smxModal.componentInstance.smxConfig = {title: '显示值设置'};
        smxModal.componentInstance.smxData = deepCopy(this.controlConfig);
        smxModal.result.then((result) => {
          this.controlConfig = result;
          this.hiddenDT = true;
          setTimeout(() => {
            this.hiddenDT = false;
          }, 50);

        }, (reson) => {
          console.log(reson);
        });
        break;

      case 'integer':
        smxModal.componentInstance.smxType = 'integer';
        smxModal.componentInstance.smxConfig = {title: '数值设置'};
        smxModal.componentInstance.smxData = deepCopy(this.controlConfig);
        smxModal.result.then((result) => {
          this.controlConfig = result;
          this.hiddenDT = true;
          setTimeout(() => {
            this.hiddenDT = false;
          }, 50);
        }, (reson) => {
          console.log(reson);
        });
        break;

      case 'decimal':
        smxModal.componentInstance.smxType = 'decimal';
        smxModal.componentInstance.smxConfig = {title: '数值设置'};
        smxModal.componentInstance.smxData = deepCopy(this.controlConfig);
        smxModal.result.then((result) => {
          this.controlConfig = result;
          this.hiddenDT = true;
          setTimeout(() => {
            this.hiddenDT = false;
          }, 50);
        }, (reson) => {
          console.log(reson);
        });
        break;
    }
  }


  submit() {
    this.activeModal.close({type: this.componentId, component_id: this.component_id, config: this.controlConfig});
  }
}
