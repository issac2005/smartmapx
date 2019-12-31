import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {SmxSliderComponent} from './smx-slider.component';
import {NzSliderModule} from 'ng-zorro-antd';
import {SmxSlider2Component} from './slider/slider';

@NgModule({
  declarations: [SmxSliderComponent, SmxSlider2Component],
  imports: [
    CommonModule, FormsModule, NzSliderModule
  ],
  exports: [SmxSliderComponent, SmxSlider2Component]
})
export class SmxSliderModule {
}
