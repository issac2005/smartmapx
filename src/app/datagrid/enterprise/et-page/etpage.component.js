"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var enterprise_modal_component_1 = require("../../modal/enterprise-modal.component");
var EtPageComponent = /** @class */ (function () {
    function EtPageComponent(httpService, ngbModalService, toastService) {
        this.httpService = httpService;
        this.ngbModalService = ngbModalService;
        this.toastService = toastService;
        this.initializeData = new core_1.EventEmitter();
        this.submitSuccess = new core_1.EventEmitter();
        this.filterArrayData = [];
        // filterConfig: any[];
        this.conjunctionSelect = [
            {
                label: '满足所有条件',
                value: 'and'
            }, {
                label: '任意条件',
                value: 'or'
            }
        ];
        this.selectTwoGroup = [
            {
                name: '等于',
                operator: '=',
                data_type_rule_id: '4f1392a2-491f-42b3-81ff-73f3f98e555b'
            }, {
                name: '包含',
                operator: 'like',
                data_type_rule_id: '22c85efb-357e-4336-a31a-cc28921c26de'
            }, {
                name: '以开头',
                operator: 'start',
                data_type_rule_id: '138dff59-787a-4ca5-a3e2-cbfdeebabd0d'
            }, {
                name: '以结尾',
                operator: 'end',
                data_type_rule_id: 'f702c1c8-9c4f-498c-8079-9e902a4ad340'
            }, {
                name: '正则匹配',
                operator: 'rex',
                data_type_rule_id: '5b0c8b8e-c8b3-4285-97a4-ed7ae83c92e6'
            }, {
                name: '大于',
                operator: 'rex',
                data_type_rule_id: '7a70bbfb-adc8-4478-a843-b8fca82cbd2e'
            }, {
                name: '小于',
                operator: 'rex',
                data_type_rule_id: '98d5c4e3-bf58-48d8-9421-5543244da610'
            }, {
                name: '值替换',
                operator: 'rex',
                data_type_rule_id: 'ef27a63c-5113-4e39-aa38-16918324235a'
            } /*, {
                name: '区间',
                operator: 'rex',
                data_type_rule_id: '596dd14b-a9e1-4344-90c0-dce71a530c2e'
            }*/
        ];
        this.checkEditItemId = '';
        this.checkEditItemId2 = '';
        this.checkEditItemId3 = '';
        this.loadStatus = false; // 加载数据状态
    }
    EtPageComponent.prototype.ngOnInit = function () {
        this.operationSource = [];
        for (var _i = 0, _a = this.strucrtorData; _i < _a.length; _i++) {
            var v = _a[_i];
            v['alias'] = v.name;
            this.operationSource.push(v);
        }
    };
    EtPageComponent.prototype.getRuleTitle = function (id) {
        for (var _i = 0, _a = this.selectTwoGroup; _i < _a.length; _i++) {
            var v = _a[_i];
            if (v.data_type_rule_id === id) {
                return v.name;
            }
        }
    };
    EtPageComponent.prototype.getDescTitle = function (id) {
        for (var _i = 0, _a = this.filterConfig; _i < _a.length; _i++) {
            var v = _a[_i];
            if (v.service_event_config_id === id) {
                // debugger;
                return v.desc;
            }
        }
    };
    // 初始化参数
    EtPageComponent.prototype.initData = function (id, InterfaceType, operationType, permission) {
        var _this = this;
        this.loadStatus = false;
        this.pageType = InterfaceType; // 接口类型
        this.operationType = operationType; // 操作类型
        this.service_event_id = id;
        this.permission = permission;
        // 初始化数据
        this.operation = { key: [], oldKey: [] };
        this.operationTwo = { key: [], oldKey: [] };
        if (this.operationType !== 2) {
            this.httpService.getData({ service_event_id: this.service_event_id }, true, 'execute', 'fc6cfb1a-253b-4bb6-bfe0-33a13dab9dbc', '1')
                .subscribe(function (data) {
                if (data.status < 0) {
                    return;
                }
                _this.event_data = data.data.event_data;
                // 数据整理
                _this.reorganizeData();
            }, function (error) {
                console.log(error);
            });
        }
        else {
            // this.operationType = 1;
            this.event_data = {
                entity_id: this.pageConfig.entity_id,
                service_event_parameters: [],
                service_event_config: [],
                type: InterfaceType
            };
            this.reorganizeData();
        }
    };
    // 整理数据
    EtPageComponent.prototype.reorganizeData = function () {
        // 数据源操作配置
        switch (this.pageType) {
            case 'query':
            case 'select':
            case 'selects':
                if (this.event_data.service_event_parameters[0]) {
                    this.conjunction = this.event_data.service_event_parameters[0].expression.conjunction ?
                        this.event_data.service_event_parameters[0].expression.conjunction : 'and';
                    this.filterArrayData = this.event_data.service_event_parameters[0].expression.filters ?
                        this.event_data.service_event_parameters[0].expression.filters : [];
                }
                else {
                    this.conjunction = 'and';
                    this.filterArrayData = [];
                }
                break;
        }
        // 返回
        for (var _i = 0, _a = this.event_data.service_event_config; _i < _a.length; _i++) {
            var v = _a[_i];
            if (v.config_type === 'result' || v.config_type === 'delete' || v.config_type === 'insert' || v.config_type === 'update') {
                this.operation.key.push(v);
                this.operation.oldKey.push(v);
            }
            else if (v.config_type === 'filter') {
                this.operationTwo.key.push(v);
                this.operationTwo.oldKey.push(v);
            }
            else if (v.config_type === 'updateKey') {
                this.operationTwo.key.push(v);
                this.operationTwo.oldKey.push(v);
            }
        }
        this.loadStatus = true;
    };
    // 添加字段key
    EtPageComponent.prototype.insertKey = function (tag, data, type) {
        switch (tag) {
            case 'query':
                for (var _i = 0, _a = this.operationSource; _i < _a.length; _i++) {
                    var l = _a[_i];
                    l['config_type'] = 'result';
                }
                break;
            default:
                for (var _b = 0, _c = this.operationSource; _b < _c.length; _b++) {
                    var l = _c[_b];
                    l['config_type'] = type;
                }
        }
        var modalRef = this.ngbModalService.open(enterprise_modal_component_1.EnterpriseModalComponent, { backdrop: 'static', keyboard: false });
        modalRef.componentInstance.title = tag;
        modalRef.componentInstance.modalData = this.operationSource;
        modalRef.componentInstance.operationData = data.key;
        modalRef.result.then(function (result) {
            data.key = result;
        }, function (reason) {
        });
    };
    // 删除字段Key
    EtPageComponent.prototype.deleteKey = function (n, keyData) {
        var index = keyData.key.indexOf(n);
        keyData.key.splice(index, 1);
    };
    // 添加请求参数
    EtPageComponent.prototype.addCondition = function (tag) {
        this.filterArrayData.push({
            data_type_id: this.filterConfig[0].data_type_id,
            rule: '4f1392a2-491f-42b3-81ff-73f3f98e555b',
            service_event_config_id: this.filterConfig[0].service_event_config_id,
            value: ''
        });
    };
    // 删除请求参数
    EtPageComponent.prototype.removeCondition = function (v, data) {
        var index = data.indexOf(v);
        data.splice(index, 1);
        // console.log(index);
    };
    // 切换操作模式
    EtPageComponent.prototype.operationMode = function (tag) {
        var _this = this;
        // debugger;
        if (tag === 'switch') {
            this.operationType = 1;
        }
        else if (tag === 'close') {
            var modalRef = this.ngbModalService.open(enterprise_modal_component_1.EnterpriseModalComponent, { backdrop: 'static', keyboard: true });
            modalRef.componentInstance.title = 'isSave';
            modalRef.result.then(function (result) {
                _this.submit(result);
            }, function (reason) {
                _this.submit('cancel'); // 取消修改
            });
        }
    };
    // 过滤条件切换
    EtPageComponent.prototype.filterChanged = function (e, val) {
        for (var _i = 0, _a = this.filterConfig; _i < _a.length; _i++) {
            var v = _a[_i];
            if (v.service_event_config_id === e) {
                val.data_type_id = v.data_type_id;
                return;
            }
        }
    };
    EtPageComponent.prototype.transformData = function (tag, baseData) {
        var data;
        switch (tag) {
            case 'query':
            case 'delete':
            case 'insert':
            case 'update':
                this.operation.key = [];
                data = this.operation.key;
                break;
            case 'updateKey':
                this.operationTwo.key = [];
                data = this.operationTwo.key;
                break;
        }
        for (var _i = 0, baseData_1 = baseData; _i < baseData_1.length; _i++) {
            var v = baseData_1[_i];
            data.push(v);
        }
    };
    // 选择条目
    EtPageComponent.prototype.checkedItem = function (id, tag) {
        if (tag === 1) {
            this.checkEditItemId = id;
        }
        else if (tag === 2) {
            this.checkEditItemId2 = id;
        }
        else if (tag === 3) {
            this.checkEditItemId3 = id;
        }
    };
    // 取消条目选择
    EtPageComponent.prototype.cancelEdit = function () {
        this.checkEditItemId = '';
        this.checkEditItemId2 = '';
        this.checkEditItemId3 = '';
    };
    // 操作日志
    EtPageComponent.prototype.operationLog = function (tag, e) {
        switch (tag) {
        }
    };
    // 提交
    EtPageComponent.prototype.submit = function (flag) {
        var _this = this;
        if (flag === 'submit') {
            if (this.pageType === 'query' || this.pageType === 'selects' || this.pageType === 'select') {
                for (var i = 0; i < this.filterArrayData.length; i++) {
                    if (this.filterArrayData[i].value === null || this.filterArrayData[i].value === '') {
                        this.filterArrayData.splice(i, 1);
                    }
                }
                this.event_data.service_event_config = this.operation.key.concat(this.filterConfig);
            }
            else if (this.pageType === 'update') {
                this.event_data.service_event_config = this.operation.key.concat(this.operationTwo.key);
            }
            else {
                this.event_data.service_event_config = this.operation.key;
            }
            this.httpService.getData(this.event_data, true, 'etl', 'inOrUpServiceEvent', '1')
                .subscribe(function (data) {
                if (data.status > 0) {
                    var res = {
                        data: _this.event_data,
                        tag: _this.operationType
                    };
                    _this.submitSuccess.emit(res); // 修改添加成功
                    _this.operationType = 0; // 切换查看模式
                }
            }, function (error) {
                console.log(error);
            });
        }
        else if (flag === 'cancel') {
            if (this.operationType === 1) {
                switch (this.pageType) {
                    case 'query':
                    case 'delete':
                    case 'insert':
                        this.transformData('query', this.operation.oldKey);
                        break;
                    case 'update':
                        this.transformData('update', this.operation.oldKey);
                        this.transformData('updateKey', this.operationTwo.oldKey);
                        break;
                }
            }
            else if (this.operationType === 2) {
                this.initializeData.emit();
            }
            this.operationType = 0; // 切换查看模式
        }
    };
    /**
     * 测试接口
     */
    EtPageComponent.prototype.testInterface = function () {
        var modalRef = this.ngbModalService.open(enterprise_modal_component_1.EnterpriseModalComponent, { backdrop: 'static', keyboard: true });
        modalRef.componentInstance.title = 'test';
        modalRef.componentInstance.pageConfig = this.pageConfig;
        modalRef.componentInstance.eventData = this.event_data;
        modalRef.result.then(function (result) {
        }, function (reason) {
        });
    };
    __decorate([
        core_1.Input()
    ], EtPageComponent.prototype, "strucrtorData");
    __decorate([
        core_1.Input()
    ], EtPageComponent.prototype, "operationConfig");
    __decorate([
        core_1.Input()
    ], EtPageComponent.prototype, "pageConfig");
    __decorate([
        core_1.Input()
    ], EtPageComponent.prototype, "filterConfig");
    __decorate([
        core_1.Output()
    ], EtPageComponent.prototype, "initializeData");
    __decorate([
        core_1.Output()
    ], EtPageComponent.prototype, "submitSuccess");
    EtPageComponent = __decorate([
        core_1.Component({
            selector: 'et-page',
            templateUrl: './etpage.component.html',
            styleUrls: ['./etpage.component.scss']
        })
    ], EtPageComponent);
    return EtPageComponent;
}());
exports.EtPageComponent = EtPageComponent;
//# sourceMappingURL=etpage.component.js.map
