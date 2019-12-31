import {Component, ContentChild, Input, OnInit, TemplateRef} from '@angular/core';

@Component({
  selector: 'smx-panel',
  templateUrl: './smx-panel.component.html',
  styleUrls: ['./smx-panel.component.scss']
})
export class SmxPanelComponent implements OnInit {
  @Input() smxData: PanelData[];

  constructor() {
  }

  ngOnInit() {
  }

}

export class PanelData {
  title: string;
  active: boolean;
  view: any | any[];
  type: string;
}
