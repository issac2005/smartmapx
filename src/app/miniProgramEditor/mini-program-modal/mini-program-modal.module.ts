import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {MiniProgramModalComponent} from './mini-program-modal.component';
import {SmxDropdownModule} from '../../smx-component/smx-dropdown/dropdown';

@NgModule({
  declarations: [
    MiniProgramModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    SmxDropdownModule
  ],
  entryComponents: [
    MiniProgramModalComponent
  ]
})
export class MiniProgramModalModule {
}
