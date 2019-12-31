/**
 * @author  keiferju
 * @time    2019-05-24 12:46
 * @title   标签选择模态框
 * @description
 *
 */
import {NgModule, Component, Input, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {NzTabsModule} from 'ng-zorro-antd';
import {ScrollEventModule, SmxEmptyModule} from '../../smx-component/smx.module';
import {SmxModalUnitModule} from './base/smx-modal-unit.module';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType} from '../smx-toast/toast-model';
import {ToastService} from '../smx-toast/toast.service';
import {toError} from '../../smx-component/smx-util';
import {SmxActiveModal} from '../../smx-component/smx-modal/directive/modal-ref';

@Component({
  selector: 'smx-data-select',
  template: `
    <div class="smx-data-select-modal">
      <smx-modal-unit [title]="smxConfig.title" [smxDisabled]="!checkedItem" (OkEvent)="submit()" [smxWidth]="590">
        <ng-container *ngIf="view">
          <div class="createMapModal">
            <!--        搜索框-->
            <div *ngIf="view.showFilter" class="createMapModal-search">
              <div class="createMapModal-search-key">
                <input type="text" class="createMapModal-search-input smx-control" placeholder="请输入关键字搜索"
                       (keyup.enter)="getKeyList()" [(ngModel)]="searchKey" maxlength="12"/>
                <a class="createMapModal-search-clear" (click)="clearSearch()" title="取消搜索"
                   [ngStyle]="{'opacity': searchKey? 1:0 }">×</a>
              </div>
              <button class="createMapModal-search-btn smx-btn smx-default smx-lg" (click)="getKeyList()">搜索</button>
            </div>
            <!--tabs下拉框-->
            <nz-tabset [nzTabPosition]="tabPosition" [nzType]="titleLayout" (nzSelectChange)="switchList($event)">
              <nz-tab *ngFor="let tab of view.tabs" [nzTitle]="tab.title">
                <div *ngIf="baseMapList && baseMapList.length > 0" class="layer-list" detect-scroll
                     (onScroll)="handleScrollEvent($event)" [bottomOffset]="1">
                  <ul>
                    <ng-container *ngIf="tabLayout === 'card'">
                      <li *ngFor="let v of baseMapList">
                        <div style="background-size: 100% 100%;"
                             (click)="checkedBaseData(v)"
                             [ngClass]="{'layer-list-img-bg-checked': v[tab.id] === checkedItem[tab.id],
            'layer-list-img-bg': v[tab.id] !== checkedItem[tab.id] }"
                             [ngStyle]="{'background-image': v[tab.img]? 'url('+'/uploadfile/'+ v[tab.img] + ')': 'url(./assets/source-img/map_bg.png)'}">
                          <div class="container-center">
                            <div class="container-center-hover">
                              <span>{{v[tab.description]}}</span>
                            </div>
                          </div>
                        </div>
                        <div class="layer-list-footer">
                          <span class="footer-user-title">{{v[tab.name]}}</span>
                          <div *ngIf="view.showCustom"
                               [ngClass]="{'layer-list-footer-custom-ck': v[tab.id] === checkedItem[tab.id],
            'layer-list-footer-custom': v[tab.id] !== checkedItem[tab.id]}">
                            <input type="checkbox" class="data_w_zdy smx-checkbox"
                                   [ngModel]="checkedItem.isCustom"
                                   (ngModelChange)="checkedItem.isCustom = $event;"
                                   value="true">
                            <span class="layer-list-footer-custom-title">自定义</span>
                          </div>
                        </div>
                      </li>
                    </ng-container>
                    <!--                <ng-container *ngIf="tabLayout === 'line'">-->
                    <!--                  <li *ngFor="let v of baseMapList" style="width: 100%">-->
                    <!--                    <div class="smx-pick-data" (click)="checkedBaseData(v)"-->
                    <!--                         [ngStyle]="{'background':v[tab.id] !== checkedItem[tab.id] ? '': 'rgb(238, 238, 238)'}">-->
                    <!--                                  <span class="layer-list-icon"-->
                    <!--                                        [ngStyle]="{'background': 'url('+ getUrl(v.geo_type) + ')'}"></span>-->
                    <!--                      <span class="layer-list-name" title={{v.description}}>-->
                    <!--                                      {{ v.description }}-->
                    <!--                        <span *ngIf="(tag === 'mymap') && (v.type === 'view' ? true : false)" title="不可编辑"-->
                    <!--                              class="layer-list-editor"></span>-->
                    <!--                                      <span *ngIf="(v?.isedit === 1 ? false : true) && (tag === 'sharemap')"-->
                    <!--                                            title="不可编辑"-->
                    <!--                                            class="layer-list-editor"></span>-->
                    <!--                                    </span>-->
                    <!--                      <span class="layer-list-checked"-->
                    <!--                            [ngStyle]="{'opacity': v[keyConfig.view.id] !== checkedItem[keyConfig.view.id] ? 0: 1}"></span>-->
                    <!--                    </div>-->
                    <!--                  </li>-->
                    <!--                </ng-container>-->
                  </ul>
                </div>
                <div *ngIf="!baseMapList || baseMapList.length === 0" class="layer-list">
                  <smx-empty></smx-empty>
                </div>
              </nz-tab>
            </nz-tabset>
          </div>
        </ng-container>
      </smx-modal-unit>
    </div>
  `,
  styleUrls: ['./base/smx-modal-unit.modal.scss']
})
export class SmxDataSelectModalComponent implements OnInit {
  @Input() smxConfig: any;
  @Input() smxData: any;

  view: View;
  titleLayout = 'card';
  tabPosition = 'top';
  tabLayout = 'card';

  searchKey: any; // 关键字
  baseMapList = [];
  checkedItem: any;


  // 分页数据
  everyPageNum = 12;
  pageNum = 1;
  totalPage = 0;


  // 当前索引
  currentIndex = 0;

  constructor(public activeModal: SmxActiveModal, public httpService: HttpService, public toastService: ToastService) {
  }

  ngOnInit() {
    this.view = this.smxConfig.view;

    if (this.view) {
      if (this.view.titleLayout) {
        this.titleLayout = this.view.titleLayout;
      }

      if (this.view.tabPosition) {
        this.tabPosition = this.view.tabPosition;
      }

      if (this.view.tabLayout) {
        this.tabLayout = this.view.tabLayout;
      }
    }

    this.initData();
  }


  /**
   * 初始化数据(数目)
   */

  initData() {
    if (this.view.showNum) {
      for (let i = 0; i < this.view.tabs.length; i++) {
        this.getNum(i);
      }
    }

    this.getBaseList(this.currentIndex);
  }


  /**
   * 滚动加载
   * @param e
   */
  handleScrollEvent(event: any) {
    if (event.isReachingBottom) {
      if (!this.searchKey || this.searchKey === '') {
        if (this.everyPageNum * this.pageNum < this.totalPage) {
          this.pageNum = this.pageNum + 1;
          this.getBaseList();
        }
      }
    }

  }


  /**
   * 选中底图
   * @param e
   */
  public checkedBaseData(v: any) {
    if (this.checkedItem) {
      this.checkedItem['isCustom'] = false;
    }
    this.checkedItem = v;
    this.checkedItem['isCustom'] = false;

  }


  /**
   * 清除搜索
   */
  clearSearch() {
    this.searchKey = '';
    this.getBaseList(this.currentIndex);
  }


  /**
   * 切换分类
   * @param tag
   */
  public switchList(e: any) {
    this.currentIndex = e.index;

    if (this.searchKey && this.searchKey !== '') { // 带有关键字
      this.getKeyList(this.currentIndex);
    } else { // 不带关键字
      this.everyPageNum = 12;
      this.pageNum = 1;
      this.totalPage = 0;

      this.getBaseList(this.currentIndex);
    }

  }


  /**
   * 关键字查询
   * @param tabIndex   索引,当前索引
   */
  getKeyList(tabIndex = this.currentIndex) {
    let tag: any;
    let url: any;

    if (this.view.tabs[tabIndex]) {
      tag = this.view.tabs[tabIndex].tag;
      url = this.view.tabs[tabIndex].filter;
    } else {
      return;
    }
    this.httpService.getData({key: this.searchKey, type: tag}, true, 'execute', url, 'layer')
      .subscribe(
        data => {
          this.totalPage = (data as any).data.totalProperty;
          if (this.totalPage > 0) {
            this.checkedItem = (data as any).data.root[0];
            this.baseMapList = (data as any).data.root;
          } else {
            this.checkedItem = null;
            this.baseMapList = [];
          }


        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );

  }


  /**
   * todo 存在重复请求问题,后期优化
   * 获取列表内容
   * @param tabIndex   索引,默认当前
   * @param start   开始了条目  默认0
   * @param limit  查询数量   默认当前
   */
  getBaseList(tabIndex = this.currentIndex, start = 0, limit = this.everyPageNum * this.pageNum) {

    let tag: any;
    let url: any;

    if (this.view.tabs[tabIndex]) {
      tag = this.view.tabs[tabIndex].tag;
      url = this.view.tabs[tabIndex].url;
    } else {
      return;
    }


    const body = {
      start: start,
      limit: limit,
      type: tag
    };
    this.httpService.getData(body, true, 'execute', url, 'layer')
      .subscribe(
        data => {
          this.totalPage = (data as any).data.totalProperty;
          if (this.totalPage > 0) {
            this.checkedItem = (data as any).data.root[0];
            this.baseMapList = (data as any).data.root;
          } else {
            this.checkedItem = null;
            this.baseMapList = [];
          }


        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  /**
   *
   * @param tabIndex
   */
  getNum(tabIndex) {

    let tag: any;
    let url: any;

    if (this.view.tabs[tabIndex]) {
      tag = this.view.tabs[tabIndex].tag;
      url = this.view.tabs[tabIndex].url;
    } else {
      return;
    }

    this.httpService.getData({start: 0, limit: 1, type: tag}, true, 'execute', url, 'layer')
      .subscribe(
        data => {
          this.view.tabs[tabIndex].title = `${this.view.tabs[tabIndex].title}(${(data as any).data.totalProperty})`;
        },
        error => {
          toError(error);
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求出现未知错误,请稍后再试！', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  /**
   * 提交
   */
  submit() {
    this.activeModal.close({checkedItem: this.checkedItem, tag: this.currentIndex});
  }
}

// 类名限制
export class View {
  tabs: any[];
  titleLayout: string;
  tabPosition: string;
  tabLayout: string;
  showFilter: boolean;
  showCustom: boolean;
  showNum: number;
}

@NgModule({
  declarations: [SmxDataSelectModalComponent],
  imports: [CommonModule, FormsModule, NzTabsModule, ScrollEventModule, SmxModalUnitModule, SmxEmptyModule],
  entryComponents: [SmxDataSelectModalComponent]

})
export class SmxDataTabsModalModule {
}
