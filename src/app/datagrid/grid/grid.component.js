"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var choose_data_modal_component_1 = require("../modal/choose-data-modal.component");
var del_data_modal_component_1 = require("../modal/del-data-modal.component");
var add_data_modal_component_1 = require("../modal/add-data-modal.component");
var update_data_modal_component_1 = require("../modal/update-data-modal.component");
var toast_model_1 = require("../../common/toast/toast-model");
var Buffer = require('buffer').Buffer;
var wkx = require('wkx');
// import {Debug} from "ng2-img-cropper/src/exif";
var GridComponent = (function () {
    function GridComponent(httpService, ngbModalService, toastService, appService) {
        var _this = this;
        this.httpService = httpService;
        this.ngbModalService = ngbModalService;
        this.toastService = toastService;
        this.appService = appService;
        this.totalProperty = new core_1.EventEmitter();
        this.postDataBody = {
            conjunctionCon: 'and',
            filtersCon: []
        };
        this.totalPage = 0; // 数据总数,不是总页数
        this.everyPageNum = 30;
        this.pageNum = 1; // 当前加载数据页码
        // 属性是geo的列entity_column_id
        this.geoEntityColumnId = [];
        this.types = [];
        var info = localStorage.getItem('data_info') || '';
        this.pageConfig = JSON.parse(info);
        this.unDataAction = this.appService.dataActionEventEmitter.subscribe(function (value) {
            // debugger;
            if (value.type === 'addGeo') {
                _this.addNewGriddata(value.value);
            }
            else if (value.type === 'removeGeo') {
                _this.removeGridData(value.value);
            }
            else if (value.type === 'updateGeo') {
                _this.updateGriddate(value.value);
            }
            else if (value.type === 'unionGeo') {
                _this.unionGriddate(value.value);
            }
        });
    }
    GridComponent.prototype.ngOnDestroy = function () {
        this.unDataAction.unsubscribe();
    };
    /*
     * 初始化
     */
    GridComponent.prototype.ngOnInit = function () {
        this.gridHeader = [];
        this.canChecked = !this.pageConfig.visit_type;
        // this.gngOnChanges();
        // 下拉框的请求服务器方法
        this.getDropDown();
    };
    /*
     *获取类型下拉框的服务器请求
     */
    GridComponent.prototype.getDropDown = function () {
        var _this = this;
        this.httpService.getData({ 'parent_id': 'sys_column_type' }, true, 'execute', '6a35661d-7a2c-4a75-b3f2-e3a82ed953e0', '1')
            .subscribe(function (data) {
            if (data.status > 0) {
                var obj = [];
                for (var _i = 0, _a = data.data; _i < _a.length; _i++) {
                    var v = _a[_i];
                    obj.push({
                        label: v.item_name,
                        value: v.baseid
                    });
                }
                // debugger;
                _this.types = obj;
            }
            // console.log(this.gridData)
        }, function (error) {
            console.log(error);
        });
    };
    /*
     *下拉框的onchange事件方法
     */
    GridComponent.prototype.typeChange = function (e, item, itemHeader, i) {
        var _this = this;
        // debugger;
        var refModal = this.ngbModalService.open(del_data_modal_component_1.DelDataModalComponent, {
            backdrop: 'static'
        });
        refModal.componentInstance.type = 'conversion';
        refModal.result.then(function (result) {
            if (result === 'conversion') {
                var body = {
                    entity_column_id: item['名称'],
                    data_type_id: e
                };
                _this.httpService.getData(body, true, 'etl', 'convertColumnType', 'type')
                    .subscribe(function (data) {
                    if (data.status > 0) {
                        var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.SUCCESS, '', '类型转换成功!', 2000);
                        _this.toastService.toast(toastCfg);
                    }
                    else {
                        item[itemHeader] = _this.strucrtorData[i].data_type_id;
                    }
                }, function (error) {
                    console.log(error);
                });
            }
        }, function (reason) {
            console.log(reason);
        });
    };
    GridComponent.prototype.ngOnChanges = function () {
        this.removeIdArray = [];
        this.dataIndex = [];
        this.gridHeaderShow = [];
        this.operationShow = [];
        this.updateIdArray = [];
        // this.operationUpdateKey = [];
        this.operationDel = {
            url: '',
            key: []
        };
        this.operationAdd = {
            url: '',
            key: [],
            tag: 1
        };
        this.operationUpdate = {
            url: '',
            key: [],
            tag: 1
        };
        if (this.operationConfig) {
            for (var _i = 0, _a = this.operationConfig; _i < _a.length; _i++) {
                var i = _a[_i];
                if (i.config_type === 'delete') {
                    // this.operationDel.url = i.service_event_id;
                    this.operationDel.key.push(i.alias);
                }
                else if (i.config_type === 'insert') {
                    // this.operationAdd.url = i.service_event_id;
                    this.operationAdd.key.push({
                        name: i.alias,
                        desc: i.desc,
                        null_able: i.null_able,
                        type: i.model ? i.model : 'input',
                        content: i.content ? JSON.parse(i.content) : '',
                        precision: i.precision,
                        data_type_id: i.data_type_id,
                        service_event_id: i.service_event_id
                    });
                    if (i.model === 'editor') {
                        this.operationAdd.tag = 2;
                    }
                }
                else if (i.config_type === 'update') {
                    this.operationUpdate.key.push({
                        desc: i.desc,
                        name: i.alias,
                        null_able: i.null_able,
                        type: i.model ? i.model : 'input',
                        content: i.content ? JSON.parse(i.content) : '',
                        precision: i.precision,
                        data_type_id: i.data_type_id,
                        service_event_id: i.service_event_id,
                        isId: false
                    });
                    if (i.model === 'editor') {
                        this.operationUpdate.tag = 2;
                    }
                }
                else if (i.config_type === 'updateKey') {
                    this.operationUpdate.key.push({
                        desc: i.desc,
                        name: i.alias,
                        null_able: i.null_able,
                        type: i.model ? i.model : 'input',
                        content: i.content ? JSON.parse(i.content) : '',
                        precision: i.precision,
                        data_type_id: i.data_type_id,
                        service_event_id: i.service_event_id,
                        isId: true
                    });
                }
                else if (i.config_type === 'result') {
                    this.operationShow.push(i.alias);
                    this.gridHeaderShow.push(i.desc);
                    if (i.model === 'select_point' || i.model === 'select_polygon' || i.model === 'select_line') {
                        this.geoEntityColumnId.push(i.entity_column_id);
                    }
                }
                else if (i.config_type === 'operation') {
                    if (i.model === 'delete') {
                        this.operationDel.url = i.service_event_id;
                    }
                    else if (i.model === 'insert') {
                        this.operationAdd.url = i.service_event_id;
                    }
                    else if (i.model === 'update') {
                        this.operationUpdate.url = i.service_event_id;
                    }
                }
            }
            console.log(this.operationUpdate);
        }
        this.gridData = [];
        this.rawData = [];
        this.gridHeader = [];
        this.pageNum = 1;
        if (this.operationConfig) {
            if (this.pageType === 1) {
                this.getGridData(this.postDataBody.conjunctionCon, this.postDataBody.filtersCon);
            }
            else if (this.pageType === 2) {
                this.getGridStructure();
            }
        }
    };
    /*
    * 获取表格数据
    * */
    GridComponent.prototype.getGridData = function (conjunctionCon, filtersCon, startNum) {
        var _this = this;
        for (var _i = 0, filtersCon_1 = filtersCon; _i < filtersCon_1.length; _i++) {
            var item = filtersCon_1[_i];
            if (item.data_type_id === 'postgres_integer' || item.data_type_id === 'postgres_numeric' ||
                item.data_type_id === 'postgres_bigint' || item.data_type_id === 'postgres_smallint') {
                item.value = Number(item.value);
            }
        }
        this.postDataBody.conjunctionCon = conjunctionCon;
        this.postDataBody.filtersCon = filtersCon;
        if (startNum !== undefined) {
            this.gridData = [];
            this.rawData = [];
            this.pageNum = 1;
        }
        var postBody = {
            filters: filtersCon,
            conjunction: conjunctionCon,
            limit: this.everyPageNum,
            start: startNum !== undefined ? startNum : this.everyPageNum * (this.pageNum - 1),
            service_event_parameters_id: this.pageConfig.service_event_parameters_id
        };
        //
        this.httpService.getData(postBody, true, 'execute', this.pageConfig.service_event_id, '1')
            .subscribe(function (data) {
            if (data.status < 0) {
                return;
            }
            // this.gridData = (data as any).data.root;
            // 下面的判断是在ngchange事件会出发两次导致首次进入有60条数据，有两个组件传入数据导致
            if ((_this.pageNum * _this.everyPageNum) === (_this.gridData.length + 30)) {
                _this.rawData.push.apply(_this.rawData, _this.cloneObj(data.data.root));
                _this.gridData.push.apply(_this.gridData, data.data.root);
                _this.gridHeader = [];
                for (var _i = 0, _a = _this.gridData; _i < _a.length; _i++) {
                    var i = _a[_i];
                    for (var j in i) {
                        if (_this.operationShow.indexOf(j) === -1) {
                            delete i[j];
                        }
                    }
                }
                // console.log(this.gridData)
                for (var key in _this.gridData[0]) {
                    if (key) {
                        _this.gridHeader.push(key);
                    }
                }
                _this.gridHeader = _this.operationShow;
                _this.totalPage = data.data.totalProperty;
            }
            // 发送总数事件
            _this.totalProperty.emit(data.data.totalProperty);
        }, function (error) {
            console.log(error);
        });
    };
    GridComponent.prototype.exportData = function () {
        var postBody = {
            filters: this.postDataBody.filtersCon,
            conjunction: this.postDataBody.conjunctionCon,
            service_event_parameters_id: this.pageConfig.service_event_parameters_id
        };
        var token = localStorage.getItem('id_token');
        var dataUrl = '/services/1.0.0/execute/' + this.pageConfig.service_event_id + '?parameter=';
        var param = {
            tag: 'export',
            "export": 'csv',
            data: postBody,
            token: token
        };
        console.log(dataUrl + JSON.stringify(param));
        window.open(dataUrl + JSON.stringify(param));
    };
    /*
    * 深copy
    * */
    GridComponent.prototype.cloneObj = function (obj) {
        var str, newobj = obj.constructor === Array ? [] : {};
        if (typeof obj !== 'object') {
            return;
        }
        else if (window.JSON) {
            str = JSON.stringify(obj),
                newobj = JSON.parse(str); // 还原
        }
        else {
            for (var i in obj) {
                if (i) {
                    newobj[i] = typeof obj[i] === 'object' ?
                        this.cloneObj(obj[i]) : obj[i];
                }
            }
        }
        return newobj;
    };
    ;
    /*
    * 获取表格结构
    * */
    GridComponent.prototype.getGridStructure = function () {
        var _this = this;
        this.httpService.getData({ 'service_event_parameters_id': this.pageConfig.service_event_parameters_id }, true, 'execute', '7d334f95-fe30-4bd1-a184-5706947c8160', '1')
            .subscribe(function (data) {
            _this.strucrtorData = data.data;
            _this.structureValue = _this.formatStructure(_this.strucrtorData);
            _this.structureHeader = [];
            for (var key in _this.structureValue[0]) {
                if (key) {
                    _this.structureHeader.push(key);
                }
            }
            // console.log(this.gridData)
        }, function (error) {
            console.log(error);
        });
    };
    /*
    * 格式化表格结构数据
    * */
    GridComponent.prototype.formatStructure = function (data) {
        var _formatData = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var index = data_1[_i];
            _formatData.push({
                '名称': index.name,
                '类型': index.data_type_id,
                '长度': index.precision,
                '精度': index.scale,
                '别名': index.desc,
                '允许空': index.null_able,
                '主键': index.primary_key
            });
        }
        return _formatData;
    };
    /*
    * 选择事件
    * */
    GridComponent.prototype.checkItem = function (index, e, item) {
        //
        // 修改选择
        if (e.target.checked) {
            this.updateIdArray.push({ index: index, value: this.rawData[index] });
        }
        else {
            for (var _i = 0, _a = this.updateIdArray; _i < _a.length; _i++) {
                var j = _a[_i];
                if (this.cmp(j.value, this.rawData[index])) {
                    this.updateIdArray.splice(this.updateIdArray.indexOf(j), 1);
                }
            }
        }
        // 删除选择
        if (e.target.checked) {
            var removeKeyValue = {};
            for (var _b = 0, _c = this.operationDel.key; _b < _c.length; _b++) {
                var j = _c[_b];
                removeKeyValue[j] = this.rawData[index][j];
            }
            this.dataIndex.push(index);
            this.removeIdArray.push(removeKeyValue);
        }
        else {
            var removeKeyValue = {};
            for (var _d = 0, _e = this.operationDel.key; _d < _e.length; _d++) {
                var j = _e[_d];
                removeKeyValue[j] = this.rawData[index][j];
            }
            for (var _f = 0, _g = this.removeIdArray; _f < _g.length; _f++) {
                var j = _g[_f];
                if (this.cmp(j, removeKeyValue)) {
                    this.removeIdArray.splice(this.removeIdArray.indexOf(j), 1);
                }
            }
            this.dataIndex.splice(this.dataIndex.indexOf(index), 1);
        }
        // 修改按钮状态
        if (this.updateIdArray.length !== 1) {
            this.btnDisabled.update = false;
        }
        else {
            this.btnDisabled.update = true;
            for (var key in this.updateIdArray[0].value) {
                if (key) {
                    for (var _h = 0, _j = this.operationUpdate.key; _h < _j.length; _h++) {
                        var l = _j[_h];
                        if (key === l.name) {
                            l['value'] = this.updateIdArray[0].value[key];
                        }
                    }
                }
            }
        }
        console.log(this.operationUpdate);
        // 删除按钮状态
        if (this.removeIdArray.length !== 0) {
            this.btnDisabled.del = true;
        }
        else {
            this.btnDisabled.del = false;
        }
    };
    /*
    * 判断两个对象是否相等,在取消选中事件时使用
    * */
    GridComponent.prototype.cmp = function (x, y) {
        if (x === y) {
            return true;
        }
        if (!(x instanceof Object) || !(y instanceof Object)) {
            return false;
        }
        if (x.constructor !== y.constructor) {
            return false;
        }
        for (var p in x) {
            if (x.hasOwnProperty(p)) {
                if (!y.hasOwnProperty(p)) {
                    return false;
                }
                if (x[p] === y[p]) {
                    continue;
                }
                if (typeof (x[p]) !== 'object') {
                    return false;
                }
                // if (!(<any>Object).equals(x[p], y[p])) {
                //     return false;
                // }
            }
        }
        for (var p in y) {
            if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
                return false;
            }
        }
        return true;
    };
    ;
    /*
    * 图上选取点击事件
    * */
    GridComponent.prototype.chooseImg = function (index) {
        var chooseMap = this.ngbModalService.open(choose_data_modal_component_1.ChooseDataModalComponent, {
            backdrop: 'static'
        });
        chooseMap.componentInstance.geoType = this.geoType;
        chooseMap.result.then(function (result) {
            console.log(result);
        }, function (reason) {
            console.log(reason);
        });
    };
    /*
    * 表结构别名修改点击变成输入框
    * */
    GridComponent.prototype.changeEditFlag = function (index, str, e) {
        this.structureValue[index].editFlag = true;
        this.structureValue[index].editValue = str;
        setTimeout(function () {
            /*if (document.getElementsByClassName('right-side-box')[0].getElementsByTagName('input')[0]) {
                document.getElementsByClassName('right-side-box')[0].getElementsByTagName('input')[0].focus()
            }*/
            document.getElementsByClassName('change-name-input')[0].focus();
        });
    };
    /*
    * 表结构别名修改失去焦点事件
    * */
    GridComponent.prototype.saveChangeName = function (e, index) {
        var _this = this;
        var targetValue = e.target.value;
        var postIndexId = '';
        this.structureValue[index].editFlag = false;
        if (targetValue === '') {
            return;
        }
        for (var _i = 0, _a = this.strucrtorData; _i < _a.length; _i++) {
            var j = _a[_i];
            if (j.name === this.structureValue[index]['名称']) {
                postIndexId = j.entity_column_id;
            }
        }
        var postData = {
            entity_column_id: postIndexId,
            desc: targetValue,
            service_event_id: this.pageConfig.service_event_id
        };
        this.httpService.getData(postData, true, 
        // 'execute', 'e4adc729-2e84-4867-8c83-fe5ab4067d70', '1')
        'execute', 'c0bd4559-6ef4-4fc3-a0d2-9f35d94a4cf9', '1')
            .subscribe(function (data) {
            if (data.status > 0) {
                _this.structureValue[index]['别名'] = targetValue;
                // 更该数据源,保证数据源信息联动
                for (var _i = 0, _a = _this.operationConfig; _i < _a.length; _i++) {
                    var v = _a[_i];
                    if (v.entity_column_id === _this.structureValue[index]['名称'] && v.config_type === 'result') {
                        v.desc = targetValue;
                        return;
                    }
                }
            }
            else {
                var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.ERROR, '', '修改失败,请稍后再试!', 2000);
                _this.toastService.toast(toastCfg);
                // alert('修改失败，请稍后再试！');
            }
        }, function (error) {
        });
    };
    /*
    * 输入框回车事件
    * */
    GridComponent.prototype.inputChangeName = function (e) {
        if (e.keyCode === 13) {
            e.target.blur();
        }
    };
    /*
    * 加载下一页事件
    * */
    GridComponent.prototype.loadNextPage = function (event) {
        // console.log(event.isReachingBottom);
        if (event.isReachingBottom) {
            if (this.pageType === 1) {
                if (this.everyPageNum * this.pageNum < this.totalPage) {
                    if (this.gridData.length !== 0) {
                        this.pageNum = this.pageNum + 1;
                        console.log('Loading next page!');
                        this.getGridData(this.postDataBody.conjunctionCon, this.postDataBody.filtersCon);
                    }
                }
            }
        }
    };
    /* // 监听左右滑动a */
    GridComponent.prototype.scrollLeft = function (event) {
        var left = document.getElementsByClassName('grid-box')[0];
        var change = document.getElementsByTagName('thead')[0];
        change.style.left = -left.scrollLeft + 'px';
    };
    /**
     * 删除表格数据
     * @param value
     */
    GridComponent.prototype.removeGridData = function (value) {
        var _this = this;
        var odiv = document.getElementsByClassName('del-modal');
        if (odiv.length > 0) {
            document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-window')[0]);
            document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-backdrop')[0]);
        }
        if (value) {
            this.ngbModalService.open(del_data_modal_component_1.DelDataModalComponent, {
                backdrop: 'static'
            }).result.then(function (result) {
                // debugger;
                if (result === 'submit') {
                    var delData = {};
                    for (var _i = 0, _a = _this.operationDel.key; _i < _a.length; _i++) {
                        var j = _a[_i];
                        for (var i in value) {
                            if (i === j) {
                                delData[i] = value[i];
                            }
                        }
                    }
                    console.log(result);
                    console.log(delData);
                    _this.httpService.getData([delData], true, 'execute', _this.operationDel.url, '1')
                        .subscribe(function (data) {
                        if (data.status > 0) {
                            _this.totalPage = _this.totalPage - 1;
                            _this.totalProperty.emit(_this.totalPage);
                            // const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 2000);
                            // this.toastService.toast(toastCfg);
                        }
                        else {
                            // localStorage.setItem('removeGeoFun', 'undefined');
                            // localStorage.setItem('removeGeoFun', 'fail');
                            // 删除数据失败
                            _this.appService.dataActionEventEmitter.emit({ type: 'removeFail' });
                            var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.ERROR, '', '删除失败,请稍后再试!', 5000);
                            _this.toastService.toast(toastCfg);
                        }
                    }, function (error) {
                        console.log(error);
                    });
                }
                else {
                    // localStorage.setItem('removeGeoFun', 'undefined');
                    // localStorage.setItem('removeGeoFun', 'fail');
                    _this.appService.dataActionEventEmitter.emit({ type: 'removeFail' });
                }
            }, function (reason) {
                // console.log(reason)
                // localStorage.setItem('removeGeoFun', 'undefined');
                // localStorage.setItem('removeGeoFun', 'fail');
                _this.appService.dataActionEventEmitter.emit({ type: 'removeFail' });
            });
        }
        else {
            if (this.removeIdArray.length !== 0) {
                // const self = this.removeIdArray;
                var refModal = this.ngbModalService.open(del_data_modal_component_1.DelDataModalComponent, {
                    backdrop: 'static'
                });
                refModal.result.then(function (result) {
                    if (result === 'submit') {
                        _this.httpService.getData(_this.removeIdArray, true, 'execute', _this.operationDel.url, '1')
                            .subscribe(function (data) {
                            if (data.status > 0) {
                                console.log('delete success!');
                                // 清除选择
                                _this.cleanSelect();
                                _this.dataIndex.sort(function (a, b) {
                                    return b - a;
                                });
                                for (var _i = 0, _a = _this.dataIndex; _i < _a.length; _i++) {
                                    var i = _a[_i];
                                    _this.gridData.splice(i, 1);
                                    _this.rawData.splice(i, 1);
                                }
                                _this.removeIdArray = [];
                                _this.dataIndex = [];
                                _this.totalPage = _this.totalPage - 1;
                                _this.totalProperty.emit(_this.totalPage);
                            }
                            else {
                                alert('删除失败，请稍后再试！');
                            }
                        }, function (error) {
                        });
                    }
                }, function (reason) {
                    console.log(reason);
                });
            }
        }
    };
    /**
     * 新增一条数据
     * @param geoJson
     */
    GridComponent.prototype.addNewGriddata = function (geoJson) {
        var _this = this;
        var odiv = document.getElementsByClassName('add-modal');
        if (odiv.length > 0) {
            document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-window')[0]);
            document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-backdrop')[0]);
        }
        var refModal = this.ngbModalService.open(add_data_modal_component_1.AddDataModalComponent, {
            backdrop: 'static'
        });
        for (var _i = 0, _a = this.operationAdd.key; _i < _a.length; _i++) {
            var i = _a[_i];
            i['value'] = '';
        }
        if (geoJson) {
            // console.log(this.operationAdd)
            for (var _b = 0, _c = this.operationAdd.key; _b < _c.length; _b++) {
                var i = _c[_b];
                if (/^select_/g.exec(i.type)) {
                    i.value = geoJson;
                }
            }
        }
        refModal.componentInstance.formConfig = this.operationAdd;
        refModal.result.then(function (result) {
            if (result === 'submit') {
                // console.log(this.operationAdd)
                var postAddData = {};
                for (var _i = 0, _a = _this.operationAdd.key; _i < _a.length; _i++) {
                    var j = _a[_i];
                    postAddData[j.name] = (j.data_type_id === 'postgres_bigint' || j.data_type_id === 'postgres_double_precision'
                        || j.data_type_id === 'postgres_integer') ? parseFloat(j.value) : j.value;
                }
                _this.httpService.getData(postAddData, true, 'execute', _this.operationAdd.url, '1')
                    .subscribe(function (data) {
                    if (data.status > 0) {
                        // console.log('add success!');
                        if (geoJson) {
                            var changeGeo = data.data.root[0];
                            // for (const i of this.operationAdd.key) {
                            //     if (/^select_/g.exec(i.type)) {
                            //         changeGeo['geoJson'] = postAddData[i.name];
                            //     }
                            // }
                            // console.log(changeGeo)
                            // localStorage.setItem('addGeo', JSON.stringify(changeGeo));
                            _this.appService.dataActionEventEmitter.emit({ type: 'addSuccess', value: changeGeo });
                        }
                        _this.totalPage = _this.totalPage + 1;
                        _this.totalProperty.emit(_this.totalPage);
                        var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.SUCCESS, '', '数据添加成功!', 2000);
                        _this.toastService.toast(toastCfg);
                        // 刷新数据
                        _this.getGridData(_this.postDataBody.conjunctionCon, _this.postDataBody.filtersCon, _this.pageNum);
                    }
                    else {
                        if (geoJson) {
                            // localStorage.setItem('addGeoFun', 'undefined');
                            // localStorage.setItem('addGeoFun', 'fail');
                            _this.appService.dataActionEventEmitter.emit({ type: 'addFail' });
                        }
                        var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.ERROR, '', '添加失败,请稍后再试!', 2000);
                        _this.toastService.toast(toastCfg);
                    }
                }, function (error) {
                    console.log(error);
                });
            }
            else {
                if (geoJson) {
                    // localStorage.setItem('addGeoFun', 'undefined');
                    // localStorage.setItem('addGeoFun', 'fail');
                    _this.appService.dataActionEventEmitter.emit({ type: 'addFail' });
                }
            }
        }, function (reason) {
            if (geoJson) {
                // localStorage.setItem('addGeoFun', 'undefined');
                // localStorage.setItem('addGeoFun', 'fail');
                _this.appService.dataActionEventEmitter.emit({ type: 'addFail' });
            }
        });
    };
    /**
     * 修改表格数据
     * @param geoJson
     */
    GridComponent.prototype.updateGriddate = function (geoJson) {
        var _this = this;
        var odiv = document.getElementsByClassName('add-modal');
        if (odiv.length > 0) {
            document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-window')[0]);
            document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-backdrop')[0]);
        }
        if (geoJson) {
            var postUpdateData = geoJson;
            this.httpService.getData(postUpdateData, true, 'execute', this.operationUpdate.url, '1')
                .subscribe(function (data) {
                if (data.status > 0) {
                    var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.SUCCESS, '', '修改成功!', 2000);
                    _this.toastService.toast(toastCfg);
                }
                else {
                    var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.ERROR, '', '修改失败!', 2000);
                    _this.toastService.toast(toastCfg);
                    _this.appService.dataActionEventEmitter.emit({ type: 'updateFail' });
                }
            }, function (error) {
                // console.log(error);
                var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.ERROR, '', '修改失败!', 2000);
                _this.toastService.toast(toastCfg);
                _this.appService.dataActionEventEmitter.emit({ type: 'updateFail' });
            });
        }
        else {
            var refModal = this.ngbModalService.open(update_data_modal_component_1.UpdateDataModalComponent, { backdrop: 'static', keyboard: true });
            refModal.componentInstance.formConfig = this.operationUpdate;
            refModal.result.then(function (result) {
                if (result === 'submit') {
                    // 提交
                    console.log(result);
                    var postUpdateData = {};
                    for (var _i = 0, _a = _this.operationUpdate.key; _i < _a.length; _i++) {
                        var j = _a[_i];
                        if (j.type === 'select_point') {
                            if (typeof j.value === 'string') {
                                j.value = JSON.parse(j.value);
                            }
                            if (j.value.type === 'geometry') {
                                var wkbBuffer = new Buffer(j.value.value, 'hex');
                                j.value = wkx.Geometry.parse(wkbBuffer).toGeoJSON();
                            }
                            postUpdateData[j.name] = JSON.stringify(j.value);
                        }
                        else if (j.type === 'select_line') {
                            if (typeof j.value === 'string') {
                                j.value = JSON.parse(j.value);
                            }
                            if (j.value.type === 'geometry') {
                                var wkbBuffer = new Buffer(j.value.value, 'hex');
                                j.value = wkx.Geometry.parse(wkbBuffer).toGeoJSON();
                            }
                            postUpdateData[j.name] = JSON.stringify(j.value);
                        }
                        else if (j.type === 'select_polygon') {
                            if (typeof j.value === 'string') {
                                j.value = JSON.parse(j.value);
                            }
                            if (j.value.type === 'geometry') {
                                var wkbBuffer = new Buffer(j.value.value, 'hex');
                                j.value = wkx.Geometry.parse(wkbBuffer).toGeoJSON();
                            }
                            postUpdateData[j.name] = JSON.stringify(j.value);
                        }
                        else {
                            // 数字类型
                            postUpdateData[j.name] = (j.data_type_id === 'postgres_bigint'
                                || j.data_type_id === 'postgres_double_precision'
                                || j.data_type_id === 'postgres_integer') ? parseFloat(j.value) : j.value;
                            // postUpdateData[j.name] = j.value;
                        }
                    }
                    _this.httpService.getData(postUpdateData, true, 'execute', _this.operationUpdate.url, '1')
                        .subscribe(function (data) {
                        if (data.data.status < 0) {
                            return;
                        }
                        var index = _this.updateIdArray[0].index;
                        for (var i in _this.gridData[index]) {
                            if (i) {
                                for (var _i = 0, _a = _this.operationUpdate.key; _i < _a.length; _i++) {
                                    var j = _a[_i];
                                    if (i === j.name) {
                                        _this.gridData[index][i] = j.value;
                                    }
                                }
                            }
                        }
                        var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.SUCCESS, '', '修改成功!', 2000);
                        _this.toastService.toast(toastCfg);
                    }, function (error) {
                        console.log(error);
                    });
                }
            }, function (reason) {
                console.log(reason);
                // if (geoJson) {
                //     localStorage.setItem('addGeoFun', undefined);
                //     localStorage.setItem('addGeoFun', 'fail');
                // }
            });
        }
    };
    /*
    * 合并面新增数据
    * */
    GridComponent.prototype.unionGriddate = function (geoJson) {
        var _this = this;
        var odiv = document.getElementsByClassName('add-modal');
        if (odiv.length > 0) {
            document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-window')[0]);
            document.getElementsByTagName('body')[0].removeChild(document.getElementsByTagName('ngb-modal-backdrop')[0]);
        }
        /*console.log(geoJson);*/
        var refModal = this.ngbModalService.open(add_data_modal_component_1.AddDataModalComponent, {
            backdrop: 'static'
        });
        for (var _i = 0, _a = this.operationAdd.key; _i < _a.length; _i++) {
            var i = _a[_i];
            i['value'] = '';
        }
        if (geoJson) {
            // console.log(this.operationAdd)
            for (var _b = 0, _c = this.operationAdd.key; _b < _c.length; _b++) {
                var i = _c[_b];
                if (/^select_/g.exec(i.type)) {
                    i.value = geoJson;
                }
            }
        }
        refModal.componentInstance.formConfig = this.operationAdd;
        refModal.componentInstance.unionInfo = geoJson.unionInfo;
        refModal.result.then(function (result) {
            if (result === 'submit') {
                // console.log(this.operationAdd)
                var postAddData = {};
                for (var _i = 0, _a = _this.operationAdd.key; _i < _a.length; _i++) {
                    var j = _a[_i];
                    postAddData[j.name] = (j.data_type_id === 'postgres_bigint' || j.data_type_id === 'postgres_double_precision'
                        || j.data_type_id === 'postgres_integer') ? parseFloat(j.value) : j.value;
                }
                _this.httpService.getData(postAddData, true, 'execute', _this.operationAdd.url, '1')
                    .subscribe(function (data) {
                    if (data.status > 0) {
                        // console.log('add success!');
                        if (geoJson) {
                            var changeGeo = data.data.root[0];
                            // for (const i of this.operationAdd.key) {
                            //     if (/^select_/g.exec(i.type)) {
                            //         changeGeo['geoJson'] = postAddData[i.name];
                            //     }
                            // }
                            // console.log(changeGeo)
                            // localStorage.setItem('addGeo', JSON.stringify(changeGeo));
                            _this.appService.dataActionEventEmitter.emit({ type: 'unionSuccess', value: changeGeo });
                        }
                        _this.totalPage = _this.totalPage + 1;
                        _this.totalProperty.emit(_this.totalPage);
                        var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.SUCCESS, '', '数据合并成功!', 2000);
                        _this.toastService.toast(toastCfg);
                        // 刷新数据
                        _this.getGridData(_this.postDataBody.conjunctionCon, _this.postDataBody.filtersCon, _this.pageNum);
                    }
                    else {
                        if (geoJson) {
                            // localStorage.setItem('addGeoFun', 'undefined');
                            // localStorage.setItem('addGeoFun', 'fail');
                            _this.appService.dataActionEventEmitter.emit({ type: 'unionFail' });
                        }
                        var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.ERROR, '', '合并失败,请稍后再试!', 2000);
                        _this.toastService.toast(toastCfg);
                    }
                }, function (error) {
                    console.log(error);
                });
                /*删除选取数据*/
                if (result === 'submit') {
                    var delArray = [];
                    var delData = {};
                    for (var m = 0; m < geoJson.unionInfo.length; m++) {
                        var info = geoJson.unionInfo[m].properties;
                        for (var _b = 0, _c = _this.operationDel.key; _b < _c.length; _b++) {
                            var j = _c[_b];
                            for (var i in info) {
                                if (i === j) {
                                    delData[i] = info[i];
                                    delArray.push((_d = {},
                                        _d[i] = info[i],
                                        _d));
                                }
                            }
                        }
                    }
                    /*console.log(delArray);
                    console.log(result);
                    console.log(delData);*/
                    for (var i = 0; i < delArray.length; i++) {
                        _this.httpService.getData([delArray[i]], true, 'execute', _this.operationDel.url, '1')
                            .subscribe(function (data) {
                            if (data.status > 0) {
                                _this.totalPage = _this.totalPage - 1;
                                _this.totalProperty.emit(_this.totalPage);
                                // const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 2000);
                                // this.toastService.toast(toastCfg);
                            }
                            else {
                                // localStorage.setItem('removeGeoFun', 'undefined');
                                // localStorage.setItem('removeGeoFun', 'fail');
                                // 删除数据失败
                                _this.appService.dataActionEventEmitter.emit({ type: 'removeFail' });
                                var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.ERROR, '', '删除失败,请稍后再试!', 5000);
                                _this.toastService.toast(toastCfg);
                            }
                        }, function (error) {
                            console.log(error);
                        });
                    }
                }
                else {
                    _this.appService.dataActionEventEmitter.emit({ type: 'removeFail' });
                }
            }
            else {
                if (geoJson) {
                    // localStorage.setItem('addGeoFun', 'undefined');
                    // localStorage.setItem('addGeoFun', 'fail');
                    _this.appService.dataActionEventEmitter.emit({ type: 'unionFail' });
                }
            }
            var _d;
        }, function (reason) {
            if (geoJson) {
                // localStorage.setItem('addGeoFun', 'undefined');
                // localStorage.setItem('addGeoFun', 'fail');
                _this.appService.dataActionEventEmitter.emit({ type: 'unionFail' });
            }
        });
    };
    /**
     * 重置清除选择事假
     */
    GridComponent.prototype.cleanSelect = function () {
        this.updateIdArray = [];
        this.removeIdArray = [];
    };
    /**
     * 判断数组是否包含某一元素
     */
    GridComponent.prototype.inArray = function (needle) {
        for (var _i = 0, _a = this.geoEntityColumnId; _i < _a.length; _i++) {
            var i = _a[_i];
            if (i === needle) {
                return true;
            }
        }
        return false;
    };
    /**
     * 编辑geo
     * @param e
     */
    GridComponent.prototype.editGeo = function (e, n) {
        // if (!e || e === '') {
        //     this.chooseImg(n);
        // }
    };
    GridComponent.prototype.test = function () {
        console.log(this);
        this.geoType = 30;
    };
    return GridComponent;
}());
__decorate([
    core_1.Input()
], GridComponent.prototype, "btnDisabled");
__decorate([
    core_1.Input()
], GridComponent.prototype, "pageType");
__decorate([
    core_1.Input()
], GridComponent.prototype, "geoType");
__decorate([
    core_1.Input()
], GridComponent.prototype, "operationConfig");
__decorate([
    core_1.Output()
], GridComponent.prototype, "totalProperty");
GridComponent = __decorate([
    core_1.Component({
        selector: 'c-grid',
        templateUrl: './grid.component.html',
        styleUrls: ['./grid.component.scss']
    })
], GridComponent);
exports.GridComponent = GridComponent;
//# sourceMappingURL=grid.component.js.map