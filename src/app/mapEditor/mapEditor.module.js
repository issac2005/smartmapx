"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var http_1 = require("@angular/http");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var ngx_color_picker_1 = require("../ngx-color-picker");
var forms_1 = require("@angular/forms");
var platform_browser_1 = require("@angular/platform-browser");
var core_1 = require("@angular/core");
var app_layout_component_1 = require("./app-layout/app-layout.component");
var layers_component_1 = require("./layers/layers.component");
var modal_component_1 = require("./modal/modal.component");
var select_color_component_1 = require("./mapEditorComponent/select-color/select-color.component");
var boolean_component_1 = require("./mapEditorComponent/boolean/boolean.component");
var double_input_component_1 = require("./mapEditorComponent/double-input/double-input.component");
var input_pattern_component_1 = require("./mapEditorComponent/input-pattern/input-pattern.component");
var layout_component_1 = require("./mapEditorComponent/layout/layout.component");
var base_info_component_1 = require("./mapEditorComponent/base-info/base-info.component");
var primeng_1 = require("primeng/primeng");
var ng2_dragula_1 = require("ng2-dragula");
var app_publish_component_1 = require("./publish/app-publish.component");
var mini_program_component_1 = require("./mini-program/mini-program.component");
var primeng_2 = require("primeng/primeng");
var MapEditorModule = /** @class */ (function () {
    function MapEditorModule() {
    }
    MapEditorModule = __decorate([
        core_1.NgModule({
            declarations: [
                app_layout_component_1.AppLayoutComponent,
                layers_component_1.LayersComponent,
                modal_component_1.ModalComponent,
                select_color_component_1.SelectColorComponent,
                boolean_component_1.BooleanComponent,
                double_input_component_1.DoubleInputComponent,
                input_pattern_component_1.InputPatternComponent,
                layout_component_1.LayoutComponent,
                base_info_component_1.BaseInfoComponent,
                app_publish_component_1.AppPublishComponent,
                mini_program_component_1.MiniProgramComponent,
            ],
            imports: [
                platform_browser_1.BrowserModule,
                http_1.HttpModule,
                forms_1.FormsModule,
                ng_bootstrap_1.NgbModule.forRoot(),
                ngx_color_picker_1.ColorPickerModule,
                primeng_1.SliderModule,
                ng2_dragula_1.DragulaModule,
                primeng_2.DropdownModule
            ],
            exports: [app_layout_component_1.AppLayoutComponent],
            providers: [],
            bootstrap: []
        })
    ], MapEditorModule);
    return MapEditorModule;
}());
exports.MapEditorModule = MapEditorModule;
//# sourceMappingURL=mapEditor.module.js.map