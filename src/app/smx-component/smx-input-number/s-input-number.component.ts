import {AfterViewInit, Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'smx-input-number',
  templateUrl: './s-input-number.component.html',
  styleUrls: ['./s-input-number.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SInputNumberComponent),
    multi: true
  }]
})
export class SInputNumberComponent implements OnInit, AfterViewInit {
  @Input() smxStyle: any;
  @Input() smxClass: any;
  @Input() smxName = new Date().getTime() + ((1 + Math.random()) * 0x10000).toString(16).substring(1);
  @Input() smxMax: any;
  @Input() smxMin: any;
  @Input() smxDisabled = false;
  @Input() smxPrecision: number;
  @Input() smxPlaceholder = '数值输入框';
  @Input() smxAutoFocus: boolean = false;
  @Input() smxThousands: boolean = false;
  @Input() smxStep: number;  //  存在并且大于0
  @Output() change = new EventEmitter();
  @Output() enter = new EventEmitter();
  @Output() blur = new EventEmitter();

  @Input() smxDecimal = false;
  @Input() smxDecimalPrecision = 2;

  @ViewChild('smxNumberInput', {static: false}) input;
  setStepEvent = false;

  innerValue: any = '';
  value: any = '';
  public onModelChange: Function = () => {
  };
  public onModelTouched: Function = () => {
  };

  constructor() {

  }

  ngOnInit() {
  }


  ngAfterViewInit(): void {
    if (this.smxAutoFocus) {
      this.input.nativeElement.focus();
    }
  }


  writeValue(value: any) {
    if ((value && value !== undefined) || value === 0) {

      // 千分位
      if (this.smxThousands) {
        this.innerValue = this.format(value);
      } else {
        this.innerValue = value;
      }

    } else {
      this.innerValue = '';
    }
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }


  /**
   * 设置事件(输出)
   */
  changeEvent() {
    const value = this.limit(this.innerValue);
    let numstr;
    if (this.smxThousands) {
      numstr = this.format(value).toString();
    } else {
      numstr = value.toString();
    }

    setTimeout(() => {
      const str = numstr.toString().replace(/,/g, '');
      this.value = Number(str);
      this.onModelChange(this.value);
      this.change.emit(this.value);
      this.innerValue = numstr;
    }, 10);
  }

  /**
   * 回车事件
   * @param e
   */
  enterEvent(e: any) {
    setTimeout(() => {
      this.enter.emit(this.value);
    }, 10);

  }

  /**
   * 失去焦点事件
   * @param e
   */
  blurEvent(e: any) {
    setTimeout(() => {
      if (!this.setStepEvent) {
        this.blur.emit(this.value);
      }
      this.setStepEvent = false;
    }, 500);


  }


  /**
   * 设置步长
   * @param tag
   */
  clickStep(tag: string) {
    this.setStepEvent = true;
    let num = this.setModelValue(this.innerValue);
    num = parseFloat(num);
    if (tag === 'up') {

      num = num + Number(this.smxStep);
    }

    if (tag === 'down') {
      num = num - Number(this.smxStep);
    }


    this.innerValue = this.format(num);
    this.changeEvent();
    this.input.nativeElement.focus();
  }


  /**
   * 去除千分位分割符号
   */
  setModelValue(str: any): any {
    let numstr = str.toString().replace(/,/g, '');

    // 判断大小
    if (this.smxMax || this.smxMax === 0) {
      if ((this.smxMin || this.smxMin === 0) && this.smxMin < this.smxMax) {
        numstr = parseInt(numstr, 10);
        if (numstr > this.smxMax) {
          numstr = this.smxMax;
        }
      }
    }

    if (this.smxMin || this.smxMin === 0) {
      if ((this.smxMax || this.smxMax === 0) && this.smxMin < this.smxMax) {
        numstr = parseInt(numstr, 10);
        if (numstr < this.smxMin) {
          numstr = this.smxMin;
        }
      }
    }

    return numstr;
  }

  /**
   * 处理小数和整数
   */
  limit(innerValue) {
    const ivalue = innerValue.split('-');
    const num = ivalue.length - 1;
    if (num === 1 && ivalue[0] !== '') {
      innerValue = innerValue.substring(0, innerValue.length - 1);
    }
    if (num > 1) {
      innerValue = innerValue.substring(0, innerValue.length - 1);
    }

    let limitV = this.setModelValue(innerValue);
    limitV = limitV.replace(/^- + [0-9.]/g, '');
    // 处理0开头的整数
    if ((/^0+[0-9]+$/).test(limitV)) {
      limitV = limitV.replace(/\b(0+)/g, '');
    }

    // 处理整数部分
    if (this.smxPrecision && this.smxPrecision > 0) {
      const array = limitV.split('.');
      if (this.smxPrecision < array[0].length) {
        limitV = array[0].substr(0, this.smxPrecision);

        if (array[1]) {
          limitV = limitV + '.' + array[1];
        }
      }
    }

    // 限定小数点后的位数
    if (this.smxDecimal) {
      const digits = this.smxDecimalPrecision > 0 ? Number(this.smxDecimalPrecision) : 2;
      if (limitV * Math.pow(10, digits) % 1 !== 0) {
        const index = limitV.indexOf('.');
        const last = index + digits + 1;
        limitV = ('' + limitV).substring(0, last);
      }
    }

    return limitV;

  }


  // 对输入数字的整数部分插入千位分隔符
  format(innerValue: any) {
    const formatV = this.setModelValue(innerValue);
    let array = [];
    array = formatV.split('.');
    const re = /(-?\d+)(\d{3})/;
    while (re.test(array[0])) {
      array[0] = array[0].replace(re, '$1,$2');
    }
    let returnV = array[0];
    for (let i = 1; i < array.length; i++) {
      returnV += '.' + array[i];
    }
    return returnV;
  }
}
