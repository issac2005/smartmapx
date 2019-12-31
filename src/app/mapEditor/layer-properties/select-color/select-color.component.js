"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var SelectColorComponent = /** @class */ (function () {
    function SelectColorComponent(mapEditorService, elementRef, renderer) {
        this.mapEditorService = mapEditorService;
        this.elementRef = elementRef;
        this.renderer = renderer;
    }
    SelectColorComponent.prototype.ngOnInit = function () {
    };
    SelectColorComponent.prototype.ngOnChanges = function () {
        if (!this.layer[this.patemter.belong]) {
            this.layer[this.patemter.belong] = {};
        }
        this.layerInfo = this.layer[this.patemter.belong];
        this.attribute = this.patemter.attribute;
        if (this.layerInfo[this.attribute] === undefined) {
            this.pattern = this.patemter.pattern;
            this.title = this.patemter.title;
            this.model = this.patemter["default"];
        }
        else {
            this.pattern = this.patemter.pattern;
            this.title = this.patemter.title;
            this.model = this.layerInfo[this.attribute];
        }
        this.showStyle = typeof this.layerInfo[this.attribute];
    };
    SelectColorComponent.prototype.ngAfterViewChecked = function () {
    };
    SelectColorComponent.prototype.clickAdd = function () {
        if (this.layerInfo[this.attribute] === undefined) {
            this.layerInfo[this.attribute] = {
                'stops': [
                    [6, this.model], [10, this.model]
                ]
            };
        }
        else {
            this.layerInfo[this.attribute] = {
                'stops': [
                    [6, this.layerInfo[this.attribute]], [10, this.layerInfo[this.attribute]]
                ]
            };
        }
        this.showStyle = typeof this.layerInfo[this.attribute];
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    SelectColorComponent.prototype.remove = function (index) {
        this.layerInfo[this.attribute].stops.splice(index, 1);
        if (this.layerInfo[this.attribute].stops.length <= 1) {
            var value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
            this.layerInfo[this.attribute] = value;
            this.model = value;
            this.showStyle = typeof this.layerInfo[this.attribute];
        }
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    SelectColorComponent.prototype.buttomAdd = function () {
        var num = this.layerInfo[this.attribute].stops.length - 1;
        var value = this.layerInfo[this.attribute].stops[num][1];
        var index = this.layerInfo[this.attribute].stops[num][0];
        this.layerInfo[this.attribute].stops.push([Number(index) + 1, value]);
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    SelectColorComponent.prototype.change = function (event) {
        this.layerInfo[this.attribute] = this.model;
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    SelectColorComponent.prototype.changes = function (event) {
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    SelectColorComponent.prototype.test = function (event, index) {
        var pattern = /^((\d)|(1\d)|(2[0-4]))$/;
        var fall = pattern.test(event.target.value);
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
    __decorate([
        core_1.Input()
    ], SelectColorComponent.prototype, "layer");
    __decorate([
        core_1.Input()
    ], SelectColorComponent.prototype, "patemter");
    __decorate([
        core_1.Input()
    ], SelectColorComponent.prototype, "map");
    SelectColorComponent = __decorate([
        core_1.Component({
            selector: 'app-select-color',
            templateUrl: './select-color.component.html',
            styleUrls: ['./select-color.component.scss']
        })
    ], SelectColorComponent);
    return SelectColorComponent;
}());
exports.SelectColorComponent = SelectColorComponent;
//# sourceMappingURL=select-color.component.js.map