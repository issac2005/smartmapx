import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import {getFocusableBoundaryElements} from '../utils/focus-trap';
import {ModalDismissReasons} from './modal-dismiss-reasons';

@Component({
  selector: 'ngb-modal-window',
  host: {
    '[class]': '"modal fade show d-block" + (windowClass ? " " + windowClass : "")',
    'role': 'dialog',
    'tabindex': '-1',
    '(keyup.esc)': 'escKey($event)',
    '(keyup.enter)': 'enterKey($event)',
    '(click)': 'backdropClick($event)',
    '[attr.aria-modal]': 'true',
    '[attr.aria-labelledby]': 'ariaLabelledBy',
  },
  template: `
    <div
      [class]="(newModal ? '': 'modal-dialog' ) + (size ? ' modal-' + size : '') + (centered ? ' modal-dialog-centered' : '')"
      role="document">
      <div [ngClass]="{'modal-content': !newModal}">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class NgbModalWindow implements OnInit,
  AfterViewInit, OnDestroy {
  private _elWithFocus: Element;  // element that is focused prior to modal opening

  @Input() ariaLabelledBy: string;
  @Input() backdrop: boolean | string = true;
  @Input() centered: string;
  @Input() keyboard = true;
  @Input() enterKeyId: string;
  @Input() size: string;
  @Input() windowClass: string;
  @Input() newModal = false;

  @Output('dismiss') dismissEvent = new EventEmitter();

  constructor(@Inject(DOCUMENT) private _document: any, private _elRef: ElementRef<HTMLElement>) {
  }

  backdropClick($event): void {
    if (this.backdrop === true && this._elRef.nativeElement === $event.target) {
      this.dismiss(ModalDismissReasons.BACKDROP_CLICK);
    }
  }

  escKey($event): void {
    if (this.keyboard && !$event.defaultPrevented) {
      this.dismiss(ModalDismissReasons.ESC);
    }
  }

  /**
   * 确认提交
   * @param $event
   */
  enterKey($event): void {
    if (this.enterKeyId) {
      const btn = document.getElementById(this.enterKeyId);
      btn.click();
      $event.stopPropagation();
    }
  }

  dismiss(reason): void {
    this.dismissEvent.emit(reason);
  }

  ngOnInit() {
    this._elWithFocus = this._document.activeElement;
    // this._elRef.nativeElement.style.top = '20%';
  }

  ngAfterViewInit() {
    if (!this._elRef.nativeElement.contains(document.activeElement)) {
      const autoFocusable = this._elRef.nativeElement.querySelector(`[ngbAutofocus]`) as HTMLElement;
      const firstFocusable = getFocusableBoundaryElements(this._elRef.nativeElement)[0];

      const elementToFocus = autoFocusable || firstFocusable || this._elRef.nativeElement;
      elementToFocus.focus();
    }

    const width = this._elRef.nativeElement.clientWidth / 2;
    const heigth = this._elRef.nativeElement.clientHeight / 2;
    // console.log(this._elRef.nativeElement.clientHeight);
    this._elRef.nativeElement.style.left = 'calc( 50% - ' + width + 'px)';
    this._elRef.nativeElement.style.top = 'calc( 50% - ' + heigth + 'px)';
  }

  ngOnDestroy() {
    const body = this._document.body;
    const elWithFocus = this._elWithFocus;

    let elementToFocus;
    if (elWithFocus && elWithFocus['focus'] && body.contains(elWithFocus)) {
      elementToFocus = elWithFocus;
    } else {
      elementToFocus = body;
    }
    elementToFocus.focus();
    this._elWithFocus = null;
  }
}
