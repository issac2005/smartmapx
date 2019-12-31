/**
 * @author  keiferju
 * @time    2019-05-27 22:56
 * @title 通用confirm模态框模块
 * @description
 *
 */
import {NgModule, Component, Input, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {SmxModalUnitModule} from './base/smx-modal-unit.module';
import {SmxActiveModal} from '../../smx-component/smx-modal/directive/modal-ref';
import {isArray} from '../../smx-component/smx.module';
import {NzGridModule} from 'ng-zorro-antd';

@Component({
  selector: 'smx-confirm',
  template: `
    <smx-modal-unit [title]="smxConfig.title" (OkEvent)="submit()">
      <div nz-row nzType="flex" nzJustify="space-around" nzAlign="middle">
        <div nz-col nzSpan="8" style="text-align: center">
          <i class="smx-icon icon-warning" style="color: #efef05;font-size: 32px"></i>
        </div>
        <div nz-col nzSpan="16">
          <span class="height-50" *ngFor="let v of text">{{v}}</span>
        </div>
      </div>
    </smx-modal-unit>
  `,
  styles: [`
  `]
})

export class SmxConfirmModalComponent implements OnInit {
  @Input() smxConfig: any;

  text: string[] = [];
  view: View;

  constructor(public activeModal: SmxActiveModal) {
  }

  ngOnInit() {

    this.view = this.smxConfig.view;
    if (typeof this.view.text === 'string') {
      this.text.push(this.view.text);
    }

    if (isArray(this.view.text)) {
      this.text = this.view.text;
    }

  }


  submit() {
    this.activeModal.close();
  }
}

// 类名限制
export class View {
  text: any;
}

@NgModule({
  imports: [SmxModalUnitModule, NzGridModule, FormsModule, CommonModule],
  declarations: [SmxConfirmModalComponent],
  entryComponents: [SmxConfirmModalComponent]
})
export class SmxConfirmModalModule {
}
