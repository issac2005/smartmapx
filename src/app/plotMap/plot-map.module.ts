import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PlotMapComponent} from './plot-map.component';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {PropPanelComponent} from './prop-panel/prop-panel.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {ToolbarModule} from '../mapEditor/toolbar/toolbar.module';
import {PlotStyleModule} from './plot-style/plot-style.module';
import {PlotModalModule} from './plot-modal/plot-modal.module';
import {PlotEditComponent} from './plot-edit/plot-edit.component';
// import {MultiplexsModule} from '../multiplex/multiplexs.module';
import {SmxModalModule, SmxUploadModule} from '../smx-component/smx.module';
import {PlotMapPipe} from './plot-map.pipe';
import {MultiplexsModule} from '../multiplex/multiplexs.module';


@NgModule({
  declarations: [
    PlotMapComponent,
    PlotEditComponent,
    PropPanelComponent,
    PlotMapPipe // 管道文件
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    NgZorroAntdModule,
    ToolbarModule,
    PlotStyleModule, // 标绘样式库组件
    PlotModalModule,
    SmxModalModule,
    SmxUploadModule,
    // MultiplexsModule
  ]
})
export class PlotMapModule {
}
