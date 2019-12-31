import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'smx-loading',
  templateUrl: './s-loading.component.html',
  styleUrls: ['./s-loading.component.scss']
})
export class SLoadingComponent implements OnInit {

  @Input() loading: any;

  constructor() {
  }

  ngOnInit() {
  }

}
