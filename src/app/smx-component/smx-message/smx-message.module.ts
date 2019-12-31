/**
 * @license
 * Copyright Alibaba.com All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzAddOnModule } from './core/addon/addon.module';

import { NZ_MESSAGE_DEFAULT_CONFIG_PROVIDER } from './smx-message-config';
import { SmxMessageContainerComponent } from './smx-message-container.component';
import { SmxMessageComponent } from './smx-message.component';
import { SmxMessageService } from './smx-message.service';

@NgModule({
  imports: [CommonModule, OverlayModule, NzAddOnModule],
  declarations: [SmxMessageContainerComponent, SmxMessageComponent],
  providers: [NZ_MESSAGE_DEFAULT_CONFIG_PROVIDER, SmxMessageService],
  entryComponents: [SmxMessageContainerComponent]
})
export class SmxMessageModule {}
