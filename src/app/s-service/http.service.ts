/**
 * Created by LLCN on 2017/8/14 16:02.
 *
 * name: http.service.ts
 * description: http模块
 */
import {throwError as observableThrowError, Observable} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {DataStorage} from './local.storage';
import {get, set} from '../smx-component/smx-util';
import 'rxjs/Observable';
import {AppService} from './app.service';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {ToastService} from '../smx-unit/smx-toast/toast.service';
import {ToastConfig, ToastType} from '../smx-unit/smx-toast/toast-model';

let self: any;

@Injectable()
export class HttpService {
  urlRoot = '/services';
  version = '1.0.0';
  jwt: any;
  // decodedJwt: any;
  smxAccess = false;


  constructor(private http: HttpClient,
              public router: Router,
              public toastService: ToastService,
              public appService: AppService,
              private ds: DataStorage) {
  }

  // token判断
  prejudgeToken() {
    return this.http.post<any>('/services/1.0.0/execute/71c21c45-39eb-49f6-ac2d-8e75089f3078', {data: {limit: 1, start: 0}});
  }

  /**
   * 静态文件读取
   */
  getFile(url: any) {
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * 获取服务列表
   * @param url
   * @param isJwt
   * @param body
   */
  getServiceList(url: any, isJwt: boolean, body = {}) {
    let params = new HttpParams();
    for (const l in body) {
      if (l) {
        params = params.set(l, body[l]);
      }
    }

    if (isJwt) {
      return this.getDataWithJwt(url, params);
    } else {
      return this.getDataWithoutJwt(url, params);
    }
  }

  /**
   * window 打开
   * @param param
   * @param modulename
   * @param operation
   * @param type
   */
  open(url: string, type = 'default') {

    // 获取路径
    const baseUrl = this.getBaseUrl(type);
    const path = baseUrl ? baseUrl + url : url;
    console.log(path);
    window.open(path);
  }

  /**
   * 正常请求
   * @param param
   * @param isJwt
   * @param modulename
   * @param operation
   * @param tag
   * @param type
   */
  getData(param: Object, isJwt: boolean, modulename: string, operation: string, tag: string, type = 'default') {
    self = this;


    // 获取路径
    const baseUrl = this.getBaseUrl(type);
    const path = baseUrl ? baseUrl + this.getUrl(modulename, operation, type) : this.getUrl(modulename, operation, type);


    // 参数处理
    const body = this.getBody(param, tag, type);


    // get 请求
    if (type === 'sprite') { // get
      let params = new HttpParams();
      for (const l in param) {
        if (l) {
          params = params.set(l, param[l]);
        }
      }
      if (isJwt) {
        return this.getDataWithJwt(path, params);
      } else {
        return this.getDataWithoutJwt(path, params);
      }

    } else {
      if (isJwt) {
        return this.postDataWithJwt(path, body);
      } else {
        return this.postDataWithoutJwt(path, body);
      }
    }


  }


  /**
   * 上传服务
   * @param url
   * @param params
   * @param files
   * @param type
   */
  makeFileRequest(url: string, params: any, files: File[], type = 'default'): Observable<any[]> {

    // 获取路径
    const baseUrl = this.getBaseUrl(type);
    const path = baseUrl ? baseUrl + url : url;


    // 返回
    return Observable.create(observer => {
      const formData: FormData = new FormData(),
        xhr: XMLHttpRequest = new XMLHttpRequest();


      for (const key in params) {
        if (key) {
          formData.append(key, params[key]);
        }
      }

      for (let i = 0; i < files.length; i++) {
        formData.append('uploads', files[i], files[i].name);
      }


      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            observer.next(JSON.parse(xhr.response));
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      };

      xhr.open('POST', path, true);
      const token = get('id_token');
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.send(formData);
    });
  }


  /**
   * 获取url
   */
  private getBaseUrl(type: any) {
    // const properties = this.appService.properties;
    const properties = <any>this.ds.get('properties');
    let baseUrl = null;
    if (type === 'em') {
      baseUrl = properties.em;  // node
    } else if (type === 'sprite') {
      baseUrl = properties.sprite; // 图标
    } else {
      baseUrl = properties.service;   // 默认java 上传 微信
    }

    return baseUrl;
  }


  /**
   * 获取参数
   * @param param
   * @param tag
   * @param type
   */
  private getBody(param: Object, tag: string, type: string) {
    let body;
    if (type === 'wechat') {
      body = param;
    } else if (type === 'em') {
      body = {'tag': tag, data: param};
    } else {
      body = {'tag': tag, data: param};
    }
    return body;
  }


  /**
   * 得到路径
   * @param modulename
   * @param operation
   * @param type
   */
  private getUrl(modulename: string, operation: string, type: string) {
    // const properties = this.appService.properties;
    const properties = <any>this.ds.get('properties');
    let url = '';
    if (type === 'em') {
      url = '/em/services/' + this.version + '/' + modulename + '/' + operation;
    } else if (type === 'sprite') {
      url = modulename + operation + '?t=' + new Date().getTime();
    } else if (type === 'mall_order_proof') {
      url = '/upload/' + this.version + '/' + modulename + '/' + operation;
    } else {
      url = this.urlRoot + '/' + this.version + '/' + modulename + '/' + operation;
    }

    return url + '?ver=' + properties.version;
  }


  /**
   * post 非token
   * @param dataUrl
   * @param body
   */
  private postDataWithoutJwt(dataUrl: string, body: Object): Observable<any[]> {
    this.appService.httpEventEmitter.emit(true);
    const headers = new HttpHeaders().append('extra', 'noToken');
    return this.http.post(dataUrl, body, {headers: headers}).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  /**
   * get 非token
   * @param dataUrl
   * @param body
   */
  private getDataWithoutJwt(dataUrl: string, body: HttpParams): Observable<any[]> {
    this.appService.httpEventEmitter.emit(true);
    const headers = new HttpHeaders().append('extra', 'noToken');
    return this.http.get(dataUrl, {headers: headers, params: body}).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }


  /**
   * post token
   * @param dataUrl
   * @param body
   */
  private postDataWithJwt(dataUrl: string, body: Object): Observable<any> {
    this.appService.httpEventEmitter.emit(true);
    return this.http.post<any>(dataUrl, body, {observe: 'response'}).pipe(
      map(this.extractJwtData),
      catchError(this.handleError)
    );
  }

  /**
   * get token
   * @param dataUrl
   * @param body
   */
  private getDataWithJwt(dataUrl: string, body: HttpParams): Observable<any> {
    this.appService.httpEventEmitter.emit(true);
    return this.http.get<any>(dataUrl, {observe: 'response', params: body}).pipe(
      map(this.extractJwtData),
      catchError(this.handleError)
    );
  }

  /**
   * token回调处理
   * @param res
   */
  private extractJwtData(res: HttpResponse<any>): Observable<any> {
    self.appService.httpEventEmitter.emit(false);
    if ((res as any).headers.get('Authorization') !== null) {
      set('id_token', (res as any).headers.get('Authorization'));
    }
    const body = (res as any).body;


    // 授权码
    if (body.status === -401) {
      const thisNode = document.getElementById('smx-access');
      if (thisNode) {
        return body || {};
      }
      if (!self.smxAccess) {
        self.smxAccess = true;
        self.toastService.toast(new ToastConfig(ToastType.BREAK, '', (body as any).data.serial, -1));
        self.router.navigate(['/index']);
        return body || {};
      } else {
        return body || {};
      }

    }


    // 错误状态码统一弹出吐司
    if (body.status < 0) {
      if (body.msg) {
        self.toastService.toast(new ToastConfig(ToastType.ERROR, '', body.msg, 5000, true, body.exception));
      }
    }


    // 访问值处理
    if (body.status > 0) {
      return body || {};
    } else if (body.status > -101) {  // 非关键性异常
      return body || {};
    } else if (body.status > -110) { // 尚未登录
      self.router.navigate(['/index'], {queryParams: {type: 'login'}});
      self.appService.loginedFlagEventEmitter.emit('loginout'); // 退出登录
      return body || {};
    } else if (body.status > -120) { // 权限不足
      return body || {};
    } else if (body.status > -500) { // 关键异常 退出当前操作
      return body || {};
    } else {  // 中断性异常 退出主界面
      self.appService.loginedFlagEventEmitter.emit('loginout'); // 退出登录
      return body || {};
    }


  }

  /**
   * 非token回调处理
   * @param res
   */
  private extractData(res: HttpResponse<any[]> | any) {
    self.appService.httpEventEmitter.emit(false);
    const body = res;

    // 授权码
    if (body.status === -401) {
      const thisNode = document.getElementById('smx-access');
      if (thisNode) {
        return body || {};
      }
      if (!self.smxAccess) {
        self.smxAccess = true;
        self.toastService.toast(new ToastConfig(ToastType.BREAK, '', (body as any).data.serial, -1));
        self.router.navigate(['/index']);
        return body || {};
      } else {
        return body || {};
      }

    }


    // 错误状态码统一弹出吐司
    if (body.status < 0) {
      if (body.msg) {
        self.toastService.toast(new ToastConfig(ToastType.ERROR, '', body.msg, 5000, true, body.exception));
      }
    }


    // 返回值处理
    if (body.status > 0) {
      return body || {};
    } else if (body.status > -101) { // 非关键性异常 <= -1
      return body || {};
    } else if (body.status > -110) { // 尚未登录 <= -101
      self.router.navigate(['/index'], {queryParams: {type: 'login'}});
      self.appService.loginedFlagEventEmitter.emit('loginout'); // 退出登录
      return body || {};
    } else if (body.status > -120) { // 权限不足
      return body || {};
    } else if (body.status > -500) { // 关键异常 退出当前操作
      return body || {};
    } else {  // 中断性异常 退回主界面
      return body || {};
    }
  }

  /**
   * 错误处理
   * @param error
   */
  private handleError(error: HttpResponse<any[]> | any) {
    self.appService.httpEventEmitter.emit(false);
    let errMsg: string;

    if (error) {
      let msg = '请求出现异常,请确认网络连接稍后再试!';
      if (error.status >= 500) {
        msg = '服务器异常,请稍后再试!';
      } else if (error.status < 500 && error.status > 400) {
        msg = '请求资源未找到,请确认请求合法性!';
      }

      self.toastService.toast(new ToastConfig(ToastType.ERROR, '', msg, 3000));
    }


    if (error instanceof Response) {
      const body = error.statusText || '请检查您的网络连接';
      errMsg = `${error.status} - ${error.statusText || ''} ${body}`;
    } else {
      errMsg = (error as any).message ? (error as any).message : error.toString();
    }
    return observableThrowError(errMsg);
  }

}
