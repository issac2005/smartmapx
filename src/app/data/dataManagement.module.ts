import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {DataManagementComponent} from './dataManagement.component';
import {PopueComponent} from './modal/data-popue.component';
import {DataToolbarComponent} from './toolbar/data_toolbar.component';
import {DataHomeComponent} from './show/data-home.component';


// 类型组件
import {SmxInputInfoComponent} from './modal/smx-input-info/smx-input-info.component';
import {SmxComponentModule, ClipboardModule, QRCodeModule, SmxTooltipModule} from '../smx-component/smx.module';   // smx表格模块
import {NgZorroAntdModule} from 'ng-zorro-antd';  // 第三方依赖
import {SOutputCsvModule, SmxUiSettingModule, SmxPipeModule, SmxSmartTableModule} from '../smx-unit/smx-unit.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ClipboardModule,
    QRCodeModule,
    SmxComponentModule,
    NgZorroAntdModule,
    SOutputCsvModule,
    SmxUiSettingModule,
    SmxPipeModule,
    SmxSmartTableModule,
    SmxTooltipModule
  ],
  exports: [
    DataManagementComponent
  ],
  declarations: [
    DataManagementComponent,
    DataToolbarComponent,
    PopueComponent,
    DataHomeComponent,
    SmxInputInfoComponent
  ],
  entryComponents: [
    PopueComponent
  ],
  providers: [],
})
export class DataManagementModule {
}
