/**
 * Created by LLCN on 2018/9/14 16:08.
 *
 * name: app-modal.component.ts
 * description: 全局模态框组件
 */

import {Component, Input, OnInit, AfterViewInit, Output, EventEmitter} from '@angular/core';

import {HttpService} from '../s-service/http.service';
import {SmxActiveModal, SmxModal} from '../smx-component/smx-modal/smx-modal.module';

@Component({
  selector: 'app-modal',
  templateUrl: './app-modal.component.html',
  styleUrls: ['./app-modal.component.scss']
})

export class AppModalComponent implements OnInit, AfterViewInit {
  @Input() modalType: any;  // 模态框类型
  @Input() type: any; // 操作类型
  @Input() config: any;  // 配置文件
  @Input() modalData: any; // 数据
  @Output() outEvent = new EventEmitter();

  constructor(public activeModal: SmxActiveModal,
              public httpService: HttpService) {

  }


  ngOnInit() {
  }


  ngAfterViewInit() {
  }
}
