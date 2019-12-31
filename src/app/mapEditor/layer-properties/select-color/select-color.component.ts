import {AfterViewChecked, Component, ElementRef, Input, OnChanges, OnInit, Renderer2} from '@angular/core';
// import {MapEditorService} from '../../mapEditor.service';
import {AppService} from '../../../s-service/app.service';

@Component({
    selector: 'app-select-color',
    templateUrl: './select-color.component.html',
    styleUrls: ['./select-color.component.scss']
})
export class SelectColorComponent implements OnInit, OnChanges, AfterViewChecked {
    @Input() layer: any;
    @Input() patemter: any;
    layerInfo: any;
    attribute: any;
    showStyle: any;
    pattern: any;
    title: any;
    model: any;
    @Input() map: any;
    tooltip: any;

    constructor(private mapEditorService: AppService, private elementRef: ElementRef, private renderer: Renderer2) {
    }

    ngOnInit() {}

    ngOnChanges() {
        if ( !this.layer[this.patemter.belong] ) {
            this.layer[this.patemter.belong] = {};
        }
        this.layerInfo = this.layer[this.patemter.belong];
        this.attribute = this.patemter.attribute;
        if (this.layerInfo[this.attribute] === undefined) {
            this.pattern = this.patemter.pattern;
            this.title = this.patemter.title;
            this.model = this.patemter.default;
            this.tooltip = this.patemter.tooltip;
        } else {
            this.pattern = this.patemter.pattern;
            this.title = this.patemter.title;
            this.model = this.layerInfo[this.attribute];
            this.tooltip = this.patemter.tooltip;
        }
        this.showStyle = typeof this.layerInfo[this.attribute];
    }

    ngAfterViewChecked() {
    }

    clickAdd(Attribute) {
        if (this.attribute === 'fill-outline-color' && !this.layerInfo['fill-antialias']) {
            return;
        } else {
            if (this.layerInfo[this.attribute] === undefined) {
                this.layerInfo[this.attribute] = {
                    'stops': [
                        [6, this.model], [10, this.model]
                    ]
                };
            } else {
                this.layerInfo[this.attribute] = {
                    'stops': [
                        [6, this.layerInfo[this.attribute]], [10, this.layerInfo[this.attribute]]
                    ]
                };
            }
            this.showStyle = typeof this.layerInfo[this.attribute];
            this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
        }
    }

    remove(index: any) {
        this.layerInfo[this.attribute].stops.splice(index, 1);
        if (this.layerInfo[this.attribute].stops.length <= 1) {
            const value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
            this.layerInfo[this.attribute] = value;
            this.model = value;
            this.showStyle = typeof this.layerInfo[this.attribute];
        }
        this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }

    buttomAdd() {
        const num = this.layerInfo[this.attribute].stops.length - 1;
        const value = this.layerInfo[this.attribute].stops[num][1];
        const index = this.layerInfo[this.attribute].stops[num][0];
        this.layerInfo[this.attribute].stops.push([Number(index) + 1, value]);
        this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }

    change(event: any) {
        this.layerInfo[this.attribute] = this.model;
        //this.layerInfo[this.attribute] = event.color.rgba;
        this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
      //this.map.setPaintProperty(this.layer.id, 'fill-color', this.layer[this.patemter.belong][this.patemter.attribute]);
    }

    changes(event: any, index: any) {
      /*const value = {"stops":[[10,"rgba(255, 255, 255, 1)"],[12,"rgba(0, 0, 0, 1)"]]};
      const value2 = {"stops":[[10,"rgba(255, 235, 255, 1)"],[12,"rgba(0, 0, 1, 1)"]]};
      const layer = JSON.parse(JSON.stringify(this.layer));
      const value1 = layer.paint['fill-color'];
      console.log(value);
      console.log(JSON.stringify(value1));
      this.map.setPaintProperty(this.layer.id, 'fill-color', value2);*/
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
      /*setTimeout(() => {
        const value = {"stops":[[10,"rgba(255, 255, 255, 1)"],[12,"rgba(0, 0, 0, 1)"]]};
        //const value = this.layer.paint['fill-color'];
        this.map.setPaintProperty(this.layer.id, 'fill-color', value);
        console.log(value);
      }, 1000);*/

     /* console.log(value);
      const value1 = {
        stops: [
          [value.stops[0][0], value.stops[0][1]],
          [value.stops[1][0], value.stops[1][1]]
        ]
      }
      /!*for (let i = 0; i < value.stops.length; i++) {
        value1.stops.push(value.stops[i]);
      }*!/
      console.log(value);
      console.log(value1);*/

    }

    test(event: any, index: any) {
        const pattern = /^((\d)|(1\d)|(2[0-4]))$/;
        const fall = pattern.test(event.target.value);
        if (!fall) {
            let min = 0;
            let max = 0;
            if (index === 0) {
                min = 0;
                max = this.layerInfo[this.attribute].stops[index + 1][0];
            } else if (index === (this.layerInfo[this.attribute].stops.length) - 1) {
                min = this.layerInfo[this.attribute].stops[index - 1][0];
                max = 24;
            } else {
                min = this.layerInfo[this.attribute].stops[index - 1][0];
                max = this.layerInfo[this.attribute].stops[index + 1][0];
            }
            this.layerInfo[this.attribute].stops[index][0] = Math.floor(Math.random() * (max - min) + min);

        }
        this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }

    /**
     * 获取setPaintProperty与setLayoutProperty所需参数
     * */
    getOptions () {
      const options = {
        property: true,
        belong: this.patemter.belong,
        id: this.layer.id,
        attribute: this.patemter.attribute,
        value: this.layer[this.patemter.belong][this.patemter.attribute],
        layerInfo: this.layer
      };
      return options;
    }
}
