import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SLoadingComponent} from './s-loading.component';

@NgModule({
  declarations: [SLoadingComponent],
  imports: [
    CommonModule
  ],
  exports: [SLoadingComponent]
})
export class SmxLoadingModule {
}
