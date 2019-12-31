import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {GradeSetComponent} from './grade-set/grade-set.component';
import {StaMainComponent} from './sta-main.component';
import {SubsectionComponent} from './component/subsection/subsection.component';
import {RadioComponent} from './component/radio/radio.component';
import {SliderComponent} from './component/slider/slider.component';
import {SelectComponent} from './component/select/select.component';
import {MultiplexsModule} from '../multiplex/multiplexs.module';
import {IconComponent} from './component/icon/icon.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FlowGraphComponent} from './component/flow-graph/flow-graph.component';
import {
  ColorSketchModule,
  SmxComponentModule,
  SmxEditorModule,
  SmxSelectCheckboxModule,
  SmxModalModule,
  SmxSliderModule
} from '../smx-component/smx.module';

@NgModule({
  declarations: [
    SubsectionComponent,
    RadioComponent,
    SliderComponent,
    GradeSetComponent,
    StaMainComponent,
    SelectComponent,
    IconComponent,
    FlowGraphComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    SmxSliderModule,
    SmxModalModule,
    ColorSketchModule,
    MultiplexsModule,
    NgZorroAntdModule,
    SmxEditorModule,
    SmxSelectCheckboxModule,
    SmxComponentModule
  ],
  exports: [StaMainComponent],
  providers: [],
  bootstrap: []
})
export class StaMainModule {
}
