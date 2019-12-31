"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var InputPatternComponent = /** @class */ (function () {
    function InputPatternComponent(mapEditorService, config, elementRef, renderer) {
        this.mapEditorService = mapEditorService;
        this.config = config;
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.opacity = [];
        this.isCollapsed = true;
    }
    InputPatternComponent.prototype.ngOnInit = function () {
    };
    InputPatternComponent.prototype.ngOnChanges = function () {
        var _this = this;
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
        this.type = this.patemter.type;
        this.showStyle = typeof this.layerInfo[this.attribute];
        if (this.type === 2) {
            this.model = this.model * 100;
            this.opacity = [];
            var _this_1 = this;
            if (this.showStyle === 'object') {
                this.layerInfo[this.attribute].stops.forEach(function (value, index, array) {
                    _this_1.opacity.push(value[1] * 100);
                });
            }
        }
        if (this.attribute === 'icon-image') {
            this.iconChange = this.mapEditorService.iconChangeEventEmitter.subscribe(function (value) {
                if (value.target.innerText === '...') {
                    _this.isCollapsed = false;
                }
                else if (value.target.className === 'nav-link') {
                    _this.isCollapsed = false;
                }
                else {
                    _this.isCollapsed = true;
                }
            });
            this.iconPosition = this.splite;
            this.iconClass = [[], [], [], [], [], [], [], []];
            for (var i in this.iconPosition) {
                switch (i.substr(0, 1)) {
                    case '1':
                        this.iconClass[0].push({
                            id: i,
                            position: this.iconPosition[i]
                        });
                        break;
                    case '2':
                        this.iconClass[1].push({
                            id: i,
                            position: this.iconPosition[i]
                        });
                        break;
                    case '3':
                        this.iconClass[2].push({
                            id: i,
                            position: this.iconPosition[i]
                        });
                        break;
                    case '4':
                        this.iconClass[3].push({
                            id: i,
                            position: this.iconPosition[i]
                        });
                        break;
                    case '5':
                        this.iconClass[4].push({
                            id: i,
                            position: this.iconPosition[i]
                        });
                        break;
                    case '7':
                        this.iconClass[5].push({
                            id: i,
                            position: this.iconPosition[i]
                        });
                        break;
                    case '8':
                        this.iconClass[6].push({
                            id: i,
                            position: this.iconPosition[i]
                        });
                        break;
                    default:
                        this.iconClass[7].push({
                            id: i,
                            position: this.iconPosition[i]
                        });
                }
            }
        }
    };
    InputPatternComponent.prototype.clicks = function (event, index) {
        this.isCollapsed = !this.isCollapsed;
        var iconChange = this.elementRef.nativeElement.getElementsByClassName('iconStyle')[0];
        iconChange.style.position = 'fixed';
        iconChange.style.top = (event.screenY - 150) + 'px';
        iconChange.style.left = (event.screenX + 50) + 'px';
        this.chooseClass(0);
        if (index !== undefined) {
            this.iconIndex = index;
        }
    };
    InputPatternComponent.prototype.chooseClass = function (value) {
        this.iconList = this.iconClass[value];
    };
    InputPatternComponent.prototype.selectIcon = function (iconClass, index) {
        if (this.showStyle === 'object') {
            this.layerInfo[this.attribute].stops[this.iconIndex][1] = iconClass[index].id;
        }
        else {
            this.model = iconClass[index].id;
            this.layerInfo[this.attribute] = iconClass[index].id;
        }
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    InputPatternComponent.prototype.clickAdd = function () {
        if (this.layerInfo[this.attribute] === undefined) {
            if (this.type === 2) {
                this.layerInfo[this.attribute] = {
                    'stops': [
                        [6, (this.model / 100)], [10, (this.model / 100)]
                    ]
                };
                this.opacity.push(this.layerInfo[this.attribute].stops[0][1] * 100);
                this.opacity.push(this.layerInfo[this.attribute].stops[1][1] * 100);
            }
            else {
                this.layerInfo[this.attribute] = {
                    'stops': [
                        [6, this.model], [10, this.model]
                    ]
                };
            }
        }
        else {
            this.layerInfo[this.attribute] = {
                'stops': [
                    [6, this.layerInfo[this.attribute]], [10, this.layerInfo[this.attribute]]
                ]
            };
            this.opacity.push(this.layerInfo[this.attribute].stops[0][1] * 100);
            this.opacity.push(this.layerInfo[this.attribute].stops[1][1] * 100);
        }
        this.showStyle = typeof this.layerInfo[this.attribute];
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    InputPatternComponent.prototype.remove = function (index) {
        this.layerInfo[this.attribute].stops.splice(index, 1);
        this.opacity.splice(index, 1);
        if (this.layerInfo[this.attribute].stops.length <= 1) {
            var value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
            if (this.type === 1) {
                this.layerInfo[this.attribute] = value;
                this.model = value;
                if (this.layerInfo[this.attribute] === '') {
                    delete this.layerInfo[this.attribute];
                }
            }
            else if (this.type === 0) {
                this.layerInfo[this.attribute] = Number(value);
                this.model = Number(value);
            }
            else {
                this.layerInfo[this.attribute] = Number(value);
                this.model = Number(value) * 100;
            }
            this.opacity = [];
            this.showStyle = typeof this.layerInfo[this.attribute];
        }
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    InputPatternComponent.prototype.buttomAdd = function () {
        var num = this.layerInfo[this.attribute].stops.length - 1;
        var value = this.layerInfo[this.attribute].stops[num][1];
        var index = this.layerInfo[this.attribute].stops[num][0];
        this.layerInfo[this.attribute].stops.push([Number(index) + 1, value]);
        this.opacity.push(value * 100);
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    InputPatternComponent.prototype.change = function (event) {
        if (this.type === 1) {
            this.layerInfo[this.attribute] = this.model;
            if (this.layerInfo[this.attribute] === '') {
                delete this.layerInfo[this.attribute];
            }
        }
        else {
            this.layerInfo[this.attribute] = Number(this.model);
        }
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    InputPatternComponent.prototype.changes = function () {
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    InputPatternComponent.prototype.slideEnd = function (event) {
        this.layerInfo[this.attribute] = this.model / 100;
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    InputPatternComponent.prototype.slideEndStops = function (event, index) {
        this.layerInfo[this.attribute].stops[index][1] = this.opacity[index] / 100;
        this.mapEditorService.changeStyle.emit(this.layer);
    };
    InputPatternComponent.prototype.test = function (event, index) {
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
    ], InputPatternComponent.prototype, "layer");
    __decorate([
        core_1.Input()
    ], InputPatternComponent.prototype, "patemter");
    __decorate([
        core_1.Input()
    ], InputPatternComponent.prototype, "splite");
    InputPatternComponent = __decorate([
        core_1.Component({
            selector: 'app-input-pattern',
            templateUrl: './input-pattern.component.html',
            styleUrls: ['./input-pattern.component.scss']
        })
    ], InputPatternComponent);
    return InputPatternComponent;
}());
exports.InputPatternComponent = InputPatternComponent;
//# sourceMappingURL=input-pattern.component.js.map