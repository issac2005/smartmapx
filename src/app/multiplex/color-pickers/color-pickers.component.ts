import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-color-pickers',
  templateUrl: './color-pickers.component.html',
  styleUrls: ['./color-pickers.component.scss']
})
export class ColorPickersComponent implements OnInit {
  @Input() label: any;
  @Input() cname: any;
  @Input() ColorValue: any;
  @Output() onColorChange: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  change(event: any) {
    const color = event.color.rgba;
    this.onColorChange.emit([this.cname, color]);
  }
}
