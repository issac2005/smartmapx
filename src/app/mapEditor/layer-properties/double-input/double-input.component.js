"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var DoubleInputComponent = /** @class */ (function () {
    function DoubleInputComponent(mapEditorService) {
        this.mapEditorService = mapEditorService;
    }
    DoubleInputComponent.prototype.ngOnInit = function () {
    };
    DoubleInputComponent.prototype.ngOnChanges = function () {
        if (!this.layer[this.patemter.belong]) {
            this.layer[this.patemter.belong] = {};
        }
        this.layerInfo = this.layer[this.patemter.belong];
        this.attribute = this.patemter.attribute;
        if (this.layerInfo[this.attribute] === undefined) {
            this.pattern = this.patemter.pattern;
            this.title = this.patemter.title;
            this.model = this.patemter["default"];
            this.type = this.patemter.type;
        }
        else {
            this.pattern = this.patemter.pattern;
            this.title = this.patemter.title;
            this.model = this.layerInfo[this.attribute];
            this.type = this.patemter.type;
        }
        if (this.type === 0) {
            this.one = this.model[0];
        }
        else if (this.type === 2) {
            this.one = this.model[0];
            this.two = this.model[1];
            this.three = this.model[2];
            this.four = this.model[3];
        }
        else {
            this.one = this.model[0];
            this.two = this.model[1];
        }
        this.showStyle = typeof this.layerInfo[this.attribute];
        this.isArray = this.layerInfo[this.attribute] instanceof Array;
    };
    DoubleInputComponent.prototype.clickAdd = function () {
        if (this.layerInfo[this.attribute] === undefined) {
            if (this.type === 0) {
                this.layerInfo[this.attribute] = {
                    'stops': [
                        [6, [this.one]], [10, [this.one]]
                    ]
                };
            }
            else if (this.type === 2) {
                this.layerInfo[this.attribute] = {
                    'stops': [
                        [6, [this.one, this.two, this.three, this.four]], [10, [this.one, this.two, this.three, this.four]]
                    ]
                };
            }
            else {
                this.layerInfo[this.attribute] = {
                    'stops': [
                        [6, [this.one, this.two]], [10, [this.one, this.two]]
                    ]
                };
            }
            this.mapEditorService.changeStyle.emit(this.layer);
        }
        else {
            if (this.type === 0) {
                this.layerInfo[this.attribute] = {
                    'stops': [
                        [6, [this.layerInfo[this.attribute][0]]],
                        [10, [this.layerInfo[this.attribute][0]]]
                    ]
                };
            }
            else if (this.type === 2) {
                this.layerInfo[this.attribute] = {
                    'stops': [
                        [6, [this.layerInfo[this.attribute][0], this.layerInfo[this.attribute][1], this.layerInfo[this.attribute][2], this.layerInfo[this.attribute][3]]],
                        [10, [this.layerInfo[this.attribute][0], this.layerInfo[this.attribute][1], this.layerInfo[this.attribute][2], this.layerInfo[this.attribute][3]]]
                    ]
                };
            }
            else {
                this.layerInfo[this.attribute] = {
                    'stops': [
                        [6, [this.layerInfo[this.attribute][0], this.layerInfo[this.attribute][1]]],
                        [10, [this.layerInfo[this.attribute][0], this.layerInfo[this.attribute][1]]]
                    ]
                };
            }
            this.mapEditorService.changeStyle.emit(this.layer);
        }
        this.isArray = this.layerInfo[this.attribute] instanceof Array;
        this.showStyle = typeof this.layerInfo[this.attribute];
    };
    DoubleInputComponent.prototype.remove = function (index) {
        this.layerInfo[this.attribute].stops.splice(index, 1);
        if (this.layerInfo[this.attribute].stops.length <= 1) {
            var value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
            this.layerInfo[this.attribute] = value;
            if (this.type === 0) {
                this.one = value[0];
            }
            else if (this.type === 2) {
                this.one = Number(value[0]);
                this.two = Number(value[1]);
                this.three = Number(value[2]);
                this.four = Number(value[3]);
            }
            else {
                this.one = Number(value[0]);
                this.two = Number(value[1]);
            }
            this.isArray = this.layerInfo[this.attribute] instanceof Array;
            this.showStyle = typeof this.layerInfo[this.attribute];
        }
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    DoubleInputComponent.prototype.buttomAdd = function () {
        var num = this.layerInfo[this.attribute].stops.length - 1;
        var value = this.layerInfo[this.attribute].stops[num][1];
        var index = this.layerInfo[this.attribute].stops[num][0];
        if (this.type === 0) {
            this.layerInfo[this.attribute].stops.push([Number(index) + 1, [value[0]]]);
        }
        else if (this.type === 2) {
            this.layerInfo[this.attribute].stops.push([Number(index) + 1, [value[0], value[1], value[2], value[3]]]);
        }
        else {
            this.layerInfo[this.attribute].stops.push([Number(index) + 1, [value[0], value[1]]]);
        }
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    DoubleInputComponent.prototype.change = function (event, index) {
        if (event.target.value === '') {
            event.target.value = 0;
        }
        if (this.type === 0) {
            this.layerInfo[this.attribute] = [this.one];
        }
        else if (this.type === 2) {
            this.layerInfo[this.attribute] = [Number(this.one), Number(this.two), Number(this.three), Number(this.four)];
        }
        else {
            this.layerInfo[this.attribute] = [Number(this.one), Number(this.two)];
        }
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    DoubleInputComponent.prototype.changes = function (event, index1, index2) {
        if (event.target.value === '') {
            event.target.value = 0;
            this.layerInfo[this.attribute].stops[index1][1][index2] = 0;
        }
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    DoubleInputComponent.prototype.test = function (event, index) {
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
    ], DoubleInputComponent.prototype, "layer");
    __decorate([
        core_1.Input()
    ], DoubleInputComponent.prototype, "patemter");
    DoubleInputComponent = __decorate([
        core_1.Component({
            selector: 'app-double-input',
            templateUrl: './double-input.component.html',
            styleUrls: ['./double-input.component.scss']
        })
    ], DoubleInputComponent);
    return DoubleInputComponent;
}());
exports.DoubleInputComponent = DoubleInputComponent;
//# sourceMappingURL=double-input.component.js.map