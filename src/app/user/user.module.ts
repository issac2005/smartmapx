import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserComponent} from './user.component';
import {SmxModalModule, SmxSelectButtonModule, SmxSelectModule, ClipboardModule} from '../smx-component/smx.module';
import {UserModalComponent} from './modal/user-modal.component';
import {OrderComponent} from './order/order.component';
import {STableComponent} from './s-table/s-table.component';
import {SmxPipeModule} from '../smx-unit/smx-unit.module';

@NgModule({
  imports: [
    CommonModule,
    SmxModalModule,
    ClipboardModule,
    FormsModule,
    SmxSelectButtonModule,
    SmxSelectModule,
    SmxPipeModule
  ],
  declarations: [UserComponent, UserModalComponent, OrderComponent, STableComponent],
  entryComponents: [UserModalComponent]
})
export class UserModule {
}
