import {Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output} from '@angular/core';
@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.scss']
})
export class DropDownComponent implements OnInit {
  @Input() label: any;
  @Input() dname: any;
  @Input() default: any;
  @Input() programJson: any;
  @Output() ondropdownChange: EventEmitter<any> = new EventEmitter();
  select = [];
  constructor() { }

  ngOnInit() {
    for (let i = 0 ; i < this.programJson.length ; i ++) {
      this.select.push(this.programJson[i]);
    }
  }
  onchange(event: any , v: any) {
    this.ondropdownChange.emit([this.dname, v]);
  }

}
