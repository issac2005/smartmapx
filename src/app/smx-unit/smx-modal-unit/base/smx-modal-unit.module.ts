import {EventEmitter, Input, NgModule, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {SmxActiveModal} from '../../../smx-component/smx-modal/directive/modal-ref';

@Component({
  selector: 'smx-modal-unit',
  template: `
    <div class="smx-modal-header">
      <h4 class="modal-title">{{title}}</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="smx-modal-body" [style.width.px]="smxWidth">
      <ng-content></ng-content>
    </div>
    <div class="smx-modal-footer">
      <button class="smx-btn smx-outline-default smx-grid" type="button" (click)="cancel()">取消</button>
      <button [disabled]="smxDisabled" class="smx-btn smx-default smx-grid" type="button" (click)="submit()">确定
      </button>
    </div>
  `,
  styles: [`
    .smx-modal-header {
      background: #3887be;
      height: 30px;
      padding: 0px 11px 0px 12px;
      line-height: 30px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 1px solid #e9ecef;
      border-top-left-radius: 0.3rem;
      border-top-right-radius: 0.3rem;
    }

    .smx-modal-header .modal-title {
      color: #fff;
      font-size: 12px;
      padding-bottom: 0px;
      line-height: 30px;
    }

    .smx-modal-header .close {
      color: #fff !important;
      opacity: 1 !important;
      font-weight: normal;
      position: relative;
      bottom: 3px;
      line-height: 30px;
    }

    .smx-modal-body {
      position: relative;
      flex: 1 1 auto;
      padding: 2rem;
      padding-bottom: 1rem;
      max-height: 550px;
      overflow: auto;
    }

    .smx-modal-footer {
      text-align: center;
      display: block;
      border: 0px;
      /*padding: 1rem;*/
      padding-bottom: 2rem;
      align-items: center;
      justify-content: flex-end;
    }

    .smx-modal-footer > :not(:last-child) {
      margin-right: 1.5rem;
    }
  `]
})
export class SmxModalUnitComponent implements OnInit {

  @Input() title: string = '';
  @Input() smxWidth: boolean;
  @Input() smxDisabled: boolean = false;
  @Output() OkEvent = new EventEmitter();

  constructor(public activeModal: SmxActiveModal) {
  }

  ngOnInit() {
  }

  submit() {
    this.OkEvent.emit();
  }

  cancel() {
    this.activeModal.dismiss();
  }

}

@NgModule({
  declarations: [SmxModalUnitComponent],
  imports: [CommonModule, FormsModule],
  exports: [SmxModalUnitComponent]
})
export class SmxModalUnitModule {
}
