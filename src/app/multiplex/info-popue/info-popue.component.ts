import {Component, OnInit, OnChanges, OnDestroy, AfterViewInit, Input, EventEmitter, Output} from '@angular/core';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {AppService} from '../../s-service/app.service';

@Component({
  selector: 'app-info-popue',
  templateUrl: './info-popue.component.html',
  styleUrls: ['./info-popue.component.scss']
})
export class InfoPopueComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy{
  @Input() mapObj: any;
  @Input() name;
  @Input() programJson: any;
  @Input() programInfo: any;
  @Input() default: any;
  @Output() layerChange = new EventEmitter();
  title: any;
  pluseBoolean = false;
  layerInfomation = [];
  layerInfoId: any;
  layerInfoArray = [];
  testArray = [];

  middleArray = [];
  AllArray = [];
  layerInfoIds = [];
  promptBoolean = false;
  promptIndex: any;
  layerLength = 0;
  layerData = [];
  optionItems: any;
  textValue: any;
  listenLayerDelete: any;


  constructor(private httpService: HttpService,
              private toastService: ToastService,
              private appService: AppService
              ) {
  }


  ngOnInit() {
    if (this.programJson) {
      this.testArray = this.programJson[this.name];
      console.log(this.testArray);
      this.searchDeletedLayer();
    }

    // 当图层选择弹框或别名弹框显示时，点击页面其他区域隐藏该弹框
    document.onclick = (e: any) => {
      const add = document.getElementById('add');
      // 隐藏图层选择弹框
      if (e.target !== add && this.pluseBoolean) {
        const checkboxModal = document.getElementById('layer-smartMapX-select-checkAll');
        const checkboxModalShow = this.isParent(e.target, checkboxModal);
        if (!checkboxModalShow) {
          this.pluseBoolean = false;
        }
      }
      // 隐藏别名弹框
      if (e.target.className !== 'layer-smartMapX-select-add') {
        // 隐藏其他已显示的弹框
        this.hideNameSelectModal();
      }
    };
  }

  ngOnChanges() {
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {

  }

  // 查找已添加的图层项目中是否含有已删除的图层，如果有则删除该图层项
  searchDeletedLayer() {
    const style = this.mapObj.getStyle();
    if (style && style.layers && this.testArray && this.testArray.length > 0 && this.testArray[0] ) {
      // 遍历已添加的图层项目
      this.testArray.forEach((item: any, index: number) => {
        let layerDeleted = false;
        // 遍历单个图层项目中所添加的图层
        item.layers.forEach((layer: any, i: number) => {
          style.layers.forEach((v) => {
            if (layer.styleId === v.id) {
              layerDeleted = true;
            }
          });
        });
        // 如果该图层项目中有至少一个添加的图层已被删除，则删除该图层项目
        if (!layerDeleted) {
          this.removeLayer(index);
          this.programJson[this.name] = this.testArray;
          this.programInfo.properties = this.programJson;
          this.saveMiniprogram();
        }
      });
    }
  }

  // 向服务器保存删除图层后的小程序配置
  saveMiniprogram() {
    const data = {
      status: this.programInfo.status, // 1启用 0禁用
      content: this.programJson,
      map_mini_program_id: this.programInfo.map_mini_program_id,
      version: this.programInfo.current_version ? this.programInfo.current_version : null
    };
    this.httpService.getData(data, true, 'execute', '83a0f98e-cd3f-41d6-9a65-6455c7e1ad07', '')
      .subscribe(
        (res: any) => {
          if (res.status < 0) {
            console.log('小程序配置保存失败');
          }
        },
        error => {

        });
  }

  // 更新小程序
  update(item: any) {
    const app = {
      id: item.id,
      map_mini_program_id: item.map_mini_program_id,
      title: item.title,
      description: item.description,
      properties: item.properties,
      map_mini_user_id: item.map_mini_user_id,
      version: item.recommend
    };
    this.mapObj.addApp(app);
  }

  // 判断点击元素是否为指定元素的子元素
  isParent(obj: any, parentObj: any) {
    while (obj !== undefined && obj != null && obj.tagName && obj.tagName.toUpperCase() !== 'BODY') {
      if (obj === parentObj) {
        return true;
      }
      obj = obj.parentNode;
    }
    return false;
  }

  // 添加图层
  add() {
    this.pluseBoolean = !this.pluseBoolean;
    const middle = [];
    const result = this.getMapLayers();
    if (result.length === 0) {
      return;
    }
    for (let i = 0; i < result[0].length; i++) {
      const obj = {
        name: '',
        id: '',
        styleId: ''
      };
      obj.name = result[0][i];
      obj.id = result[1][i];
      obj.styleId = result[2][i];
      middle.push(obj);
    }

    this.layerInfomation = middle;
    this.layerInfoId = result[1];
  }


  // 确定/取消
  buttonSubmit() {
    this.httpService.getData({layer_id: this.layerInfoArray[0].id}, true, 'execute',
      '4fcd3418-fced-483a-8ce8-66f312532dc4', '').subscribe((data) => {
      this.layerData = [];
      if (data && (data as any).data.length > 0) {

        const obj = {
          layers: [],
          name: '',
          show: true,
          nameShow: true,
          slidedown: true,
          layerData: [],
          selectDefault: '',
          titleTemplate: '',
          contentTemplate: '',
          titleModalShow: false,
          titleSelect: true,
          dataShow: true,
          currentPosition: null
        };
        const allObj = {
          layer: []
        };

        obj.layers = this.layerInfoArray;
        obj.name = this.layerInfoArray[0].name;
        obj.layerData = (data as any).data;

        obj.selectDefault = obj.layerData[0]['description'];
        let tplContent = '';
        obj.layerData.forEach((item: any, index: any) => {
          if (item.description === 'class') {
            tplContent += 'oclass' + ':  ' + '<%=' + 'oclass' + '%>' + '<br />\n';
          } else {
            tplContent += item.description + ':  ' + '<%=' + item.description + '%>' + '<br />\n';
          }
        });
        obj.contentTemplate = tplContent;
        obj.titleTemplate = '<%=' + obj.layerData[0]['description'] + '%>';

        // 把生成的对象放入面板数组
        if (obj.layers.length > 0) {
          this.testArray.push(obj);
        }

        this.middleArray = this.layerInfomation;
        allObj.layer = this.middleArray;
        this.AllArray.push(allObj);
        this.middleArray = [];
        this.layerInfoArray = [];
        this.layerInfoIds = [];
        this.layerLength = this.layerInfoArray.length;
        this.pluseBoolean = !this.pluseBoolean;
        this.layerChange.emit([this.name, this.testArray]);
      } else {
        const toast = new ToastConfig(ToastType.INFO, '', '此图层没有可显示的数据', 2000);
        this.toastService.toast(toast);
      }
    });
  }

  // 取消
  buttonDis() {
    this.layerInfoArray = [];
    this.layerLength = this.layerInfoArray.length;
    this.pluseBoolean = !this.pluseBoolean;
  }

  clicks(event: any, index: any) {
    this.layerInfoArray = [];
    this.layerInfoArray.push(this.layerInfomation[index]);
    this.layerLength = this.layerInfoArray.length;
  }

  prompt(i: any) {
    this.promptIndex = i;
    this.promptBoolean = true;
  }

  ButtonSuerDelete() {
    if (this.promptIndex > -1) {
      this.removeLayer(this.promptIndex);
      this.promptIndex = -1;
    }
    this.promptBoolean = false;
  }

  ButtonDisDelete() {
    this.promptIndex = -1;
    this.promptBoolean = false;
  }

  // 删除选中后显示的图层和样式
  removeLayer(index: any) {
    this.testArray.splice(index, 1);
    this.AllArray.splice(index, 1);
    this.layerChange.emit([this.name, this.testArray]);
  }


  // 获取地图图层
  getMapLayers() {
    if (this.mapObj) {
      const style = this.mapObj.getStyle();
      const layers = [];
      const id = [];
      const styleId = [];
      const mapName = {};
      if (style && style.layers) {
        for (let i = 0; i < style.layers.length; i++) {
          if (style.layers[i] && style.layers[i].metadata && style.layers[i].type !== 'background') {
            if (!mapName[style.layers[i].metadata.layer_id]) {
              layers.push(style.layers[i].metadata.name);
              id.push(style.layers[i].metadata.layer_id);
              styleId.push(style.layers[i].id);
              mapName[style.layers[i].metadata.layer_id] = true;
            }
          }
        }
        return [layers, id, styleId];
      } else {
        return [];
      }
    }
  }


  // 获取所选择图层中的数据
  getLayerData(layerId: string) {
    this.httpService.getData({layer_id: layerId}, true, 'execute', '4fcd3418-fced-483a-8ce8-66f312532dc4', '').subscribe((data) => {
      this.layerData = [];
      if (data && (data as any).data) {
        this.layerData = (data as any).data.map((item: any, index: any) => {
          item.checked = false;
          return item;
        });
      }
    });
  }

  slideToggle(index: any) {
    this.testArray[index].slidedown = !this.testArray[index].slidedown;
    this.layerChange.emit([this.name, this.testArray]);
  }

  hideNameSelectModal() {
    if (this.testArray) {
      this.testArray.forEach((v: any) => {
        if (v.titleModalShow) {
          v.titleModalShow = false;
        }
      });
    }
  }

  // 标题选择弹框显隐
  titleModalToggle(item: any) {
    // 隐藏其他已显示的弹框
    this.hideNameSelectModal();

    if (!item.titleSelect && item.titleModalShow) {
      item.titleSelect = true;
    } else {
      item.titleModalShow = !item.titleModalShow;
    }
    item.titleSelect = true;
    this.layerChange.emit([this.name, this.testArray]);
  }

  // 别名选择
  titleSelect(item: any, option: any) {
    if (item.titleSelect) {
      if (option.description === 'class') {
        item.titleTemplate = item.titleTemplate + '<%=oclass%>';
      } else {
        item.titleTemplate = item.titleTemplate + '<%=' + option.description + '%>';
      }
    } else {
      if (item.currentPosition) {
        const start = item.contentTemplate.slice(0, item.currentPosition);
        const end = item.contentTemplate.slice(item.currentPosition);
        if (option.description === 'class') {
          item.contentTemplate = start + 'oclass:  ' + '<%=oclass%>' + '<br />\n' + end;
        } else {
          item.contentTemplate = start + option.description + ':  ' + '<%=' + option.description + '%>' + ' <br />\n' + end;
        }
      } else {
        if (option.description === 'class') {
          item.contentTemplate = item.contentTemplate + 'oclass:  ' + '<%=oclass%>' + '<br />\n';
        } else {
          item.contentTemplate = item.contentTemplate + option.description + ':  ' + '<%=' + option.description + '%>' + ' <br />\n';
        }
      }
    }
    item.titleModalShow = false;
    this.layerChange.emit([this.name, this.testArray]);
  }

  // 内容弹框与标题选择框为同一弹框
  contentModalToggle(item: any) {
    // 隐藏其他已显示的弹框
    this.hideNameSelectModal();
    item.titleSelect = false;
    item.titleModalShow = !item.titleModalShow;
    this.layerChange.emit([this.name, this.testArray]);
  }

  // 点击文本框时，记录光标位置
  textareaClick(e: any, item: any) {
    item.currentPosition = e.target.selectionStart;
    this.layerChange.emit([this.name, this.testArray]);
  }

  // 在文本框时按Enter键时，记录光标位置
  textareaKeyup(e: any, item: any, index: any, tpl: any) {
    item.currentPosition = e.target.selectionStart;
    this.testArray[index].contentTemplate = tpl;
    this.layerChange.emit([this.name, this.testArray]);
  }

  // 显示图层数据开关按钮
  showLayerData(item: any) {
    item.dataShow = !item.dataShow;
    this.layerChange.emit([this.name, this.testArray]);
  }

  //
  inputChange(index: any, tpl) {
    this.testArray[index].titleTemplate = tpl;
    this.layerChange.emit([this.name, this.testArray]);
  }

  // 排序
  moveUp(item: any, index: any) {
    const currentData = this.testArray[index];
    const upIndexData = this.testArray[index - 1];
    const newArray = this.testArray;
    newArray[index - 1] = currentData;
    newArray[index] = upIndexData;
    this.testArray = newArray;
    this.layerChange.emit([this.name, this.testArray]);
  }

  moveDown(item: any, index: any) {
    const currentData = this.testArray[index];
    const downIndexData = this.testArray[index + 1];
    const newArray = this.testArray;
    newArray[index + 1] = currentData;
    newArray[index] = downIndexData;
    this.testArray = newArray;
    this.layerChange.emit([this.name, this.testArray]);
  }

}
