import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SUploadComponent} from './s-upload.component';
import {NzModalModule} from 'ng-zorro-antd';
import {SmxMessageModule} from '../smx-message/public-api';

@NgModule({
  declarations: [SUploadComponent],
  imports: [
    CommonModule, NzModalModule, SmxMessageModule
  ],
  exports: [SUploadComponent]
})
export class SmxUploadModule {
}
