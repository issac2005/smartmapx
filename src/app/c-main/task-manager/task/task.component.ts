import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SmxModal} from '../../../smx-component/smx-modal/smx-modal.module';
import {AppModalComponent} from '../../../modal/app-modal.component';
import {Router} from '@angular/router';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';
@Component({
  selector: 'task-item',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
  @Input() task: any;
  @Input() submit: any;
  @Output() removeEvent = new EventEmitter();

  taskName: any;

  constructor(private ngbModalService: SmxModal,
              public toastService: ToastService,
              public router: Router) {
  }


  ngOnInit() {
    try {
      const content = JSON.parse(this.task.content);
      this.taskName = content.entity_desc || this.task.task_name;
    } catch (e) {
      this.taskName = this.task.task_name;
    }

  }


  /**
   * 移除条目
   * @param id
   */
  removeItem(id: any) {
    this.removeEvent.emit(id);
  }

  /**
   * 显示错误信息
   * @param error
   */
  showFailedInfo() {
    try {
      const info = JSON.parse(this.task.content);
      const modalRef = this.ngbModalService.open(AppModalComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-app'});
      modalRef.componentInstance.config = {title: '错误信息', view: info.error || '未能获取到具体错误信息', footer: 1};

    } catch (e) {
      const toastCfg = new ToastConfig(ToastType.ERROR, '', '未查询到具体错误信息！', 2000);
      this.toastService.toast(toastCfg);
    }


  }


  /**
   * 跳转路由
   */
  openComponent() {
    if (this.task && this.task.operation && this.task.model) {
      try {
        const info = JSON.parse(this.task.content);

        // 地址匹配
        if (this.task.model === 'dataconvert' && this.task.operation === 'geocoding' && info.entity_id) {
          this.router.navigate(['/app/data'], {queryParams: {type: 4, entity_id: info.entity_id}});
        }

        if (this.task.model === 'dataconvert' && this.task.operation === 'regeocoding' && info.entity_id) {
          this.router.navigate(['/app/data'], {queryParams: {type: 4, entity_id: info.entity_id}});
        }

        // 数据入库
        if (this.task.model === 'etl' && this.task.operation === 'setEntityColumns' && info.entity_id) {
          this.router.navigate(['/app/data'], {queryParams: {type: 4, entity_id: info.entity_id}});
        }

        // 数据入库
        if (this.task.model === 'etl' && this.task.operation === 'setEntityRelation' && info.entity_id) {
          this.router.navigate(['/app/data'], {queryParams: {type: 4, entity_id: info.entity_id}});
        }
        // 数据入库(shp)
        if (this.task.model === 'ShpfileService' && this.task.operation === 'readShpfile' && info.entity_id) {
          this.router.navigate(['/app/data'], {queryParams: {type: 4, entity_id: info.entity_id}});
        }

        // 数据转换
        if (this.task.model === 'etl' && this.task.operation === 'convertGeo' && info.entity_id) {
          this.router.navigate(['/app/data'], {queryParams: {type: 4, entity_id: info.entity_id}});
        }

        // 图标上传
        if (this.task.model === 'etl' && this.task.operation === 'addTask') {
          this.router.navigate(['/app/icon']);
        }
      } catch (e) {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '未查询到具体信息！', 2000);
        this.toastService.toast(toastCfg);
      }
    } else {
      const toastCfg = new ToastConfig(ToastType.ERROR, '', '未能识别具体模块,请您手动进入！', 2000);
      this.toastService.toast(toastCfg);
    }
  }

  /**
   * 获取进度提示语
   * @param status
   */
  getTip(status: any) {

    let title = '任务准备中';
    switch (status) {
      case -1:
        title = '失败';
        break;
      case 1:
        title = '中';
        break;
      case 100:
        title = '完成';
        break;
    }
    return title;
  }
}
