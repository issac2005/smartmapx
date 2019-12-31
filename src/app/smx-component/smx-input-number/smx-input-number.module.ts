import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SInputNumberComponent} from './s-input-number.component';
import {SKeydownDirective} from './s-keydown.directive';

@NgModule({
  declarations: [SInputNumberComponent, SKeydownDirective],
  imports: [
    CommonModule, FormsModule
  ],
  exports: [SInputNumberComponent]
})
export class SmxInputNumberModule {
}
