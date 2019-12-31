import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {SmxSmartTableComponent} from './smx-edit-table/smx-smart-table.component';
import {SmxTablePipe} from './smx-smart-table.pipe';
import {SmxSelectModule, SmxInputModule, SmxTableModule} from '../../smx-component/smx.module';

@NgModule({
  declarations: [SmxSmartTableComponent, SmxTablePipe],
  imports: [
    CommonModule, FormsModule, SmxTableModule, SmxSelectModule, SmxInputModule
  ],
  exports: [SmxSmartTableComponent]
})
export class SmxSmartTableModule {
}
