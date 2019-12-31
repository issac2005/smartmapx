import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {GridComponent} from './grid/grid.component';
import {FilterComponent} from './filter/filter.component';
import {DataGridComponent} from './data-body.component';
import {TestPanelComponent} from './enterprise/et-test/test-panel.component';
import {MonitorComponent} from '../monitor/monitor.component';
import {AccessComponent} from '../access/access.component';
import {MapEditorModule} from '../mapEditor/mapEditor.module';
// modal
import {GridModalComponent} from './modal/grid-modal.component';

import {
  SmxComponentModule,
  SmxModalModule,
  ClipboardModule,
  SmxListboxModule,
  SmxFieldsetModule,
  SmxChartModule,
  SmxDropdownModule
} from '../smx-component/smx.module';
import {EnterPriseModule} from './enterprise/enterprise.module';
import {StaMainModule} from '../sta-modular/sta-main.module';
import {NgZorroAntdModule, NzToolTipModule} from 'ng-zorro-antd';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import {SOutputCsvModule, SmxUiSettingModule, SmxPanelModule} from '../smx-unit/smx-unit.module';
import {
  SmxPipeModule,
} from '../smx-unit/smx-unit.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SmxModalModule,
    RouterModule,
    BrowserAnimationsModule,
    SmxChartModule,
    SmxDropdownModule,
    SmxFieldsetModule,
    SmxComponentModule,
    EnterPriseModule,
    MapEditorModule,
    SmxListboxModule,
    StaMainModule,
    ClipboardModule,
    NgZorroAntdModule,
    SOutputCsvModule,
    SmxUiSettingModule,
    SmxPipeModule,
    SmxPanelModule,
    NzToolTipModule,
    NzPopoverModule
  ],
  declarations: [
    DataGridComponent, GridComponent, FilterComponent, GridModalComponent, MonitorComponent, AccessComponent, TestPanelComponent
  ],

  exports: [DataGridComponent],

  entryComponents: [GridModalComponent],
  providers: []
})


export class DataGridModule {
}

