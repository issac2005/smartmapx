import {NgModule} from '@angular/core';
import {SketchFieldsComponent} from './component/sketch-fields.component';
import {SketchPresetColorsComponent} from './component/sketch-preset-colors.component';

import {CommonModule} from '@angular/common';
import {AlphaModule} from './module/alpha.component';
import {CheckboardModule} from './module/checkboard.component';
import {EditableInputModule} from './module/editable-input.component';
import {HueModule} from './module/hue.component';
import {SaturationModule} from './module/saturation.component';
import {SwatchModule} from './module/swatch.component';
import {SmartColorComponent} from './smart-color.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    SmartColorComponent,
    SketchFieldsComponent,
    SketchPresetColorsComponent,
  ],
  exports: [
    SmartColorComponent,
    SketchFieldsComponent,
    SketchPresetColorsComponent,
  ],
  imports: [
    CommonModule,
    AlphaModule,
    CheckboardModule,
    EditableInputModule,
    HueModule,
    SaturationModule,
    SwatchModule,
    FormsModule
  ],
})
export class ColorSketchModule {
}
