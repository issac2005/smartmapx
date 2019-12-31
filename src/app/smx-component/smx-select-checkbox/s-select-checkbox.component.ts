/**
 * @author keiferju (KeiferJu)
 * @e-mail keiferju@gmail.com
 * @Date 2019-04-17 16:13
 * @description 基于ng-zorro-antd修改的复选框组件
 *
 */
import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'smx-select-checkbox',
  templateUrl: './s-select-checkbox.component.html',
  styleUrls: ['./s-select-checkbox.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SSelectCheckboxComponent),
    multi: true
  }]
})
export class SSelectCheckboxComponent implements OnInit {
  // listOfOption: Array<{ label: string; value: string }> = [];

  @Input() options = [];
  @Input() smxWidth: any;
  @Input() smxHeight: any;
  @Input() smxDisabled = false;
  @Input() smxTagCount = 2;
  @Input() smxStyle: any;
  @Input() smxClass: any;
  @Input() optionLabel = 'label'; // 标题
  @Input() optionValue = 'value'; // 值
  @Input() smxPlaceholder = '请选择...'; // 值
  @Input() smxLabelMode = true; // key-value模式
  @Input() smxValueKey = ''; // value是对象模式的唯一判断key
  @Output() onChange = new EventEmitter;

  value = [];
  smxOptions = [];
  smxValue = [];

  public onModelChange: Function = () => {
  };
  public onModelTouched: Function = () => {
  };


  constructor() {
  }

  ngOnInit() {
    if (this.smxValueKey !== '') {
      const data = ([] as any);
      if (this.smxLabelMode) {
        for (const v of this.options) {
          const obj = {};
          obj[this.optionLabel] = v[this.optionLabel];
          obj[this.optionValue] = v[this.optionValue][this.smxValueKey];
          data.push(obj);
        }
      } else {
        for (const v of this.options) {
          data.push(v[this.smxValueKey]);
        }
      }

      this.smxOptions = data;
    } else {
      this.smxOptions = this.options;
    }
  }


  writeValue(value: any) {
    if (value && value !== undefined) {
      if (this.smxValueKey !== '') {
        const data = ([] as any);
        for (const v of value) {
          data.push(v[this.smxValueKey]);
        }
        this.smxValue = data;
      } else {
        this.smxValue = value ? value : [];
      }
    } else {
      this.onModelChange([]);
    }
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }


  change(value, tag?: any) {
    if (this.smxValueKey !== '') {
      const data = ([] as any);
      for (const l of value) {
        for (const v of this.options) {
          if (this.smxLabelMode) {
            if (v[this.optionValue][this.smxValueKey] === l) {
              data.push(v[this.optionValue]);
            }
          } else {
            if (v[this.smxValueKey] === l) {
              console.log(2);
              data.push(v);
            }
          }
        }
      }
      this.onModelChange(data);
      this.onChange.emit(data);


    } else {
      this.onModelChange(value);
      this.onChange.emit(value);
    }

  }

}
