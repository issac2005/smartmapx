import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  forwardRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'smx-input',
  templateUrl: './s-input.component.html',
  styleUrls: ['./s-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SInputComponent),
    multi: true
  }]
})
export class SInputComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() smxStyle: any;
  @Input() smxClass: any;
  @Input() smxMode = 'input';  // 'input'  'textarea'
  @Input() smxFormat: any;
  @Input() smxName = new Date().getTime() + ((1 + Math.random()) * 0x10000).toString(16).substring(1);
  @Input() smxMax: any;
  @Input() smxMin: any;
  @Input() smxDisabled: any;
  @Input() smxMinlength: any;
  @Input() smxMaxlength: any;
  @Input() smxPlaceholder = '文本输入框';
  @Input() smxAutoFocus: any;
  @Output() change = new EventEmitter();
  @Output() enter = new EventEmitter();
  @Output() blur = new EventEmitter();


  @ViewChild('smxInput', {static: false}) input;
  @ViewChild('smxTextarea', {static: false}) textarea;



  private innerValue: any;
  private onTouchedCallback: () => void = function () {
  };
  private onChangeCallback: (_: any) => void = function () {
  };

  constructor() {

  }

  ngOnInit() {

    if (!this.smxPlaceholder) {
      this.smxPlaceholder = '文本输入框';
    }
  }


  ngAfterViewInit(): void {
    if (this.smxAutoFocus) {
      if (this.smxMode === 'input') {
        this.input.nativeElement.focus();
      } else {
        this.textarea.nativeElement.focus();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

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

  changeEvent(e: any, tag?: any) {
    if (this.smxFormat === 'number') {
      if (this.smxMax === 0 || this.smxMax) {
        if (this.value > this.smxMax) {
          this.value = this.smxMax;
        }
      }

      if (this.smxMin === 0 || this.smxMin) {
        if (this.value < this.smxMin) {
          this.value = this.smxMin;
        }
      }
    }


    // 回车
    if (e.which === 13) {
      this.enter.emit(this.value);
    }


    // 失去焦点
    if (tag && tag === 'blur') {
      this.blur.emit(this.value);
    }


    // 改变
    this.change.emit(this.value);
  }
}
