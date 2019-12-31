import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SRadioComponent} from './s-radio.component';

@NgModule({
  declarations: [SRadioComponent],
  imports: [
    CommonModule, FormsModule
  ],
  exports: [SRadioComponent]
})
export class SmxRadioModule {
}
