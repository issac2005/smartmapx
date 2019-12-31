import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SmxModalModule} from '../../smx-component/smx-modal/smx-modal.module';

import {HomeComponent} from './home.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SmxModalModule
  ],
  declarations: [
    HomeComponent
  ],
  exports: [
    HomeComponent
  ],
  providers: []
})
export class HomeModule {
}
