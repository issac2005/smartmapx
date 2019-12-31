/**
 * @author LLCN
 * @Date 2019/1/2 10:21
 * @description 自定义单选框
 *
 */
import {Component, OnInit, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {guid} from '../smx-util';

@Component({
  selector: 'smx-radio',
  templateUrl: './s-radio.component.html',
  styleUrls: ['./s-radio.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SRadioComponent),
    multi: true
  }]
})
export class SRadioComponent implements OnInit {
  @Input() options: any[];
  @Input() optionLabel: any = 'label';
  @Input() optionValue: any = 'value';
  @Input() smxDisabled = false;
  @Input() smxStyle: any;
  @Input() smxClass: any;
  @Output() onChange = new EventEmitter;


  model: any;
  uuid: any;


  public onModelChange: Function = () => {
  };
  public onModelTouched: Function = () => {
  };

  constructor() {
  }

  ngOnInit() {
    this.uuid = guid();
  }

  writeValue(value: any) {
    this.model = value;
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }


  change(value) {
    this.model = value;
    this.onModelChange(this.model);
    this.onChange.emit(this.model);
  }
}
