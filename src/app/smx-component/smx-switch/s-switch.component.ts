import {Component, OnInit, Input, Output, EventEmitter, forwardRef, AfterViewInit, OnChanges, SimpleChanges} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'smx-switch',
  templateUrl: './s-switch.component.html',
  styleUrls: ['./s-switch.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SSwitchComponent),
    multi: true
  }]

})

export class SSwitchComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() smxCheckedLabel: any;
  @Input() smxUnCheckedLabel: any;
  @Input() smxOptions: SwitchClass[];
  @Input() smxDisabled = false;
  @Input() smxStyle: any;
  @Input() smxClass: any;
  @Output() onChange = new EventEmitter();


  value: any;

  constructor() {
  }


  public onModelChange: Function = () => {
  };
  public onModelTouched: Function = () => {
  };

  ngOnInit() {
    if (this.smxOptions) {
      for (const v of this.smxOptions) {
        if (v.value) {
          this.smxCheckedLabel = v.label;
        }

        if (!v.value) {
          this.smxUnCheckedLabel = v.label;
        }
      }
    }
  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {

  }


  writeValue(value: any) {
    if (value && value !== undefined) {
      this.value = value;
    }
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }


  changeStatus() {
    this.value = !this.value;
    this.onModelChange(this.value);
    this.onChange.emit(this.value);
  }

}

export class SwitchClass {
  label: any;
  value: boolean;
}
