"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var SliderComponent = /** @class */ (function () {
    function SliderComponent() {
    }
    SliderComponent.prototype.ngOnInit = function () {
        console.log(this.style);
        if (this.config.componentType === 1) {
            this.sValue = this.getValue();
        }
        else {
            this.sValue = this.getValue() * 100;
        }
    };
    // 滑动结束
    SliderComponent.prototype.onSlideEnd = function (e) {
        if (this.config.componentType === 1) {
            if (this.config.parentKey.length === 1) {
                this.style[this.config.parentKey[0]] = e.value;
            }
            else if (this.config.parentKey.length === 2) {
                this.style[this.config.parentKey[0]][this.config.parentKey[1]] = e.value;
            }
            else {
                this.style[this.config.parentKey[0]][this.config.parentKey[1]][this.config.parentKey[2]] = e.value;
            }
        }
        else {
            if (this.config.parentKey.length === 1) {
                this.style[this.config.parentKey[0]] = e.value;
            }
            else if (this.config.parentKey.length === 2) {
                this.style[this.config.parentKey[0]][this.config.parentKey[1]] = e.value / 100;
            }
            else {
                this.style[this.config.parentKey[0]][this.config.parentKey[1]][this.config.parentKey[2]] = e.value / 100;
            }
        }
        console.log(this.style);
    };
    SliderComponent.prototype.getValue = function () {
        var obj = this.style;
        for (var _i = 0, _a = this.config.parentKey; _i < _a.length; _i++) {
            var v = _a[_i];
            obj = obj[v];
        }
        return obj;
    };
    __decorate([
        core_1.Input()
    ], SliderComponent.prototype, "config");
    __decorate([
        core_1.Input()
    ], SliderComponent.prototype, "style");
    __decorate([
        core_1.Input()
    ], SliderComponent.prototype, "value");
    SliderComponent = __decorate([
        core_1.Component({
            selector: 'sta-slider',
            templateUrl: './slider.component.html',
            styleUrls: ['./slider.component.scss']
        })
    ], SliderComponent);
    return SliderComponent;
}());
exports.SliderComponent = SliderComponent;
//# sourceMappingURL=slider.component.js.map