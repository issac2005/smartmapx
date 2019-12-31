import {Component, OnInit, Output, EventEmitter, OnDestroy, Input, AfterViewInit, ViewChild} from '@angular/core';
import * as acorn from 'acorn';
import {HttpService} from '../../../s-service/http.service';
import {LocalStorage} from '../../../s-service/local.storage';
import {AppService} from '../../../s-service/app.service';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';
@Component({
  selector: 'app-js-edit-panel',
  templateUrl: './js-edit-panel.component.html',
  styleUrls: ['./js-edit-panel.component.scss']
})
export class JsEditPanelComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() index: any;
  @Input() dataInfo: any;
  @Output() event = new EventEmitter();
  @ViewChild('jseditor', {static: false}) editor: any;

  isFull = false;
  tipShow = false;
  isEdit = false;
  jsChange: any;
  jsEditor: any;
  originJs: any;
  jsStatus = 'default'; // default-未更改 saved-已保存 changed-已修改
  APP_METHOD_NAME = 'app';
  visible = false;
  saveClicked = false;
  themes = ['ambiance', 'chaos', 'chrome', 'clouds', 'clouds_midnight', 'cobalt',
    'crimson_editor', 'dawn', 'dracula', 'dreamweaver', 'eclipse', 'github',
    'gob', 'gruvbox', 'idle_fingers', 'iplastic', 'katzenmilch', 'kr_theme', 'kuroir',
    'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark', 'solarized_dark',
    'solarized_light', 'sqlserver', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night', 'tomorrow_night_blue',
    'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink', 'xcode'];
  theme = 'dracula';
  fontSizeOptions = [{label: 12, value: 12}, {label: 14, value: 14}, {label: 16, value: 16}, {label: 18, value: 18}, {
    label: 20,
    value: 20
  }];
  fontSize = 14;
  fontFamilyOptions = [{label: 'monospace', value: 'monospace'}, {label: 'Courier New', value: 'Courier New'}, {
    label: 'YouYuan',
    value: 'YouYuan'
  }, {label: 'Microsoft Yahei', value: 'Microsoft Yahei'}];

  fontFamily = 'monospace';
  beautify: any;
  isChangeVersion = false;


  textJS: any;

  constructor(private ls: LocalStorage,
              private toastService: ToastService,
              private httpService: HttpService,
              private appService: AppService
  ) {
    this.jsChange = this.appService.onJsChangeEventEmitter.subscribe((data) => {
      this.isChangeVersion = true;
      // this.jsEditor.session.setValue(data);
      this.textJS = data;
      this.jsStatus = 'default';
    });
  }


  ngOnInit() {
    if (this.dataInfo) {
      this.isEdit = !this.dataInfo.visit_type;
    }
    this.theme = this.ls.get('smx-theme') || 'dracula';
    this.fontFamily = this.ls.get('smx-fontFamily') || 'monospace';
    this.fontSize = Number(this.ls.get('smx-fontSize')) || 14;
  }


  ngAfterViewInit(): void {

    this.jsEditor = this.editor.getEditorObj();

    if (this.isEdit) {
      this.jsEditor.commands.addCommand({
        name: 'save',
        bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
        exec: (editor) => {
          this.saveJs();
        },
        readOnly: true // false if this command should not apply in readOnly mode
      });
      this.jsEditor.commands.addCommand({
        name: 'theme',
        bindKey: {win: 'Ctrl-Alt-T', mac: 'Command-Alt-T'},
        exec: (editor) => {
          this.openDraw();
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '哈哈,竟然被你发现了,修改主题是测试功能,如有问题请反馈!', 5000);
          this.toastService.toast(toastCfg);
        },
        readOnly: true // false if this command should not apply in readOnly mode
      });
      this.jsEditor.commands.addCommand({
        name: 'format',
        bindKey: {win: 'Ctrl-Alt-L', mac: 'Command-Alt-L'},
        exec: (editor) => {
          this.codeFormat();
        },
        readOnly: true // false if this command should not apply in readOnly mode
      });
    }

    this.showJs();
  }

  ngOnDestroy() {
    if (this.jsEditor) {
      this.jsEditor.container.remove();
    }
    this.jsEditor = null;
    this.jsChange.unsubscribe();
  }

  codeFormat() {
    this.editor.beautify();
    // this.saveJs();
  }

  openDraw(): void {
    this.visible = true;
  }

  closeDraw(): void {
    this.visible = false;
  }

  updateTheme(theme: any) {
    this.editor.setTheme(theme);
    this.theme = theme;
    this.ls.set('smx-theme', theme);
  }

  updateFontFamily(n: any) {
    this.editor.setFontFamily(n);
    this.ls.set('smx-fontFamily', n);
  }

  updateFontSize(n: any) {
    this.editor.setFontSize(n);
    this.ls.set('smx-fontSize', n);
  }

  saveJs() {
    const jscode = this.jsEditor.getValue();
    if (jscode === '') {
      const toastCfg = new ToastConfig(ToastType.INFO, '', 'JavaScript不能为空', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    this.validateApp(this.textJS,  (err: any) => {
      if (err) {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '应用程序验证错误\n' + (err.toString() || err), 2000);
        this.toastService.toast(toastCfg);
      } else {
        this.postJs(false, null);
      }
    });
  }

  validateApp(appContent: any, callback: any) {
    if (appContent === null || appContent === undefined) {
      return callback('The app\'s content is null');
    }

    if (typeof appContent !== 'string') {
      appContent = appContent.toString().trim();
    }

    if (appContent === '') {
      return callback('The app\'s content is empty');
    }

    try {
      const appResult = acorn.parse(appContent);
      if (appResult.body) {
        const body = appResult.body;
        if (body) {
          let appExpression = null;
          for (let i = 0; i < body.length; i++) {
            if (body[i].type === 'ExpressionStatement' &&
              body[i].expression &&
              body[i].expression.type === 'CallExpression' &&
              body[i].expression.callee && body[i].expression.callee.type === 'Identifier' &&
              body[i].expression.callee.name === this.APP_METHOD_NAME) {
              if (appExpression != null) {
                return callback('app() is called multiple times. ');
              }
              appExpression = body[i].expression;
            }
          }

          if (appExpression != null) {
            return callback(null, {start: appExpression.start, end: appExpression});
          }
        }
      }

      return callback('app() is not called');
    } catch (e) {
      return callback(e);
    }
  }

  showJs() {
    const postData = {
      mini_program_id: this.dataInfo.mini_program_id,
      // version: this.dataInfo.version
      version: 'current'
    };
    this.httpService.getData(postData, true, 'app', 'JSshow', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            if (data.data !== '' && data.data !== null && data.data !== undefined) {
              this.textJS = data.data;
              this.originJs = data.data;
            } else {
              this.textJS = 'app({\n' +
                '    onload: function(e){\n' +
                '        // 第一步： 设置小程序初始的方法和属性\n' +
                '        var app = e.target; // 获取小程序对象\n' +
                '        var map = app.map; // 获取地图对象\n' +
                '        var properties = app.properties; // 获取小程序json中为小程序设置的属性\n' +
                '        var mapContainer = map.getContainer(); //获取放置地图的容器\n' +
                '        var el = window.document.createElement(\'div\'); // 创建放置小程序的容器\n' +
                '        this.container = el;\n' +
                '        el.style.width = \'150px\';\n' +
                '        el.style.height = \'55px\';\n' +
                '        el.style.background = \'#09c\';\n' +
                '        el.style.top = \'50px\';\n' +
                '        el.style.left = \'50px\';\n' +
                '        el.style.padding = \'10px\';\n' +
                '        el.style.position = \'absolute\';' +
                '\n' +
                '        // 第二步： 设置小程序的属性（如果json中给properties设置了属性）\n' +
                '        /* 滑动块属性设置 */ \n' +
                '        if (!properties.opacity) {\n' +
                '            this.container.style.opacity = 0.5;\n' +
                '        } else {\n' +
                '            if (properties.opacity) this.container.style.opacity = properties.opacity/100;\n' +
                '        }\n' +
                '        /* 字符串输入框文字属性值调用 */ \n' +
                '        if (!properties.inputString) {\n' +
                '         el.innerHTML ="Sm@rtMapX团队"; \n' +
                '        } else {\n' +
                '        el.innerHTML =properties.inputString; \n' +
                '        }\n' +
                '        /* 数字输入框属性值调用 */ \n' +
                '        if(!properties.inputNumber){ \n' +
                '         el.style.top = \'50px\'; \n' +
                '         el.style.left = \'50px\'; \n' +
                '        } else { \n' +
                '         el.style.top = properties.inputNumber + \'px\'; \n' +
                '         el.style.left = properties.inputNumber + \'px\'; \n' +
                '        } \n' +
                '        /* 拾色器属性值调用 */ \n' +
                '        if(!properties.colorPicker){ \n' +
                '         el.style.background = \'rgb(0, 153, 204)\';  \n' +
                '        } else { \n' +
                '         el.style.background = properties.colorPicker ;\n' +
                '        }\n' +
                '        /* 下拉框属性值调用 */ \n' +
                '        if(!properties.colorPicker){ \n' +
                '        el.innerHTML = el.innerHTML; \n' +
                '        } else { \n' +
                '        el.innerHTML = el.innerHTML +" " + properties.dropDown; \n' +
                '        } \n' +
                '        \n' +
                '        // 第三步： 将小程序放入地图中\n' +
                '        mapContainer.appendChild(this.container);\n' +
                '    },\n' +
                '    onunload: function(){\n' +
                '       // 第四步：当小程序销毁时清除资源\n' +
                '        if (this.container && this.container.parentNode) {\n' +
                '            this.container.parentNode.removeChild(this.container);\n' +
                '            delete this.container;\n' +
                '        }\n ' +
                '   }\n' +
                '});';
              this.originJs = this.textJS;
            }

          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', 'app.js文件请求失败', 2000);
          this.toastService.toast(toastCfg);
        }
      );

    this.resizeEditor();
  }


  postJs(param: any, type: any) {
    const postData = {mini_program_id: this.dataInfo.mini_program_id, js: this.textJS};

    this.httpService.getData(postData, true, 'app', 'JSsave', '')
      .subscribe(
        (data) => {
          if ((data as any).status > 0) {
            if (!param) {
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '保存成功!', 2000);
              this.toastService.toast(toastCfg);
            }
            if (type) {
              // 发布时保存app.js
              this.appService.onJsSavedEmitter.emit();
            } else {
              this.saveClicked = true; // 保存按钮已被点击（用户已保存js）
              this.jsStatus = 'saved';
            }
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', (data as any).msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        (error) => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '保存请求失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });
  }

  // 异常
  private handleError(error: any):
    Promise<any> {
    return Promise.reject(error.message || error);
  }

  // 设置全屏
  setFullScreen() {
    this.isFull = true;
    this.event.emit(this.isFull);
    this.resizeEditor();
  }

  // 设置小屏
  setOriginScreen() {
    this.isFull = false;
    this.event.emit(this.isFull);
    this.resizeEditor();
  }

  resizeEditor() {
    setTimeout(() => {
      if (this.jsEditor) {
        this.jsEditor.resize();
      }
    }, 400);
  }

  // 监听内容是否有变化
  receiveChange(e: any) {
    // 判断js内容是否有改动
      if (e === '' && this.isChangeVersion) {
        return;
      }
      if (!this.isChangeVersion) {
        if (this.originJs !== e) {
          this.jsStatus = 'changed';
        } else {
          this.jsStatus = 'default';
        }
      } else {
        this.isChangeVersion = false;
      }
  }

}
