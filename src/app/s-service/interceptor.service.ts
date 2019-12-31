/**
 * @author LLCN
 * @Date 2019/1/22 15:21
 * @description token处理模块
 *
 */
import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {LocalStorage} from './local.storage';

@Injectable()
export class InterceptorService implements HttpInterceptor {

  constructor(private ls: LocalStorage) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.ls.get('id_token');

    let headers = req.headers
      .set('Content-Type', 'application/json');

    let authReq: any;
    if (headers.get('extra') === 'noToken' || !token) {
      headers = headers.delete('Authorization').delete('extra');
      headers = headers.delete('Authorization');
      authReq = req.clone({headers: headers});
    } else {
      authReq = req.clone({setHeaders: {Authorization: 'Bearer ' + token}});
    }
    return next.handle(authReq);

  }
}
