import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {HttpService} from '../../s-service/http.service';
import {AppService} from '../../s-service/app.service';
import {Location} from '@angular/common';

// 吐司
import {LocalStorage} from '../../s-service/local.storage';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {isEmptyObject} from '../../smx-component/smx-util';

@Component({
  selector: 'app-chome',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {

  classModuleShow: any = {};
  title: string;

  userName: any; // 用户名

  mainListEvent: any;

  fontSize = 14;

  constructor(public location: Location,
              public router: Router,
              private appService: AppService,
              public httpService: HttpService,
              private routerIonfo: ActivatedRoute,
              public toastService: ToastService,
              private ls: LocalStorage) {
    this.mainListEvent = this.appService.mainListEventEmitter.subscribe((value: string) => {

      if (value) {
        const jwt = this.ls.get('id_token');
        this.userName = jwt ? this.ls.get('user_id') : '';
        if (value && value === 'login') {
        } else {
          this.classModuleShow = value;
          const tree = {home: value};
          this.ls.set('smx-data-tree', JSON.stringify(tree));
        }
      }
    });

  }

  /**
   * 初始化
   */
  ngOnInit() {
    if (isEmptyObject(this.classModuleShow)) {
      const tree = this.ls.get('smx-data-tree');
      this.classModuleShow = JSON.parse(tree).home;
    }
    // 根据浏览器窗口大小，动态计算字体大小
    // this.fontSize = Math.round(document.documentElement.clientWidth * 0.01);
    // window.onresize = () => {
    //   this.fontSize = Math.round(document.documentElement.clientWidth * 0.01);
    // };
  }


  ngOnDestroy() {
    this.mainListEvent.unsubscribe();
  }

  /*
  * 获取页面宽度
  * */
  getWinWidth() {
    let width = 0;
    /*for (let i of this.classModule) {
     width += parseInt(i.width) * 160 + 160;
     }*/
    width = this.classModuleShow.width * 1 + 160;
    return width;
  }

  /*
  * 点击每个模块进入相应的子菜单
  * */
  openModule(tile: any) {
    if (tile.type === 'html') {
      window.open(tile.model);
      // window.location.href = tile.model;
    } else if (tile.type === 'component') {
      if (tile.name === '帮助中心') {
        window.open(tile.model);
        return;
      }
      if (tile.disabled) {
        this.toastService.toast(new ToastConfig(ToastType.WARNING, '', '您尚未购买此服务！', 2000));
      } else {
        this.router.navigate([tile.model]);
      }

    }
  }
}
