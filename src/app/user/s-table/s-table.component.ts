/**
 * Created by LLCN on 2018/9/14 16:07.
 *
 * name: s-table.component.ts
 * description: 表格组件
 */

import {Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';

@Component({
  selector: 'smx-table',
  templateUrl: './s-table.component.html',
  styleUrls: ['./s-table.component.scss']
})
export class STableComponent implements OnInit, OnChanges {
  @Input() cols: any[];
  @Input() datas: any[];
  @Input() config: any;

  @Output() sBtnClick = new EventEmitter();
  @Output() onCheckbox = new EventEmitter();
  arrays: any[];

  constructor() {
  }

  ngOnInit() {

  }


  ngOnChanges() {
    this.arrays = this.datas;
  }

  /**
   * 过滤
   * @param values
   * @param type
   */
  filter(values: any, type = 'and') {
    let datas = this.datas;

    if (type === 'and') {
      for (const f of values) {
        const filterDatas = [];
        for (const v of datas) {
          if (v[f.h] === f.v) {
            filterDatas.push(v);
          }
        }

        datas = filterDatas;
      }
    } else {
      const filterDatas = [];

      outer:
        for (const v of datas) {
          for (const f of values) {
            if (v[f.h] === f.v) {
              filterDatas.push(v);
              continue outer;
            }
          }

        }
      datas = filterDatas;
    }


    this.arrays = datas;
  }


  /**
   * 自定义按钮点击事件
   * @param index
   * @param e
   */
  customClick(index: any, e: any) {
    const data = {index: index, data: e};
    this.sBtnClick.emit(data);
  }

  /**
   * 选择事件
   * @param $event
   */
  checkItem($event: any) {
    this.onCheckbox.emit($event);
  }
}
