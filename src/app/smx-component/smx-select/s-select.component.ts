/**
 * Created by LLCN on 2018/9/14 16:06.
 *
 * name: s-select.component.ts
 * description: 下拉框组件
 */

import {Component, OnInit, Input, Output, EventEmitter, forwardRef, AfterViewInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'smx-select',
  templateUrl: './s-select.component.html',
  styleUrls: ['./s-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SSelectComponent),
    multi: true
  }]
})
export class SSelectComponent implements OnInit, ControlValueAccessor, AfterViewInit {

  // @Input() value: any;
  @Input() options = [];
  @Input() smxLabelMode = true;   // 键值对模式
  @Input() optionLabel = 'label'; // 标题
  @Input() optionValue = 'value'; // 值
  @Input() smxDisabled = false;
  @Input() smxToNumber = false;
  @Input() smxStyle: any;
  @Input() smxClass: any;
  @Input() smxHeight = 30;  // 高度
  @Input() smxPlaceholder = '请选择...'; // 值
  @Input() smxAutoFocus = false;

  @Output() onChange = new EventEmitter;
  @Output() blur = new EventEmitter;
  model: any;
  disabled = false;
  @ViewChild('smxSelect', {static: false}) select;
  public onModelChange: Function = () => {
  };
  public onModelTouched: Function = () => {
  };


  constructor() {
  }

  ngOnInit() {
    setTimeout(() => {
      this.disabled = this.smxDisabled;
    });
  }

  ngAfterViewInit(): void {
    if (this.smxAutoFocus) {
      this.select.nativeElement.focus();
    }
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


  change(value) {

    if (this.smxToNumber) {
      this.model = Number(value);
    } else {
      this.model = value;
    }
    this.onModelChange(this.model);
    // 改变
    this.onChange.emit(this.model);
  }


  blurEvent(value: any) {
    if (this.smxToNumber) {
      this.model = Number(value.target.value);
    } else {
      this.model = value.target.value;
    }
    this.onModelChange(this.model);
    this.blur.emit(this.model);

  }
}
