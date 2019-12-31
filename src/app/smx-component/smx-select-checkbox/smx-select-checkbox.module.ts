import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SSelectCheckboxComponent} from './s-select-checkbox.component';
import {NzSelectModule} from 'ng-zorro-antd';

@NgModule({
  declarations: [SSelectCheckboxComponent],
  imports: [
    CommonModule, FormsModule, NzSelectModule
  ],
  exports: [SSelectCheckboxComponent]
})
export class SmxSelectCheckboxModule {
}
