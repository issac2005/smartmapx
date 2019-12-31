"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var del_data_modal_component_1 = require("../modal/del-data-modal.component");
var FilterComponent = (function () {
    function FilterComponent(httpService, ngbModalService) {
        this.httpService = httpService;
        this.ngbModalService = ngbModalService;
        this.filterArray = [];
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
    }
    /*
     * 初始化
     */
    FilterComponent.prototype.ngOnInit = function () {
        // this.filterArray = [];
        var info = localStorage.getItem('data_info') || '';
        this.pageConfig = JSON.parse(info);
        this.selectTwoNow = this.selectTwoGroup[0].data_type_rule_id;
        //
    };
    /* InitSelect() {
         setTimeout(() => {
             if (this.filterData.length > 0) {
                 this.selectOneNow = this.filterData[0].service_event_config_id;
             }
         }, 10);
     }*/
    /*
    * 删除过滤条件
    * */
    FilterComponent.prototype.remove = function (index) {
        var _this = this;
        if (this.filterWay === 'left') {
            this.ngbModalService.open(del_data_modal_component_1.DelDataModalComponent, {
                backdrop: 'static'
            }).result.then(function (result) {
                if (result === 'submit') {
                    // console.log(this.filterArray)
                    _this.filterArray.splice(index, 1);
                    _this.saveData();
                }
            }, function (reason) {
                console.log(reason);
            });
        }
        else if (this.filterWay === 'right') {
            this.filterArray.splice(index, 1);
        }
        else if (this.filterWay === 'split_and') {
            this.filterArray.splice(index, 1);
        }
        else if (this.filterWay === 'split_or') {
            this.filterArray.splice(index, 1);
        }
    };
    /*
    * 新增过滤条件
    * */
    FilterComponent.prototype.addFilter = function () {
        if (this.filterArray.length >= 20) {
            alert('最多添加20个查询条件！');
            return;
        }
        if (this.filterData.length > 0) {
            this.filterArray.push({
                service_event_config_id: this.filterData[0].service_event_config_id,
                rule: this.selectTwoGroup[0].data_type_rule_id,
                value: '',
                data_type_id: 'postgres_character_varying'
            });
        }
    };
    /*
    * 保存修改后的信息
    * */
    FilterComponent.prototype.saveData = function () {
        var postBody = {
            expression: {
                filters: this.filterArray,
                conjunction: this.conjunction
            },
            service_event_parameters_id: this.pageConfig.service_event_parameters_id
        };
        this.httpService.getData(postBody, true, 'execute', 'b3edb109-2a6d-4fd0-9cca-8635b6804aad', '1')
            .subscribe(function (data) {
            console.log(data);
        }, function (error) {
        });
    };
    /*
    * 修改filter数据
    * */
    FilterComponent.prototype.changeFilter = function (e, v) {
        // debugger;
        for (var _i = 0, _a = this.filterData; _i < _a.length; _i++) {
            var item = _a[_i];
            if (e === item.service_event_config_id) {
                this.filterArray[this.filterArray.map(function (filter) {
                    return filter.service_event_config_id;
                }).indexOf(e)].data_type_id = item.data_type_id;
            }
        }
        if (this.filterWay === 'left') {
            for (var _b = 0, _c = this.filterArray; _b < _c.length; _b++) {
                var item = _c[_b];
                if (item.data_type_id === 'postgres_integer' || item.data_type_id === 'postgres_numeric' ||
                    item.data_type_id === 'postgres_bigint' || item.data_type_id === 'postgres_smallint') {
                    item.value = Number(item.value);
                }
                if (item.value === '') {
                    return;
                }
            }
            this.saveData();
        }
    };
    return FilterComponent;
}());
__decorate([
    core_1.Input()
], FilterComponent.prototype, "filterArray");
__decorate([
    core_1.Input()
], FilterComponent.prototype, "conjunction");
__decorate([
    core_1.Input()
], FilterComponent.prototype, "filterData");
__decorate([
    core_1.Input()
], FilterComponent.prototype, "filterWay");
FilterComponent = __decorate([
    core_1.Component({
        selector: 'c-filter',
        templateUrl: './filter.component.html',
        styleUrls: ['./filter.component.scss']
    })
], FilterComponent);
exports.FilterComponent = FilterComponent;
//# sourceMappingURL=filter.component.js.map