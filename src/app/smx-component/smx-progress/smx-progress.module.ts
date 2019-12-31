import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SProgressComponent} from './s-progress.component';

@NgModule({
  declarations: [SProgressComponent],
  imports: [
    CommonModule
  ],
  exports: [SProgressComponent]
})
export class SmxProgressModule {
}
