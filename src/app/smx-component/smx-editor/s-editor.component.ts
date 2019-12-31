/**
 * @author keiferju (KeiferJu)
 * @e-mail keiferju@gmail.com
 * @Date 2019-04-12 15:49
 * @description 编辑器组件
 *
 */
import {AfterViewInit, Component, EventEmitter, forwardRef, Input, OnInit, Output, OnDestroy} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';


import ace from './ace/ace';
import * as beautify from './ace/ext-beautify';
import './ace/ext-language_tools';

@Component({
  selector: 'smx-editor',
  templateUrl: './s-editor.component.html',
  styleUrls: ['./s-editor.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SEditorComponent),
    multi: true
  }]
})

export class SEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() smxStyle: any;
  @Input() smxClass: any;
  @Input() smxReadOnly = false;
  @Input() smxFontSize = 14;
  @Input() smxFontFamily = 'monospace';
  @Input() smxTheme = 'dracula';
  @Input() mode = 'text';
  @Input() acePath = '/assets/ace/';
  @Output() onChange = new EventEmitter();
  @Output() blur = new EventEmitter();

  uuid: any;
  editor: any;

  codeValue: any;

  public onModelChange: Function = () => {
  };
  public onModelTouched: Function = () => {
  };


  constructor() {
    this.uuid = this.guid();
  }

  ngOnInit() {
  }


  ngAfterViewInit(): void {
    ace.config.set('basePath', this.acePath); // 设置编辑器路径
    if (!this.editor) {
      this.editor = ace.edit(this.uuid, {
        mode: 'ace/mode/' + this.mode,
        fontSize: this.smxFontSize,
        fontFamily: this.smxFontFamily,
        autoScrollEditorIntoView: true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        showPrintMargin: false,
        readOnly: this.smxReadOnly,
      });

      this.editor.setTheme('ace/theme/' + this.smxTheme);
      // 注销事件
      this.editor.commands.removeCommand('find');

      // 注册改变事件
      this.editor.session.on('change', (delta) => {
        this.codeValue = this.editor.getValue();
        this.onModelChange(this.codeValue);
        this.onChange.emit(this.codeValue);
      });
      this.editor.on('blur', (delta) => {
        this.codeValue = this.editor.getValue();
        this.onModelChange(this.codeValue);
        this.blur.emit(this.codeValue);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.container.remove();
    }
    this.editor = null;
  }

  /**
   * 返回对象
   */
  public getEditorObj() {
    return this.editor;
  }

  /**
   * 获取随机数
   */
  guid() {
    function S4() {
      return ((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return S4();
  }


  writeValue(value: any) {
    if (value && value !== undefined) {
      this.codeValue = value;
      // 初始化输入值
      this.editor.session.setValue(this.codeValue);
    }
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }


  setTheme(theme: any) {
    this.editor.setTheme('ace/theme/' + theme);
  }

  setFontFamily(n: any) {
    this.editor.setOption('fontFamily', n);
  }

  setFontSize(n: any) {
    document.getElementById(this.uuid).style.fontSize = n + 'px';
  }


  beautify() {
    beautify.beautify(this.editor.session);
  }
}
