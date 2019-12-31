"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
// /*import '../../../smartmapx/jsoneditor.min.css';*/
/*import {SelectItem, SelectItemGroup} from 'primeng/primeng';*/
var BaseInfoComponent = /** @class */ (function () {
    function BaseInfoComponent(config, mapEditorService, httpService) {
        var _this = this;
        this.config = config;
        this.mapEditorService = mapEditorService;
        this.httpService = httpService;
        this.unsubscribe = this.mapEditorService.changeStyle.subscribe(function (value) {
            _this.myTextarea = JSON.stringify(_this.layerInfo, null, 2);
        });
        this.unlayerEditor = this.mapEditorService.layerEditorEventEmitter.subscribe(function (value) {
            _this.myTextarea = JSON.stringify(_this.layerInfo, null, 2);
        });
    }
    BaseInfoComponent.prototype.ngOnInit = function () {
    };
    BaseInfoComponent.prototype.ngOnDestroy = function () {
        this.unlayerEditor.unsubscribe();
        this.unsubscribe.unsubscribe();
    };
    BaseInfoComponent.prototype.ngOnChanges = function () {
        var _this = this;
        this.defau = [];
        this.rangeValues = [this.layerInfo['minzoom'], this.layerInfo['maxzoom']];
        /*this.minIndex = this.layerInfo['maxzoom'];*/
        this.condition = ['==', '!=', '>', '>=', '<', '<=', 'in', '!in', 'has', '!has'];
        if (this.layerInfo.filter === undefined) {
            this.layerInfo.filter = ['all'];
            return;
        }
        else if (this.layerInfo.filter[0] === 'all' || 'any' || 'none') {
            this.newFilter = this.layerInfo.filter.slice(1);
        }
        this.myTextarea = JSON.stringify(this.layerInfo, null, 2);
        /*setTimeout(function () {
            this.container = document.getElementById('myresource');
             this.options = {
                 mode: 'tree',
                 onChange: function () {
                     alert(112);
                 }
             };
             const json = {
                 'Array': [1, 2, 3],
                 'Boolean': true,
                 'Null': null,
                 'Number': 123,
                 'Object': {'a': 'b', 'c': 'd'},
                 'String': 'Hello World',
             };
             console.log(this.layerInfo)
             this.editor = new JSONEditor(this.container, this.options);
             console.log(this.editor);
                // this.editor.destroy();
                 this.editor.set(this.layerInfo);
                 console.log(111);
         }, 1000)*/
        if (this.patemter.attribute === 'filter') {
            setTimeout(function () {
                if (_this.ServiceEventId.length > 0) {
                    var id = _this.layerInfo.metadata.service_event_id;
                    for (var i = 0; i < _this.ServiceEventId.length; i++) {
                        if (id === _this.ServiceEventId[i].id) {
                            for (var m = 0; m < _this.ServiceEventId[i].name.length; m++) {
                                _this.defau = _this.ServiceEventId[i];
                            }
                            /* console.log(this.defau);*/
                        }
                    }
                }
            }, 500);
        }
        if (this.layerInfo.type === 'symbol') {
            this.type = '图标';
        }
        else if (this.layerInfo.type === 'line') {
            this.type = '线';
        }
        else if (this.layerInfo.type === 'fill') {
            this.type = '面';
        }
        else if (this.layerInfo.type === 'circle') {
            this.type = '圆';
        }
        else if (this.layerInfo.type === 'background') {
            this.type = '背景';
        }
        else if (this.layerInfo.type === 'fill-extrusion') {
            this.type = '高程面';
        }
        /* switch (this.layerInfo.type) {
             case 'symbol':
                 this.type = '图标';
                 break;
             case 'line':
                 this.type = '线';
                 break;
             case 'fill':
                 this.type = '面';
                 break;
             case 'circle':
                 this.type = '圆';
                 break;
             case 'background':
                 this.type = '背景';
                 break;
             case 'fill-extrusion"':
                 this.type = '高程面';
                 break;
             default:
         }*/
    };
    BaseInfoComponent.prototype.addFilter = function () {
        if (this.layerInfo.filter.length >= 10) {
            alert('最多添加10个过滤！');
            return;
        }
        else {
            this.layerInfo.filter.push(['==', 'name', '']);
            this.newFilter = this.layerInfo.filter.slice(1);
        }
        this.mapEditorService.changeStyle.emit(this.layerInfo);
    };
    /*slideEnd(event: any) {
        this.minIndex = this.layerInfo['maxzoom'];
        if (this.layerInfo['maxzoom'] < this.layerInfo['minzoom'] ) {
           console.log(this.layerInfo['minzoom']);
            console.log(this.layerInfo['maxzoom']);
           this.layerInfo['minzoom'] = this.layerInfo['maxzoom'];
        } else {
            this.minIndex = this.layerInfo['maxzoom'];
            console.log(11);
        }
        console.log(this.minIndex);
        this.mapEditorService.changeStyle.emit(this.layerInfo);
    }*/
    BaseInfoComponent.prototype.slideEnds = function (event) {
        console.log(this.rangeValues);
        this.layerInfo['minzoom'] = this.rangeValues[0];
        this.layerInfo['maxzoom'] = this.rangeValues[1];
        this.mapEditorService.changeStyle.emit(this.layerInfo);
    };
    BaseInfoComponent.prototype.remove = function (index) {
        this.layerInfo.filter.splice(index + 1, 1);
        this.newFilter = this.layerInfo.filter.slice(1);
        this.mapEditorService.changeStyle.emit(this.layerInfo);
    };
    BaseInfoComponent.prototype.change = function (event) {
        this.mapEditorService.changeStyle.emit(this.layerInfo);
    };
    BaseInfoComponent.prototype.changeLayerType = function (event) {
        this.layerInfo.paint = {};
        this.layerInfo.layout = {};
        this.mapEditorService.changeStyle.emit(this.layerInfo);
    };
    BaseInfoComponent.prototype.changeLayer = function (string) {
        var oldtype = this.layerInfo.type;
        this.layerInfo = JSON.parse(string);
        var newtype = this.layerInfo.type;
        if (oldtype !== newtype) {
            this.layerInfo.paint = {};
            this.layerInfo.layout = {};
        }
        this.layerEditor[this.layerIndex] = this.layerInfo;
        this.mapEditorService.changeStyle.emit(this.layerInfo);
        this.mapEditorService.layerEditorEventEmitter.emit([this.layerInfo, this.layerIndex]);
    };
    __decorate([
        core_1.Input()
    ], BaseInfoComponent.prototype, "layerInfo");
    __decorate([
        core_1.Input()
    ], BaseInfoComponent.prototype, "patemter");
    __decorate([
        core_1.Input()
    ], BaseInfoComponent.prototype, "layerIndex");
    __decorate([
        core_1.Input()
    ], BaseInfoComponent.prototype, "layerEditor");
    __decorate([
        core_1.Input()
    ], BaseInfoComponent.prototype, "ServiceEventId");
    BaseInfoComponent = __decorate([
        core_1.Component({
            selector: 'app-base-info',
            templateUrl: './base-info.component.html',
            styleUrls: ['./base-info.component.scss']
        })
    ], BaseInfoComponent);
    return BaseInfoComponent;
}());
exports.BaseInfoComponent = BaseInfoComponent;
//# sourceMappingURL=base-info.component.js.map