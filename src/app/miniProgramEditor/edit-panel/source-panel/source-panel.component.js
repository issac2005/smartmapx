"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
require("rxjs/add/operator/toPromise");
var toast_model_1 = require("../../../common/toast/toast-model");
var SourcePanelComponent = /** @class */ (function () {
    function SourcePanelComponent(toastService, httpService, uploadService, http, modalService) {
        this.toastService = toastService;
        this.httpService = httpService;
        this.uploadService = uploadService;
        this.http = http;
        this.modalService = modalService;
        this.newFile = [];
        this.filename = [];
    }
    SourcePanelComponent.prototype.ngOnInit = function () {
        this.appsInfo = JSON.parse(localStorage.appsInfo);
        this.bianmaModel = 'UTF-8';
        // 加载数据库中已上传的文件资源
        this.fileResearch();
    };
    // 选中数据
    SourcePanelComponent.prototype.onCheck = function (data, index) {
        // 判断复选框是否被选中
        if (this.fileData[index].value) {
            this.filename.push(data.name);
        }
        else {
            var arr = this.filename.slice(0);
            var strIndex = this.filename.indexOf(data.name);
            this.filename.splice(strIndex, 1);
        }
    };
    // 删除选中数据
    SourcePanelComponent.prototype.fileDelete = function () {
        var _this = this;
        var self = this;
        this.filename.map(function (value, index) {
            self.fileData.map(function (data, ind) {
                if (data.name === value) {
                    self.fileData.splice(ind, 1);
                }
            });
        });
        var filename = this.filename.join();
        var deleteData = { mini_program_id: this.appsInfo.mini_program_id, fileName: filename };
        this.httpService.getData(deleteData, true, 'file', 'fileDelete', '')
            .subscribe(function (data) {
            var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.SUCCESS, '', '删除成功！', 2000);
            _this.toastService.toast(toastCfg);
        });
    };
    // 上传-打开上传弹窗
    SourcePanelComponent.prototype.open = function (content) {
        this.modalService.open(content).result.then(function (result) {
        }, function (reason) { });
    };
    // 上传
    SourcePanelComponent.prototype.upload = function () {
        var _this = this;
        console.log(this.appsInfo.mini_program_id);
        this.uploadService.makeFileRequest('upload/1.1.0/file/fileSearch', {
            charset: this.bianmaModel,
            mini_program_id: this.appsInfo.mini_program_id,
            resources: 'resources'
        }, this.inputFile) //uploadfile/mini_program/${mini_program_id}/resource
            .subscribe(function (data) {
            _this.newFile = data.data;
            console.log(_this.newFile.length);
            if (_this.newFile.length === _this.fileData.length) {
                var toastCfg_1 = new toast_model_1.ToastConfig(toast_model_1.ToastType.WARNING, '', '文件已经上传过了', 2000);
                _this.toastService.toast(toastCfg_1);
                return;
            }
            var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.SUCCESS, '', '上传成功！', 2000);
            _this.toastService.toast(toastCfg);
        });
    };
    // 上传-确定按钮
    SourcePanelComponent.prototype.upploadSave = function (close) {
        this.fileData = this.newFile;
        close();
    };
    // 上传-监听上传控件变化，判断文件大小
    SourcePanelComponent.prototype.fileChangeEvent = function (e) {
        if (e.target.files[0]) {
            if (e.target.files[0].size > (1024 * 1024 * 20)) {
                var toastCfg = new toast_model_1.ToastConfig(toast_model_1.ToastType.ERROR, '', '文件大小超出限制!', 2000);
                this.toastService.toast(toastCfg);
                e.target.value = '';
                return;
            }
            this.inputFile = e.target.files;
            this.upload();
        }
    };
    // 下载
    SourcePanelComponent.prototype.download = function () {
        var self = this;
        this.filename.map(function (value, index) {
            window.open('http://172.17.60.20:3002/uploadfile/miniprogram/' + self.appsInfo.mini_program_id + '/resources/' + value);
        });
        // for(let i=0; i<this.filename.length;i++){
        //     window.open('http://172.17.60.20:3002/uploadfile/miniprogram/'+ self.appsInfo.mini_program_id +'/resources/'+this.filename[i])
        // }
    };
    // 异常
    SourcePanelComponent.prototype.handleError = function (error) {
        return Promise.reject(error.message || error);
    };
    // 资源-请求服务器
    SourcePanelComponent.prototype.fileResearch = function () {
        var _this = this;
        var postData = { mini_program_id: this.appsInfo.mini_program_id };
        this.httpService.getData(postData, true, 'file', 'fileSearch', '')
            .subscribe(function (data) {
            _this.fileData = data.data;
            console.log(_this.fileData);
        });
    };
    __decorate([
        core_1.Input()
    ], SourcePanelComponent.prototype, "index");
    SourcePanelComponent = __decorate([
        core_1.Component({
            selector: 'app-source-panel',
            templateUrl: './source-panel.component.html',
            styleUrls: ['./source-panel.component.scss']
        })
    ], SourcePanelComponent);
    return SourcePanelComponent;
}());
exports.SourcePanelComponent = SourcePanelComponent;
//# sourceMappingURL=source-panel.component.js.map