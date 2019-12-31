import {Component, OnInit, Input, Output, OnChanges, OnDestroy, EventEmitter, Renderer2} from '@angular/core';
import * as Ajv from 'ajv';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';
@Component({
  selector: 'app-json',
  templateUrl: './json.component.html',
  styleUrls: ['./json.component.scss']
})

export class AppJsonComponent implements OnInit {
  @Input() programInfo: any;
  // @Input() programJson: any;
  @Output() jsonChange = new EventEmitter();
  json: any;
  data: any;
  validJson: any;
  jsonData: any;
  wrap: any;

  constructor(private toastService: ToastService,
              private render2: Renderer2
              ) {

  }

  ngOnInit() {
    if (this.programInfo.id) {
      // 给textarea赋值
      this.jsonData = JSON.stringify(this.programInfo.properties, null, 4);
    }
  }

  beforeChange($event: any) {
    const parent = document.getElementById($event.panelId + '-header');
    if ($event.nextState) {
      this.render2.addClass(parent.children[0].children[1], 'ngb-sort-up');
    } else {
      this.render2.removeClass(parent.children[0].children[1], 'ngb-sort-up');
    }
  }


  validateJson() {
    const ajv = new Ajv({allErrors: true});
    const self = this;
    let result;
    try {
      if (this.jsonData) {
        this.validJson = JSON.parse(this.jsonData);
        const reslut = ajv.validateSchema(this.validJson);
        if (reslut) {
          // 向父组件发送变动的数据内容
          self.data = self.jsonData;
          self.jsonChange.emit(self.data);
          result = true;

        } else {
          result = false;
          const toastCfg = new ToastConfig(ToastType.ERROR, '', this.errorsText(ajv.errors), 2000);
          self.toastService.toast(toastCfg);
        }
      }
    } catch (e) {
      result = false;
      const toastCfg = new ToastConfig(ToastType.ERROR, '', 'json格式错误', 2000);
      self.toastService.toast(toastCfg);

    }
    return result;
  }


  errorsText(errors: any) {
    if (errors) {
      let messages = ([] as any);
      errors.forEach(function (err: any) {
        const message = `[${err.dataPath}] ${err.message}]`;
        if (err.keyword === 'enum' && err.params && err.params.allowedValues) {
          // message += `[${err.params.allowedValues.join(', ')}]`;
        }
        messages.push(message);
      });
      return messages.join('\n');
    } else {
      return '';
    }

  }


}
