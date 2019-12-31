import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppLayoutComponent} from './app-layout/app-layout.component';
import {LayersComponent} from './layer-show/layers.component';
import {SelectColorComponent} from './layer-properties/select-color/select-color.component';
import {BooleanComponent} from './layer-properties/boolean/boolean.component';
import {DoubleInputComponent} from './layer-properties/double-input/double-input.component';
import {InputPatternComponent} from './layer-properties/input-pattern/input-pattern.component';
import {LayoutComponent} from './layer-properties/layout/layout.component';
import {BaseInfoComponent} from './layer-properties/base-info/base-info.component';
import {DragulaModule} from 'ng2-dragula';
import {MiniProgramComponent} from './mini-program/mini-program.component';
import {JsonShowComponent} from './mini-program/json-show/json-show.component';
import {AppJsonComponent} from './mini-program/json/json.component';
import {StaMainModule} from '../sta-modular/sta-main.module';
import {ToolbarModule} from './toolbar/toolbar.module';
import {MultiplexsModule} from '../multiplex/multiplexs.module';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {SmxTreeComponent} from './smx-tree/smx-tree.component';
import {SmxTreeNodeComponent} from './smx-tree/smx-tree-node.component';
import {ExpressionComponent} from './layer-properties/expression/expression.component';
import {SmxRasterModule} from '../raster/smx-raster.module';
import {
  SmxModalModule,
  ColorSketchModule,
  SmxSelectModule,
  SmxSliderModule,
  SmxDropdownModule,
  SmxTooltipModule
} from '../smx-component/smx.module';
import {
  SmxDataTabsModalModule
} from '../smx-unit/smx-unit.module';

@NgModule({
  declarations: [
    AppLayoutComponent,
    LayersComponent,
    SelectColorComponent,
    BooleanComponent,
    DoubleInputComponent,
    InputPatternComponent,
    LayoutComponent,
    BaseInfoComponent,
    // AppPublishComponent,
    MiniProgramComponent,
    JsonShowComponent,
    AppJsonComponent,
    SmxTreeComponent,
    SmxTreeNodeComponent,
    ExpressionComponent,
    // LayerListComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    SmxModalModule,
    SmxSliderModule,
    DragulaModule.forRoot(),
    SmxDropdownModule,
    StaMainModule,
    MultiplexsModule,
    ColorSketchModule,
    SmxTooltipModule,
    NgZorroAntdModule,
    ToolbarModule,
    SmxDataTabsModalModule,
    SmxRasterModule,
    SmxSelectModule
  ],
  exports: [AppLayoutComponent],
  providers: [],
  bootstrap: []
})
export class MapEditorModule {
}
