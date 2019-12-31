import { forwardRef, Component, Input, OnChanges, OnInit, EventEmitter, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'smx-date-time-pick',
  templateUrl: './s-date-time-pick.component.html',
  styleUrls: ['./s-date-time-pick.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SDateTimePickComponent),
    multi: true
  }]
})
export class SDateTimePickComponent implements OnInit, OnChanges {
  @Input() mode = 'date';
  @Input() smxStyle = {width: '100%'};
  @Input() smxClass: any;
  @Input() smxPlaceHolder = '请选择...';
  @Input() smxFormat: any;
  @Input() smxDisabled = false;
  @Output() onChange = new EventEmitter();
  value: any = null;

  public onModelChange: Function = () => {
  };
  public onModelTouched: Function = () => {
  };

  constructor() {
  }

  ngOnInit() {
    if (this.mode === 'date') {
      if (!this.smxFormat) {
        this.smxFormat = 'yyyy-MM-dd';
      }
    }

    if (this.mode === 'time') {
      if (!this.smxFormat) {
        this.smxFormat = 'HH:mm:ss';
      }
    }

    if (this.mode === 'date-time') {
      if (!this.smxFormat) {
        this.smxFormat = 'yyyy-MM-dd HH:mm:ss';
      }
    }
  }

  ngOnChanges(): void {

  }

  writeValue(value: any): void {
    if (value && value !== undefined) {
      this.value = new Date(Number(value));
    }
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }

  /**
   * 时间关闭
   * @param result
   */
  change(result: Date): void {
    if (result) {
      const time = result.getTime();
      this.onModelChange(time);
      this.onChange.emit(time);
    } else {
      const time = new Date().getTime();
      this.onModelChange(time);
      this.onChange.emit(time);
    }
  }

}
