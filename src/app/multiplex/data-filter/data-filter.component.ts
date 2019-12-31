import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpService} from '../../s-service/http.service';
// import { type } from 'os';
import {LocalStorage} from '../../s-service/local.storage';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {AppService} from '../../s-service/app.service';

@Component({
  selector: 'app-data-filter',
  templateUrl: './data-filter.component.html',
  styleUrls: ['./data-filter.component.scss']
})
export class DataFilterComponent implements OnInit {
  @Input() mapObj: any;
  @Input() name;
  @Input() programJson: any;
  @Input() programInfo: any;
  @Input() default: any;
  @Output() dataFilterChange = new EventEmitter();
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
  a = [];
  listenLayerDelete: any;

  constructor(private httpService: HttpService,
              private toastService: ToastService,
              private appService: AppService,
              private ls: LocalStorage
              ) {}

  ngOnInit() {
    if (this.programJson) {
      this.testArray = this.programJson[this.name];
      this.searchDeletedLayer();
    }
  }

  // 查找已添加的图层项目中是否含有已删除的图层，如果有则删除该图层项
  searchDeletedLayer() {
    const style = this.mapObj.getStyle();
    if (style && style.layers && this.testArray && this.testArray.length > 0) {
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
          // 更新小程序
          // this.update(this.programInfo);
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

  // 添加图层
  add() {
    this.pluseBoolean = !this.pluseBoolean;
    const middle = [];
    for (let i = 0; i < this.getMapLayers()[0].length; i++) {
      const obj = {
        name: '',
        id: '',
        styleId: ''
      };
      obj.name = this.getMapLayers()[0][i];
      obj.id = this.getMapLayers()[1][i];
      obj.styleId = this.getMapLayers()[2][i];
      middle.push(obj);
    }
    this.layerInfomation = middle;
    this.layerInfoId = this.getMapLayers()[1];
  }


  // 确定/取消
  buttonSubmit() { // 60967dd1-4ed3-49bd-abe7-fd4f272f305a
    this.httpService.getData({layer_id: this.layerInfoArray[0].id}, true, 'execute', '4fcd3418-fced-483a-8ce8-66f312532dc4', '')
      .subscribe((data) => {
        this.layerData = [];
        if (data && (data as any).data.length > 0) {
          const obj = {
            layers: [],
            name: '',
            show: true,
            nameShow: true,
            slidedown: true,
            selectDefault: '',
            titleModalShow: false,
            titleSelect: true,
            dataShow: true,
            key: [],
            data: [
              {name: '', value: '', type: ''}
            ]
          };
          const allObj = {
            layer: []
          };
          obj.layers = this.layerInfoArray;
          obj.name = this.layerInfoArray[0].name;
          // (data as any).data.forEach((i: any, index: any) => {
          //   obj.key.push(i.description);
          // });
          // console.log(this.mapObj.getLayer(this.layerInfoArray[0].styleId));
          const layerData = this.mapObj.getLayer(obj.layers[0].styleId);
          this.getDataType(layerData, obj);

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

  dBclickLegend() {
    this.dataFilterChange.emit([this.name, this.testArray]);
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
    this.dataFilterChange.emit([this.name, this.testArray]);
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
          // if (style.layers[i] && style.layers[i].metadata && style.layers[i].type !== 'background') {
          if (style.layers[i] && style.layers[i].metadata && style.layers[i].metadata.basemap !== true) {
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

  // 下拉框展示、收起
  slideToggle(index: any) {
    this.testArray[index].slidedown = !this.testArray[index].slidedown;
    this.dataFilterChange.emit([this.name, this.testArray]);
  }

  // 排序
  moveUp(item: any, index: any) {
    const currentData = this.testArray[index];
    const upIndexData = this.testArray[index - 1];
    const newArray = this.testArray;
    newArray[index - 1] = currentData;
    newArray[index] = upIndexData;
    this.testArray = newArray;
    this.dataFilterChange.emit([this.name, this.testArray]);
  }

  moveDown(item: any, index: any) {
    const currentData = this.testArray[index];
    const downIndexData = this.testArray[index + 1];
    const newArray = this.testArray;
    newArray[index + 1] = currentData;
    newArray[index] = downIndexData;
    this.testArray = newArray;
    this.dataFilterChange.emit([this.name, this.testArray]);
  }

  // 添加查询条件
  addCondition(item: any, index: any) {
    item.data.push({'name': '', 'value': '', type: ''});
  }

  // 下拉框选择
  selectKey(event: any, data: any, index: any, item: any) {

    // if (event.target.value == '') {
    //   //data.value = '';
    //   // data.value = event.target.value;
    //   item = [];
    // } else {

    data.value = event.target.value;
    // const layerData = this.mapObj.getLayer(item.layers[0].styleId);
    // this.getDataType(layerData, item, index);
    item.dataType.forEach((v: any) => {
      if (item.data[index].value === v.description) {
        item.data[index].type = v.data_type;
        item.data[index].name = v.description;
        this.dataFilterChange.emit([this.name, this.testArray]);
      }
    });

  }

  // 删除查询条件
  deleteCondition(data: any, item: any, index: any) {
    item.splice(index, 1);
    this.dataFilterChange.emit([this.name, this.testArray]);
  }

  // 显示图层数据开关按钮
  showLayerData(item: any) {
    item.dataShow = !item.dataShow;
    this.dataFilterChange.emit([this.name, this.testArray]);
  }

  // 查询字段
  getDataType(layerData: any, item: any) {
    this.httpService.getData({'entity_id': layerData.metadata.entity_id},
      true, 'execute', '60967dd1-4ed3-49bd-abe7-fd4f272f305a', 'map')
      .subscribe(
        data => {
          if ((data as any).status < 0 || (data as any).tag !== 'map') {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据获取失败,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          item['dataType'] = [];
          (data as any).data.forEach((v: any) => {
            if (v.data_type !== 'USER-DEFINED' && v.data_type !== 'POINT' && v.data_type !== 'postgres_line' && v.data_type !== 'postgres_polygon') {
              item['dataType'].push(v);
            }
          });
          this.dataFilterChange.emit([this.name, this.testArray]);
        });
  }

}
