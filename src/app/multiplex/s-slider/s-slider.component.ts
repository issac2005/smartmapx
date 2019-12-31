import {Component, OnInit, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-s-slider',
  templateUrl: './s-slider.component.html',
  styleUrls: ['./s-slider.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SSliderComponent),
    multi: true
  }]
})
export class SSliderComponent implements OnInit {
  @Input() label: any = '透明度';
  @Output() onSlideEnd = new EventEmitter;
  @Input() min: any;
  @Input() max: any;
  showNum: any;
  private innerValue: any = '';
  constructor() {
  }
  private onTouchedCallback: () => void = function() {};
  private onChangeCallback: (_: any) => void = function() {};
  ngOnInit() {
  }
  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    this.showNum = v;
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.showNum = this.innerValue;
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
  onSlideEnds (event: any) {
    this.onSlideEnd.emit(event.value);
  }
}
