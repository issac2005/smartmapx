import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NzTimePickerModule} from 'ng-zorro-antd/time-picker';

import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';

import {SDateTimePickComponent} from './s-date-time-pick.component';
import {NZ_I18N, zh_CN} from 'ng-zorro-antd';
import {registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';

registerLocaleData(zh);
@NgModule({
  imports: [CommonModule, FormsModule, NzTimePickerModule, NzDatePickerModule],
  declarations: [
    SDateTimePickComponent
  ],
  exports: [
    SDateTimePickComponent
  ],
  providers: [{provide: NZ_I18N, useValue: zh_CN}]
})
export class SmxDateTimePickerModule {
}
