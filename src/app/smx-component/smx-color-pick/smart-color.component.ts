import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, NgModule, OnInit, QueryList, Renderer2,
  ViewChildren
} from '@angular/core';

import {ColorWrap} from './module/color-wrap.component';
import {isValidHex, toState} from './module/color';

@Component({
  selector: 'smart-color',
  templateUrl: './smart-color.component.html',
  styleUrls: ['./smart-color.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
})
export class SmartColorComponent extends ColorWrap implements OnInit {
  /** Remove alpha slider and options from picker */
  @Input() disableAlpha = false;
  @Input() disabledBoolean: any;
  /** Hex strings for default colors at bottom of picker */
  @Input() presetColors = [
    '#D0021B',
    '#F5A623',
    '#F8E71C',
    '#8B572A',
    '#7ED321',
    '#417505',
    '#BD10E0',
    '#9013FE',
    '#4A90E2',
    '#50E3C2',
    '#B8E986',
    '#000000',
    '#4A4A4A',
    '#9B9B9B',
    '#FFFFFF',
  ];
  /** Width of picker */
  @Input() width = 200;
  activeBackground: string;
  show: boolean;
  isfocus: boolean;
  top: any;
  left: any;
  constructor(private elementRef: ElementRef,
              private renderer: Renderer2) {
    super();
  }
  /*视图选择装饰器函数(对应模板`<div class='sketch-picker'>`)*/
  @ViewChildren('sketch-picker') unclick: QueryList<ElementRef>;
  /*监听dom*/
  @HostListener('document:click', ['$event']) bodyClick(e) {
    if (this.isfocus === true) {
      this.show = true;
      this.isfocus = false;
      return;
    } else if (this.isfocus === false && getTrigger(this.unclick, 'sketch-picker')) {
      this.show = false;
    }
    function getTrigger(queryList, className?) {
      let flag = true;
      (<HTMLElement[]>e.path).forEach(i => {
        flag && queryList.forEach(el => {
          i.isEqualNode && i.isEqualNode(el.nativeElement) && (flag = false);
        })
        flag && i.className && i.className.indexOf && i.className.indexOf(className) > -1 && (flag = false);
      })
      return flag;
    }
  }
  afterValidChange() {
    this.activeBackground = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.rgb.a})`;
  }

  handleValueChange({data, $event}) {
    this.handleChange(data, $event);
  }
  handleBlockChange({hex, $event}) {
    if (isValidHex(hex)) {
      // this.hex = hex;
      this.handleChange(
        {
          hex,
          source: 'hex',
        },
        $event,
      );
    }
  }
  onfocus (e: any) {
    const winW = document.body.clientWidth;
    const winH = document.body.clientHeight;
    this.left = this.elementRef.nativeElement.children[0].children[0].getBoundingClientRect().left + 200;
    if ((this.elementRef.nativeElement.children[0].children[0].getBoundingClientRect().top + 309) > document.body.clientHeight) {
      this.top = document.body.clientHeight - 309 ;
    } else {
      this.top = this.elementRef.nativeElement.children[0].children[0].getBoundingClientRect().top;
    }

    // 使拾色器面板总是在视窗范围内
    if (document.body.clientWidth - e.pageX < 420) {
      this.left = document.body.clientWidth - 220 - 40;
      this.top = this.top + 40;
    }

    if (e.path[3].className === 'style-info middle') {
      this.left = e.pageX - 150;
      this.top = e.pageY - 150;
    }




    // if (document.body.clientHeight - e.top < 309) {
    //   this.top = document.body.clientHeight - 309 - 40;
    // }
    this.isfocus = true;
  }
  onblur (event) {
  }
  click (event) {
  }
  change ($event) {
    if (this.background) {
      this.inputStyle.background = this.color;
    }
    const data = this.setState(toState(this.color, this.oldHue));
    this.handleChange((data as any).hsl, $event);
  }

  clamp_css_byte(i) {  // Clamp to integer 0 .. 255.
    i = Math.round(i);  // Seems to be what Chrome does (vs truncation).
    return i < 0 ? 0 : i > 255 ? 255 : i;
  }

  clamp_css_float(f) {  // Clamp to float 0.0 .. 1.0.
    return f < 0 ? 0 : f > 1 ? 1 : f;
  }

  parse_css_int(str) {  // int or percentage.
    if (str[str.length - 1] === '%')
      return this.clamp_css_byte(parseFloat(str) / 100 * 255);
    return this.clamp_css_byte(parseInt(str));
  }

  parse_css_float(str) {  // float or percentage.
    if (str[str.length - 1] === '%')
      return this.clamp_css_float(parseFloat(str) / 100);
    return this.clamp_css_float(parseFloat(str));
  }

  css_hue_to_rgb(m1, m2, h) {
    if (h < 0) h += 1;
    else if (h > 1) h -= 1;

    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
    return m1;
  }

  parseCSSColor(css_str) {
    // Remove all whitespace, not compliant, but should just be more accepting.
    var str = css_str.replace(/ /g, '').toLowerCase();

    // Color keywords (and transparent) lookup.
    //if (str in kCSSColorTable) return kCSSColorTable[str].slice();  // dup.

    // #abc and #abc123 syntax.
    if (str[0] === '#') {
      if (str.length === 4) {
        var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
        if (!(iv >= 0 && iv <= 0xfff)) return null;  // Covers NaN.
        return [((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8),
          (iv & 0xf0) | ((iv & 0xf0) >> 4),
          (iv & 0xf) | ((iv & 0xf) << 4),
          1];
      } else if (str.length === 7) {
        var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
        if (!(iv >= 0 && iv <= 0xffffff)) return null;  // Covers NaN.
        return [(iv & 0xff0000) >> 16,
          (iv & 0xff00) >> 8,
          iv & 0xff,
          1];
      }

      return null;
    }

    var op = str.indexOf('('), ep = str.indexOf(')');
    if (op !== -1 && ep + 1 === str.length) {
      var fname = str.substr(0, op);
      var params = str.substr(op+1, ep-(op+1)).split(',');
      var alpha = 1;  // To allow case fallthrough.
      switch (fname) {
        case 'rgba':
          if (params.length !== 4) return null;
          alpha = this.parse_css_float(params.pop());
        // Fall through.
        case 'rgb':
          if (params.length !== 3) return null;
          return [this.parse_css_int(params[0]),
            this.parse_css_int(params[1]),
            this.parse_css_int(params[2]),
            alpha];
        case 'hsla':
          if (params.length !== 4) return null;
          alpha = this.parse_css_float(params.pop());
        // Fall through.
        case 'hsl':
          if (params.length !== 3) return null;
          var h = (((parseFloat(params[0]) % 360) + 360) % 360) / 360;  // 0 .. 1
          // NOTE(deanm): According to the CSS spec s/l should only be
          // percentages, but we don't bother and let float or percentage.
          var s = this.parse_css_float(params[1]);
          var l = this.parse_css_float(params[2]);
          var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
          var m1 = l * 2 - m2;
          return [this.clamp_css_byte(this.css_hue_to_rgb(m1, m2, h + 1 / 3) * 255),
            this.clamp_css_byte(this.css_hue_to_rgb(m1, m2, h) * 255),
            this.clamp_css_byte(this.css_hue_to_rgb(m1, m2, h - 1 / 3) * 255),
            alpha];
        default:
          return null;
      }
    }

    return null;
  }

}


