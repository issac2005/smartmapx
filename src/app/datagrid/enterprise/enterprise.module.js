"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var router_1 = require("@angular/router");
var enterprise_component_1 = require("./enterprise.component");
var etpage_component_1 = require("./et-page/etpage.component");
// import {EnterpriseModalComponent} from './modal/enterprise-modal.component';
var animations_1 = require("@angular/platform-browser/animations");
var ng_tree_module_1 = require("../../tree/ng.tree.module");
var primeng_1 = require("primeng/primeng");
// import {DataActionComponent} from '../panel/data-action/data-action.component'
// import {TestPanelComponent} from './panel/test-panel.component'
var EnterPriseModule = /** @class */ (function () {
    function EnterPriseModule() {
    }
    EnterPriseModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                ng_bootstrap_1.NgbModule,
                router_1.RouterModule,
                animations_1.BrowserAnimationsModule,
                ng_tree_module_1.NgTreeModule,
                primeng_1.MultiSelectModule
            ],
            declarations: [enterprise_component_1.EnterpriseComponent, etpage_component_1.EtPageComponent],
            entryComponents: [],
            exports: [enterprise_component_1.EnterpriseComponent],
            providers: []
        })
    ], EnterPriseModule);
    return EnterPriseModule;
}());
exports.EnterPriseModule = EnterPriseModule;
//# sourceMappingURL=enterprise.module.js.map
