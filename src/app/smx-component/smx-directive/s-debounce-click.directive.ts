import {Directive, EventEmitter, HostListener, OnInit, Output, Input, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import 'rxjs-compat/add/operator/debounceTime';

@Directive({
  selector: '[SmxSDebounceClick]'
})
export class SDebounceClickDirective implements OnInit, OnDestroy {
  @Output() smxDebounceClick = new EventEmitter();
  @Input() smxDebounceTime = 500;
  private clicks = new Subject<any>();
  subscription: any;

  constructor() {
  }


  ngOnInit(): void {
    this.subscription = this.clicks.debounceTime(this.smxDebounceTime)
      .subscribe(e => {
        this.smxDebounceClick.emit(e);
      });
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }

}
