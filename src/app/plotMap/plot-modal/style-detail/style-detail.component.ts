import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-style-detail',
  templateUrl: './style-detail.component.html',
  styleUrls: ['./style-detail.component.scss']
})
export class StyleDetailComponent implements OnInit {
  @Input() defaultStyle?: any;
  @Input() styleArray?: any;
  @Input() modeType?: string;

  lineTypeSelectShow = false;
  fillPatternSelectShow = false;
  fontSizeSelectShow = false;
  lineHeightSelectShow = false;
  lineTypeIndex = 0;

  // 线类型
  lineTypeSelectData = [
    {'value': 0},
    {'value': 1}
  ];

  // 面类型
  // 填充图案
  fillPaternSelectData =  [
    {
      iconId: 'H00001',
      url: 'assets/img/001.png'
    },
    {
      iconId: 'H00002',
      url: 'assets/img/002.png'
    },
    {
      iconId: '',
      url: ''
    }
  ];

  // 字体大小、行高
  textSelectData = [12, 14, 16, 18, 20, 22, 24, 26, 30, 32, 34, 36, 38, 40];
  lineSelectData = [12, 14, 16, 18, 20, 22, 24, 26, 30, 32, 34, 36, 38, 40];

  constructor() { }

  ngOnInit() {
  }

  // 线类型 - 打开选择框
  openLineTypeSelect() {
    this.lineTypeSelectShow = !this.lineTypeSelectShow;
    // 如果样式框存在，点击空白除隐藏样式框
    if (this.lineTypeSelectShow) {
      document.onclick = (e) => {
        this.lineTypeSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
  }

  // 线类型 - 选择类型
  chooseLineType(item: any, index: any) {
    this.lineTypeIndex = index;
    if (index === 0) { // 实线
      item.value = 0;
      this.defaultStyle.style[item.name] = item.value;
    } else { // 虚线
      item.value = 1;
      this.defaultStyle.style[item.name] = item.value;
    }
  }

  // 面类型 - 打开选择框
  openFillPatternSelect() {
    this.fillPatternSelectShow = !this.fillPatternSelectShow;
    if (this.fillPatternSelectShow) {
      document.onclick = (e) => {
        this.fillPatternSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
  }

  // 面类型 - 选择填充图案
  chooseFillPattern(item: any, v: any) {
    item.value = v.iconId;
    this.defaultStyle.style[item.name] = item.value;
  }

  // 文本 - 打开字号选择框
  openFontSizeSelect() {
    this.fontSizeSelectShow = !this.fontSizeSelectShow;
    if (this.fontSizeSelectShow) {
      document.onclick = (e) => {
        this.fontSizeSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    this.lineHeightSelectShow = false;
  }

  // 文本 - 选择字体大小
  chooseFontSize(item: any, event: any) {
    item.value = Number( event.target.innerText );
    this.defaultStyle.style[item.name] = item.value;
  }

  // 文本 - 打开行高选择框
  openLineHeightSelect() {
    this.lineHeightSelectShow = !this.lineHeightSelectShow;
    if (this.lineHeightSelectShow) {
      document.onclick = (e) => {
        this.lineHeightSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    this.fontSizeSelectShow = false;
  }

  // 文本 - - 字体加粗
  setTextBold(item: any) {
    if (item.value === 1) {
      item.value = 0;
    } else {
      item.value = 1;
    }
    this.defaultStyle.style[item.name] = item.value;
  }

  // 拾色器值变化
  colorChange(item: any, event: any) {
    this.defaultStyle.style[item.name] = event.color.rgba;
  }

  // 滑动条数值改变
  sliderChange(item: any, event: any) {
    this.defaultStyle.style[item.name] = event;
  }


}
