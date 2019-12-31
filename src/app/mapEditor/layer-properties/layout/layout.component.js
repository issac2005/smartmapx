"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var LayoutComponent = /** @class */ (function () {
    function LayoutComponent(mapEditorService, httpService) {
        this.mapEditorService = mapEditorService;
        this.httpService = httpService;
    }
    LayoutComponent.prototype.ngOnInit = function () {
    };
    LayoutComponent.prototype.ngOnChanges = function () {
        var _this = this;
        if (!this.layer[this.patemter.belong]) {
            this.layer[this.patemter.belong] = {};
        }
        this.layerInfo = this.layer[this.patemter.belong];
        this.attribute = this.patemter.attribute;
        if (this.layerInfo[this.attribute] === undefined) {
            this.pattern = this.patemter.pattern;
            this.title = this.patemter.title;
            this.defau = this.patemter["default"];
            this.type = this.patemter.type;
        }
        else {
            this.pattern = this.patemter.pattern;
            this.title = this.patemter.title;
            this.defau = this.patemter["default"];
            this.type = this.patemter.type;
        }
        this.showStyle = typeof this.layerInfo[this.attribute];
        if (this.patemter.attribute === 'text-field') {
            setTimeout(function () {
                _this.pattern = [];
                _this.defau = [];
                var id = _this.layer.metadata.service_event_id;
                for (var i = 0; i < _this.ServiceEventId.length; i++) {
                    if (id === _this.ServiceEventId[i].id) {
                        for (var m = 0; m < _this.ServiceEventId[i].name.length; m++) {
                            _this.pattern.push('{' + _this.ServiceEventId[i].name[m] + '}');
                            _this.defau.push(_this.ServiceEventId[i].desc[m]);
                        }
                    }
                }
            }, 500);
        }
    };
    LayoutComponent.prototype.clickButtom = function (value) {
        this.layerInfo[this.attribute] = value;
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    LayoutComponent.prototype.clickAdd = function () {
        this.layerInfo[this.attribute] = {
            'stops': [
                [6, this.layerInfo[this.attribute]], [10, this.layerInfo[this.attribute]]
            ]
        };
        this.showStyle = typeof this.layerInfo[this.attribute];
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    LayoutComponent.prototype.clickNewButtom = function (item, value, index) {
        this.layerInfo[this.attribute].stops[index][1] = value;
    };
    LayoutComponent.prototype.remove = function (index) {
        this.layerInfo[this.attribute].stops.splice(index, 1);
        if (this.layerInfo[this.attribute].stops.length <= 1) {
            var value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
            this.layerInfo[this.attribute] = value;
            this.showStyle = typeof this.layerInfo[this.attribute];
        }
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    LayoutComponent.prototype.buttomAdd = function () {
        var num = this.layerInfo[this.attribute].stops.length - 1;
        var value = this.layerInfo[this.attribute].stops[num][1];
        var index = this.layerInfo[this.attribute].stops[num][0];
        this.layerInfo[this.attribute].stops.push([Number(index) + 1, value]);
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    LayoutComponent.prototype.test = function (event, index) {
        var pattern = /^((\d)|(1\d)|(2[0-4]))$/;
        var fall = pattern.test(event.target.value);
        /* console.log(fall);*/
        if (!fall) {
            var min = 0;
            var max = 0;
            if (index === 0) {
                min = 0;
                max = this.layerInfo[this.attribute].stops[index + 1][0];
            }
            else if (index === (this.layerInfo[this.attribute].stops.length) - 1) {
                min = this.layerInfo[this.attribute].stops[index - 1][0];
                max = 24;
            }
            else {
                min = this.layerInfo[this.attribute].stops[index - 1][0];
                max = this.layerInfo[this.attribute].stops[index + 1][0];
            }
            this.layerInfo[this.attribute].stops[index][0] = Math.floor(Math.random() * (max - min) + min);
        }
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    LayoutComponent.prototype.change = function () {
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    __decorate([
        core_1.Input()
    ], LayoutComponent.prototype, "layer");
    __decorate([
        core_1.Input()
    ], LayoutComponent.prototype, "patemter");
    __decorate([
        core_1.Input()
    ], LayoutComponent.prototype, "ServiceEventId");
    LayoutComponent = __decorate([
        core_1.Component({
            selector: 'app-layouts',
            templateUrl: './layout.component.html',
            styleUrls: ['./layout.component.scss']
        })
    ], LayoutComponent);
    return LayoutComponent;
}());
exports.LayoutComponent = LayoutComponent;
//# sourceMappingURL=layout.component.js.map