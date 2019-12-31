import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import {SmxModal} from '../../smx-component/smx-modal/directive/smx-modal';
import {LegendComponent} from '../../multiplex/s_legend/legend.component';
import {PlotModalComponent} from '../plot-modal/plot-modal.component';
import {CreateStyleModalComponent} from '../plot-modal/create-style-modal/create-style-modal.component';
import {AppService} from '../../s-service/app.service';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
@Component({
  selector: 'app-circle-style',
  templateUrl: './plot-style.component.html',
  styleUrls: ['./plot-style.component.scss']
})
export class PlotStyleComponent implements OnInit , OnDestroy {
  @ViewChild(LegendComponent, {static: false}) LegendCom: LegendComponent;
  @Input() plotStyle: any;
  @Input() map: any;
  @Input() isUpdateStyle: any;
  @Output() sendChooseStyle = new EventEmitter<any>();
  @Output() plotEditChange = new EventEmitter<any>();    // 和plot-edit组件通信事件
  isPlotStyleCom = true;
  styleList = [];
  plotFormat = 'plot';
  waterMark: any;
  // 下拉框初始数据
  // width宽度 下拉框
  widthSelectData = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  // 描边宽度
  borderWidthSelectData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // 透明度
  opacitySelectData = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

  // 行高、字号
  textSelectData = [12, 14, 16, 18, 20, 22, 24, 26, 30, 32, 34, 36, 38, 40];
  lineSelectData = [1, 1.2, 1.4, 1.6, 1.8, 2];
  // 圆角
  radiusSelectData = ['0', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];

  // 挂件-图片宽度
  imageWidthSelectData = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];

  // 文字-最大宽度
  maxWidthSelectData = [10, 20, 30, 50, 100, 150, 200, 250, 300];

  // 线类型
  lineTypeSelectData = [
    {'value': [0, 0]},
    {'value': [2, 2]}
  ];

  // 填充图案
  fillPaternSelectData =  [
    {
      iconId: 'H00001',
      url: 'assets/img/001.png'
    },
    {
      iconId: 'H00002',
      url: 'assets/img/002.png'
    },
    {
      iconId: '',
      url: ''
    }
  ];

  unReceiveStyle: any;
  plotStyleArray: any;
  drawType: any;
  itemIndex = 0; // 公共样式库默认选中第一个

  widthSelectShow = false;
  borderWidthSelectShow= false;
  opacitySelectShow= false;
  lineTypeSelectShow= false;
  fontSizeSelectShow= false;
  lineHeightSelectShow= false;
  fillPatternSelectShow= false;
  showStyleList = false;
  imageBorderWidthSelectShow = false;
  imageRaiudsSelectShow = false;
  imageWidthSelectShow = false;
  imageHeightSelectShow = false;
  imageBoxShadowShow = false;
  backWidth: number;
  backHeight: number;

  lineTypeIndex = 0;
  iconImage: any;
  iconRatio = 1;
  imageOffset: any;
  color = '#09c';


  // 用户最近使用的类型样式
  recentUse = {
    // 点类型
    draw_point_list : [],
    draw_point_item : null,

    // 线类型
    draw_line_list: [],
    draw_line_item: null,

    // 注记
    draw_words_list: [],
    draw_words_item: null,

    // 面
    draw_fill_list: [],
    draw_fill_item: null,

    draw_box_list: [],
    draw_box_item: null,

    draw_circle_list: [],
    draw_circle_item: null,

    // 箭头
    draw_arrow_list: [],
    draw_arrow_item: null,

    // 箭头
    draw_photo_list: [],
    draw_photo_item: null,

    // 图标
    draw_symbol: [],
    draw_symbol_item: null,

    // 挂件-文字
    draw_pendant_words_item: null,

    // 挂件-图片
    draw_pendant_image_item: null,
  };

  // 下拉输入框
  widthInput = false;
  heightInput = false;
  borderWidthInput = false;
  radiusInput = false;

  // 挂件图片-位置下拉框
  positionData = {
    options: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
    title: ['左上角', '右上角', '左下角', '右下角'],
    showDrop: false
  };

  // 挂件图片-置顶置地
  setTopBottom = {
    options: ['top-layer'],
    title: ['置顶'],
    showDrop: false
  };




  constructor(
    private modalService: SmxModal,
    private appService: AppService,
    private httpService: HttpService,
    private elementRef: ElementRef,
    private toastService: ToastService
  ) {
    this.unReceiveStyle = this.appService.onSaveStyleEmitter.subscribe((data: any) => {
      this.styleList = data.styleList;
    });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.unReceiveStyle.unsubscribe();
  }

  // 点击宽度width选择框
  openWidthSelect() {
    this.widthSelectShow = !this.widthSelectShow;
    // 如果样式框存在，点击空白除隐藏样式框
    if (this.widthSelectShow) {
      document.onclick = (e) => {
        this.widthSelectShow = false;
        // 隐藏输入框
        this.widthInput = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    // 隐藏其他显示的弹框
    this.showStyleList = false;
    this.opacitySelectShow = false;
    this.borderWidthSelectShow = false;
    this.lineTypeSelectShow = false;
    this.fontSizeSelectShow = false;
    this.lineHeightSelectShow = false;
    this.fillPatternSelectShow = false;

    // 隐藏输入框
    this.widthInput = false;
  }

  // 点击透明度opacity选择框
  openOpacitySelect() {
    this.opacitySelectShow = !this.opacitySelectShow;
    // 如果样式框存在，点击空白除隐藏样式框
    if (this.opacitySelectShow) {
      document.onclick = (e) => {
        this.opacitySelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    // 隐藏其他显示的弹框
    this.showStyleList = false;
    this.widthSelectShow = false;
    this.borderWidthSelectShow = false;
    this.lineTypeSelectShow = false;
    this.fillPatternSelectShow = false;
  }

  // 点击边框宽度borderWidth选择框
  openBorderWidthSelect() {
    this.borderWidthSelectShow = !this.borderWidthSelectShow;
    // 如果样式框存在，点击空白除隐藏样式框
    if (this.borderWidthSelectShow) {
      document.onclick = (e) => {
        this.borderWidthSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    // 隐藏其他显示的弹框
    this.showStyleList = false;
    this.widthSelectShow = false;
    this.opacitySelectShow = false;
  }


 // 点击线类型lineType选择框
  openLineTypeSelect() {
    this.lineTypeSelectShow = !this.lineTypeSelectShow;
    // 如果样式框存在，点击空白除隐藏样式框
    if (this.lineTypeSelectShow) {
      document.onclick = (e) => {
        this.lineTypeSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    // 隐藏其他显示的弹框
    this.showStyleList = false;
    this.widthSelectShow = false;
    this.opacitySelectShow = false;
  }

  // 点击文本类型字体大小选择框
  openFontSizeSelect() {
    this.fontSizeSelectShow = !this.fontSizeSelectShow;
    if (this.fontSizeSelectShow) {
      document.onclick = (e) => {
        this.fontSizeSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    // 隐藏其他显示的弹框
    this.widthSelectShow = false;
    this.lineHeightSelectShow = false;
  }

  // 点击文本类型行高选择框
  openLineHeightSelect() {
    this.lineHeightSelectShow = !this.lineHeightSelectShow;
    if (this.lineHeightSelectShow) {
      document.onclick = (e) => {
        this.lineHeightSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }

    // 隐藏其他显示的弹框
    this.widthSelectShow = false;
    this.fontSizeSelectShow = false;
  }

  openFillPatternSelect() {
    this.fillPatternSelectShow = !this.fillPatternSelectShow;
    if (this.fillPatternSelectShow) {
      document.onclick = (e) => {
        this.fillPatternSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }

    // 隐藏其他显示的弹框
    this.opacitySelectShow = false;
    this.widthSelectShow = false;
  }

  // 打开挂件-边框宽度选择框
  openImageBorderWidthSelect() {
    this.imageBorderWidthSelectShow = !this.imageBorderWidthSelectShow;
    if (this.imageBorderWidthSelectShow) {
      document.onclick = (e) => {
        this.imageBorderWidthSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    this.imageRaiudsSelectShow = false;
    this.imageWidthSelectShow = false;
    this.imageHeightSelectShow = false;
    this.imageBoxShadowShow = false;
  }

  // 打开挂件-边框宽度选择框
  openImageRadiusSelect() {
    this.imageRaiudsSelectShow = !this.imageRaiudsSelectShow;
    if (this.imageRaiudsSelectShow) {
      document.onclick = (e) => {
        this.imageRaiudsSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    this.imageBorderWidthSelectShow = false;
    this.imageWidthSelectShow = false;
    this.imageHeightSelectShow = false;
    this.imageBoxShadowShow = false;
  }

  // 打开挂件-宽度选择框
  openImageWidthSelect() {
    this.imageWidthSelectShow = !this.imageWidthSelectShow;
    if (this.imageWidthSelectShow) {
      document.onclick = (e) => {
        this.imageWidthSelectShow = false;
        this.borderWidthInput = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    this.imageBorderWidthSelectShow = false;
    this.imageRaiudsSelectShow = false;
    this.imageHeightSelectShow = false;
    this.imageBoxShadowShow = false;
  }

  // 打开挂件-高度选择框
  openImageHeightSelect() {
    this.imageHeightSelectShow = !this.imageHeightSelectShow;
    if (this.imageHeightSelectShow) {
      document.onclick = (e) => {
        this.imageHeightSelectShow = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    this.imageBorderWidthSelectShow = false;
    this.imageRaiudsSelectShow = false;
    this.imageWidthSelectShow = false;
    this.imageBoxShadowShow = false;
  }

  // 打开挂件-阴影框
  openImageBoxShadowShow(item: any) {
    this.imageBoxShadowShow = !this.imageBoxShadowShow;
    if (this.imageBoxShadowShow) {
      document.onclick = (e) => {
        if (e.target['parentNode'].className === 'offset-wrap' || e.target['parentNode'].className === 'list-wrap' || e.target['parentNode'].className === '' ||  e.target['parentNode'].className === 'color-saturation') {
          return;
        } else {
          this.imageBoxShadowShow = false;
          document.onclick = null;
        }
      };
    } else {
      document.onclick = null;
    }
    this.imageBorderWidthSelectShow = false;
    this.imageRaiudsSelectShow = false;
    this.imageWidthSelectShow = false;
    this.imageHeightSelectShow = false;
    const arr = item.value.split('px');
    arr.forEach((v: any, index: any) => {
      arr[index] = v.replace(/\s+/, '');
    });
    this.imageOffset = arr;
  }


  // 选择模板库样式
  openStyle(modeType: any) {
    this.showStyleList = !this.showStyleList;
    // 如果样式框存在，点击空白除隐藏样式框
    if (this.showStyleList) {
      document.onclick = (e) => {
        this.showStyleList = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }

    // 隐藏其他显示的弹框
    this.widthSelectShow = false;
    this.borderWidthSelectShow = false;
    this.opacitySelectShow = false;
  }
  // 打开图标库弹框
  openSymbolModal(event: any) {
    this.LegendCom.selectClick(event, 0);
  }
  // 样式管理弹框
  styleManage(mode_type: any) {
    const styleList = [];
    this.styleList.forEach((item: any) => {
      styleList.push(item);
    });
    const modalRef = this.modalService.open(PlotModalComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-plot'});
    modalRef.componentInstance.type = 'manage-style';
    modalRef.componentInstance.keyConfig = {
      title: '样式管理'
    };
    modalRef.componentInstance.modalData = {
      styleList: styleList,
      modeType: mode_type
    };
  }

  // 新建样式
  createStyle(mode_type: string) {
    const styleList = [];
    this.styleList.forEach((item: any) => {
      styleList.push(item);
    });
    const modalRef = this.modalService.open(CreateStyleModalComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-createStyePopule'});
    modalRef.componentInstance.type = 'create-style';
    modalRef.componentInstance.keyConfig = {
      title: '新建样式'
    };
    modalRef.componentInstance.modalData = {
      styleList: styleList,
      modeType: mode_type
    };
  }


  // 选择模板样式
  chooseStyle(item: any, index: any) {
    // 将用户使用的样式放到最前面位置
    if (index) {
      let arr, oindex;
      this.recentUse[item.geo_type + '_list'].forEach((v: any, i: any) => {
        if (v.plot_template_style_id === item.plot_template_style_id) {
          arr = v;
          oindex = i;
          return false;
        }
      });
      if (arr) { // 如果用户在模板框中选择的样式已存在最近使用的样式中，则将该样式放到最前面
        if (oindex !== 0) {
          const itemObj = {};
          const itemStyle = {};
          const newArr = this.recentUse[item.geo_type + '_list'].splice(oindex, 1);
          this.recentUse[item.geo_type + '_list'].unshift(newArr[0]);
          for (const key of Object.keys(item)) {
            itemObj[key] = item[key];
          }
          for (const key of Object.keys(item.style)) { // 将style样式单独提取出来，否则会产生耦合问题
            itemStyle[key] = item.style[key];
          }
          this.recentUse[item.geo_type + '_item'] = itemObj;
          this.recentUse[item.geo_type + '_item'].style = itemStyle;
        }
      } else { // 否则删除最后一个使用的样式，将用户选择的样式放在最前面
        const itemObj = {};
        const itemStyle = {};
        this.recentUse[item.geo_type + '_list'].unshift(item);
        this.recentUse[item.geo_type + '_list'].pop();
        for (const key of Object.keys(item)) {
          itemObj[key] = item[key];
        }
        for (const key of Object.keys(item.style)) { // 将style样式单独提取出来，否则会产生耦合问题
          itemStyle[key] = item.style[key];
        }
        this.recentUse[item.geo_type + '_item'] = itemObj;
        this.recentUse[item.geo_type + '_item'].style = itemStyle;
      }

      this.itemIndex = index;
    } else {
      const itemStyle = {};
      for (const key of Object.keys(item.style)) { // 将style样式单独提取出来，否则会产生耦合问题
        itemStyle[key] = item.style[key];
      }
      this.recentUse[item.geo_type + '_item'].style = itemStyle;
      this.styleList.forEach((styleItem: any, i: any) => {
        if (styleItem.plot_template_style_id === item.plot_template_style_id) {
          this.itemIndex = i;
          return false;
        }
      });
    }
    this.appService.onSelectStyleEmitter.emit({plot_template_style_id: item.plot_template_style_id, type: this.isUpdateStyle, style: item.style});

    // 展示具体样式组件
    this.showStyle(item);
    this.sendChooseStyle.emit(item);
  }

  // 显示具体样式新
  showStyle(item: any) {
    if (item.style['backgroundSize']) {
      const size = item.style['backgroundSize'].split(' ');
      this.backWidth = size[0];
      this.backHeight = size[1];
    }
    let obj;
    this.httpService.getFile('config/plotStyle.json').subscribe(
      (data: any) => {
        data.styles.forEach((v: any) => {
          if (v.type === item.geo_type) {
            v.properties.forEach((prop: any) => {
              for (const key in item.style) {
                if (prop.name === key) {
                  prop['value'] = item.style[key];
                }
              }
            });
            obj = v.properties;
          }
        });
        this.plotStyleArray = obj;
      });
    /**
     * 获取点击的挂件图片实例
     * */
    this.waterMark = item.waterMark;
  }

  /*--  样式信息选择-开始  --*/

  // color-颜色选择
  chooseColor(item: any) {
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
  }

  // borderColor - 边框颜色选择
  chooseBorderColor(item: any) {
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
  }

  // width - 选择宽度
  chooseWidth(item: any, event: any, inputChange: boolean) {
    if (item.name === 'icon-size' && this.iconImage) {
      this.plotStyleArray[0].value = this.iconImage;
      this.iconImage = null;
    }
    if (inputChange) {
      const value = Number(item.value.replace(/\D/g, ''));
      item.value = value > 0 && value <= 20 ? value : 1 ;
    } else {
      item.value = Number(event.target.innerText);
    }
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    if (this.drawType !== 'draw_symbol') {
      this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
    }
  }

  // 文字-最大宽度
  chooseMaxWidth(item: any, event: any, inputChange: boolean) {
    if (inputChange) {
      const value = Number(item.value.replace(/\D/g, ''));
      item.value = value >= 1 && value <= 300 ? value : 10;
    } else {
      item.value = Number(event.target.innerText);
    }
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    if (this.drawType !== 'draw_symbol') {
      this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
    }
  }

  // borderWidth- 选择边框宽度
  chooseBorderWidth(item: any, event: any, inputChange: boolean) {
    if (inputChange) {
      const value = Number(item.value.replace(/\D/g, ''));
      item.value = value <= 10 ? value : 1 ;
    } else {
      item.value = Number(event.target.innerText);
    }
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    if (this.drawType !== 'draw_symbol') {
      this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
    }
  }



  // opacity - 选择透明度
  chooseOpacity(item: any, event: any, inputChange: boolean) {
    if (inputChange) {
      const value = Number(item.value.replace(/[^\d\.]/g, ''));
      item.value = value <= 1 && value >= 0 ? value : 1 ;
    } else {
      item.value = Number(event.target.innerText);
    }
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    if (this.drawType === 'draw_symbol') {
      this.recentUse[this.drawType + '_item']['opacity'] = item.value;
    } else {
      this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
    }
  }

  // 选择字体大小
  chooseFontSize(item: any, event: any, inputChange: boolean) {
    if (inputChange) {
      const value = Number(item.value.replace(/\D/, ''));
      item.value = value <= 40 && value >= 12 ? value : 12 ;
    } else {
      item.value = Number(event.target.innerText);
    }
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
  }

  // 选择行高
  chooseLineHeight(item: any, event: any, inputChange: boolean) {
    if (item.name === 'icon-size' && this.iconImage) {
      this.plotStyleArray[0].value = this.iconImage;
      this.iconImage = null;
    }
    if (inputChange) {
      const value = Number(item.value.replace(/[^\d\.]/g, ''));
      item.value = value <= 2 && value >= 1 ? value : 1 ;
    } else {
      item.value = Number(event.target.innerText);
    }
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    if (this.drawType !== 'draw_symbol') {
      this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
    }
  }

  // 选择填充图案
  chooseFillPattern(v: any, item: any) {
    v.value = item.iconId;
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][v.name] = v.value;
  }

  // lineType - 选择线类型
  chooseLineType(item: any, index: any) {
    this.lineTypeIndex = index;
    if (index === 0) { // 实线
      item.value = 0;
    } else { // 虚线
      item.value = 1;
    }
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
  }

  // 挂件-图片 选择边框宽度
  chooseImageBorderWidth(item: any, event: any, inputChange: any) {
    if (inputChange) {
      const value = Number(event.target.value.replace(/[^\d]/g, ''));
      item.value = value >= 0 && value <= 10 ? value + 'px' : '1px';
    } else {
      item.value =  event.target.innerText + 'px';
    }
    const style = this.tranformStyle(this.plotStyleArray);
    const re = /px/;
    style['height'] = re.test(style['height']) ? style['height'] : style['height'] + 'px';
    style['width'] = re.test(style['width']) ? style['width'] : style['width'] + 'px';
    style['backgroundSize'] = style['width'] + ' ' + style['height'];
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
  }


  // 挂件-图片 选择宽度
  chooseImageWidth(item: any, event: any, inputChange: any) {
    if (inputChange) {
      const value = Number(event.target.value.replace(/[^\d]/g, ''));
      item.value =  value >= 20 && value <= 200 ? value + 'px' : '20px';
    } else {
      item.value =  event.target.innerText + 'px';
    }
    this.backWidth = item.value;
    const style = this.tranformStyle(this.plotStyleArray);
    const re = /px/;
    style['height'] = re.test(style['height']) ? style['height'] : style['height'] + 'px';
    style['borderWidth'] = re.test(style['borderWidth']) ? style['borderWidth'] : style['borderWidth'] + 'px';
    style['backgroundSize'] = item.value + ' ' + style['height'];
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
  }

  // 挂件-图片 选择高度
  chooseImageHeight(item: any, event: any, inputChange: any) {
    if (inputChange) {
      const value = Number(event.target.value.replace(/[^\d]/g, ''));
      item.value =  value >= 20 && value <= 200 ? value + 'px' : '20px';
    } else {
      item.value =  event.target.innerText + 'px';
    }
    this.backHeight = item.value;
    const style = this.tranformStyle(this.plotStyleArray);
    const re = /px/;
    style['width'] = re.test(style['width']) ? style['width'] : style['width'] + 'px';
    style['borderWidth'] = re.test(style['borderWidth']) ? style['borderWidth'] : style['borderWidth'] + 'px';
    style['backgroundSize'] = style['width'] + ' ' + item.value;
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
  }

  // 挂件-图片 选择圆角
  chooseImageRadius(item: any, event: any, inputChange: any) {
    if (inputChange) {
      const value = Number(item.value.replace(/[^\d]/g, ''));
      item.value = value >= 0 && value <= 100 ? value + '%' : '10%';
    } else {
      item.value =  event.target.innerText;
    }
    const style = this.tranformStyle(this.plotStyleArray);
    const re = /px/;
    style['height'] = re.test(style['height']) ? style['height'] : style['height'] + 'px';
    style['width'] = re.test(style['width']) ? style['width'] : style['width'] + 'px';
    style['backgroundSize'] = style['width'] + ' ' + style['height'];
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
  }

  // 挂件 -图片 阴影
  offsetChange(item: any, event: any, type: any) {
    switch (type) {
      case 'x':
        item.value = event.target.value + 'px ' + this.imageOffset[1] + 'px ' + this.imageOffset[2] + 'px ' + this.imageOffset[3];
        break;
      case 'y':
        item.value = this.imageOffset[0] + 'px ' + event.target.value + 'px ' + this.imageOffset[2] + 'px ' + this.imageOffset[3];
        break;
      case 'z':
        item.value = this.imageOffset[0] + 'px ' + this.imageOffset[1] + 'px ' + event.target.value + 'px ' + this.imageOffset[3];
        break;
      case 'c':
        item.value = this.imageOffset[0] + 'px ' + this.imageOffset[1] + 'px ' + this.imageOffset[2] + 'px ' + this.imageOffset[3];
        break;
    }

    const style = this.tranformStyle(this.plotStyleArray);
    const re = /px/;
    style['height'] = re.test(style['height']) ? style['height'] : style['height'] + 'px';
    style['width'] = re.test(style['width']) ? style['width'] : style['width'] + 'px';
    style['backgroundSize'] = style['width'] + ' ' + style['height'];
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
  }

  // fontBold - 字体加粗
  setTextBold(item: any) {
    if (item.value === 1) {
      item.value = 0;
    } else {
      item.value = 1;
    }
    const style = this.tranformStyle(this.plotStyleArray);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
    this.recentUse[this.drawType + '_item']['style'][item.name] = item.value;
  }

  // 选择图标
  chooseSymbol(event: any, index: number) {
    let selectedSymbol;
    if (event.length) {
      selectedSymbol = event[0];
    } else {
      selectedSymbol = event;
    }

    if (this.iconImage !== selectedSymbol.iconId) {
      const obj = JSON.parse(JSON.stringify(selectedSymbol));
      let repeatSymbol = false;
      if (index) {
        this.recentUse.draw_symbol.splice(index, 1);
        this.recentUse.draw_symbol.unshift(obj);
      } else {
        this.recentUse.draw_symbol.forEach((v: any, i: any) => {
          if (v.iconId === selectedSymbol.iconId) {
            const sym = JSON.parse(JSON.stringify(v));
            this.recentUse.draw_symbol.splice(i, 1);
            this.recentUse.draw_symbol.unshift(sym);
            repeatSymbol = true;
          }
        });
        if (!repeatSymbol) {
          this.recentUse.draw_symbol.pop();
          this.recentUse.draw_symbol.unshift(selectedSymbol);
        }
      }
      this.recentUse.draw_symbol_item = selectedSymbol;
      this.iconImage = selectedSymbol.iconId;
      const style = {
        'icon-image': this.iconImage,
        'icon-size': 1,
        'icon-opacity': 1,
        'positionx': selectedSymbol['positionx'],
        'positiony': selectedSymbol['positiony'],
        'iconSprite_width': selectedSymbol['iconSprite_width'],
        'sprite': selectedSymbol['sprite'],
      };
      this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
      this.sendChooseStyle.emit(style);
    }
  }


  tranformStyle(arr: any) {
    const obj = {};
    arr.forEach((v: any) => {
      obj[v.name] = v.value;
    });
    return obj;
  }

  // 将px去掉
  transformValue(value: any) {
    if (typeof value === 'string') {
      return value.replace('px', '');
    } else {
      return value;
    }
  }

  // 挂件-显示边宽输入框
  showBorderWidthInput() {
    this.borderWidthInput = true;
    setTimeout(() => {
      this.elementRef.nativeElement.querySelector('#borderWidthInput').focus();
    }, 300);
  }

  // 挂件-显示宽度输入框
  showWidthInput() {
    this.widthInput = true;
    setTimeout(() => {
      this.elementRef.nativeElement.querySelector('#widthInput').focus();
    }, 300);
  }

  // 挂件-显示高度输入框
  showHeightInput() {
    this.heightInput = true;
    setTimeout(() => {
      this.elementRef.nativeElement.querySelector('#heightInput').focus();
    }, 300);
  }

  // 挂件-显示透明度输入框
  showRadiusInput() {
    this.radiusInput = true;
    setTimeout(() => {
      this.elementRef.nativeElement.querySelector('#radiusInput').focus();
    }, 300);
  }

  /*--  样式信息选择-结束 --*/

  // 挂件图片-隐藏挂件输入框
  hideInput() {
    this.borderWidthInput = false;
    this.widthInput = false;
    this.heightInput = false;
    this.radiusInput = false;
  }

  // 挂件图片-禁止挂件图片拖动
  lockPendantImage() {
    this.waterMark.disableDragging();
  }

  // 挂件图片-禁止挂件图片拖动
  unlockPendantImage() {
    this.waterMark.enableDragging();
  }

  // 挂件图片-删除挂件图片
  deletePendantImage() {
    this.plotEditChange.emit({
      type: 'removeMark'
    });
  }

  // 挂件图片-设置图片位置
  setPenImgPtn() {

  }

  // 挂件图片-置顶
  setPendantImageTop() {

  }

  // 挂件图片-置底
  setPendantImageBottom() {

  }

  onSelectChange(a: any, b: any) {

  }

  // 挂件图片- 显示位置下拉框
  showPositionSelect() {
    this.positionData.showDrop = !this.positionData.showDrop;
    if (this.positionData.showDrop) {
      document.onclick = (e) => {
        this.positionData.showDrop = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    this.setTopBottom.showDrop = false;
  }

  // 挂件图片- 选择图片位置
  choosePosition(type: any, drawType: any) {
    const style = this.tranformStyle(this.plotStyleArray);
    const re = /px/;
    if (drawType === 'draw_pendant_image') {
      style['height'] = re.test(style['height']) ? style['height'] : style['height'] + 'px';
      style['width'] = re.test(style['width']) ? style['width'] : style['width'] + 'px';
      style['backgroundSize'] = style['width'] + ' ' + style['height'];
    }
    if (type === 'topLeft') {
      this.waterMark.setReferencePoint('topLeft');
    } else if (type === 'topRight') {
      this.waterMark.setReferencePoint('topRight');
    } else if (type === 'bottomLeft') {
      this.waterMark.setReferencePoint('bottomLeft');
    } else if (type === 'bottomRight') {
      this.waterMark.setReferencePoint('bottomRight');
    }
    this.changeReference(this.waterMark, this.map);
    this.appService.onSelectStyleEmitter.emit({type: this.isUpdateStyle, style: style});
  }

  /**
   * 选则参考坐标系是更换偏移类型和值
   * */
  changeReference (marker, map) {
    const marker_feature = marker.getProperty();
    const new_point = {
      x: marker_feature.geometry.coordinates[0],
      y: marker_feature.geometry.coordinates[1]
    };
    const referencePoint = marker.getReferencePoint();
    let position = {};
    const canvasRect = map.getCanvas().getBoundingClientRect();
    const markerRect = marker._element.getBoundingClientRect();
    if (referencePoint === 'topLeft') {
      position = {
        'top': new_point.y,
        'left': new_point.x
      };
    } else if (referencePoint === 'topRight') {
      new_point.x = canvasRect.width - new_point.x - markerRect.width;
      position = {
        'top': new_point.y,
        'right': new_point.x
      };
    } else if (referencePoint === 'bottomLeft') {
      new_point.y = canvasRect.height - new_point.y - markerRect.height;
      position = {
        'bottom': new_point.y,
        'left': new_point.x
      };
    } else if (referencePoint === 'bottomRight') {
      new_point.y = canvasRect.height - new_point.y - markerRect.height;
      new_point.x = canvasRect.width - new_point.x - markerRect.width;
      position = {
        'bottom': new_point.y,
        'right': new_point.x
      };
    }
    marker_feature.properties.content.position = position;
    marker_feature.properties.content.reference = referencePoint;
    marker.setPosition({top: 'auto', left: 'auto'});
    for (const i in marker_feature.properties.content.position) {
      marker_feature.properties.content.position[i] = 10;
    }
    marker.setPosition(marker_feature.properties.content.position);
    marker.setProperty(marker_feature);
  }

  // 挂件图片- 显示下拉框
  showTopBottom() {
    /*this.setTopBottom.showDrop = !this.setTopBottom.showDrop;
    if (this.setTopBottom.showDrop) {
      document.onclick = (e) => {
        this.setTopBottom.showDrop = false;
        document.onclick = null;
      };
    } else {
      document.onclick = null;
    }
    this.positionData.showDrop = false;*/
    this.plotEditChange.emit({
      type: 'topShow'
    });
  }

  // 挂件图片- 设置图片置顶置底
  chooseTopBottom(type: any) {
    console.log(type);
  }

}
