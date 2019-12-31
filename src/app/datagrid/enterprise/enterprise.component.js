"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var toast_model_1 = require("../../common/toast/toast-model");
var enterprise_modal_component_1 = require("../modal/enterprise-modal.component");
var EnterpriseComponent = /** @class */ (function () {
    function EnterpriseComponent(httpService, ngbModalService, toastService) {
        this.httpService = httpService;
        this.ngbModalService = ngbModalService;
        this.toastService = toastService;
        this.pageType = '';
        // 结构数据
        this.treeData = [];
        // treeConfig = {
        //     tools: [
        //         // {name: 'icon-plus', title: '添加', iconClass: 'icon-plus'},
        //         // {name: 'icon-edit', title: '编辑', iconClass: 'icon-edit'},
        //         // {name: 'icon-bin', title: '删除', iconClass: 'icon-bin'}
        //     ],
        //     onToolClick: (e: any, node: any, name: any) => {
        //         if (name === 'icon-plus') {
        //             this.addPlan(e, node);
        //             this.node = node;
        //         } else if (name === 'icon-edit') {
        //             this.editData(e, node)
        //             this.node = node;
        //         } else {
        //             this.deleteData(e, node)
        //             this.node = node;
        //         }
        //     },
        //     onClick: (node?: any) => {
        //         this.openData(node);
        //     }
        // }
        this.clickTimeStatus = true;
    }
    EnterpriseComponent.prototype.ngOnInit = function () {
        // 处理数据
        this.getInitData();
    };
    /**
     * 获取原始方案
     */
    EnterpriseComponent.prototype.getInitData = function () {
        var _this = this;
        this.httpService.getData({ entity_id: this.pageConfig.entity_id }, true, 'execute', '54d3cc4d-28ba-45aa-899a-3b0016ddb55d', '1')
            .subscribe(function (data) {
            if (data.status < 0) {
                return;
            }
            // debugger;
            _this.treeData = data.data;
            // 处理原始数据
            // this.treeData = this.formatData((data as any).data, 'id', 'parent_id', 'children');
            // this.initializeData();
        }, function (error) {
            console.log(error);
        });
    };
    /**
     * 添加方案
     * @param e
     * @param node
     */
    EnterpriseComponent.prototype.addPlan = function (e, node) {
        var _this = this;
        // this.etPage.initData('', node.id, 2);
        var modalRef = this.ngbModalService.open(enterprise_modal_component_1.EnterpriseModalComponent, { backdrop: 'static' });
        modalRef.componentInstance.title = 'node_add';
        modalRef.result.then(function (result) {
            _this.etPage.initData('', result, 2);
        }, function (reason) {
        });
    };
    /**
     * 选择方案
     * @param info
     */
    EnterpriseComponent.prototype.onSelectNode = function (info) {
        var _this = this;
        this.selectedInfo = info;
        if (this.clickTimeStatus) {
            this.etPage.initData(info.id, info.operation_type, 0, info.event_type);
            this.clickTimeStatus = false;
            setTimeout(function () {
                _this.clickTimeStatus = true;
            }, 1000);
        }
        else {
            var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.WARNING, '', '您的点击速度有点跟不上!', 2000);
            this.toastService.toast(toastCfg);
        }
    };
    /**
     * 编辑方案
     * @param info
     */
    EnterpriseComponent.prototype.updateNode = function (info) {
        if (info.event_type === 'system_node' || info.event_type === 'system_ds') {
            var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.WARNING, '', '系统接口不允许修改', 2000);
            this.toastService.toast(toastCfg);
        }
        else {
            this.etPage.initData(info.id, info.operation_type, 1);
        }
    };
    /**
     * 删除方案
     * @param info
     */
    EnterpriseComponent.prototype.deleteNode = function (info) {
        var _this = this;
        if (info.event_type === 'system_node' || info.event_type === 'system_ds') {
            var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.WARNING, '', '系统接口不允许删除', 2000);
            this.toastService.toast(toastCfg);
        }
        else {
            var modalRef = this.ngbModalService.open(enterprise_modal_component_1.EnterpriseModalComponent, { backdrop: 'static' });
            modalRef.componentInstance.title = 'node_delete';
            modalRef.result.then(function (result) {
                _this.httpService.getData({ service_event_id: info.id }, true, 'execute', 'ab59f817-0838-4c98-9510-8f7fe0c490db', '1')
                    .subscribe(function (data) {
                    if (data.status < 0) {
                        return;
                    }
                    for (var i = 0; i < _this.treeData.length; i++) {
                        if (_this.treeData[i].id === info.id) {
                            _this.treeData.splice(i, 1);
                        }
                    }
                    _this.initializeData();
                    var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.SUCCESS, '', '接口已删除', 2000);
                    _this.toastService.toast(toastCfg);
                }, function (error) {
                    console.log(error);
                });
            }, function (reason) {
            });
        }
    };
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
    //             // debugger;
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
    EnterpriseComponent.prototype.initializeData = function () {
        // 默认打开第一条
        this.etPage.initData(this.treeData[0].id, this.treeData[0].operation_type, 0, this.treeData[0].event_type);
        // for (const v of this.treeData) {
        //     if ((v as any).children.length > 0) {
        //         this.etPage.initData((v as any).children[0].id, (v as any).id, 0, (v as any).children[0].event_type);
        //         return;
        //     }
        // }
    };
    /**
     * 添加或修改成功
     */
    EnterpriseComponent.prototype.submitSuccess = function (data) {
        var _this = this;
        if (data.tag === 1) {
            this.node.name = data.data.desc;
        }
        else {
            this.httpService.getData({ entity_id: this.pageConfig.entity_id }, true, 'execute', '54d3cc4d-28ba-45aa-899a-3b0016ddb55d', '1')
                .subscribe(function (res) {
                if (res.status < 0) {
                    return;
                }
                // 处理原始数据
                // this.treeData = this.formatData((res as any).data, 'id', 'parent_id', 'children');
                _this.treeData = res.data;
            }, function (error) {
                console.log(error);
            });
            // const new_node = {
            //     event_type: 'rest_api',
            //     iconClass: false,
            //     id: data.data.service_event_id,
            //     name: data.data.desc,
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
    };
    __decorate([
        core_1.ViewChild('etPage')
    ], EnterpriseComponent.prototype, "etPage");
    __decorate([
        core_1.Input()
    ], EnterpriseComponent.prototype, "pageConfig");
    __decorate([
        core_1.Input()
    ], EnterpriseComponent.prototype, "strucrtorData");
    __decorate([
        core_1.Input()
    ], EnterpriseComponent.prototype, "operationConfig");
    __decorate([
        core_1.Input()
    ], EnterpriseComponent.prototype, "filterConfig");
    EnterpriseComponent = __decorate([
        core_1.Component({
            selector: 'enterprise',
            templateUrl: './enterprise.component.html',
            styleUrls: ['./enterprise.component.scss']
        })
    ], EnterpriseComponent);
    return EnterpriseComponent;
}());
exports.EnterpriseComponent = EnterpriseComponent;
//# sourceMappingURL=enterprise.component.js.map
