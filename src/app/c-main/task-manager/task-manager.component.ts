import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppService} from '../../s-service/app.service';
import {HttpService} from '../../s-service/http.service';
import {AppModalComponent} from '../../modal/app-modal.component';
import {SmxModal} from '../../smx-component/smx-modal/directive/smx-modal';
import {TaskManageService} from './task-manage.service';
@Component({
  selector: 'task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.scss']
})
export class TaskManagerComponent implements OnInit, OnDestroy {
  // 任务栏
  taskShow: boolean;
  loadingNum = 0;
  failedNum = 0;
  finishNum = 0;
  mouseEvent: any; // 鼠标事件
  tmServiceEvent: any; // 任务服务
  taskNum: any; // 任务数量
  taskTitle = '';
  taskItems: any[] = [];

  constructor(private ngbModalService: SmxModal,
              public tmService: TaskManageService,
              private appService: AppService,
              private httpService: HttpService) {
    /**
     * 鼠标监听事件
     */
    this.mouseEvent = this.appService.mouseEventEmitter.subscribe((value: any[]) => {
      if (this.taskShow) {
        this.taskShow = false;
      }
    });

    /**
     * 鼠标监听事件
     */
    this.tmServiceEvent = this.tmService.tms.subscribe((value: any) => {
      if (value === 'add') {
        this.requestTask();
      }

      if (value === 'removeAll') {
        this.removeTasks();
      }
    });
  }

  ngOnInit() {
    this.requestTask();
  }


  /**
   * 打开任务栏
   */
  openTask(e: any) {
    e.stopPropagation();
    this.taskShow = true;
  }


  ngOnDestroy() {
    this.mouseEvent.unsubscribe();
    this.tmServiceEvent.unsubscribe();
  }

  /**
   * 删除任务
   */
  removeTask(id?: any) {
    const modalRef = this.ngbModalService.open(AppModalComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-app'});
    modalRef.componentInstance.config = {title: '清除任务', view: '您确定要清除此任务?'};
    modalRef.result.then((result: any) => {
      if (id) {
        this.httpService.getData({user_task_id: id}, true, 'etl', 'delTask', 'tm').subscribe(data => {
          this.requestTask();
        }, error => {

        });
      }
    }, (reason: any) => {
    });

  }

  /**
   * 删除全部已完成任务
   */
  removeTasks() {
    const modalRef = this.ngbModalService.open(AppModalComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-app'});
    modalRef.componentInstance.config = {title: '清除任务', view: '您确定要清除所有已完成任务吗?'};
    modalRef.result.then((result: any) => {
      this.httpService.getData({}, true, 'etl', 'clearTaskList', 'tm').subscribe(data => {

        if ((data as any).status < 0) {
          return;
        }
        this.requestTask();

      }, error => {
      });
    }, (reason: any) => {
    });


  }


  /**
   * 请求任务列表
   */
  requestTask() {
    this.httpService.getData({}, true, 'etl', 'getTaskList', 'tm').subscribe(data => {
      if ((data as any).status < 0) {
        return;
      }
      if ((data as any).data && (data as any).data.length >= 0) {
        this.taskItems = (data as any).data;

        let fan = 0, fin = 0, lon = 0;
        for (const v of this.taskItems) {
          v.status = parseInt(v.status, 10);
          if (v.complation_degreetask) {
            v.complation_degreetask = parseInt(v.complation_degreetask, 10);
          }
          if (v.status === -1 || v.status === '-1') {
            fan++;
          }
          if (v.status === 1 || v.status === '1') {
            lon++;
          }
          if (v.status === 0 || v.status === '0') {
            lon++;
          }
          if (v.status === 100 || v.status === '100') {
            fin++;
          }
        }
        this.failedNum = fan;
        this.finishNum = fin;
        this.taskNum = this.loadingNum = lon;
        this.taskTitle = '当前有' + this.loadingNum + '项任务正在执行中';
        if (this.taskNum > 99) {
          this.taskNum = '99+';
        }
        //任务未结束，阻止循环请求
        if (this.loadingNum > 0) {
          setTimeout(() => {
            this.requestTask();
          }, 3000);
        }
      }


    }, error => {

    });
  }
}
