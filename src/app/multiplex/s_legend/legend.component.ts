import {Component, OnInit,  OnDestroy,  OnChanges,  QueryList,  ElementRef,  Input,  Output,  ViewChild,  HostListener,  ViewChildren,  EventEmitter,  forwardRef} from '@angular/core';
import {HttpService} from '../../s-service/http.service';
import {AppService} from '../../s-service/app.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {LocalStorage, DataStorage} from '../../s-service/local.storage';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LegendComponent),
    multi: true
  }]
})
export class LegendComponent implements OnInit, OnDestroy, OnChanges {
  @Input() layer: any;
  @Input() iconids;
  @Input() BooleanColseHtml: any; /* 是否显示输入框 添加 删除按钮 */
  @Input() BooleanInput: any;
  @Input() BooleanDelete: any;
  @Input() legend: any;
  @Input() name: any;
  @Input() programJson: any;
  @Input() staIcondata: any;
  @Input() isStaIconData: any;
  @Input() BottomisHRow: any;
  @Input() GobalkData: any;
  @Input() FiconIndex: any;
  @Input() iconJson: any;
  @Input() mapObj: any;
  @Input() Tagtyle: any; /* 标记样式需要改变的类型 */
  @Input() Tagtylemore: any;
  @Input() FilGFillIcon: any;
  @Input() isPlotStyleCom: any; // 引入标绘属性
  @Input() plotFormat: any;
  @Input() style_url: any; // 统计专题 图标符号图 style
  @Input() otherValue: any; // 其他图标
  @Output() iconidsChange = new EventEmitter();
  @Output() otherIconData = new EventEmitter();
  @Output() setIconData = new EventEmitter();
  @Output() getFillData = new EventEmitter();
  @Output() circlestyleChange = new EventEmitter();
  iconLibraryStatus = false;
  splite: any;
  iconData = [];
  chooseIndex: any;
  sprite: any;
  /* // 图片路径 */
  iconChange: any;
  isCollapsed = true;
  isShow: boolean;
  isShowCheck: boolean;
  iconPosition: any;
  iconClass: any = [];
  iconList: any;
  iconIndex: any;
  positionx: any = [];
  positiony: any = [];
  iconDataIndex: any;
  iconId: any;
  iconIdarrLength: any;
  private innerValue: any = '';
  iconWarnBoolean = false;  /* 提示框状态 */
  sprite2_height: any;
  isTrue: any;
  isStaboolean = true;
  isStaLegend = false;
  legendshow = true;
  imgSizeW: any;
  imgSizeH: any;
  iconFormat: any; /* 图标缩放大小 */
  bottom_ishave: any;
  iconselfType = 'icon';
  iconSize: any;
  iconLibrary: any = []; /* 保存图标各个类别 */
  nameLibrary: any = [];
  spriteTool: any;
  chooseSpriteIndex: any;
  user_url: any = [];
  user_urls: any = []; // 只保存url
  isPlotStyleComBoolean: any; // 标绘地图
  value_test: any = false;
  sprite_icon: any = [];
  spriteTools: any;
  sprite_name: any;
  isrequest = false;
  file_url: any = [];
  constructor(private toastService: ToastService,
              private httpService: HttpService,
              private mapEditorService: AppService,
              private httpClient: HttpClient,
              private elementRef: ElementRef,
              private ls: LocalStorage,
              private ds: DataStorage) {
  }

  ngOnInit() {
    this.user_url[0] = {
      url: '/handler/sprite/sprite2@2x',
      url_id: '系统'
    };
    this.user_urls[0] = '/handler/sprite/sprite2@2x';
    this.user_url[1] = {
      url: '/handler/sprite/' + this.ls.get('userId'),
      url_id: '专属'
    };
    this.user_urls[1] = '/handler/sprite/' + this.ls.get('userId');

    // 地图 图标显示
    if (this.mapObj) {
      for (let k = 1; k < this.user_urls.length; k++) {
        this.mapObj.style.addSprite(this.user_urls[k], (err) => {
          if (err) {
            console.log(err);
          } else {
            // console.log('sprite成功!');
          }
        });
      }
    }
    /*  this.mapObj.style.addSprite("http://dev.smartmapx.com/handler/sprite/sprite", (err) => {
             if (err)
                 console.log(err);
             else
                 console.log("sprite成功");
          }) */
    // 标绘模块属性控制
    if ( this.isPlotStyleCom ) {
      this.isPlotStyleComBoolean = false;
    } else {
      this.isPlotStyleComBoolean = true;
    }
    /* 图标选择框样式判断 */
    if (this.Tagtyle) {
      this.iconselfType = this.Tagtyle;
    }
    if (this.Tagtylemore) {
      this.iconselfType = this.Tagtylemore;
    }
    if (this.plotFormat === 'plot' ) {
      this.iconselfType = 'plot';
    }
    /* 根据调用父组件确定 图标的缩放大小 */
    if (this.iconselfType === 'icon' || this.iconselfType === 'staicon') {
      this.iconFormat = 30;
    } else if (this.iconselfType === 'firstLayer') {
      this.iconFormat = 25;
    } else if (this.iconselfType === 'morefirst') {
      this.iconFormat = 25;
    } else if ( this.iconselfType === 'plot' ) {
      this.iconFormat = 16;
    }


    // 初始图标设置
    const obj = {
      iconId: '',
      isClick: false,
      iconInputValue: '',
      position: '',
      sprite: '',
      sprite_nameId: '',
      iconSprite_hight: '',
      iconSprite_width: '',
      iconSprite_contrast_width: 1,
      iconSprite_contrast_heigh: 1,
      chosclasIndex: '',
      url: ''
    };
    this.iconData[0] = obj;
    obj.iconInputValue = '图例' + (this.iconData.length);
    /* 小程序回显 */
    if (this.programJson && this.programJson[this.name].length > 0) {
      this.iconData = this.programJson[this.name];
      this.iconIdarrLength = this.iconData.length;
      for (const v of this.iconData) {
        const obj = {
          url: '',
          url_id: '引用'
        };
        if (this.user_urls.indexOf(v.url) === -1) {
          obj.url = v.url;
          this.user_url.push(obj);
          this.user_urls.push(obj.url);
        }
        this.positionx.push(v.position.x * v.iconSprite_contrast_width);
        this.positiony.push(v.position.y * v.iconSprite_contrast_heigh);
      }

    }

    /* 图标符号图回显 */
    if (this.isStaIconData === 'isStaLegend') {
      const sta_urls = [];
      for (const js of this.style_url.metadata.statistics.layer_info[3]) {
          if (sta_urls.indexOf(js[0].url) === -1) {
            sta_urls.push(js[0].url);
          }
          if (sta_urls.indexOf(this.style_url.metadata.statistics.otherValue[3][0].url) === -1) {
            sta_urls.push(this.style_url.metadata.statistics.otherValue[3][0].url);
          }
      }
      for (const url of sta_urls) {
        if (url !== '/handler/sprite/sprite2') {
          if (url !== undefined) {
            const objs = {
              url: '',
              url_id: '引用'
            };
            if (this.user_urls.indexOf(url) === -1) {
              objs.url = url;
              this.user_url.push(objs);
              this.user_urls.push(objs.url);
            }
          }
        }
      }
    }
    if (this.isStaIconData === 'isStaLegend') {
      if (this.staIcondata && this.staIcondata.length > 0) {
        this.iconData[0].sprite = this.staIcondata[0].staSprite;
        this.iconData[0].iconSprite_hight = this.staIcondata[0].icon_hight * this.staIcondata[0].Sta_heightcon;
        this.iconData[0].iconSprite_width = this.staIcondata[0].icon_width * this.staIcondata[0].Sta_widthcon;
        this.iconData[0].positionx = this.staIcondata[0].stapositionx * this.staIcondata[0].Sta_widthcon;
        this.iconData[0].positiony = this.staIcondata[0].stapositiony * this.staIcondata[0].Sta_heightcon;

      }
    }


    if (this.isStaIconData === 'isStaLegend') {
      this.isStaLegend = true;
      this.legendshow = false;
      this.iconselfType = 'staicon';
    }


    /* 是否有下边距 */
    if (this.BottomisHRow) {
      this.bottom_ishave = false;
    } else {
      this.bottom_ishave = true;
    }


    /* 图层编辑-图案图标回显 */ // 图标符号库完成
    if (this.FilGFillIcon === 'isFill_GFill') {
      const isFill_url = [];
      if (this.iconJson.metadata.sprite && this.iconJson.metadata.sprite.length > 0) {
        for (const js of this.iconJson.metadata.sprite) {
          if (js.url !== '/handler/sprite/sprite2' && js.url !== '' ) {
            if (isFill_url.indexOf(js.url) === -1) {
              isFill_url.push(js.url);
            }
          }
        }
        for (const v of isFill_url) {
          const objs = {
            url: '',
            url_id: '引用'
          };
          if (this.user_urls.indexOf(v) === -1) {
            objs.url = v;
            this.user_url.push(objs);
            this.user_urls.push(objs.url);
          }
        }
      }
      if (this.iconJson && this.iconJson.metadata.sprite && this.iconJson.metadata.sprite[this.FiconIndex]) {
        this.iconData[0].sprite = this.iconJson.metadata.sprite[this.FiconIndex].sprite;
        this.iconData[0].iconSprite_hight = this.iconJson.metadata.sprite[this.FiconIndex].iconSprite_hight;
        this.iconData[0].iconSprite_width = this.iconJson.metadata.sprite[this.FiconIndex].iconSprite_width;
        this.iconData[0].positionx = this.iconJson.metadata.sprite[this.FiconIndex].positionx;
        this.iconData[0].positiony = this.iconJson.metadata.sprite[this.FiconIndex].positiony;
      } else {
        const obj = {
          iconId: '',
          isClick: false,
          iconInputValue: '',
          position: '',
          sprite: '',
          sprite_nameId: '',
          iconSprite_hight: '',
          iconSprite_width: '',
          iconSprite_contrast_width: 1,
          iconSprite_contrast_heigh: 1,
          chosclasIndex: '',
          url: ''
        };
        this.iconData[0] = obj;
      }
    }
     // 地图 图标显示
     if (this.mapObj) {
      for (let k = 1; k < this.user_urls.length; k++) {
        this.mapObj.style.addSprite(this.user_urls[k], (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('sprite成功!');
          }
        });
      }
    }
    // 请求获取图标信息
    if (!this.isrequest) {
      this.getIconSpriteLibrary(0, this.user_url, this.getIncon.bind(this));
    }

  }

  ngOnChanges() {
    if (this.FilGFillIcon === 'isFill_GFill') {
      let isHaves = false;
      const obj = {
        iconId: '',
        isClick: false,
        iconInputValue: '',
        position: '',
        sprite: '',
        sprite_nameId: '',
        iconSprite_hight: '',
        iconSprite_width: '',
        iconSprite_contrast_width: 1,
        iconSprite_contrast_heigh: 1,
        chosclasIndex: '',
        url: ''
      };
      if (this.iconJson && this.iconJson.metadata.sprite && this.iconJson.metadata.sprite[this.FiconIndex]) {
        this.iconData[0] = obj;
        this.iconData[0].sprite = this.iconJson.metadata.sprite[this.FiconIndex].sprite;
        this.iconData[0].iconSprite_hight = this.iconJson.metadata.sprite[this.FiconIndex].iconSprite_hight;
        this.iconData[0].iconSprite_width = this.iconJson.metadata.sprite[this.FiconIndex].iconSprite_width;
        this.iconData[0].positionx = this.iconJson.metadata.sprite[this.FiconIndex].positionx;
        this.iconData[0].positiony = this.iconJson.metadata.sprite[this.FiconIndex].positiony;
        isHaves = true;
      } else {
        this.iconData[0] = obj;
      }
    // 在进行图层编辑 切换图层的时候 加载不同的图标
    if (isHaves) {
      this.file_url = [];
      this.file_url[0] = {
        url: '/handler/sprite/sprite2@2x',
        url_id: '系统'
      };
      this.file_url[1] = {
        url: '/handler/sprite/' + this.ls.get('userId'),
        url_id: '专属'
      };
      for (const v of this.iconJson.metadata.sprite) {
        if (v.url !== '/handler/sprite/sprite2' && v.url !== '' && v.url !== this.file_url[1].url) {
          const objv = {
            url: '',
            url_id: '引用',
          };
          objv.url = v.url;
          this.file_url.push(objv);
        }
      }
      // 避免和初始化 重复加载图标
      this.isrequest = true;
      if (this.isrequest) {
        this.getIconSpriteLibrary(0, this.file_url, this.getIncon.bind(this));
      }
    }
    }
  }

  ngOnDestroy() {
  }

  get value(): any {
    return this.innerValue;
  }

  /*视图选择装饰器函数(对应模板`<div class='sketch-picker'>`)*/
  // @ViewChildren('sketch-picker') unclick: QueryList<ElementRef>;
  @ViewChildren('iconStyle') unclick: QueryList<ElementRef>;

  /*监听dom*/
  @HostListener('document:click', ['$event']) bodyClick(e) {
    if (this.isShow === true) {
      this.isCollapsed = false;
      this.isShow = false;
      this.isShowCheck = true;
      return;
    } else if (this.isShow === false && getTrigger(this.unclick, 'iconStyle')) {
      this.isCollapsed = true;
    }
    if (this.isShowCheck === false) {
      if (!getTrigger(this.unclick, 'iconStyle')) {
        this.isCollapsed = true;
      }
    }

    function getTrigger(queryList, className?) {
      let flag = true;
      (<HTMLElement[]>e.path).forEach(i => {
        flag && queryList.forEach(el => {
          i.isEqualNode && i.isEqualNode(el.nativeElement) && (flag = false);
        });
        flag && i.className && i.className.indexOf && i.className.indexOf(className) > -1 && (flag = false);
      });
      return flag;
    }
  }


  getIncon(event: any) {
    this.iconLibrary = event;
    // 对不同sprite处理
    for (let i = 0; i < this.iconLibrary.length; i++) {
      this.iconPosition = this.iconLibrary[i].splite;
      const arr = [];
      for (const j in this.iconPosition) {
        arr.push({
          id: j,
          position: this.iconPosition[j]
        });
      }
      this.iconClass[i] = arr;
    }
    // 图标面板在第一页
    this.chooseClass(0);
  }

  // 选择不同的图标汇总名称
  chooseClass(value: any) {
    // 选取图标时  找iconLibrary中的sprite的索引
    this.chooseSpriteIndex = value;
    // 给iconData的sprite填值 指定索引
    if (!this.iconDataIndex) {
      this.iconDataIndex = 0;
    }
    this.spriteTool = this.iconLibrary[value].sprite;
    this.sprite_name = this.iconLibrary[value].name_id;
    this.iconSize = this.getImageSize(this.iconLibrary[value].splite);
    this.chooseIndex = value;
    this.iconList = this.iconClass[value];
  }


  // 选择不同的图标汇总名称
  /* chooseClass(value: any) {
    this.chooseIndexl = value;
    this.iconList = this.iconClass[value];
  } */

  /* 选取图标*/
  selectIcon(iconClass: any, index: any) {
    // 根据选择的图标 判断sprite的值
    this.iconData[this.iconDataIndex].sprite = this.iconLibrary[this.chooseSpriteIndex].sprite;
    this.iconData[this.iconDataIndex].sprite_nameId = this.iconLibrary[this.chooseSpriteIndex].name_id;

    if (this.chooseIndex === 0) {
      this.iconData[this.iconDataIndex].url = '/handler/sprite/sprite2';
    } else {
      this.iconData[this.iconDataIndex].url = this.user_url[this.chooseIndex].url;
    }
    if (this.FilGFillIcon === 'isFill_GFill') {
      this.iconData[this.iconDataIndex].selfurl = '/handler/sprite/' + this.ls.get('userId');
    }

    this.iconData[this.iconDataIndex].iconSprite_hight = this.iconSize[1];
    this.iconData[this.iconDataIndex].iconSprite_width = this.iconSize[0];
    this.iconData[this.iconDataIndex].iconSprite_contrast_width = 1;
    this.iconData[this.iconDataIndex].iconSprite_contrast_heigh = 1;
    const icon_position_x = iconClass[index].position.x;
    const icon_position_y = iconClass[index].position.y;
    this.positionx.push(icon_position_x);
    this.positiony.push(icon_position_y);

    this.positionx[this.iconIndex] = iconClass[index].position.x;
    this.positiony[this.iconIndex] = iconClass[index].position.y;
    if (this.positionx.length > this.iconData.length) {
      this.positionx = this.positionx.splice(0, this.iconData.length);
      this.positiony = this.positiony.splice(0, this.iconData.length);
    }
    this.iconData[this.iconDataIndex].position = iconClass[index].position;


    this.iconData[this.iconDataIndex].iconId = iconClass[index].id;
    this.iconIdarrLength = this.iconData.length;

    /* 处理图不等传化比例问题 */
    /* 宽对比度 this.iconFormat */
    this.iconData[this.iconDataIndex].iconSprite_contrast_width = this.iconFormat / iconClass[index].position.width;
    /* 长对比度 */
    this.iconData[this.iconDataIndex].iconSprite_contrast_heigh = this.iconFormat / iconClass[index].position.height;
    /* 新的xy值 */
    this.iconData[this.iconDataIndex].positionx = this.iconData[this.iconDataIndex].position.x *
      this.iconData[this.iconDataIndex].iconSprite_contrast_width;
    this.iconData[this.iconDataIndex].positiony = this.iconData[this.iconDataIndex].position.y *
      this.iconData[this.iconDataIndex].iconSprite_contrast_heigh;
    /* 新的png的size */
    this.iconData[this.iconDataIndex].iconSprite_hight = this.iconData[this.iconDataIndex].iconSprite_hight *
      this.iconData[this.iconDataIndex].iconSprite_contrast_heigh;
    this.iconData[this.iconDataIndex].iconSprite_width = this.iconData[this.iconDataIndex].iconSprite_width *
      this.iconData[this.iconDataIndex].iconSprite_contrast_width;
    this.iconData[this.iconDataIndex].chosclasIndex = this.chooseIndex;
    // 把ID对象数组传给总组件
    this.iconidsChange.emit([this.name, this.iconData]);
    this.otherIconData.emit(this.iconData);
    this.setIconData.emit(this.iconData);
    this.getFillData.emit(this.iconData[0]);
    this.circlestyleChange.emit(this.iconData);
    this.positionx = [];
    this.isShowCheck = false;


  }

  // 取消选中的图标
  selectIcon_null() {
    const obj = {
      iconId: '',
      isClick: false,
      iconInputValue: '',
      position: '',
      sprite: '',
      sprite_nameId: '',
      iconSprite_hight: '',
      iconSprite_width: '',
      iconSprite_contrast_width: 1,
      iconSprite_contrast_heigh: 1,
      chosclasIndex: '',
      url:''
    };
    this.iconData[this.iconDataIndex] = obj;
    this.iconidsChange.emit([this.name, this.iconData]);
    this.otherIconData.emit(this.iconData);
    this.setIconData.emit(this.iconData);
    this.getFillData.emit(this.iconData[0]);
    // this.getFillData.emit('');
    this.circlestyleChange.emit(this.iconData);
    this.isShowCheck = false;
  }

  /* 失去Input框获取输入框的值 */
  dBclickLegend(index: any, value: any) {
    this.iconData[index].iconInputValue = value;
    this.iconidsChange.emit([this.name, this.iconData]);
  }

  dBclicklabLegend(index: any) {
    this.iconData[index].isClick = !this.iconData[index].isClick;
  }

  /*点击获取索引值*/
  selectClick(event: any, index: any) {
    this.iconDataIndex = index;
    if (!this.BooleanColseHtml && this.isStaIconData === 'isStaLegend') {
      if (this.staIcondata && this.staIcondata.length > 0) {
        this.chooseClass(this.staIcondata[0].chooseIndex);
      }
    } else {
      this.chooseClass(0);
    }
    this.isShow = true;


    const iconChange = this.elementRef.nativeElement.getElementsByClassName('iconStyle')[0];
    iconChange.style.position = 'fixed';

    if ( !this.isPlotStyleComBoolean ) {
      iconChange.style.top = ( event.clientY - event.offsetY + event.target.clientHeight + 20 ) + 'px'; // width = 182
      iconChange.style.left = ( event.clientX - event.offsetX + event.target.clientWidth - 100 ) + 'px';
    } else {
      iconChange.style.top = ( event.clientY - event.offsetY + event.target.clientHeight - 110 ) + 'px'; // width = 182
      iconChange.style.left = ( event.clientX - event.offsetX + event.target.clientWidth + 80 ) + 'px';
    }
/*
    iconChange.style.top = (event.clientY - event.offsetY + event.target.clientHeight - 110) + 'px'; // width = 182
    iconChange.style.left = (event.clientX - event.offsetX + event.target.clientWidth + 125) + 'px';
 */
    if (index !== undefined) {
      this.iconIndex = index;
    }
  }

  /*增加一行*/
  addIconParam() {
    const obj = {
      iconId: '',
      isClick: false,
      iconInputValue: '',
      position: '',
      sprite: '',
      sprite_nameId: '',
      iconSprite_hight: '',
      iconSprite_width: '',
      iconSprite_contrast_width: 1,
      iconSprite_contrast_heigh: 1,
      url: ''
    };
    obj.iconInputValue = '图例' + (this.iconData.length + 1);
    this.iconData.push(obj);
    this.iconIdarrLength = this.iconData.length;
    this.iconidsChange.emit([this.name, this.iconData]);
  }

  /*删除随意一行*/
  removeIconParam(i: any) {
    this.iconData.splice(i, 1);
    this.iconIdarrLength = this.iconData.length;
    this.iconidsChange.emit([this.name, this.iconData]);
  }

  /*获取sprite的宽高*/
  getImageSize(json) {
    let imageWidth = 0, imageHeight = 0;
    for (const name in json) {
      if (json.hasOwnProperty(name)) {
        const right = json[name].x + json[name].width;
        const bottom = json[name].y + json[name].height;
        if (right > imageWidth) {
          imageWidth = right;
        }
        if (bottom > imageHeight) {
          imageHeight = bottom;
        }
      }
    }
    return [imageWidth, imageHeight];
  }

  /* getIconLibrary(array: any, fn: Function) {
    const sprite = [];
    const spriteReal = [];
    for (let i = 0; i < array.length; i++) {
      this.httpService.getFile(array[i].url + '.json?t=' + new Date().getTime()).subscribe((data) => {
          this.sprite = array[i].url + '.png';
          this.splite = data;
          // 多图标保存
          const arr = {
            sprite: array[i].url + '.png',
            splite: data,
            name_id: array[i].url_id,
            index: i
          };
          sprite.push(arr);
          if (sprite.length === array.length) {
            if (sprite.indexOf([]) === -1) {
              for (let i in sprite) {
                spriteReal[sprite[i].index] = sprite[i];
              }
              this.getIncon(spriteReal);
            }
          }
        },
        error => {
          console.log(error);
          if (error.status === 404) {
            console.log(111);
          }
        }
      );
    }
  } */
  // sprite Json去重
  getUniqueSprite(spriteJson) {
    const hash = {};
    for (const name in spriteJson) {
        if (spriteJson.hasOwnProperty(name)) {
            const value = spriteJson[name];
            const key = value.x + '_' + value.y;
            if (!hash[key]) {
                hash[key] = name;
            }
        }
    }
    const result = {};
    for (const key in hash) {
        if (hash.hasOwnProperty(key)) {
            const name = hash[key];
            result[name] = spriteJson[name];
        }
    }
    return result;
}
  // 递归方法请求雪碧图
  getIconSpriteLibrary(index: any, array: any, fn: Function) {
    if (index === 0) {
      this.sprite_icon = [];
      this.iconLibrary = [];
    }
    console.log(this.sprite_icon);
    if (index < array.length) {
      this.httpService.getFile(array[index].url + '.json?t=' + new Date().getTime()).subscribe((data) => {
          data = this.getUniqueSprite(data);
          const arr = {
            sprite: array[index].url + '.png' + '?t=' + new Date().getTime(),
            splite: data,
            name_id: array[index].url_id,
            index: index
          };
          this.sprite_icon.push(arr);
          return this.getIconSpriteLibrary(index + 1, array, fn);
        },
        error => {
          return this.getIconSpriteLibrary(index + 1, array, fn);
        }
      );
    } else {
      this.getIncon(this.sprite_icon);
    }
  }


}
