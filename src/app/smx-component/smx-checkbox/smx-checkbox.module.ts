import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SCheckboxComponent} from './s-checkbox.component';

@NgModule({
  declarations: [SCheckboxComponent],
  imports: [
    CommonModule, FormsModule
  ],
  exports: [SCheckboxComponent]
})
export class SmxCheckboxModule {
}
