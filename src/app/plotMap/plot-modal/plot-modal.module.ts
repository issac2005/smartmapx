import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {PlotModalComponent} from './plot-modal.component';
import {ColorSketchModule, SmxComponentModule, SmxSliderModule} from '../../smx-component/smx.module';
import {MultiplexsModule} from '../../multiplex/multiplexs.module';
import {CreateStyleModalComponent} from './create-style-modal/create-style-modal.component';
import {StyleDetailComponent} from './style-detail/style-detail.component';

@NgModule({
  declarations: [
    PlotModalComponent,
    CreateStyleModalComponent,
    StyleDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    ColorSketchModule,
    MultiplexsModule,
    SmxComponentModule,
    SmxSliderModule
  ],
  entryComponents: [
    PlotModalComponent,
    CreateStyleModalComponent
  ]
})
export class PlotModalModule {
}
