import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {IndexComponent} from './index.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    RouterModule
  ],
  declarations: [
    IndexComponent
  ],
  exports: [
    IndexComponent
  ],
  providers: []
})
export class IndexModule {
}
