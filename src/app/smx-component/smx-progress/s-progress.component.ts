import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'smx-progress',
  templateUrl: './s-progress.component.html',
  styleUrls: ['./s-progress.component.scss']
})
export class SProgressComponent implements OnInit {
  @Input() smxPercent = 0;
  @Input() smxStatus = 1;   // -1 失败  1 加载中 100 完成
  @Input() smxPercentType = 1;
  @Input() smxShowInfo: any; // 在percent模式下显示数值
  @Input() smxShowTip: any;  // 显示文字
  @Input() smxHeight = 18;  // 滚动条高度


  constructor() {
  }

  ngOnInit() {
  }

}



