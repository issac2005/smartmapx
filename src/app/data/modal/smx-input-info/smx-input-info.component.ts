/**
 * @author LLCN
 * @Date 2018/12/20 16:12
 * @name smx-input-info.component.ts
 * @description 模态框创建组件,呈现为左标题右标签形式
 *
 */
import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {SmxModal} from '../../../smx-component/smx-modal/directive/smx-modal';

@Component({
  selector: 'smx-input-info',
  templateUrl: './smx-input-info.component.html',
  styleUrls: ['./smx-input-info.component.scss', '../data-popue.component.scss']
})
export class SmxInputInfoComponent implements OnInit {
  @Input() view: any;
  @Input() smxControl: any;
  @Output() btnEvent = new EventEmitter();
  inputFile: any; // 图片文件
  constructor() {
  }

  ngOnInit() {
    for (let m of this.view) {
      const s = m.maxLength ? m.maxLength : 256;
    }
  }


  /**
   * 上传图片
   * @param event
   */
  fileChange(e: any, m: any) {
    m.value = this.inputFile = e.file;
    for (const v of this.view) {
      if (v.alias === 'description') {
        // const index = this.inputFile[0].name.lastIndexOf('.');
        // v.value = this.inputFile[0].name.substring(0, index);
        v.value = e.name;
        break;
      }
    }
  }

  /**
   * 取消图片上传
   */
  fileCancel(m: any) {
    this.inputFile = null;
    m.value = null;
  }

  /**
   * 父组件获取值(目前默认返回图标文件)
   * @param tag
   */
  getValue(tag?: any) {
    return this.inputFile;
  }

  /**
   * 上传
   * @param e
   */
  uploadEnd(e: any, m: any) {
    m.value = this.inputFile = e.file;
  }


  btnClick() {
    this.btnEvent.emit();
  }
}
