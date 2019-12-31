import {Component, Input, OnInit, Output, EventEmitter, OnDestroy, AfterViewInit, ViewChild} from '@angular/core';
import * as Ajv from 'ajv';
import {HttpService} from '../../../s-service/http.service';
import {AppService} from '../../../s-service/app.service';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';

@Component({
  selector: 'app-json-edit-panel',
  templateUrl: './json-edit-panel.component.html',
  styleUrls: ['./json-edit-panel.component.scss']
})
export class JsonEditPanelComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() index: any;
  @Input() jsonUpdate: any;
  @Input() dataInfo: any;
  @Input() mapObj: any;

  @Output() event = new EventEmitter();
  @Output() send = new EventEmitter();
  @ViewChild('editor', {static: false}) ed: any;
  jsonEditor: any;
  schema: any;
  validJson: any;
  validate: any;
  originJson: any;
  jsonStatus = 'default'; // default-未更改 saved-已保存 changed-已修改

  isFull = false;
  isEdit = false;
  textjson: any;
  jsonChange: any;
  isChangeVersion = false;

  constructor(private toastService: ToastService,
              private httpService: HttpService,
              private appService: AppService
  ) {
    this.jsonChange = this.appService.onJsonChangeEventEmitter.subscribe((data) => {
      this.isChangeVersion = true;
      this.jsonEditor.session.setValue(data);
      this.jsonStatus = 'default';
    });

  }

  ngOnInit() {
    if (this.dataInfo) {
      this.isEdit = !this.dataInfo.visit_type;
    }
  }


  ngAfterViewInit(): void {
    this.jsonEditor = this.ed.getEditorObj();
    if (this.isEdit) {
      this.jsonEditor.commands.addCommand({
        name: 'myCommand',
        bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
        exec: (editor) => {
          this.saveJson();
        },
        readOnly: true // false if this command should not apply in readOnly mode
      });


      this.jsonEditor.commands.addCommand({
        name: 'theme',
        bindKey: {win: 'Ctrl-Alt-L', mac: 'Command-Alt-L'},
        exec: (editor) => {
          this.codeFormat();
        },
        readOnly: true // false if this command should not apply in readOnly mode
      });
    }


    this.showJson();
  }

  ngOnDestroy() {
    if (this.jsonEditor) {
      this.jsonEditor.container.remove();
    }
    this.jsonEditor = null;
    this.jsonChange.unsubscribe();
  }

  saveJson() {
    const ajv = new Ajv({allErrors: true});
    if (this.textjson === '') {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', 'Json不能为空', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    try {
      this.validJson = JSON.parse(this.textjson);
      const reslut = ajv.validateSchema(this.validJson);
      if (reslut) {
        this.postJson(false, null);
      } else {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', this.errorsText(ajv.errors), 2000);
        this.toastService.toast(toastCfg);
      }
    } catch (e) {
      const toastCfg = new ToastConfig(ToastType.ERROR, '', 'Json格式错误', 2000);
      this.toastService.toast(toastCfg);
    }
  }


  errorsText(errors: any) {
    if (errors) {
      const messages = ([] as any);
      errors.forEach(function (err: any) {
        const message = `[${err.dataPath}] ${err.message}]`;
        if (err.keyword === 'enum' && err.params && err.params.allowedValues) {
          // message += `[${err.params.allowedValues.join(', ')}]`;
        }
        messages.push(message);
      });
      return messages.join('\n');
    } else {
      return '';
    }
  }

  showJson() {
    const postData = {
      mini_program_id: this.dataInfo.mini_program_id,
      version: 'current'
    };
    this.httpService.getData(postData, true, 'app', 'JSONshow', '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            if (data.data !== '' && data.data !== null && data.data !== undefined) {
              const code = data.data;
              // const json = JSON.parse(code);
              // const text = JSON.stringify(json, null, 4);
              this.textjson = code;
              // this.jsonEditor.session.setValue(text);
              this.originJson = code;
            } else {
              this.textjson = '{\n' +
                '  "modal": "angular",\n' +
                '  "description": "小程序描述",\n' +
                '  "group":[ \n' +
                '     {\n' +
                '       "title": "标题名称",\n' +
                '       "properties": [\n' +
                '          {\n' +
                '           "attribute": "opacity",\n' +
                '           "title": "滑动块",\n' +
                '           "type": "slider",\n' +
                '           "max": 100,\n' +
                '           "min": 0,\n' +
                '           "default": 60\n' +
                '         },\n' +
                '       { \n' +
                '           "attribute": "inputString",\n' +
                '           "title": "字符串输入框", \n' +
                '           "type": "input",\n' +
                '           "format": "string", \n' +
                '           "default": "Sm@rtMapX团队" \n' +
                '       },\n' +

                '       {\n' +
                '           "attribute": "inputNumber", \n' +
                '           "title": "数字输入框", \n' +
                '           "type": "input", \n' +
                '           "max": 2000,\n' +
                '           "min": 0,\n' +
                '           "format": "number", \n' +
                '           "default": 50 \n' +
                '       }, \n' +
                '       { \n' +
                '           "attribute": "colorPicker", \n' +
                '           "title": "拾色器", \n' +
                '           "type": "color", \n' +
                '           "default": "rgb(0, 153, 204)" \n' +
                '       }, \n' +
                '       { \n' +
                '           "attribute": "dropDown", \n' +
                '           "title": "下拉框", \n' +
                '           "type": "dropdown",\n' +
                '           "enum": [ \n' +
                '               { \n' +
                '                   "label": "奔驰", \n ' +
                '                   "value": "奔驰" \n' +
                '               }, \n' +
                '               { \n' +
                '                   "label": "奥迪", \n' +
                '                   "value": "奥迪" \n' +
                '               }, \n' +
                '               { \n' +
                '                   "label": "宝马", \n' +
                '                   "value": "宝马" \n' +
                '               } \n' +
                '           ], \n' +
                '           "default": "宝马" \n' +
                '       } \n' +


                '       ]\n' +
                '      }\n' +
                '   ]\n' +
                '}';
              this.originJson = this.textjson;
            }
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', 'app.json文件请求失败', 2000);
          this.toastService.toast(toastCfg);
        }
      );
    this.resizeEditor();
  }

  postJson(param: any, type: any) {
    const jsondata = this.textjson;
    const json = JSON.parse(jsondata);
    const jsonValue = {};
    for (let i = 0; i < json.group.length; i++) {
      const properties = json.group[i].properties;
      for (let m = 0; m < properties.length; m++) {
        jsonValue[properties[m].attribute] = properties[m].default;
      }
    }

    const postData = {
      mini_program_id: this.dataInfo.mini_program_id,
      json: this.textjson,
      default_content: jsonValue
    };


    this.httpService.getData(postData, true, 'app', 'JSONsave', '')
      .subscribe(
        (data: any) => {
          if ((data as any).status > 0) {
            if (!param) {
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '保存成功!', 2000);
              this.toastService.toast(toastCfg);
            }
            if (type) {
              this.appService.onJsonSavedEventEmitter.emit();
            }
            this.jsonStatus = 'saved';
            this.send.emit();
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', (data as any).msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        (error) => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '保存请求失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }


  // 代码格式化
  codeFormat() {
    // const code = this.jsonEditor.getValue();
    const json = JSON.parse(this.textjson);
    const text = JSON.stringify(json, null, '  ');
    this.textjson = text;
    // this.jsonEditor.session.setValue(text);
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

  // 添加、更新小程序
  // update(item: any, value: any) {
  //     const apps = ({} as any);
  //     const programId = item.mini_program_id;
  //     apps[programId] = {
  //         title: item.name,
  //         description: item.description,
  //         properties: value
  //     };
  //     this.mapObj.updateApps(apps);
  // }

  resizeEditor() {
    setTimeout(() => {
      if (this.jsonEditor) {
        this.jsonEditor.resize();
      }
    }, 400);
  }

  // 监听json内容是否有变化
  receiveChange(e: any) {
    if (e === '' && this.isChangeVersion) {
      return;
    }
    if (!this.isChangeVersion) {
      if (this.originJson !== e) {
        this.jsonStatus = 'changed';
      } else {
        this.jsonStatus = 'default';
      }
    } else {
      this.isChangeVersion = false;
    }
  }

}
