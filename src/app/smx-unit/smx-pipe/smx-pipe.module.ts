import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SmxPipe} from './smx-pipe.pipe';

@NgModule({
  declarations: [SmxPipe],
  imports: [
    CommonModule
  ],
  exports: [SmxPipe]
})
export class SmxPipeModule {
}
