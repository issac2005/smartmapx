"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var RadioComponent = /** @class */ (function () {
    function RadioComponent() {
    }
    RadioComponent.prototype.ngOnInit = function () {
        console.log(this.style);
        this.sValue = this.getValue();
    };
    RadioComponent.prototype.checkedRadio = function (e) {
        if (this.config.parentKey.length === 1) {
            this.style[this.config.parentKey[0]] = e.target.value;
        }
        else if (this.config.parentKey.length === 2) {
            this.style[this.config.parentKey[0]][this.config.parentKey[1]] = e.target.value;
        }
        else {
            this.style[this.config.parentKey[0]][this.config.parentKey[1]][this.config.parentKey[2]] = e.target.value;
        }
    };
    RadioComponent.prototype.getValue = function () {
        var obj = this.style;
        for (var _i = 0, _a = this.config.parentKey; _i < _a.length; _i++) {
            var v = _a[_i];
            obj = obj[v];
        }
        return obj;
    };
    __decorate([
        core_1.Input()
    ], RadioComponent.prototype, "config");
    __decorate([
        core_1.Input()
    ], RadioComponent.prototype, "style");
    RadioComponent = __decorate([
        core_1.Component({
            selector: 'sta-radio',
            templateUrl: './radio.component.html',
            styleUrls: ['./radio.component.scss']
        })
    ], RadioComponent);
    return RadioComponent;
}());
exports.RadioComponent = RadioComponent;
//# sourceMappingURL=radio.component.js.map