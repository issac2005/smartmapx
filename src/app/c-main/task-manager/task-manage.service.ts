import {EventEmitter, Injectable, OnInit, ViewChild} from '@angular/core';
import {TaskManagerComponent} from './task-manager.component';

@Injectable({
  providedIn: 'root'
})
export class TaskManageService implements OnInit {
  tms = new EventEmitter();

  constructor() {

  }


  ngOnInit(): void {

  }


  start() {
    this.tms.emit('add');
  }

  dismissAll() {
    this.tms.emit('all');
  }

  // change() {
  //
  // }
  //
  // fail() {
  //
  // }
}
