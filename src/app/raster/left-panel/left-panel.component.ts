import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {AppService} from '../../s-service/app.service';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.scss']
})
export class LeftPanelComponent implements OnInit {
  @Input() layerInfo: any;
  @Input() url: any;
  @Input() info: any;
  @Input() mapObj: any;
  @Output() layerChangeName = new EventEmitter();
  layerInfor: any;
  layerType: any;

  constructor(private appService: AppService) {
  }

  ngOnInit() {
    if (this.layerInfo) {
      if (this.layerInfo.metadata.type === 101) {
        this.layerType = 'raster';
      }
      if (this.layerInfo.metadata.type === 105) {
        this.layerType = 'WMS';
      }
      if (this.layerInfo.metadata.type === 106) {
        this.layerType = 'WMTS';
      }
      if (this.layerInfo.metadata.type === 109) {
        this.layerType = 'image ';
      }
    }
  }

  changeLayerName(tag: any, e: any) {
    this.layerChangeName.emit({tag: tag, value: e.target.value});
  }
}
