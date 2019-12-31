import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SmxTreeService {
  checked: EventEmitter<any>;
  split: EventEmitter<any>;
  shift: EventEmitter<any>;
  selected: EventEmitter<any>;
  change: EventEmitter<any>;
  constructor() {
    this.checked = new EventEmitter();
    this.split = new EventEmitter();
    this.shift = new EventEmitter();
    this.selected = new EventEmitter();
    this.change = new EventEmitter();
  }
}
