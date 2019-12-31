import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {PlotStyleComponent} from './plot-style.component';
import {ColorSketchModule} from '../../smx-component/smx-color-pick/smart-color.module';
import {MultiplexsModule} from './../../multiplex/multiplexs.module';
import {SmxSelectModule} from '../../smx-component/smx-select/smx-select.module';
@NgModule({
  declarations: [
    PlotStyleComponent
  ],
  exports: [
    PlotStyleComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ColorSketchModule,
    MultiplexsModule,
    SmxSelectModule
  ]
})
export class PlotStyleModule { }
