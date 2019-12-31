import {Component, OnInit, OnDestroy, OnChanges, Input, Output, ViewChild, EventEmitter, AfterViewInit} from '@angular/core';
import {AppService} from '../../s-service/app.service';
import {HttpService} from '../../s-service/http.service';

@Component({
  selector: 'app-layer-select',
  templateUrl: './layer-select.component.html',
  styleUrls: ['./layer-select.component.scss']
})
export class LayerSelectComponent implements OnInit, OnDestroy {
  @Input() mapObj?;
  @Input() pname?: any;
  @Input() programJson?: any; // 小程序的配置
  @Input() programInfo?: any; // 小程序的所有信息
  @Output() selectLayersChange = new EventEmitter();
  title: any;
  value: any;
  description: any;
  name: any;
  layer: any;
  layerInfo: any;
  attribute: any;
  model: any;
  pluseBoolean = false;
  layerInfomation = [];
  layerInfoId: any;
  layerInfoArray = [];
  submitDisArray = [];
  testArray = [];
  layerInfoIds = [];
  layerLength = 0;
  OnOffBoolean = true;
  promptBoolen = false;
  promptIndex: any;
  reselectBoolean = false;
  reselectArray = [];
  reselectArrayLength: any;
  middleArray = [];
  AllArray = [];
  traverseArray = [];
  HtmlNeedArray = [];
  remiddleNumber: any;

  layerArray = [];

  // 获取选择图层
  Boolean = false;
  tessTarry = [];
  mNumber: any;
  deleteArray: any = [];
  listenLayerDelete: any;

  constructor(
    private appService: AppService,
    private httpService: HttpService
  ) {}

  ngOnInit() {
    if (this.programJson) {
      this.testArray = this.testArray.concat(this.programJson[this.pname]);

      // 给已添加的图层控制生成数组
      if (this.programJson && this.programJson[this.pname] && this.programJson[this.pname].length > 0) {
        this.programJson[this.pname].forEach((item: any, index: any) => {
          this.createArray(item);
        });
      }
      this.layerInfoId = this.getUserMapLayers()[1];
      // 查找已添加的图层项目中是否含有已删除的图层，如果有则删除该图层项
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
      if (e.target.className !== 'fa fa-navicon' && this.reselectBoolean) {
        const checkboxModal = document.getElementById('layer-smartMapX-reselect-checkAll');
        const checkboxModalShow = this.isParent(e.target, checkboxModal);
        if (!checkboxModalShow) {
          this.reselectBoolean = false;
        }
      }

    };

  }

  ngOnDestroy() {
  }

  // 查找已添加的图层项目中是否含有已删除的图层，如果有则删除该图层项
  searchDeletedLayer() {
    const style = this.mapObj.getStyle();
    if (style && style.layers && this.testArray && this.testArray.length > 0 && this.testArray[0]) {
      // 遍历已添加的图层项目
      this.testArray.forEach((item: any, index: number) => {
        let layerDeleted = true;
        // 遍历单个图层项目中所添加的图层
        item.layers.forEach((layer: any, i: number) => {

          // 判断已选图层时是否包含已删除的图层
          let bool = false;
          style.layers.forEach((v: any) => {
            if (v.metadata.map_instance_layer_seq === layer.optId) {
              bool = true;
            }
          });
          if (!bool) {
            layerDeleted = false;
            return false;
          }


        });
        // 如果该图层项目中有至少一个添加的图层已被删除，则删除该图层项目
        if (!layerDeleted) {
          this.removeLayers(index);
          this.programJson[this.pname] = this.testArray;
          this.programInfo.properties = this.programJson;
          // 更新小程序
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

  createArray(layerDetail: any) {
    let layerObj = ({} as any);
    let middle = [];
    const arrList = this.getUserMapLayers();
    for (let i = 0; i < arrList[0].length; i++) {
      let obj = {
        name: '',
        id: '',
        isCheck: false,
        optId: ''
      };
      for (let j = 0; j < layerDetail.layers.length; j++) {
        if (layerDetail.layers[j].id === arrList[1][i]) {
          obj.isCheck = true;
        }
      }

      obj.name = arrList[0][i];
      obj.id = arrList[1][i];
      obj.optId = arrList[2][i];
      middle.push(obj);
    }
    layerObj['layer'] = middle;
    this.AllArray.push(layerObj);
  }

  bgEndPluse() {
    this.pluseBoolean = !this.pluseBoolean;
    let middle = [];
    const arrList = this.getUserMapLayers();
    for (let i = 0; i < arrList[0].length; i++) {
      let obj = {
        name: '',
        id: '',
        isCheck: false,
        reisCheck: false,
        optId: ''
      };
      obj.name = arrList[0][i];
      obj.id = arrList[1][i];
      obj.optId = arrList[2][i];
      middle.push(obj);
    }
    this.layerInfomation = middle;
    this.layerInfoId = arrList[1];
  }


  // 图层编辑事件
  reselectPluse(index: any) {
    this.remiddleNumber = index;
    this.reselectBoolean = !this.reselectBoolean;
    this.reselectArray = this.testArray[index].layers;
    this.reselectArrayLength = this.reselectArray.length;
    this.HtmlNeedArray = this.AllArray[index].layer;

    this.submitDisArray = this.AllArray[index].layer;

  }



  clicks(event: any, index: any) {
    this.layerInfomation[index].isCheck = !this.layerInfomation[index].isCheck;
    this.layerInfomation[index].reisCheck = !this.layerInfomation[index].reisCheck;
    if (this.layerInfoArray.indexOf(this.layerInfomation[index]) < 0) {
      this.layerInfoArray.push(this.layerInfomation[index]);
    }
    if (this.layerInfoArray.length > 0) {
      for (let i = 0; i < this.layerInfoArray.length; i++) {

        if (this.layerInfoArray[i].isCheck === false) {
          this.layerInfoArray.splice(i, 1);
        }
      }
    }
    this.layerLength = this.layerInfoArray.length;
  }




  // 图层编辑 每个元素触发事件
  reclick(index: any) {
    this.mNumber = index;
    this.HtmlNeedArray[index].isCheck = !this.HtmlNeedArray[index].isCheck;
    let layerNumber = 0;
    for (let v of this.HtmlNeedArray) {
      if (v.isCheck === true) {
        layerNumber++;
      }
    }
    this.reselectArrayLength = layerNumber;
  }

  // 图层编辑button
  reselectSure() {
    this.testArray[this.remiddleNumber].layers = [];
    for (let v of this.HtmlNeedArray) {
      if (v.isCheck === true) {
        v.reisCheck = true;
        this.testArray[this.remiddleNumber].layers.push(v);
      }
    }

    this.deleteArray = [];
    this.tessTarry = [];
    this.remiddleNumber = -1;
    this.reselectArrayLength = -1;
    this.reselectBoolean = !this.reselectBoolean;
    this.selectLayersChange.emit([this.pname, this.testArray]);
  }

  reslectDis() {
    for (let v of this.HtmlNeedArray) {
      if (v.isCheck === true) {
        if (v.reisCheck === false) {
          v.isCheck = false;
        }
      } else {
        if (v.reisCheck === true) {
          v.isCheck = true;
        }
      }
    }
    this.reselectBoolean = !this.reselectBoolean;
  }

  // 图层控制--确定按钮
  buttonSubmit() {
    let obj = {
      layers: [],
      name: '',
      itemId: null,
      show: true,
      nameShow: true,
      jsOnOffname: true

    };
    let allObj = {
      layer: []
    };
    obj.layers = this.layerInfoArray;
    obj.itemId = new Date().getTime();

    // 生成添加图层项目的名称
    // obj.name = '图层' + (this.testArray.length + 1);
    if (this.layerInfoArray.length > 0 && this.layerInfoArray.length === 1) {
      obj.name = this.layerInfoArray[0].name;
    }
    if (this.layerInfoArray.length > 0 && this.layerInfoArray.length !== 1) {
      const name = [];
      this.layerInfoArray.forEach((item: any, i: number) => {
        name.push(item.name);
      });
      obj.name = name.join();
    }

    // 把生成的对象放入数组（面板小数组）
    if (obj.layers.length > 0) {
      this.testArray.push(obj);
    }
    this.middleArray = this.layerInfomation;
    allObj.layer = this.middleArray;
    // 把每次生成的有 boolean值得ischeck值得数组放在总数组中
    this.AllArray.push(allObj);
    this.middleArray = [];
    this.layerInfoArray = [];
    this.layerInfoIds = [];
    this.layerLength = this.layerInfoArray.length;
    this.pluseBoolean = !this.pluseBoolean;
    this.selectLayersChange.emit([this.pname, this.testArray]);
  }

  buttonDis() {
    this.layerInfoArray = [];
    this.layerLength = this.layerInfoArray.length;
    this.pluseBoolean = !this.pluseBoolean;
  }

  // 开关状态码
  changOnOff(event: any, index: any) {

    if (this.testArray[index].show === true) {
      this.testArray[index].show = false;
    } else {
      this.testArray[index].show = true;
    }
    if (this.testArray[index].jsOnOffname === true) {
      this.testArray[index].jsOnOffname = false;
    } else {
      this.testArray[index].jsOnOffname = true;
    }
    this.selectLayersChange.emit([this.pname, this.testArray]);
  }



  // 删除图层集合
  removeLayers(index: any) {
    this.testArray.splice(index, 1);
    this.AllArray.splice(index, 1);
    this.selectLayersChange.emit([this.pname, this.testArray]);
  }

  // 提示框部分
  prompt(index: any) {
    this.promptIndex = index;
    this.promptBoolen = true;
  }

  // 确认删除
  ButtonSuerDelete() {
    if (this.promptIndex > -1) {
      this.removeLayers(this.promptIndex);
      this.promptIndex = -1;
    }
    this.promptBoolen = false;
  }

  ButtonDisDelete() {
    this.promptIndex = -1;
    this.promptBoolen = false;
  }


  // 修改图层名字
  dBclicklab(index: any) {
    this.testArray[index].nameShow = !this.testArray[index].nameShow;
  }

  dBclick(i: any, value: any) {
    this.testArray[i].name = value;
    this.testArray[i].nameShow = !this.testArray[i].nameShow;
    this.selectLayersChange.emit([this.pname, this.testArray]);
  }

  // 获取地图图层
  getUserMapLayers() {
    const style = this.mapObj.getStyle();
    const layers = [];
    const id = [];
    const optId = [];
    const mapName = {};
    if (style && style.layers) {
      for (let i = 0; i < style.layers.length; i++) {
        if (style.layers[i] && style.layers[i].metadata && !style.layers[i].metadata.basemap) {
            if (!mapName[style.layers[i].metadata.layer_id]) {
              layers.push(style.layers[i].metadata.name);
              id.push(style.layers[i].id);
              if (style.layers[i].metadata.map_instance_layer_seq) {
                optId.push(style.layers[i].metadata.map_instance_layer_seq);
              } else {
                optId.push(style.layers[i].metadata.instance_layer_id);
              }
              mapName[style.layers[i].metadata.layer_id] = true;
            }
        }
      }
      return [layers, id, optId];
    } else {
      return [];
    }
  }


}
