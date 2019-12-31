"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var SearchComponent = /** @class */ (function () {
    function SearchComponent() {
        this.selectedCar2 = 'BMW';
        this.cars = [
            { label: '-15px -15px', value: 'Audi1' },
            { label: '-15px -25px', value: 'BMW' },
            { label: '-15px -35px', value: 'Fiat' },
            { label: '-15px -45px', value: 'Ford' },
            { label: '-15px -55px', value: 'Honda' },
            { label: '-15px -65px', value: 'Jaguar' },
            { label: '-15px -75px', value: 'Mercedes' },
            { label: '-15px -85px', value: 'Renault' },
            { label: '-15px -95px', value: 'VW' },
            { label: '-15px -195px', value: 'Volvo' }
        ];
    }
    SearchComponent.prototype.ngOnInit = function () {
    };
    SearchComponent = __decorate([
        core_1.Component({
            selector: 'app-search',
            templateUrl: './search.component.html',
            styleUrls: ['./search.component.css']
        })
    ], SearchComponent);
    return SearchComponent;
}());
exports.SearchComponent = SearchComponent;
//# sourceMappingURL=search.component.js.map