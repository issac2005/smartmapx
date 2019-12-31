import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ContentChild, TemplateRef} from '@angular/core';
import {ToastConfig, ToastType} from '../../smx-toast/toast-model';
import {ToastService} from '../../smx-toast/toast.service';

@Component({
  selector: 'smx-smart-table',
  templateUrl: './smx-smart-table.component.html',
  styleUrls: ['./smx-smart-table.component.scss'],
})
export class SmxSmartTableComponent implements OnInit, OnChanges {
  @Input() smxStyle: any;
  @Input() smxClass: any;
  @Input() cols: any[];
  @Input() datas: any[];
  @Input() config: any;
  @Input() pipe = '';

  @Output() onDelete = new EventEmitter();
  @Output() onCheckbox = new EventEmitter();
  @Output() regNoMatch = new EventEmitter();

  @ContentChild(TemplateRef, {static: false}) template: any;

  constructor(public toastService: ToastService,) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
  }


  /**
   * 删除条目
   * @param item
   * @param i
   */
  deleteItem(item: any, i: any) {
    this.datas.splice(i, 1);
    this.onDelete.emit({index: i, item: item});
  }


  /**
   * 选择条目
   * @param e
   * @param item
   * @param i
   */
  checkItem(e: any, item: any, i: any) {
    if (e.target.check) {
      if (e.target.check) {
        this.onCheckbox.emit({check: true, index: i, item: item});
      } else {
        this.onCheckbox.emit({check: false, index: i, item: item});
      }
    }
  }


  insertItem(item: any) {
    // const data = JSON.parse(JSON.stringify(this.config.insertItem));
    this.datas.push(item);
  }


  /**
   * 下拉框標題
   */
  getLabel(e: any, col: any) {
    for (const v of col.options) {
      if (v[col.value] === e) {
        return v[col.label];
      }
    }
  }


  blurEvent(dt: any, col: any, data: any) {
    let noPass = false;
    if (col.reg) {
      const c = new RegExp(col.reg);
      if (!c.test(data[col.field])) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '支持1-40个汉字 数字 字母 _ ()', 3000);
        this.toastService.toast(toastCfg);
      }
    }


    for (const v of this.cols) {
      if (v.reg) {
        const c = new RegExp(v.reg);
        for (const d of this.datas) {
          if (!c.test(d[v.field])) {
            noPass = true;
            break;
          }
        }
      }

    }

    if (noPass) {
      this.regNoMatch.emit('0');
    } else {
      this.regNoMatch.emit('1');
    }
    try {
      dt.closeCellEdit();
    } catch (e) {
      // console.log(e);
    }
  }


  closeClick(e: any) {
    e.stopPropagation();
  }

}
