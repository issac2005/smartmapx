import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingButtonComponent} from './setting-button/setting-button.component';
import {SOutputCsvPipe} from './setting-button/s-output-csv.pipe';
import {SettingModalComponent} from './setting-modal/setting-modal.component';
import {FormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {UiSettingModalComponent} from './setting-pick/ui-setting-modal.module';
import {SmxComponentModule} from '../../smx-component/smx.module';

@NgModule({
  declarations: [SettingButtonComponent, SOutputCsvPipe, SettingModalComponent, UiSettingModalComponent],
  imports: [CommonModule, FormsModule, NgZorroAntdModule, SmxComponentModule],
  exports: [SettingButtonComponent, SOutputCsvPipe],
  entryComponents: [SettingModalComponent, UiSettingModalComponent]
})
export class SmxUiSettingModule {
}
