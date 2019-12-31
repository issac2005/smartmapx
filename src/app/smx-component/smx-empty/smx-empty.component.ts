import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'smx-empty',
  templateUrl: './smx-empty.component.html',
  styleUrls: ['./smx-empty.component.scss']
})
export class SmxEmptyComponent implements OnInit {
  @Input() smxContentText = '未检索到数据';

  constructor() {
  }

  ngOnInit() {
  }

}
