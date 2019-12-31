import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'smx-checkbox',
  templateUrl: './s-checkbox.component.html',
  styleUrls: ['./s-checkbox.component.scss']
})
export class SCheckboxComponent implements OnInit {
  @Input() values: any[];
  @Input() options: any[];
  @Input() optionLabel: any = 'label';
  @Input() optionValue: any = 'value';
  @Input() smxStyle: any;
  @Input() smxClass: any;
  @Output() onChange = new EventEmitter;



  constructor() {
  }

  ngOnInit() {
  }


  change(value: any, v: any) {
    if (this.values.includes(value)) {
      this.values.splice(this.values.findIndex(item => item === value), 1);
    } else {
      this.values.push(value);
    }


    this.onChange.emit(this.values);
  }

}
