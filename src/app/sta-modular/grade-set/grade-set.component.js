"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var GradeSetComponent = /** @class */ (function () {
    function GradeSetComponent(appService) {
        this.appService = appService;
        this.rgb = '#87d9ce';
        this.slider = 20;
        this.show = false;
        this.colorArray = [];
    }
    GradeSetComponent.prototype.ngOnInit = function () {
    };
    GradeSetComponent.prototype.ngOnChanges = function () {
        if (this.config.componentType === 2) {
            var array = this.style.paint[this.config.attribute[0]].slice(3, this.style.paint[this.config.attribute[0]].length);
            for (var i = 0; i < array.length; i++) {
                if (i % 2 === 0) {
                    this.colorArray.push([array[i], array[i + 1]]);
                }
            }
        }
    };
    GradeSetComponent.prototype.click = function () {
        /*this.layer.layout = {};
        this.sliders = this.layer.paint['heatmap-opacity'] * 100;
        this.appService.statisticsEventEmitter.emit('123');
        this.show = true;*/
    };
    GradeSetComponent.prototype.colorChange = function () {
        console.log(this.colorArray);
        this.style.paint[this.config.attribute[0]] = ['interpolate', ['linear'], ['heatmap-density']];
        for (var i = 0; i < this.colorArray.length; i++) {
            this.style.paint[this.config.attribute[0]] = this.style.paint[this.config.attribute[0]].concat(this.colorArray[i]);
            /*this.style.paint[this.config.attribute[0]].push(this.colorArray[i]);*/
        }
    };
    GradeSetComponent.prototype.sliderEnd = function () {
        /* this.layer.paint['heatmap-opacity'] = this.sliders / 100;*/
    };
    GradeSetComponent.prototype.clicks = function () {
        this.appService.statisticsEventEmitter.emit('123');
    };
    __decorate([
        core_1.Input()
    ], GradeSetComponent.prototype, "config");
    __decorate([
        core_1.Input()
    ], GradeSetComponent.prototype, "style");
    GradeSetComponent = __decorate([
        core_1.Component({
            selector: 'app-grade-set',
            templateUrl: './grade-set.component.html',
            styleUrls: ['./grade-set.component.scss']
        })
    ], GradeSetComponent);
    return GradeSetComponent;
}());
exports.GradeSetComponent = GradeSetComponent;
//# sourceMappingURL=grade-set.component.js.map