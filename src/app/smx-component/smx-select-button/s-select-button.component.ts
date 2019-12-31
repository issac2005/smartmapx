/**
 * Created by LLCN on 2018/9/14 16:07.
 *
 * name: s-select-button.component.ts
 * description: 按钮选择框组件
 */

import {Component, OnInit, Input, forwardRef, Output, EventEmitter} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'smx-select-button',
  templateUrl: './s-select-button.component.html',
  styleUrls: ['./s-select-button.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SSelectButtonComponent),
    multi: true
  }]
})
export class SSelectButtonComponent implements OnInit, ControlValueAccessor {
  @Input() smxStyle: any[];
  @Input() smxClass: any[];
  @Input() options: any[];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() tip: any;
  @Output() onChange = new EventEmitter();


  // @Input() _model: any;
  model: any;
  // checkedItem: any;

  public onModelChange: Function = () => {
  };
  public onModelTouched: Function = () => {
  };

  constructor() {

  }

  ngOnInit() {
  }


  writeValue(value: any) {
    if (value && value !== undefined) {
      this.model = value;
    }
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }


  modelChange(v: any) {
    this.model = v[this.optionValue];
    this.onModelChange(v[this.optionValue]);
    this.onChange.emit(v);
  }
}
