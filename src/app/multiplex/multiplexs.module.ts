import {SmxModalModule} from '../smx-component/smx-modal/smx-modal.module';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BooleanComponent} from './boolean/boolean.component';
import {SSliderComponent} from './s-slider/s-slider.component';
import {LegendComponent} from './s_legend/legend.component';
import {InputComponent} from './input/input';
import {LayerSelectComponent} from './layer-select/layer-select.component';
import {DropDownComponent} from './drop-down/drop-down.component';
import {DynamicLayerComponent} from './dynamic-layer/dynamic-layer.component';
import {ColorPickersComponent} from './color-pickers/color-pickers.component';
import {InfoPopueComponent} from './info-popue/info-popue.component';
import {DataFilterComponent} from './data-filter/data-filter.component';
import {ColorSketchModule} from '../smx-component/smx-color-pick/smart-color.module';
import {SmxSelectModule, SmxSliderModule} from '../smx-component/smx.module';

@NgModule({
  declarations: [
    BooleanComponent,
    SSliderComponent,
    LegendComponent,
    InputComponent,
    LayerSelectComponent,
    DropDownComponent,
    DynamicLayerComponent,
    ColorPickersComponent,
    InfoPopueComponent,
    DataFilterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    SmxSliderModule,
    ColorSketchModule,
    SmxModalModule,
    SmxSelectModule
  ],
  exports: [
    BooleanComponent,
    SSliderComponent,
    LegendComponent,
    InputComponent,
    LayerSelectComponent,
    DropDownComponent,
    DynamicLayerComponent,
    ColorPickersComponent,
    InfoPopueComponent,
    DataFilterComponent
  ],
  providers: [],
  bootstrap: []
})
export class MultiplexsModule {
}
