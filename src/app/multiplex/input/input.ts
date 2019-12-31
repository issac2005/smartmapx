import {Component, OnInit, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.html',
  styleUrls: ['./input.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true
  }]
})

export class InputComponent implements OnInit {
  @Input() label: any;
  @Input() max: any;
  @Input() min: any;
  @Input() minlength: any;
  @Input() maxlength: any;
  @Input() format: any;
  @Output() ochange = new EventEmitter();
  private innerValue: any = '';
  private onTouchedCallback: () => void = function () {
  };
  private onChangeCallback: (_: any) => void = function () {
  };

  constructor() {

  }

  ngOnInit() {

  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  valueChange() {
    if (this.value < 0) {
      this.value = 1;
      this.ochange.emit(this.value);
      return;
    } else if (this.value > 2000) {
      this.value = 2000;
      this.ochange.emit(this.value);
      return;
    } else {
      this.ochange.emit(this.value);
      return;
    }
  }
}
