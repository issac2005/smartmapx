import {Component, EventEmitter, Input, NgModule, OnInit, Output, OnDestroy, AfterViewInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {getMapInstance} from '../../s-service/smx-map';

@Component({
  selector: 'smx-map',
  template: `
    <div [id]="uuid" class="smx-map" [ngStyle]="smxStyle" [style.width.px]="smxWidth" [style.height.px]="smxHeight"></div>
  `,
  styles: [
      `
      .smx-map {
        width: 495px;
        height: 405px;
        background: #ccc;
      }
    `
  ]
})
export class SmxMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() smxMapBase: any;
  @Input() smxOptions: any;
  @Input() smxStyle: object;
  @Input() smxWidth: number;
  @Input() smxHeight: number;
  @Output() loaded = new EventEmitter();
  uuid = new Date().getTime().toString();
  map: any;

  constructor() {
  }

  ngOnInit() {
  }


  ngAfterViewInit(): void {
    this.map = getMapInstance(this.uuid, this.smxOptions);
    this.map.on('load', () => {
      this.loaded.emit(this.map);
    });
  }

  ngOnDestroy(): void {
    console.log('地图销毁');
    if (this.map) {
      this.map.remove();
    }
  }
}


@NgModule({
  declarations: [SmxMapComponent],
  imports: [
    CommonModule
  ], exports: [SmxMapComponent]
})
export class SmxMapModule {
}
