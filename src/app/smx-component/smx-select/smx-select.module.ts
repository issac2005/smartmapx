import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SSelectComponent} from './s-select.component';

@NgModule({
  declarations: [SSelectComponent],
  imports: [
    CommonModule, FormsModule
  ],
  exports: [SSelectComponent]
})
export class SmxSelectModule {
}
