/**
 * @author LLCN
 * @Date 2018/12/25 13:49
 * @description 自定义上传组件
 *
 */

import {Component, ContentChild, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SmxMessageService} from '../smx-message/smx-message.service';


@Component({
  selector: 'smx-upload',
  templateUrl: './s-upload.component.html',
  styleUrls: ['./s-upload.component.scss']
})
export class SUploadComponent implements OnInit {
  @Input() smxFile = 'file'; // file  image
  @Input() smxMaxSize: any; // 大小限制
  @Input() smxStyle: any;   // 样式
  @Input() smxClass: any;  // 样式类名(暂未实现)
  @Input() smxAccept: any;  // 类型
  // 图片
  @Input() smxUploadService; // 上传路径
  @Input() smxIsShow = true; // 单个图片上传是否显示本地预览
  @Input() smxMultiple = false; // 多次上传
  @Input() smxMultipleNum = 5; // 多次上传数量限制
  @Input() smxMultipleWidth = 250; // 多次上传长度限制

  // 文件
  @Input() smxWidth: any;   // 总长度
  @Input() smxTip: any;  // 下部提示


  @Output() uploadEnd = new EventEmitter();  // 解析完成
  @Output() uploadCancel = new EventEmitter();
  // 图标上传
  @Input() imgFile: any; // 路径
  imgFiles = []; // 上传文件集合
  inputFile: any; // 文件
  name: any; // 名称
  fileType: any;

  uuid = new Date().getTime() + ((1 + Math.random()) * 0x10000).toString(16).substring(1);
  isVisible = false;
  viewImgUrl = '';
  closeUpload = true;
  uploadActive = true;
  @ViewChild('sui_ul', {static: false}) suiUl: ElementRef;

  showScroll = false;
  interval: any;

  @ContentChild('custom', {static: false}) customUpload: ElementRef;

  constructor(private smxMessageService: SmxMessageService) {
  }

  ngOnInit() {
    let type = '';
    if (this.smxAccept) {
      if (typeof this.smxAccept === 'string') {
        this.fileType = this.smxAccept;
      }

      if (typeof this.smxAccept === 'object') {
        for (const v of this.smxAccept) {
          type = type ? type + ',.' + v : '.' + v;
        }
        this.fileType = type;
      }

    } else {
      if (this.smxFile === 'image') {
        this.fileType = 'image/*';
      }
    }
  }


  /**
   * 上传文件
   * @param event
   */
  fileChangeEvent(e: any) {
    this.uploadActive = false;
    // 大小限制
    if (this.smxMaxSize && !this.setSize(e)) {
      e.target.value = null;
      return;
    }

    // 格式限制
    if (this.smxAccept || this.smxFile === 'image') {
      let AllImgExt = this.fileType;
      const extName = e.target.files[0].name.substring(e.target.files[0].name.lastIndexOf('.')).toLowerCase(); // 把路径中的所有字母全部转换为小写

      if (AllImgExt === 'image/*') {
        AllImgExt = '.jpg,.png,.bmp,.jpeg,.svg';
        if (AllImgExt.indexOf(extName) === -1) {
          this.smxMessageService.warning('目前只支持jpg,png,bmp,jpeg,svg格式的图片');
          e.target.value = null;
          this.uploadActive = true;
          return;
        }
      } else {
        if (AllImgExt.indexOf(extName) === -1) {
          this.smxMessageService.warning('目前只支持' + this.fileType + '格式的文件');
          e.target.value = null;
          this.uploadActive = true;
          return;
        }
      }
    }

    this.inputFile = e.target.files;
    this.toBase64(e);
  }


  /**
   * 取消图片上传
   */
  cancelFileChange(e: any, index?: number) {
    e.stopPropagation();
    this.imgFile = null;
    this.inputFile = null;
    this.name = null;
    if (this.smxMultiple) {
      this.imgFiles[index] = null;
      this.imgFiles.splice(index, 1);
      this.uploadCancel.emit();
      if (this.smxMultipleNum > this.imgFiles.length) {
        this.closeUpload = true;
      }
      this.checkScroll();
    } else {
      this.uploadCancel.emit();
    }
  }

  /**
   * 最大限制
   * @param e
   */
  setSize(e: any) {
    if (e.target.files[0].size > (1024 * 1024 * this.smxMaxSize)) {
      this.smxMessageService.warning('文件大小超出限制(' + this.smxMaxSize + 'M)!');
      this.inputFile = null;
      this.uploadActive = true;
      return false;
    }

    return true;
  }


  // 打开上传面板
  openUpload() {
    document.getElementById(this.uuid).click();
  }

  // 转base64输出
  toBase64(e: any) {
    const reader = new FileReader();
    // 为文件读取成功设置事件
    reader.onload = (res) => {
      this.imgFile = (res as any).target.result;

      // 名字
      const index = this.inputFile[0].name.lastIndexOf('.');
      this.name = this.inputFile[0].name.substring(0, index);

      if (this.smxUploadService) {

        // todo 网络上传

      } else {
        // 发送事件
        this.exportEvent();
        this.uploadActive = true;
      }

    };

    // 正式读取文件
    reader.readAsDataURL(this.inputFile[0]);
  }


  /**
   * 预览图片
   * @param imgFile
   */
  viewImg(imgFile: string) {
    this.viewImgUrl = imgFile;
    this.isVisible = true;
  }


  /**
   * 关闭预览
   */
  closeView(): void {
    this.viewImgUrl = '';
    this.isVisible = false;
  }

  checkScroll() {
    setTimeout(() => {
      if (this.suiUl.nativeElement.scrollWidth > this.suiUl.nativeElement.clientWidth) {
        this.showScroll = true;
      } else {
        this.showScroll = false;
      }
    }, 200);
  }

  /**
   * 多张图片前滚动
   * @param e
   */
  preScroll(e: any) {
    e.stopPropagation();
    this.interval = setInterval(() => {
      this.suiUl.nativeElement.scrollLeft = this.suiUl.nativeElement.scrollLeft > 2 ? this.suiUl.nativeElement.scrollLeft - 2 : 0;
    }, 10);
  }

  /**
   * 多张图片后滚动
   * @param e
   */
  nextScroll(e: any) {
    e.stopPropagation();
    this.interval = setInterval(() => {
      this.suiUl.nativeElement.scrollLeft = this.suiUl.nativeElement.scrollLeft <
      (this.suiUl.nativeElement.scrollWidth - this.suiUl.nativeElement.clientWidth - 2) ?
        this.suiUl.nativeElement.scrollLeft + 2 : this.suiUl.nativeElement.scrollWidth - this.suiUl.nativeElement.clientWidth;
    }, 10);
  }

  clearInterval() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  /**
   * 导出事件
   */
  exportEvent() {
    if (this.smxMultiple) {
      if (this.imgFiles.length >= this.smxMultipleNum) {
        this.smxMessageService.warning('您最多上传' + this.smxMultipleNum + '张图片!');
        return;
      }
      this.imgFiles.push({file: this.inputFile, result: this.imgFile, name: this.name});
      this.uploadEnd.emit(this.imgFiles);
      if (this.imgFiles.length >= this.smxMultipleNum) {
        this.closeUpload = false;
      }
      this.checkScroll();
    } else {
      this.uploadEnd.emit({file: this.inputFile, result: this.imgFile, name: this.name});
    }
  }
}
