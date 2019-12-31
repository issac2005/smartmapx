import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzEmptyModule} from 'ng-zorro-antd';
import {SmxEmptyComponent} from './smx-empty.component';


@NgModule({
  declarations: [SmxEmptyComponent],
  imports: [
    CommonModule, NzEmptyModule
  ],
  exports: [SmxEmptyComponent]
})
export class SmxEmptyModule {
}
