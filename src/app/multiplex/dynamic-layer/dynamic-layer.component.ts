import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-dynamic-layer',
  templateUrl: './dynamic-layer.component.html',
  styleUrls: ['./dynamic-layer.component.scss']
})
export class DynamicLayerComponent implements OnInit {
  @Input() mapObj: any;
  @Input() layer;
  @Input() name;
  @Input() programJson: any;
  @Output() returnLayer = new EventEmitter();
  title: any;
  pluseBoolean = false;
  reselectBoolean = false;
  layerInfomation = [];
  layerInfoId: any;
  layerInfoArray = [];
  testArray = [];
  reselectArray = [];
  HtmlNeedArray = [];
  middleArray = [];
  AllArray = [];
  layerInfoIds = [];
  submitDisArray = [];
  deleteArray: any = [] ;
  tessTarry = [];
  mNumber: any ;
  promptBoolean = false;
  promptIndex: any;
  layerLength = 0;
  remiddleNumber:any;
  reselectArrayLength: any;
  constructor() {
  }

  ngOnInit() {
    if (this.programJson) {
      this.testArray = this.testArray.concat(this.programJson[this.name]);
       // 给已添加的图层控制生成数组
       this.programJson[this.name].forEach((item: any, index: any) => {
        this.createArray(item);
      });
      this.layerInfoId = this.getMapGeojsonLayers()[1];
    }

    // 当图层选择弹框或别名弹框显示时，点击页面其他区域隐藏该弹框
    document.onclick =  (e: any) => {
      const add = document.getElementById('layer-smartMapX-select-add');
      // 隐藏图层选择弹框
      if (e.target !== add && this.pluseBoolean) {
        const checkboxModal = document.getElementById('layer-smartMapX-select-checkAll');
        const checkboxModalShow = this.isParent (e.target, checkboxModal);
        if (!checkboxModalShow) {
          this.pluseBoolean = false;
        }
      }
      if (e.target.className !== 'fa fa-navicon' && this.reselectBoolean) {
        const checkboxReselectModal = document.getElementById('layer-smartMapX-reselect-checkAll');
        const checkboxReselectModalShow = this.isParent (e.target, checkboxReselectModal);
        if (!checkboxReselectModalShow) {
          this.reselectBoolean = false;
        }
      }
    };
  }


  // 判断点击元素是否为指定元素的子元素
  isParent (obj: any, parentObj: any){
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
    let middle = [];
    for (let i = 0; i < this.getMapGeojsonLayers()[0].length; i++) {
      let obj = {
        name: '',
        id: '',
        isCheck: false,
        source: ''
      };
      obj.name = this.getMapGeojsonLayers()[0][i];
      obj.id = this.getMapGeojsonLayers()[1][i];
      obj.source = this.getMapGeojsonLayers()[2][i];
      middle.push(obj);
    }

    this.layerInfomation = middle;
    this.layerInfoId = this.getMapGeojsonLayers()[1];
  }


  // 确定/取消
  buttonSubmit() {
    let obj = {
      layers: [],
      name: '',
      show: true,
      nameShow: true
    };
    let allObj = {
      layer: []
    };
    obj.layers = this.layerInfoArray;
    obj.name = '动态图层' + (this.testArray.length + 1);

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

    this.returnLayer.emit([this.name, this.testArray]);

  }

  // 取消
  buttonDis() {
    this.layerInfoArray = [];
    this.layerLength = this.layerInfoArray.length;
    this.pluseBoolean = !this.pluseBoolean;
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

  dBclicklab(index: any) {
    this.testArray[index].nameShow = false;
  }

  dBclick(i: any, value: any) {
    this.testArray[i].name = value;
    this.testArray[i].nameShow = true;
    this.returnLayer.emit([this.name, this.testArray]);
  }

  // 删除选中后显示的图层和样式
  removeLayer(index: any) {
    this.testArray.splice(index, 1);
    this.AllArray.splice(index, 1);
    this.returnLayer.emit([this.name, this.testArray]);
  }

  //重新选择图层
  reselectPluse(index: any){
    this.remiddleNumber = index;
    this.reselectBoolean = !this.reselectBoolean;
    this.reselectArray = this.testArray[index].layers;
    this.reselectArrayLength = this.reselectArray.length;
    this.HtmlNeedArray = this.AllArray[index].layer;

    this.submitDisArray = this.AllArray[index].layer;
  }

   // 图层编辑button
   reselectSure() {
    this.testArray[this.remiddleNumber].layers = [] ;
    for (let v of this.HtmlNeedArray){
      if (v.isCheck === true) {
        v.reisCheck = true;
        this.testArray[this.remiddleNumber].layers.push(v);
      }
    }

    this.deleteArray = [] ;
    this.tessTarry = [];
    this.remiddleNumber = -1;
    this.reselectArrayLength = -1;
    this.reselectBoolean = !this.reselectBoolean;
    this.returnLayer.emit([this.name, this.testArray]);

  }

  // 图层编辑 每个元素触发事件
  reclick(index: any) {
    this.mNumber = index ;
    this.HtmlNeedArray[index].isCheck = !this.HtmlNeedArray[index].isCheck;
    var layerNumber = 0 ;
    for (let v of this.HtmlNeedArray){
      if (v.isCheck === true) {
        layerNumber++;
      }
    }
    this.reselectArrayLength = layerNumber;

  }

  // 重新选择图层的编辑页面取消
  reslectDis() {
    for (let v of this.HtmlNeedArray){
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

  createArray(layerDetail: any) {
    let layerObj = ({} as any);
    let middle = [];
    for (let i = 0; i < this.getMapGeojsonLayers()[0].length; i++) {
      let obj = {
        name: '',
        id: '',
        isCheck: false,
      };
      for (let j = 0; j < layerDetail.layers.length; j++) {
        if (layerDetail.layers[j].id === this.getMapGeojsonLayers()[1][i]) {
          obj.isCheck = true;
        }
      }

      obj.name = this.getMapGeojsonLayers()[0][i];
      obj.id = this.getMapGeojsonLayers()[1][i];
      middle.push(obj);
    }
    layerObj['layer'] = middle;
    this.AllArray.push(layerObj);
  }
// 获取geojson图层
  getMapGeojsonLayers() {
    let style = this.mapObj.getStyle();
    let self = this;
    let geojsonLayers = [];
    let geojsonLayersName = [];
    let geojsonLayersSource = [];
    let geojsonLayersNameHash = {};
    let heatmapSources = {};
    if (style && style.layers) {
      style.layers.forEach(function (layer) {
        if (layer.source) {
          const source = self.mapObj.getSource(layer.source);
          if (source && source.type === 'geojson') {
            if (layer.type !== 'heatmap') {
              if (layer.metadata && !geojsonLayersNameHash[layer.metadata.layer_id]) {
                geojsonLayers.push(layer.id);
                geojsonLayersName.push(layer.metadata.name);
                geojsonLayersSource.push(layer.source);
                geojsonLayersNameHash[layer.metadata.layer_id] = true;
              }
            } else if (!heatmapSources[layer.source]) {
              geojsonLayers.push(layer.id);
              geojsonLayersName.push(layer.metadata.name);
              geojsonLayersSource.push(layer.source);
              heatmapSources[layer.source] = true;
            }
          }
        }
      });
    }
    return [geojsonLayersName, geojsonLayers, geojsonLayersSource];
  }
  // 获取地图图层
  /* getMapGeojsonLayers() {
    if (this.mapObj) {
      const style = this.mapObj.getStyle();
      let layers = [];
      let id = [];
      if (style && style.layers) {
        for (let i = 0; i < style.layers.length; i++) {
          if (style.layers[i] && style.layers[i].metadata) {
            layers.push(style.layers[i].metadata.name);
            id.push(style.layers[i].id);
          }

        }
        return [layers, id];

      } else {
        return [];
      }
    }

  }
*/



}
