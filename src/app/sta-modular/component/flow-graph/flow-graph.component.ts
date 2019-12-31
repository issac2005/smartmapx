import {Component, OnInit, Input, EventEmitter, forwardRef} from '@angular/core';
import {HttpService} from '../../../s-service/http.service';
import {HttpClient} from '@angular/common/http';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {AnimationQueryMetadata} from '@angular/animations';

@Component({
  selector: 'app-flow-graph',
  templateUrl: './flow-graph.component.html',
  styleUrls: ['./flow-graph.component.scss']
})
export class FlowGraphComponent implements OnInit {
  @Input() config: any;
  @Input() style: any;
  @Input() staType: any;
  @Input() map: any;
  @Input() busLines: any;
  lineColorValue: any;

  pointColorValue: any;

  opacity_showNum: any; /* 透明度 */
  opacity_value: any;

  echartlayer: any;

  min = 0;
  max = 100;
  showloading: boolean = true;

  constructor(private httpClient: HttpClient, private httpService: HttpService) {
  }

  ngOnInit() {
    this.opacity_showNum = this.style.metadata.options.series[0].lineStyle.normal.opacity * 100;
    this.opacity_value = this.style.metadata.options.series[0].lineStyle.normal.opacity * 100;
  }

  changeLine(event: any) {
    this.style.metadata.options.series[0].lineStyle.normal.color = event.color.hex;
  }

  changePoint(event: any) {
    this.style.metadata.options.series[1].lineStyle.normal.color = event.color.hex;
  }

  onSlideEnds(event: any) {
    this.opacity_showNum = event.value;
    this.opacity_value = event.value;
    this.style.metadata.options.series[0].lineStyle.normal.opacity = (event.value) / 100;
  }

  /* 数值 正负 大小区间判断 */
  changeInput(event: any) {
    if (event && typeof (event) === 'object') {
      if (event.metadata.options.series[0].progressiveThreshold < 0) {
        this.style.metadata.options.series[0].progressiveThreshold = 500;
      } else if (event.metadata.options.series[0].progressive < 0) {
        this.style.metadata.options.series[0].progressive = 200;
      } else if (event.metadata.options.series[0].lineStyle.normal.width < 0) {
        this.style.metadata.options.series[0].lineStyle.normal.width = 1;
      } else if (event.metadata.options.series[1].effect.constantSpeed < 0) {
        this.style.metadata.options.series[1].effect.constantSpeed = 20;
      } else if (event.metadata.options.series[1].effect.symbolSize < 0) {
        this.style.metadata.options.series[1].effect.symbolSize = 1.5;
      } else if (event.metadata.options.series[1].effect.trailLength < 0 ||
        event.metadata.options.series[1].effect.trailLength > 1) {
        this.style.metadata.options.series[1].effect.trailLength = 0.1;
      }
    }
  }


}
