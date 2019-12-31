import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SClickRotateDirective} from './s-click-rotate.directive';
import {SDebounceClickDirective} from './s-debounce-click.directive';

@NgModule({
  declarations: [SClickRotateDirective, SDebounceClickDirective],
  imports: [
    CommonModule
  ],
  exports: [SClickRotateDirective, SDebounceClickDirective]
})
export class SmxDirectiveModule {
}
