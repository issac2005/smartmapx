import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SmxRasterComponent} from './smx-raster.component';
import {FormsModule} from '@angular/forms';
import {SmxModalModule} from '../smx-component/smx-modal/smx-modal.module';
import {RouterModule} from '@angular/router';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {RasterPanelComponent} from './raster-panel/raster-panel.component';
import {LeftPanelComponent} from './left-panel/left-panel.component';
import {SmxSliderModule} from '../smx-component/smx.module';

@NgModule({
  declarations: [SmxRasterComponent, RasterPanelComponent, LeftPanelComponent],
  imports: [
    CommonModule,
    FormsModule,
    SmxModalModule,
    RouterModule,
    NgZorroAntdModule,
    SmxSliderModule
  ],
  exports: [RasterPanelComponent],
  providers: []
})
export class SmxRasterModule {
}
