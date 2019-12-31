import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { Subscription } from 'rxjs';
import { debounceTime,  distinctUntilChanged } from 'rxjs/operators';

import { simpleCheckForValidColor, toState } from './color';
import { Color, HSLA, HSVA, RGBA } from './color.interfaces';

export interface ColorEvent {
  $event: Event;
  color: Color;
}

@Component({
  // create seletor base for test override property
  selector: 'color-wrap',
  template: ``,
})
export class ColorWrap implements OnInit, OnChanges, OnDestroy {
  @Input() className = '';
  @Input() color: any;
  @Input() inputStyle: any;
  @Input() background: string;
  @Input() cpOutputFormat: string;
  @Output() onChange = new EventEmitter<ColorEvent>();
  @Output() onChangeComplete = new EventEmitter<ColorEvent>();
  @Output() onSwatchHover = new EventEmitter<ColorEvent>();
  @Output() colorChange = new EventEmitter();
  oldHue: number;
  hsl: HSLA;
  hsv: HSVA;
  rgb: RGBA;
  hex: string;
  rgba: any;
  source: string;
  currentColor: string;
  changes: Subscription;

  ngOnInit() {
    this.changes = this.onChange.pipe(
        debounceTime(100),
        distinctUntilChanged(),
      )
      .subscribe(x => this.onChangeComplete.emit(x));
    this.setState(toState(this.color, 0));
    this.currentColor = this.hex;
  }
  ngOnChanges() {
    if (this.background) {
      this.inputStyle.background = this.color;
    }
    this.setState(toState(this.color, this.oldHue));
  }
  ngOnDestroy() {
    this.changes.unsubscribe();
  }
  setState(data) {
    this.oldHue = data.oldHue;
    this.hsl = data.hsl;
    this.hsv = data.hsv;
    this.rgb = data.rgb;
    this.hex = data.hex;
    this.rgba = data.rgba;
    this.source = data.source;
    this.afterValidChange();
    return data;
  }
  handleChange(data, $event) {
    const isValidColor = simpleCheckForValidColor(data);
    if (isValidColor) {
      const color = toState(data, data.h || this.oldHue);
      this.setState(color);
      if (this.cpOutputFormat === 'rgba') {
        this.color = (color as any).rgba;
      } else if (this.cpOutputFormat === 'hex') {
        this.color = (color as any).hex;
      }
      this.colorChange.emit(this.color);
      if (this.background) {
        this.inputStyle.background = this.color;
      }
      this.onChange.emit({ color, $event });
      this.afterValidChange();
    }
  }
  /** hook for components after a complete change */
  afterValidChange() {}

  handleSwatchHover(data, $event) {
    const isValidColor = simpleCheckForValidColor(data);
    if (isValidColor) {
      const color = toState(data, data.h || this.oldHue);
      this.setState(color);
      this.onSwatchHover.emit({ color, $event });
    }
  }
}

@NgModule({
  declarations: [ColorWrap],
  exports: [ColorWrap],
  imports: [CommonModule],
})
export class ColorWrapModule {}
