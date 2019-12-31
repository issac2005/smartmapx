import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SInputComponent} from './s-input.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';

@NgModule({
  declarations: [SInputComponent],
  imports: [
    CommonModule, FormsModule, NgZorroAntdModule
  ],
  exports: [SInputComponent]
})
export class SmxInputModule {
}
