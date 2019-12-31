/**
 * 按键事件
 */
import {Directive, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[SmxKeydown]'
})
export class SKeydownDirective {
  @Input() smxKeyDownType = 1; // 1 整数   2 小数

  const;
  intNums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', 'Backspace', 'ArrowLeft', 'ArrowRight'];
  floatNums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '.', 'Backspace', 'ArrowLeft', 'ArrowRight'];

  constructor() {
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: any) {

    if (this.smxKeyDownType === 1) {
      if (this.intNums.includes(event.key)) {

        return;

      } else {
        event.preventDefault();
      }
    }

    if (this.smxKeyDownType === 2) {
      if (this.floatNums.includes(event.key)) {

        return;

      } else {
        event.preventDefault();
      }
    }
  }

}
