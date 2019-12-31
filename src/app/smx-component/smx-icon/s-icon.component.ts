import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'smx-icon',
  templateUrl: './s-icon.component.html',
  styleUrls: ['./s-icon.component.scss']
})
export class SIconComponent implements OnInit {
  @Input() iconName: string;
  @Input() iconSize = 20;
  @Input() tip: string;
  @Output() iconClick = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  clickEvent(e: any) {
    this.iconClick.emit(e);
  }
}
