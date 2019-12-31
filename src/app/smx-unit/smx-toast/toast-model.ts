/**
 * 类型
 */
import {ViewChild} from '@angular/core';
import {ToastBoxComponent} from './toast-box.component';

export enum ToastType {
  SUCCESS, INFO, WARNING, ERROR, BREAK
}


/**
 * 配置
 */
export class ToastConfig {
  @ViewChild(ToastBoxComponent, {static: false}) toasBox: ToastBoxComponent;
  public toastType: ToastType;
  text: string;
  textStrong: string;
  autoDismissTime: number;
  dismissable: boolean;
  describe: string;


  constructor(
    toastType: ToastType,
    textStrong: string = '',
    text: string = '',
    autoDismissTime = 0,
    dismissable = true,
    describe: string = '') {
    this.toastType = toastType;
    this.text = text;
    this.textStrong = textStrong;
    this.autoDismissTime = autoDismissTime;
    this.dismissable = dismissable;
    this.describe = describe;

  }

  getToastType(): ToastType {
    return this.toastType;
  }

  getText(): string {
    return this.text;
  }

  getDescribe() {
    return this.describe;
  }

  getTextStrong(): string {
    return this.textStrong;
  }

  getAutoDismissTime(): number {
    return this.autoDismissTime;
  }

  getDismissable(): boolean {
    return this.dismissable;
  }


  isDismissable() {
    return this.autoDismissTime === 0 || this.dismissable;
  }

  isAutoDismissing() {
    return this.autoDismissTime > 0;
  }


  remove() {
    this.toasBox.remove(this);
  }
}

