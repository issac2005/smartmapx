import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {HttpService} from '../../s-service/http.service';
import {getMapInstance} from '../../s-service/smx-map';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() dataInfo: any;
  @Output() sendMsg = new EventEmitter();
  map: any;
  loaded: any;

  constructor(private httpService: HttpService) {
  }

  ngOnInit() {
    this.mapInit();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  mapInit() {
    const postData = {
      mapID: this.dataInfo.default_map_id
    };
    this.httpService.getData(postData, true, 'execute', 'findBaseMapStyle', 'em', 'em')
      .subscribe(
        (data: any) => {
          const self = this;
          this.map = getMapInstance('map', {
            style: data.data,
            appServerUrl: '/uploadfile/miniprogram'
          });
          this.map.on('load', function () {
            self.loaded = true;
            self.sendMsg.emit(self.loaded);
          });
        }
      );
  }
}
