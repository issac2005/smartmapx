"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var toast_model_1 = require("../common/toast/toast-model");
var Chart = require('chart.js');
var AccessComponent = /** @class */ (function () {
    function AccessComponent(httpService, utils, toastService) {
        this.httpService = httpService;
        this.utils = utils;
        this.toastService = toastService;
        this.data = [];
    }
    /*
     * 初始化
     * */
    AccessComponent.prototype.ngOnInit = function () {
        this.selectedCity1 = [];
        this.accessStep = 100;
        this.getAccessModule();
        this.showType = 1;
        this.cities1 = [];
        this.getTimeStep();
        this.selectedCity2 = this.cities2[0].value;
    };
    AccessComponent.prototype.changeTime = function (e) {
        this.getMonitorData();
    };
    AccessComponent.prototype.getMonitorData = function () {
        var _this = this;
        var postData = {
            filters: [
                {
                    service_event_config_id: '51853b3b-0619-42b1-b273-761049932a06',
                    rule: 'b7599da3-26e6-4c6c-a712-15d9f248da63',
                    value: this.selectedCity1
                }, {
                    service_event_config_id: '48bd594b-9345-4a09-a05b-d0eba9ad160e',
                    rule: '596dd14b-a9e1-4344-90c0-dce71a530c2e',
                    value: this.selectedCity2
                }, {
                    service_event_config_id: '4f264e90-b15f-41a5-87e3-78ffd58bce39',
                    rule: 'ef27a63c-5113-4e39-aa38-16918324235a',
                    value: this.accessStep
                }
            ],
            limit: 0,
            conjunction: 'and'
        };
        this.httpService.getData(postData, true, 'execute', 'bc49497e-cc61-4f42-bcdf-22fca4c4b5df', '1')
            .subscribe(function (data) {
            if (data.status <= 0) {
                var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
                _this.toastService.toast(toastCfg);
                return;
            }
            if (_this.selectedCity1.length <= 0) {
                return;
            }
            var showData = [];
            for (var _i = 0, _a = _this.selectedCity1; _i < _a.length; _i++) {
                var j = _a[_i];
                showData.push({
                    label: _this.cities1[_this.cities1.map(function (select) {
                        return select.value;
                    }).indexOf(j)].label,
                    name: j,
                    labelData: [],
                    valueData: [],
                    useLabel: [],
                    useValue: []
                });
            }
            for (var i in data.data.root) {
                if (data.data.root[i]) {
                    for (var _b = 0, showData_1 = showData; _b < showData_1.length; _b++) {
                        var j = showData_1[_b];
                        if (j.name === data.data.root[i].component_instance_event_id) {
                            j.labelData.push(data.data.root[i].reqtime);
                            j.valueData.push(data.data.root[i].count);
                        }
                    }
                }
            }
            var TIME_MAX = Math.max.apply(Math, data.data.root.map(function (arr) {
                return arr.reqtime;
            }));
            var TIME_MIN = Math.min.apply(Math, data.data.root.map(function (arr) {
                return arr.reqtime;
            }));
            var TIME_ARRAY = [];
            for (var i = 0; i < (TIME_MAX - TIME_MIN) / _this.accessStep; i++) {
                TIME_ARRAY.push(TIME_MIN + (i * _this.accessStep));
            }
            for (var _c = 0, showData_2 = showData; _c < showData_2.length; _c++) {
                var n = showData_2[_c];
                for (var i = 0; i < n.labelData.length + 1; i++) {
                    if (i === 0) {
                        for (var j = 0; j < (n.labelData[i] - TIME_MIN) / _this.accessStep; j++) {
                            n['useLabel'].push(TIME_MIN + j * _this.accessStep);
                            n['useValue'].push(0);
                        }
                        n['useLabel'].push(n.labelData[i]);
                        n['useValue'].push(n.valueData[i]);
                    }
                    else if (i === n.labelData.length) {
                        for (var j = 0; j < (TIME_MAX - n.labelData[i - 1]) / _this.accessStep; j++) {
                            n['useLabel'].push(n.labelData[i - 1] + (j + 1) * _this.accessStep);
                            n['useValue'].push(0);
                        }
                    }
                    else {
                        for (var j = 0; j < (n.labelData[i] - n.labelData[i - 1]) / _this.accessStep; j++) {
                            n['useLabel'].push(n.labelData[i - 1] + (j + 1) * _this.accessStep);
                            n['useValue'].push(0);
                        }
                        n['useValue'].splice(n['useValue'].length - 1, 1, n.valueData[i]);
                    }
                }
            }
            // console.log(showData)
            var dataSet = [];
            for (var _d = 0, showData_3 = showData; _d < showData_3.length; _d++) {
                var n = showData_3[_d];
                dataSet.push({
                    label: n.label,
                    data: n.useValue,
                    fill: false,
                    lineTension: 0,
                    borderWidth: 1,
                    borderColor: '#4bc0c0',
                    pointRadius: 0
                });
            }
            _this.data = {
                labels: TIME_ARRAY.map(function (timeStep) {
                    return _this.utils.dateFormat(new Date(timeStep * 1000), 'dd/MM HH:mm:ss');
                }),
                datasets: dataSet,
                borderWidth: 1,
                options: {
                    borderWidth: 1,
                    animation: {
                        duration: 0
                    },
                    hover: {
                        animationDuration: 0
                    },
                    responsiveAnimationDuration: 0
                }
            };
        }, function (error) {
            console.log(error);
        });
    };
    // 获取同级模块
    AccessComponent.prototype.getAccessModule = function () {
        var _this = this;
        this.httpService.getData({}, true, 'execute', '776cb4f5-0a0e-4a45-befa-829973f32c0b', '1')
            .subscribe(function (data) {
            if (data.status <= 0) {
                var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
                _this.toastService.toast(toastCfg);
                return;
            }
            _this.cities1 = [];
            for (var _i = 0, _a = data.data; _i < _a.length; _i++) {
                var i = _a[_i];
                _this.cities1.push({
                    label: i.event_desc,
                    value: i.component_instance_event_id
                });
            }
            // this.selectedWay = this.wayList[0].value;
            _this.getMonitorData();
        }, function (error) {
            console.log(error);
        });
    };
    /*
    * 计算时间段起始时间戳
    * */
    AccessComponent.prototype.getTimeStep = function () {
        this.cities2 = [
            { label: '1天', value: { min: Math.round(new Date().getTime() / 1000 - 86400), max: Math.round(new Date().getTime() / 1000) } },
            { label: '3天', value: { min: Math.round(new Date().getTime() / 1000 - 86400 * 3), max: Math.round(new Date().getTime() / 1000) } },
            { label: '7天', value: { min: Math.round(new Date().getTime() / 1000 - 86400 * 7), max: Math.round(new Date().getTime() / 1000) } },
            { label: '15天', value: { min: Math.round(new Date().getTime() / 1000 - 86400 * 15), max: Math.round(new Date().getTime() / 1000) } }
        ];
    };
    AccessComponent = __decorate([
        core_1.Component({
            selector: 'access-selector',
            templateUrl: './access.component.html',
            styleUrls: ['./access.component.scss']
        })
        /*
        * 访问统计
        * */
    ], AccessComponent);
    return AccessComponent;
}());
exports.AccessComponent = AccessComponent;
//# sourceMappingURL=access.component.js.map