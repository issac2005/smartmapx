import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../s-service/http.service';
import {Router} from '@angular/router';
import {AppService} from '../../s-service/app.service';
import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {LoginModalComponent} from '../modal/login-modal.component';
import {Location} from '@angular/common';
import {DataStorage} from '../../s-service/local.storage';
import {getQueryString} from '../../smx-component/smx-util';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  array: any[] = [
    'url("/assets/source-img/banner/banner.jpg")',
    'url("/assets/source-img/banner/banner2.jpg")',
    'url("/assets/source-img/banner/banner3.jpg")',
    'url("/assets/source-img/banner/banner4.jpg")'
  ];


  version: any; // 版本号
  platformType: any; // 平台类型

  constructor(public location: Location,
              private httpService: HttpService,
              private router: Router,
              private ngbModalService: SmxModal,
              private appService: AppService,
              private ds: DataStorage) {

  }

  /*
   * 初始化
   */
  ngOnInit() {
    const config = <any> this.ds.get('properties');
    this.version = config.version; // 版本号
    this.platformType = config.type; // 平台类型


    // const parmas = this.getQueryString();
    const url = this.location.path();
    const parmas = getQueryString(url);

    if ((parmas as any).type === 'login') {
      const modalRef = this.ngbModalService.open(LoginModalComponent, {size: 'lg', backdrop: 'static', centered: true, enterKeyId: 'smx-login'});
      modalRef.componentInstance.type = 'Login';
    }

  }
}
