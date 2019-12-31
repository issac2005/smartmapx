"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var smartmpax = require("../../mapEditor/source/newsmartmapx/smartmapx.js");
var MapComponent = (function () {
    function MapComponent(httpService) {
        this.httpService = httpService;
        this.sendMsg = new core_1.EventEmitter();
    }
    MapComponent.prototype.ngOnInit = function () {
        this.mapInit();
    };
    MapComponent.prototype.mapInit = function () {
        var _this = this;
        // alert(this.dataInfo.default_map_id);
        var postData = {
            mapID: this.dataInfo.default_map_id
        };
        this.httpService.getData(postData, true, 'execute', 'findBaseMapStyle', 'em')
            .subscribe(function (data) {
            var self = _this;
            _this.map = new smartmpax.Map({
                container: 'map',
                style: data.data,
                //appServerUrl: 'http://172.17.60.20:3002/uploadfile/miniprogram' // 172.17.60.20:3002/uploadfile/mini_program
                appServerUrl: '/uploadfile/miniprogram' // 线上使用
            });
            _this.map.on('load', function () {
                self.loaded = true;
                self.sendMsg.emit(self.loaded);
            });
        });
    };
    return MapComponent;
}());
__decorate([
    core_1.Input()
], MapComponent.prototype, "dataInfo");
__decorate([
    core_1.Output()
], MapComponent.prototype, "sendMsg");
MapComponent = __decorate([
    core_1.Component({
        selector: 'app-map',
        templateUrl: './map.component.html',
        styleUrls: ['./map.component.scss']
    })
], MapComponent);
exports.MapComponent = MapComponent;
//# sourceMappingURL=map.component.js.map