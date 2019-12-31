import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SmxPanelComponent} from './smx-panel.component';
import {SmxInputModule} from '../../smx-component/smx.module';
import {SmxPipeModule} from '../smx-pipe/smx-pipe.module';
import {NzGridModule, NzCollapseModule, NzToolTipModule} from 'ng-zorro-antd';

@NgModule({
  declarations: [SmxPanelComponent],
  imports: [
    CommonModule, FormsModule, NzCollapseModule, NzGridModule, SmxInputModule, SmxPipeModule, NzToolTipModule
  ],
  exports: [SmxPanelComponent]
})
export class SmxPanelModule {
}
