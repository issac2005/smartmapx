/**
 * @author LLCN(KerferJu)
 * @Date 2019/3/11 9:59
 * @description 统一模态框服务
 *
 * SmxModalModule: 根模块,需要导入到使用模态框的module文件中
 * SmxModal:模块服务,用于启动模块
 * SmxActiveModal:模块对象,用于模态框内close,dismiss方法的执行
 *
 */

import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SmxModal} from './directive/smx-modal';
import {NgbModalBackdrop} from './directive/modal-backdrop';
import {NgbModalWindow} from './directive/modal-window';
import {SharedModule} from '../share/shared';
import {SmxDragModalComponent} from './smx-drag-modal/smx-drag-modal.component';

export {SmxModal} from './directive/smx-modal';
export {SmxModalConfig, SmxModalOptions} from './directive/modal-config';
export {SmxActiveModal} from './directive/modal-ref';


@NgModule({
  imports: [CommonModule],
  declarations: [NgbModalBackdrop, NgbModalWindow, SmxDragModalComponent],
  entryComponents: [NgbModalBackdrop, NgbModalWindow],
  exports: [SmxDragModalComponent, SharedModule],
  providers: [SmxModal]
})
export class SmxModalModule {
  /**
   * Importing with '.forRoot()' is no longer necessary, you can simply import the module.
   * Will be removed in 4.0.0.
   *
   * @deprecated 3.0.0
   */
  static forRoot(): ModuleWithProviders {
    return {ngModule: SmxModalModule};
  }
}
