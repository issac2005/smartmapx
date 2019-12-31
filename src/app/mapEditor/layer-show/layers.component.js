"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
core_1.enableProdMode();
var LayersComponent = /** @class */ (function () {
    function LayersComponent(mapEditorService, config, httpService) {
        this.mapEditorService = mapEditorService;
        this.config = config;
        this.httpService = httpService;
        this.radius = 1;
        this.ServiceEventId = [];
        this.HasEventId = false;
    }
    LayersComponent.prototype.ngOnInit = function () {
        /*setTimeout(() => {
            for (let i = 0; i < document.getElementsByClassName('card-header').length; i++) {
                document.getElementsByClassName('card-header')[i].getElementsByTagName('a')[0].click();
            }
        }, 500);*/
        this.getInfo();
    };
    LayersComponent.prototype.ngOnChanges = function () {
        var _this = this;
        this.HasEventId = false;
        if (this.layerInfo !== undefined) {
            var id_1 = this.layerInfo.metadata.service_event_id;
            if (this.ServiceEventId.length === 0) {
                this.httpService.getData({ service_event_id: this.layerInfo.metadata.service_event_id }, true, 'execute', '86104465-ea69-4f8d-85a7-88a71c745f3c', '')
                    .subscribe(function (data) {
                    /*console.log(data);*/
                    var pattern = [];
                    var defau = [];
                    for (var m = 0; m < data.data.root.length; m++) {
                        pattern.push(data.data.root[m].name);
                        defau.push(data.data.root[m].desc);
                    }
                    _this.ServiceEventId.push({
                        id: id_1,
                        name: pattern,
                        desc: defau
                    });
                    console.log(_this.ServiceEventId);
                }, function (error) {
                    console.log(error);
                });
            }
            else {
                for (var i = 0; i < this.ServiceEventId.length; i++) {
                    if (id_1 === this.ServiceEventId[i].id) {
                        this.HasEventId = true;
                        break;
                    }
                }
                if (!this.HasEventId) {
                    this.httpService.getData({ service_event_id: this.layerInfo.metadata.service_event_id }, true, 'execute', '86104465-ea69-4f8d-85a7-88a71c745f3c', '')
                        .subscribe(function (data) {
                        var pattern = [];
                        var defau = [];
                        for (var m = 0; m < data.data.root.length; m++) {
                            pattern.push(data.data.root[m].name);
                            defau.push(data.data.root[m].desc);
                        }
                        _this.ServiceEventId.push({
                            id: id_1,
                            name: pattern,
                            desc: defau
                        });
                    }, function (error) {
                        console.log(error);
                    });
                }
            }
        }
        setTimeout(function () {
            var num = document.getElementsByClassName('card-header');
            for (var i = 0; i < num.length; i++) {
                if (!(num[i].getAttribute('class') === 'card-header active')) {
                    num[i].getElementsByTagName('a')[0].click();
                }
            }
        }, 50);
        if (this.layerInfo !== undefined) {
            if (this.layerInfo.maxzoom === undefined) {
                this.layerInfo.maxzoom = 24;
            }
            if (this.layerInfo.minzoom === undefined) {
                this.layerInfo.minzoom = 0;
            }
        }
        this.myTextarea = JSON.stringify(this.layerInfo, null, 2);
    };
    LayersComponent.prototype.getInfo = function () {
        var _this = this;
        this.config.getRequest().subscribe(function (res) {
            _this.layerData = res.json();
            /* console.log(this.layerData);*/
            /* console.log(this.layerData.groups.condition);*/
        }, function (error) {
            console.log(error);
        });
        this.config.getSprite().subscribe(function (res) {
            _this.splite = res.json();
        }, function (error) {
            console.log(error);
        });
    };
    __decorate([
        core_1.Input()
    ], LayersComponent.prototype, "layerInfo");
    __decorate([
        core_1.Input()
    ], LayersComponent.prototype, "layerIndex");
    __decorate([
        core_1.Input()
    ], LayersComponent.prototype, "layerEditor");
    LayersComponent = __decorate([
        core_1.Component({
            selector: 'app-layers',
            templateUrl: './layers.component.html',
            styleUrls: ['./layers.component.scss']
        })
    ], LayersComponent);
    return LayersComponent;
}());
exports.LayersComponent = LayersComponent;
//# sourceMappingURL=layers.component.js.map