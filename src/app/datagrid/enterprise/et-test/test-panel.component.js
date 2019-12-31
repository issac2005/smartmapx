"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var grid_component_1 = require("../../grid/grid.component");
var TestPanelComponent = /** @class */ (function () {
    function TestPanelComponent(httpService) {
        this.httpService = httpService;
        this.operation = {
            add: false,
            remove: false,
            update: false
        }; // 该数据拥有的操作权限：新增、删除
        this.btnDisabled = {
            del: false,
            update: false
        };
        this.conjunctionSelect = [
            {
                key: '满足所有条件',
                value: 'and'
            }, {
                key: '任意条件',
                value: 'or'
            }
        ];
        this.totalProperty = 0; // 表格数据总数
    }
    /*
     * 初始化
     */
    TestPanelComponent.prototype.ngOnInit = function () {
        // 右侧查询条件初始化
        this.filterArrayDataTwo = [];
        this.conjunction2 = 'and';
        this.showFilter = true;
        this.dataConfig = { geo_type: 0, desc: '名称' };
        this.geoType = 0;
        // 查询数据操作方式内容
        if (this.eventData.type === 'query' || this.eventData.type === 'selects' || this.eventData.type === 'select') {
            if (this.eventData.service_event_parameters.length > 0) {
                this.dataConfig = this.eventData.service_event_parameters[0];
                this.geoType = this.dataConfig.geo_type;
                if (this.dataConfig.expression) {
                    this.conjunction = this.dataConfig.expression.conjunction ?
                        this.dataConfig.expression.conjunction : 'and';
                    this.filterArrayData = this.dataConfig.expression.filters ?
                        this.dataConfig.expression.filters : [];
                }
            }
            if (this.eventData.service_event_config) {
                this.filterConfig = this.getOpData('filter', this.eventData.service_event_config); // 过滤字段
                this.operationConfig = this.eventData.service_event_config; // 数据操作方式
            }
        }
        else {
            this.getDataSourceInfo(); // 查询过滤信息
            // 查询过滤信息
            // this.getFilterInfo();  // 查询过滤字段
            this.getDataAction(); // 查询数据操作方式
        }
    };
    // 查询数据信息
    TestPanelComponent.prototype.getDataSourceInfo = function () {
        var _this = this;
        // debugger;
        this.httpService.getData({ 'service_event_parameters_id': this.pageConfig.service_event_parameters_id }, true, 'execute', 'daaf02c3-a323-4445-9446-ab3136a77f3c', '1')
            .subscribe(function (data) {
            _this.dataConfig = data.data;
            _this.geoType = _this.dataConfig.geo_type;
            if (_this.dataConfig.expression) {
                _this.conjunction = JSON.parse(_this.dataConfig.expression).conjunction ?
                    JSON.parse(_this.dataConfig.expression).conjunction : 'and';
                _this.filterArrayData = JSON.parse(_this.dataConfig.expression).filters ?
                    JSON.parse(_this.dataConfig.expression).filters : [];
            }
            else {
                _this.conjunction = 'and';
                _this.filterArrayData = [];
            }
        }, function (error) {
            console.log(error);
        });
    };
    /**
     * 查询过滤信息
     */
    // getFilterInfo() {
    //     this.httpService.getData({'service_event_parameters_id': this.pageConfig.service_event_parameters_id},
    //         true, 'execute', '586bc5f4-a7c5-491b-8137-fc399a78bcad', '1')
    //         .subscribe(
    //             data => {
    //                 // debugger;
    //                 this.filterConfig = (data as any).data;
    //             },
    //             error => {
    //             }
    //         );
    // }
    /**
     * 查询数据操作方式内容
     */
    TestPanelComponent.prototype.getDataAction = function () {
        var _this = this;
        this.httpService.getData({ 'entity_id': this.pageConfig.entity_id }, true, 'execute', '62d3a388-c291-43cc-8a5e-7e4e35e5e7cd', '1')
            .subscribe(function (data) {
            _this.operationConfig = [];
            if (_this.eventData) {
                if (_this.eventData.type === 'delete') {
                    _this.operation.remove = true;
                }
                else if (_this.eventData.type === 'update') {
                    _this.operation.update = true;
                }
                else if (_this.eventData.type === 'insert') {
                    _this.operation.add = true;
                }
                var result = _this.getOpData('result', data.data);
                _this.filterConfig = _this.getOpData('filter', data.data);
                _this.operationConfig = _this.eventData.service_event_config.concat(result);
            }
        }, function (error) {
            console.log(error);
        });
    };
    TestPanelComponent.prototype.getOpData = function (type, data) {
        var opdata = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var i = data_1[_i];
            if (i.config_type === type) {
                opdata.push(i);
            }
        }
        return opdata;
    };
    /*
    * 数据信息输入框监测回车事件
    * */
    TestPanelComponent.prototype.inputName = function (e) {
        if (e.keyCode === 13) {
            e.target.blur();
        }
    };
    /*
    * 修改查询方式
    * */
    TestPanelComponent.prototype.changeConjunction = function (e) {
        var postBody = {
            expression: {
                filters: this.filterArrayData,
                conjunction: this.conjunction
            },
            service_event_parameters_id: this.pageConfig.service_event_parameters_id
        };
        this.httpService.getData(postBody, true, 'execute', 'b3edb109-2a6d-4fd0-9cca-8635b6804aad', '1')
            .subscribe(function (data) {
            console.log(data);
        }, function (error) {
            console.log(error);
        });
    };
    TestPanelComponent.prototype.changeConjunction2 = function (e) {
        this.conjunction2 = e;
    };
    /*
    * 右侧查询条件添加
    * */
    TestPanelComponent.prototype.addFilterCon = function () {
        this.filterCom2.addFilter();
    };
    /*
    * 右侧重置按钮查询
    * */
    TestPanelComponent.prototype.removeAllFilter = function () {
        this.filterArrayDataTwo = [];
        this.searchFilter();
        // this.gridCom.cleanSelect();
    };
    /*
    * 右侧搜索按钮点击
    * */
    TestPanelComponent.prototype.searchFilter = function () {
        this.gridCom.getGridData(this.conjunction2, this.filterArrayDataTwo, 0);
        this.gridCom.cleanSelect();
        this.btnDisabled.del = false;
        this.btnDisabled.update = false;
    };
    /*
    * 表格数据删除按钮点击事件
    * */
    TestPanelComponent.prototype.delGridData = function () {
        this.gridCom.removeGridData();
        // this.gridCom.cleanSelect();
    };
    /*
    * 表格数据新增按钮点击事件
    * */
    TestPanelComponent.prototype.addNewData = function () {
        this.gridCom.addNewGriddata();
    };
    /*
    * 修改数据
    * */
    TestPanelComponent.prototype.updateGridData = function () {
        this.gridCom.updateGriddate();
    };
    // 深copy
    TestPanelComponent.prototype.deepCopy = function (arr) {
        var filterData = [];
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var i = arr_1[_i];
            filterData.push({
                service_event_config_id: i.service_event_config_id,
                rule: i.rule,
                value: i.value,
                data_type_id: i.data_type_id
            });
        }
        return filterData;
    };
    // 更新条目总数
    TestPanelComponent.prototype.setTotalProperty = function (e) {
        this.totalProperty = e;
    };
    TestPanelComponent.prototype.test = function () {
        this.geoType = 30;
    };
    __decorate([
        core_1.ViewChild('filter3')
    ], TestPanelComponent.prototype, "filterCom2");
    __decorate([
        core_1.ViewChild(grid_component_1.GridComponent)
    ], TestPanelComponent.prototype, "gridCom");
    __decorate([
        core_1.Input()
    ], TestPanelComponent.prototype, "pageConfig");
    __decorate([
        core_1.Input()
    ], TestPanelComponent.prototype, "eventData");
    TestPanelComponent = __decorate([
        core_1.Component({
            selector: 'test-panel',
            templateUrl: './test-panel.component.html',
            styleUrls: ['./test-panel.component.scss']
        })
    ], TestPanelComponent);
    return TestPanelComponent;
}());
exports.TestPanelComponent = TestPanelComponent;
//# sourceMappingURL=test-panel.component.js.map
