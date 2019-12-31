import {Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output} from '@angular/core';
import {AppService} from '../../s-service/app.service';
import {NG_VALUE_ACCESSOR} from '@angular/forms';


@Component({
  selector: 'app-booleans-component',
  templateUrl: './boolean.component.html',
  styleUrls: ['./boolean.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BooleanComponent),
    multi: true
  }]
})
export class BooleanComponent implements OnInit, OnChanges {
  @Input() layer: any;
  @Input() patemter: any;
  @Input() label: any
  @Output() onChange: EventEmitter<any> = new EventEmitter();
  layerInfo: any;
  attribute: any;
  showStyle: any;
  pattern: any;
  title: any;
  model: any;
  models:  any;
  private innerValue: any = '';
  constructor(private mapEditorService: AppService) { }
  ngOnInit() {
  }
  ngOnChanges () {
      /*if ( !this.layer[this.patemter.belong] ) {
          this.layer[this.patemter.belong] = {};
      }
      this.layerInfo = this.layer[this.patemter.belong];
      this.attribute = this.patemter.attribute;
      if (this.layerInfo[this.attribute] === undefined) {
          this.pattern = this.patemter.pattern;
          this.title = this.patemter.title;
          this.model = this.patemter.default;
      }else {
          this.pattern = this.patemter.pattern;
          this.title = this.patemter.title;
          this.model = this.layerInfo[this.attribute];
      }
      this.showStyle = typeof this.layerInfo[this.attribute];*/
  }
  clickAdd() {
    if (this.layerInfo[this.attribute] === undefined) {
      this.layerInfo[this.attribute] = {
        'stops': [
          [6, this.model], [10, this.model]
        ]
      };
    }else {
      this.layerInfo[this.attribute] = {
        'stops': [
          [6, this.layerInfo[this.attribute]], [10, this.layerInfo[this.attribute]]
        ]
      };
    }
    this.showStyle = typeof this.layerInfo[this.attribute];
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }
  remove(index: any) {
    this.layerInfo[this.attribute].stops.splice(index, 1);
    if (this.layerInfo[this.attribute].stops.length <= 1) {
      const value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
      this.layerInfo[this.attribute] = value;
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
  change () {
    this.layerInfo[this.attribute] = Number(this.model);
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }
  onChecked(event: any, index: any) {
    /*if (index >= 0) {
      this.layerInfo[this.attribute].stops[index][1] = event.target.checked;
    } else {
       /!* console.log(this.layerInfo[this.attribute]);
        console.log(event.target.checked)*!/
      if (event.target.checked) {
        this.layerInfo[this.attribute] = event.target.checked;
      }else {
        this.layerInfo[this.attribute] = event.target.checked;
      }
    }
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);*/
    //this.value = event.target.checked;
    this.models = event.target.checked;
  }
  test(event: any, index: any) {
        const pattern = /^((\d)|(1\d)|(2[0-4]))$/;
        const fall = pattern.test(event.target.value);
        if (!fall) {
            let min = 0; let max = 0
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
  private onTouchedCallback: () => void = function() {};
  private onChangeCallback: (_: any) => void = function() {};


  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    this.onChange.emit(v);
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
