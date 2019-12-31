import {Component, forwardRef, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'smx-slider',
  templateUrl: './smx-slider.component.html',
  styleUrls: ['./smx-slider.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SmxSliderComponent),
    multi: true
  }]
})
export class SmxSliderComponent implements OnInit {
  @Input() smxMax = 100;
  @Input() smxMin = 0;
  @Input() smxStep = 1;
  @Input() smxRange = false;
  @Input() smxStyle: any;
  @Output() smxOnAfterChange = new EventEmitter();

  model: any;
  public onModelChange: Function = () => {
  };
  public onModelTouched: Function = () => {
  };

  constructor() {
  }

  ngOnInit() {
    if (this.smxRange) {
      this.model = [this.smxMin, this.smxMax];
    } else {
      this.model = this.smxMin;
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


  onAfterChange(e: any) {
    this.onModelChange(e);
    this.smxOnAfterChange.emit(e);
  }

}
