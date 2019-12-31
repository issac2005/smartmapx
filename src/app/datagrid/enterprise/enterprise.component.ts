import {Component, OnInit, Input, ViewChild} from '@angular/core';

import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';

import {AppModalComponent} from '../../modal/app-modal.component';
import {GridModalComponent} from '../modal/grid-modal.component';


@Component({
  selector: 'enterprise',
  templateUrl: './enterprise.component.html',
  styleUrls: ['./enterprise.component.scss']
})
export class EnterpriseComponent implements OnInit {
  @ViewChild('etPage', {static: false}) etPage: any;

  @Input() pageConfig: any; // 页面配置
  @Input() strucrtorData: any[]; // 结构信息
  @Input() operationConfig: any; // 操作配置
  @Input() filterConfig: any; // 过滤字段
  pageType = '';


  node: any;
  // 结构数据
  treeData = [];

  clickTimeStatus = true;

  selectedInfo: any;


  constructor(private httpService: HttpService,
              private ngbModalService: SmxModal,
              public toastService: ToastService) {
  }


  ngOnInit() {
    // 处理数据
    this.getInitData();
  }


  /**
   * 获取原始方案
   */
  getInitData() {

    this.httpService.getData({entity_id: this.pageConfig.entity_id},
      true, 'execute', '54d3cc4d-28ba-45aa-899a-3b0016ddb55d', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }
          // ;
          this.treeData = (data as any).data;
          // 处理原始数据
          // this.treeData = this.formatData((data as any).data, 'id', 'parent_id', 'children');
          // this.initializeData();
        },
        error => {
        }
      );
  }

  /**
   * 添加方案
   * @param e
   * @param node
   */
  addPlan() {
    // this.etPage.initData('', node.id, 2);
    const modalRef = this.ngbModalService.open(GridModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-gridModal'});
    modalRef.componentInstance.type = 6;
    modalRef.componentInstance.config = {title: '添加方案'};
    modalRef.result.then((result: any) => {
      this.etPage.initData('', result, 2);
    }, (reason: any) => {
    });
  }


  /**
   * 选择方案
   * @param info
   */
  onSelectNode(e: any, info: any): void {
    this.selectedInfo = info;


    if (this.clickTimeStatus) {
      this.etPage.initData(info.id, info.operation_type, 0, info.event_type);
      this.clickTimeStatus = false;
      setTimeout(() => {
        this.clickTimeStatus = true;
      }, 1000);

    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '您的点击速度有点跟不上!', 2000);
      this.toastService.toast(toastCfg);
    }

  }


  /**
   * 编辑方案
   * @param info
   */
  updateNode(e: any, info: any): void {
    e.stopPropagation();
    if (info.event_type === 'system_node' || info.event_type === 'system_ds') {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '系统接口不允许修改', 2000);
      this.toastService.toast(toastCfg);
    } else {
      this.etPage.initData(info.id, info.operation_type, 1);
    }
  }


  /**
   * 删除方案
   * @param info
   */
  deleteNode(e: any, info: any) {
    e.stopPropagation();
    if (info.event_type === 'system_node' || info.event_type === 'system_ds') {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '系统接口不允许删除', 2000);
      this.toastService.toast(toastCfg);
    } else {

      const modalRef = this.ngbModalService.open(AppModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-app'});
      modalRef.componentInstance.config = {title: '删除方案', view: '是否确认删除此方案?'};
      // modalRef.componentInstance.title = 'node_delete';
      modalRef.result.then((result: any) => {
        this.httpService.getData({service_event_id: info.id},
          true, 'execute', 'ab59f817-0838-4c98-9510-8f7fe0c490db', '1')
          .subscribe(
            data => {
              if ((data as any).status < 0) {
                return;
              }

              for (let i = 0; i < this.treeData.length; i++) {
                if ((this.treeData[i] as any).id === info.id) {
                  this.treeData.splice(i, 1);
                }
              }


              this.initializeData();
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '接口已删除', 2000);
              this.toastService.toast(toastCfg);

            },
            error => {
            }
          );
      }, (reason: any) => {
      });

    }
  }

  // /**
  //  * 编辑方案
  //  * @param e
  //  * @param node
  //  */
  // editData(e: any, node: any) {
  //     // if (node.parent_id !== '') {
  //     // if (node.event_type === 'system_node' || node.event_type === 'system_ds') {
  //     //     const toastCfg = new ToastConfig(ToastType.WARNING, '', '系统接口不允许修改', 2000);
  //     //     this.toastService.toast(toastCfg);
  //     // } else {
  //     this.etPage.initData(node.id, node.operation_type, 1);
  //     // }
  //     // }
  // }


  /**
   * 删除方案
   * @param e
   * @param node
   * @returns {boolean}
   */
  // deleteData(e: any, node: any) {
  //
  //     // if (node.parent_id !== '') {
  //     if (node.event_type === 'system_node' || node.event_type === 'system_ds') {
  //         const toastCfg = new ToastConfig(ToastType.WARNING, '', '系统接口不允许删除', 2000);
  //         this.toastService.toast(toastCfg);
  //     } else {
  //         const modalRef = this.ngbModalService.open(EnterpriseModalComponent, {backdrop: 'static'});
  //         modalRef.componentInstance.title = 'node_delete';
  //         modalRef.result.then((result: any) => {
  //             this.httpService.getData({service_event_id: node.id},
  //                 true, 'execute', 'ab59f817-0838-4c98-9510-8f7fe0c490db', '1')
  //                 .subscribe(
  //                     data => {
  //                         if ((data as any).status < 0) {
  //                             return;
  //                         }
  //
  //                         for (const v of this.treeData) {
  //                             if ((v as any).id === node.parent_id) {
  //                                 const index = (v as any).children.indexOf(node);
  //                                 (v as any).children.splice(index, 1);
  //                             }
  //                         }
  //
  //                         this.initializeData();
  //                         const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '接口已删除', 2000);
  //                         this.toastService.toast(toastCfg);
  //
  //                     },
  //                     error => {
  //                         console.log(error)
  //                     }
  //                 );
  //         }, (reason: any) => {
  //         });
  //
  //     }
  //
  //
  //     // }
  // }


  /**
   * 打开方案
   * @param node
   //  */
  // openData(node: any) {
  //     if (this.clickTimeStatus) {
  //
  //
  //         this.etPage.initData(node.id, node.operation_type, 0, node.event_type);
  //         this.clickTimeStatus = false;
  //         setTimeout(() => {
  //             this.clickTimeStatus = true;
  //         }, 1000)
  //
  //     } else {
  //         const toastCfg = new ToastConfig(ToastType.WARNING, '', '您的点击速度有点跟不上!', 2000);
  //         this.toastService.toast(toastCfg);
  //     }
  //
  //
  // }


  /**
   * 原始数据处理
   * @param a
   * @param idStr
   * @param pidStr
   * @param chindrenStr
   * @return {Array}
   */
  // formatData(a: any, idStr: any, pidStr: any, chindrenStr: any): any {
  //     const r = [], hash: any = {}, id = idStr, pid = pidStr, children = chindrenStr, len = a.length;
  //     let i = 0, j = 0;
  //     for (; i < len; i++) {
  //         hash[a[i][id]] = a[i];
  //     }
  //     for (; j < len; j++) {
  //
  //         const aVal = a[j];
  //         aVal.iconClass = false;
  //         const hashVP = hash[aVal[pid]];
  //         if (hashVP) {
  //
  //             if (!hashVP[children]) {
  //
  //                 hashVP[children] = [];
  //             }
  //
  //             if (aVal.event_type !== 'system_node' && aVal.event_type !== 'system_ds') {
  //                 aVal.tools = [
  //                     {name: 'icon-edit', title: '编辑', iconClass: 'icon-edit'},
  //                     {name: 'icon-bin', title: '删除', iconClass: 'icon-bin'}
  //                 ]
  //             }
  //             aVal.iconClass = false;
  //
  //             hashVP[children].push(aVal);
  //         } else {
  //             // ;
  //             // if (aVal.event_type !== 'system_node') {
  //             // aVal.tools = [{name: 'icon-plus', title: '添加', iconClass: 'icon-plus'}];
  //             if (aVal.event_type !== 'system_node' && aVal.event_type !== 'system_ds') {
  //                 aVal.tools = [
  //                     {name: 'icon-edit', title: '编辑', iconClass: 'icon-edit'},
  //                     {name: 'icon-bin', title: '删除', iconClass: 'icon-bin'}
  //                 ]
  //             }
  //             aVal.iconClass = false;
  //             // } else {
  //             //     aVal.tools = [];
  //             // }
  //
  //             if (!aVal[children]) {
  //                 aVal[children] = [];
  //             }
  //             aVal['isOpen'] = true;
  //             r.push(aVal);
  //         }
  //     }
  //     return r;
  // }


  // 初始化数据
  initializeData() {
    // 默认打开第一条
    this.etPage.initData((this.treeData[0] as any).id, (this.treeData[0] as any).operation_type,
      0, (this.treeData[0] as any).event_type);
    // for (const v of this.treeData) {
    //     if ((v as any).children.length > 0) {
    //         this.etPage.initData((v as any).children[0].id, (v as any).id, 0, (v as any).children[0].event_type);
    //         return;
    //     }
    // }
  }

  /**
   * 添加或修改成功
   */
  submitSuccess(data: any) {
    if (data.tag === 1) { // 修改
      this.node.name = data.data.description;
    } else { // 添加
      this.httpService.getData({entity_id: this.pageConfig.entity_id},
        true, 'execute', '54d3cc4d-28ba-45aa-899a-3b0016ddb55d', '1')
        .subscribe(
          res => {
            if ((res as any).status < 0) {
              return;
            }
            // 处理原始数据
            // this.treeData = this.formatData((res as any).data, 'id', 'parent_id', 'children');
            this.treeData = (res as any).data;
          },
          error => {
          }
        );
      // const new_node = {
      //     event_type: 'rest_api',
      //     iconClass: false,
      //     id: data.data.service_event_id,
      //     name: data.data.description,
      //     parent_id: this.node.id,
      //     sort_num: this.node.id,
      //     tools: [
      //         {name: 'icon-edit', title: '编辑', iconClass: 'icon-edit'},
      //         {name: 'icon-bin', title: '删除', iconClass: 'icon-bin'}
      //     ]
      // }
      //
      // if (this.node.children) {
      //     this.node.children.push(new_node);
      // } else {
      //     this.node.children = [];
      //     this.node.children.push(new_node)
      // }
    }
  }
}
