"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var platform_browser_1 = require("@angular/platform-browser");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/http");
/*import {JsonEditorModule} from 'ng2-json-editor';*/
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var ngx_color_picker_1 = require("../ngx-color-picker");
var grade_set_component_1 = require("./grade-set/grade-set.component");
var sta_main_component_1 = require("./sta-main.component");
/*import {NgJsonEditorModule} from 'ang-jsoneditor';*/
var StaMainModule = /** @class */ (function () {
    function StaTemplateModule() {
    }
    StaTemplateModule = __decorate([
        core_1.NgModule({
            declarations: [
                select_component_1.SubsectionComponent,
                radio_component_1.RadioComponent,
                color_component_1.ColorComponent,
                slider_component_1.SliderComponent,
                grade_set_component_1.GradeSetComponent,
                sta_main_component_1.StaMainComponent
            ],
            imports: [
                platform_browser_1.BrowserModule,
                http_1.HttpModule,
                forms_1.FormsModule,
                primeng_1.SliderModule,
                ng_bootstrap_1.NgbModule.forRoot(),
                ngx_color_picker_1.ColorPickerModule,
                primeng_1.DropdownModule
            ],
            exports: [sta_main_component_1.StaMainComponent],
            providers: [],
            bootstrap: []
        })
    ], StaTemplateModule);
    return StaTemplateModule;
}());
exports.StaTemplateModule = StaMainModule;
//# sourceMappingURL=staTemplate.module.js.map
