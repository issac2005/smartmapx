import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {EtlComponent} from './etl.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {EtlModalComponent} from './modal/etl-modal.component';
import {SmxModalModule, SmxUploadModule, SmxSelectModule} from '../smx-component/smx.module';
import {SOutputCsvModule} from '../smx-unit/smx-output-csv/s-output-csv.module';

@NgModule({
  declarations: [EtlComponent, EtlModalComponent],
  imports: [
    CommonModule,
    NgZorroAntdModule,
    SmxModalModule,
    FormsModule,
    SOutputCsvModule,
    SmxUploadModule,
    SmxSelectModule
  ],
  exports: [EtlComponent],
  entryComponents: [EtlModalComponent]
})
export class EtlModule {
}
