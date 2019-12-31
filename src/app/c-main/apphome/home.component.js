"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var styles = require('./home.component.scss');
var HomeComponent = /** @class */ (function () {
    function HomeComponent(location, router, appService, routerIonfo, httpService) {
        var _this = this;
        this.location = location;
        this.router = router;
        this.appService = appService;
        this.routerIonfo = routerIonfo;
        this.httpService = httpService;
        this.classModuleShow = {};
        this.classModule = [];
        this.appService.mainListEventEmitter.subscribe(function (value) {
            if (value) {
                _this.classModuleShow = value;
            }
        });
    }
    /**
     * 初始化
     */
    HomeComponent.prototype.ngOnInit = function () {
        var _this = this;
        // const parmas = this.getQueryString();
        //
        // if ((parmas as any).id_token) {
        //     const token = (parmas as any).id_token;
        //     localStorage.setItem('id_token', token);
        //
        //
        //     this.httpService.getData({}, true, 'execute', 'a3184800-96e3-436e-88c9-98225dc3fffa', '1')
        //         .subscribe(
        //             data => {
        //                 if ((data as any).data.login_name) {
        //
        //                     localStorage.setItem('user_id', (data as any).data.login_name);
        //                 }
        //             },
        //             error => {
        //                 console.log(error)
        //             }
        //         );
        // } else {
        if (JSON.stringify(this.classModuleShow) !== '{}') {
        }
        else {
            this.productId = this.routerIonfo.snapshot.queryParams['id'];
            this.httpService.getData({}, false, 'chat_execute', 'fm_system_query_screen', '1')
                .subscribe(function (data) {
                _this.classModule = _this.forMatdata(data.data).sort(function (a, b) {
                    return a.sort - b.sort;
                });
                if (_this.appService.titleNowChoose) {
                    for (var i in _this.classModule) {
                        if (_this.appService.titleNowChoose === _this.classModule[i].name) {
                            _this.classModuleShow = _this.classModule[i];
                        }
                    }
                }
                else {
                    var _useNum = 0;
                    for (var i in _this.classModule) {
                        if (_this.productId === _this.classModule[i].menu_id) {
                            _useNum = parseInt(i, 10);
                        }
                    }
                    _this.classModuleShow = _this.classModule[_useNum];
                }
            }, function (error) {
                console.log(error);
                console.log(error.text());
            });
        }
        // }
    };
    /**
     * 获取url参数
     */
    // getQueryString() {
    //
    //     const url = this.location.path(); // 获取url中"?"符后的字串
    //     const theRequest = new Object();
    //     if (url.indexOf('?') !== -1) {
    //         const str = url.substr(1);
    //         const strs1 = str.split('?');
    //         const strs = strs1[1].split('&');
    //         for (let i = 0; i < strs.length; i++) {
    //             theRequest[strs[i].split('=')[0]] = strs[i].split('=')[1];
    //         }
    //     }
    //
    //     return theRequest;
    // }
    /*
    * 获取页面宽度
    * */
    HomeComponent.prototype.getWinWidth = function () {
        var width = 0;
        /*for (let i of this.classModule) {
         width += parseInt(i.width) * 160 + 160;
         }*/
        width = this.classModuleShow.width * 1 + 160;
        return width;
    };
    /*
    * 点击每个模块进入相应的子菜单
    * */
    HomeComponent.prototype.openModule = function (tile) {
        if (tile.type === 'html') {
            window.open(tile.model);
            // window.location.href = tile.model;
        }
        else if (tile.type === 'component') {
            if (tile.model === '/app/showdata') {
                this.router.navigate([tile.model], { queryParams: { type: 'da' } });
            }
            else if (tile.model === '/app/showapplet') {
                this.router.navigate([tile.model], { queryParams: { type: 'ap' } });
            }
            else if (tile.model === '/app/showenterprise') {
                this.router.navigate([tile.model], { queryParams: { type: 'en' } });
            }
            else {
                this.router.navigate([tile.model]);
            }
        }
    };
    /*
    * 将返回的数据格式化为树形结构
    * */
    HomeComponent.prototype.forMatdata = function (data) {
        var formatD = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var i = data_1[_i];
            if (i.content) {
                i.content = JSON.parse(i.content);
            }
            if (i.parent_id === '') {
                formatD.push(i);
            }
        }
        for (var _a = 0, data_2 = data; _a < data_2.length; _a++) {
            var i = data_2[_a];
            for (var _b = 0, formatD_1 = formatD; _b < formatD_1.length; _b++) {
                var j = formatD_1[_b];
                if (i.parent_id === j.menu_id) {
                    if (!j.child) {
                        j.child = [];
                    }
                    j['child'].push(i);
                }
            }
        }
        return formatD;
    };
    HomeComponent = __decorate([
        core_1.Component({
            selector: 'c-home',
            templateUrl: './home.component.html',
            styles: [styles]
        })
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.component.js.map