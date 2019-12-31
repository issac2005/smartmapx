import {ModuleWithProviders, NgModule} from '@angular/core';
// 组件
import {SmxMapModule} from './smx-map/smx-map.module';
import {ColorSketchModule} from './smx-color-pick/smart-color.module';
import {SmxModalModule} from './smx-modal/smx-modal.module';
import {ScrollEventModule} from './smx-scroll-event/scroll.module';
import {SmxDateTimePickerModule} from './smx-date-time-picker/s-date-time.pick.module';
import {SmxEmptyModule} from './smx-empty/smx-empty.module';
import {SmxIconModule} from './smx-icon/smx-icon.module';
import {SmxLoadingModule} from './smx-loading/smx-loading.module';
import {SmxSwitchModule} from './smx-switch/smx-switch.module';
import {SmxRadioModule} from './smx-radio/smx-radio.module';
import {SmxUploadModule} from './smx-upload/smx-upload.module';
import {SmxProgressModule} from './smx-progress/smx-progress.module';
import {SmxCheckboxModule} from './smx-checkbox/smx-checkbox.module';
import {SmxEditorModule} from './smx-editor/smx-editor.module';
import {SmxSelectButtonModule} from './smx-select-button/smx-select-button.module';
import {SmxSelectModule} from './smx-select/smx-select.module';
import {SmxSelectCheckboxModule} from './smx-select-checkbox/smx-select-checkbox.module';
import {SmxInputNumberModule} from './smx-input-number/smx-input-number.module';
import {SmxInputModule} from './smx-input/smx-input.module';
import {SmxDirectiveModule} from './smx-directive/smx-directive.module';
import {SmxSliderModule} from './smx-slider/smx-slider.module';
import {ClipboardModule} from './smx-clipboard/ngx-clipboard.module';
import {QRCodeModule} from './smx-qrcode/qrcode';
import {SmxTableModule} from './smx-table/table';
import {SmxListboxModule} from './smx-listbox/listbox';
import {SmxFieldsetModule} from './smx-fieldset/fieldset';
import {SmxChartModule} from './smx-chart/chart';
import {SmxDropdownModule} from './smx-dropdown/dropdown';
import {SmxTooltipModule} from './smx-tooltip/tooltip';
import {SharedModule} from './share/shared';

export * from './smx-map/smx-map.module';
export * from './smx-color-pick/smart-color.module';
export * from './smx-modal/smx-modal.module';
export * from './smx-scroll-event/scroll.module';
export * from './smx-date-time-picker/s-date-time.pick.module';
export * from './smx-empty/smx-empty.module';
export * from './smx-icon/smx-icon.module';
export * from './smx-loading/smx-loading.module';
export * from './smx-switch/smx-switch.module';
export * from './smx-radio/smx-radio.module';
export * from './smx-upload/smx-upload.module';
export * from './smx-progress/smx-progress.module';
export * from './smx-checkbox/smx-checkbox.module';
export * from './smx-editor/smx-editor.module';
export * from './smx-select-button/smx-select-button.module';
export * from './smx-select/smx-select.module';
export * from './smx-select-checkbox/smx-select-checkbox.module';
export * from './smx-input-number/smx-input-number.module';
export * from './smx-input/smx-input.module';
export * from './smx-directive/smx-directive.module';
export * from './smx-slider/smx-slider.module';
export * from './smx-qrcode/qrcode';
export * from './smx-table/table';
export * from './smx-listbox/listbox';
export * from './smx-fieldset/fieldset';
export * from './smx-chart/chart';
export * from './smx-dropdown/dropdown';
export * from './smx-tooltip/tooltip';
export * from './share/shared';
// 吐司
export * from './smx-message/public-api';
// 复制
export * from './smx-clipboard/ngx-clipboard.module';


// --------------------------------------------------不支持全局引入start-------------------------------------------- //
// 工具类
export * from './smx-util';


// --------------------------------------------------不支持全局引入end-------------------------------------------- //
@NgModule({
  exports: [
    SmxMapModule,
    ColorSketchModule,
    SmxModalModule,
    ScrollEventModule,
    SmxDateTimePickerModule,
    SmxEmptyModule,
    SmxIconModule,
    SmxLoadingModule,
    SmxSwitchModule,
    SmxRadioModule,
    SmxUploadModule,
    SmxProgressModule,
    SmxCheckboxModule,
    SmxEditorModule,
    SmxSelectButtonModule,
    SmxSelectModule,
    SmxSelectCheckboxModule,
    SmxInputNumberModule,
    SmxInputModule,
    SmxDirectiveModule,
    SmxSliderModule,
    ClipboardModule,
    QRCodeModule,
    SmxTableModule,
    SmxListboxModule,
    SmxFieldsetModule,
    SharedModule,
    SmxChartModule,
    SmxDropdownModule,
    SmxTooltipModule
  ]
})
export class SmxComponentModule {
  /**
   * @deprecated Use `smxComponentModule` instead.
   */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SmxComponentModule
    };
  }
}
