import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {ToastConfig} from './toast-model';

/**
 * toast服务
 */
@Injectable()
export class ToastService {

  private toastSubject = new Subject<ToastConfig>();

  constructor() {
  }

  getToasts(): Observable<ToastConfig> {
    return this.toastSubject;
  }

  toast(toastConfig: ToastConfig) {
    setTimeout(() => {
      if (document.getElementsByClassName('alert').length > 0 && (toastConfig.toastType === 3 || toastConfig.toastType === 2)) {
        return;
      }
      this.toastSubject.next(toastConfig);
    }, 10);
  }

}
