import {Component, Input, OnInit} from '@angular/core';
import {SmxActiveModal} from '../../../smx-component/smx-modal/directive/modal-ref';
import {smxIndexDown, smxIndexUp} from '../../../smx-component/smx-util';

@Component({
  selector: 'app-setting-modal',
  templateUrl: './setting-modal.component.html',
  styleUrls: ['./setting-modal.component.scss']
})
export class SettingModalComponent implements OnInit {
  @Input() smxType: any;
  @Input() smxConfig: any;
  @Input() smxData: any;


  // 文本设置
  editIndex: any;

  //  数值
  precisions = [{label: '4位数(smallint)', value: 4}, {label: '9位数(integer)', value: 9}, {label: '18位数[bigint]', value: 18}];
  thousandsOptions = [{label: '有', value: true}, {label: '无', value: false}];
  stepOptions = [{label: '有', value: 1}, {label: '无', value: 0}];

  // 时间日期
  dateFormats = [{title: '2019-04-10', value: 'yyyy-MM-dd'}, {title: '2019/4/10', value: 'yyyy/MM/dd'}, {
    title: '2019年4月10日',
    value: 'yyyy年MM月dd日'
  }, {title: '2019年4月', value: 'yyyy年MM月'}, {title: 'Jan.30.2019', value: 'MMM d, y'}];
  timeFormats = [{title: '15:20:22', value: 'HH:mm:ss'}, {title: '3:20 PM', value: 'h:mm a'}, {title: 'PM 3:20', value: 'a h:mm'},
    {title: '15:20', value: 'HH:mm'}, {title: '3:20:22 PM', value: 'h:mm:ss a'}];
  dtFormats = [{title: '2019-01-30 15:20:22', value: 'yyyy-MM-dd HH:mm:ss'}, {title: '2019-01-30 3:20 PM', value: 'yyyy-MM-dd h:mm a'},
    {title: '2019/1/30 15:20:22', value: 'yyyy/MM/dd HH:mm:ss'}, {
      title: '2019/1/30 3:20 PM',
      value: 'yyyy/MM/dd h:mm a'
    }, {title: '2019年1月30日 15时20分', value: 'yyyy年MM月dd日 HH时mm分'}];

  constructor(public activeModal: SmxActiveModal) {
  }

  ngOnInit() {

    switch (this.smxType) {
      case 'dt':
        if (!this.smxData) {
          this.smxData = {smxFormat: 'yyyy-MM-dd HH:mm:ss'};
        }
        break;
      case 'date':
        if (!this.smxData) {
          this.smxData = {smxFormat: 'yyyy-MM-dd'};
        }
        break;
      case 'time':
        if (!this.smxData) {
          this.smxData = {smxFormat: 'HH:mm:ss'};
        }
        break;
      case 'text':
        if (!this.smxData) {
          this.smxData = {options: []};
        }
        break;
      case 'boolean':
        if (!this.smxData) {
          this.smxData = {options: [{label: true, value: true}, {label: false, value: false}]};
        }
        break;

      case 'integer':
        if (!this.smxData) {
          this.smxData = {
            smxPrecision: 9,
            smxThousands: false,
            smxStep: 0,
          };
        }
        break;

      case 'decimal':
        if (!this.smxData) {
          this.smxData = {
            smxPrecision: 10,
            smxDecimalPrecision: 2,
            smxThousands: false,
            smxStep: 0,
          };
        }
        break;
    }
  }


  /**
   * 文本操作
   */
  addText() {
    this.smxData.options.push('自定义文本' + (this.smxData.options.length + 1));
  }

  removeText(index: any) {
    this.smxData.options.splice(index, 1);
  }

  moveUp(index: any) {
    const sid = smxIndexDown(this.smxData.options, index, this.smxData.options.length);
    if (sid) {
      this.smxData.options = sid;
    }
  }

  moveDown(index: any) {
    const siu = smxIndexUp(this.smxData.options, index, this.smxData.options.length);
    if (siu) {
      this.smxData.options = siu;
    }
  }

  editText(index: any) {
    this.editIndex = index;
  }

  blur(event: any, index: any) {
    this.editIndex = null;
    this.smxData.options[index] = event;
  }


  submit() {
    console.log(this.smxData);
    this.activeModal.close(this.smxData);
  }
}
