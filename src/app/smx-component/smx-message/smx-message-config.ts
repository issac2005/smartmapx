/**
 * @license
 * Copyright Alibaba.com All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { InjectionToken } from '@angular/core';

export interface SmxMessageConfig {
  nzAnimate?: boolean;
  nzDuration?: number;
  nzMaxStack?: number;
  nzPauseOnHover?: boolean;
  nzTop?: number | string;

  [index: string]: any; // tslint:disable-line:no-any
}

export const NZ_MESSAGE_DEFAULT_CONFIG = new InjectionToken<SmxMessageConfig>('NZ_MESSAGE_DEFAULT_CONFIG');

export const NZ_MESSAGE_CONFIG = new InjectionToken<SmxMessageConfig>('NZ_MESSAGE_CONFIG');

export const NZ_MESSAGE_DEFAULT_CONFIG_PROVIDER = {
  provide: NZ_MESSAGE_DEFAULT_CONFIG,
  useValue: {
    nzAnimate: true,
    nzDuration: 3000,
    nzMaxStack: 7,
    nzPauseOnHover: true,
    nzTop: 24
  }
};
