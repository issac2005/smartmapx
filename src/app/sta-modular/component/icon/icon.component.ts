import { Component, OnInit, OnDestroy, OnChanges, ElementRef, Input, Output, ViewChild, EventEmitter, forwardRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../s-service/http.service';
import { AppService } from '../../../s-service/app.service';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {LocalStorage, DataStorage} from '../../../s-service/local.storage';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';
@Component({
    selector: 'sta-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit, OnChanges {
    sta_legend = 'isStaLegend';
    BooleanHtmlFalse = false;  /* 图例需要显示的HTML的boolean */
    BooleanInputfa = false;
    BooleanDeletefa = false;
    @Input() config: any;
    @Input() style: any;
    @Input() staType: any;
    @Input() splite: any;
    @Input() map: any;
    fieldType: any;
    isArray: any;
    field: any;
    nofield: any;
    heatype: any;
    sliders: any;
    interpolates: any;
    otherValueStatus = 'show';
    mapRender: any; /* 渲染类型 */
    iconsize: any;
    otherArray = [] ;
    otherValue = true;

    constructor(private toastService: ToastService,
        private httpService: HttpService,
        private httpClient: HttpClient,
        private mapEditorService: AppService,
        private elementRef: ElementRef,
        private appService: AppService,
        private ls: LocalStorage,
        private ds: DataStorage) {
    }
    ngOnInit() {
    }
    ngOnChanges() {
        this.isArray = Array.isArray(this.style.layout[this.config.attribute[0]]);
        if (this.isArray) {
            this.fieldType = 'text';
            this.style.isLegendType = 'text';
        } else {
            this.fieldType = 'number';
            this.style.isLegendType = 'number';
        }
        if (this.style.metadata.statistics.field) {
            this.field = this.style.metadata.statistics.field;
        }
    }
    /*   改变图标 */
    getIconData(event, index) {
        const obj = {
            staiconId: 1,
            stapositionx: 1,
            stapositiony: 1,
            Sta_heightcon: 1,
            Sta_widthcon: 1,
            chooseIndex: '',
            staSprite: '',
            url: '',
            icon_hight: 1,
            icon_width: 1
        };
        obj.staiconId = event[0].iconId;
        obj.stapositionx = event[0].position.x;
        obj.stapositiony = event[0].position.y;
        obj.Sta_heightcon = event[0].iconSprite_contrast_heigh;
        obj.Sta_widthcon = event[0].iconSprite_contrast_width;
        obj.chooseIndex = event[0].chosclasIndex;
        obj.staSprite = event[0].sprite;
        obj.url = event[0].url;
        this.style.metadata.sprite[index].url = event[0].url;
        obj.icon_hight = (event[0].iconSprite_hight /  event[0].iconSprite_contrast_heigh);
        obj.icon_width = (event[0].iconSprite_width / event[0].iconSprite_contrast_width);
        const arr = [];
        arr.push(obj);
        this.style.metadata.statistics.layer_info[3][index] = arr;
        this.style.metadata.statistics.layer_info[0][index][1] = this.style.metadata.statistics.layer_info[3][index][0].staiconId;
        if (this.fieldType === 'text') {
            this.style.layout[this.config.attribute[0]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
                this.style.metadata.statistics.layer_info[1][i][0] = this.style.metadata.statistics.layer_info[0][i][0];
                if (this.style.metadata.statistics.layer_info[2][i]) {
                    this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
                        .concat(this.style.metadata.statistics.layer_info[0][i]);
                }
            }
            this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
                .concat(this.style.metadata.statistics.otherValue[0]);
            this.style.layout[this.config.attribute[1]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
                if (this.style.metadata.statistics.layer_info[2][i]) {
                    this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                        .concat(this.style.metadata.statistics.layer_info[1][i]);
                }
            }
            this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                .concat(this.style.metadata.statistics.otherValue[1]);
        } else {
            if (this.style.metadata.statistics.layer_info[2][index]) {
                this.style.layout[this.config.attribute[0]].stops[index][1] =
                this.style.metadata.statistics.layer_info[3][index][0].staiconId;
            }
        }
    }
    /*  改变其他图标方法 */
    getIconDataOther(event) {
        const obj = {
            staiconId: 1,
            stapositionx: 1,
            stapositiony: 1,
            Sta_heightcon: 1,
            Sta_widthcon: 1,
            chooseIndex: '',
            staSprite: '',
            url: '',
            icon_hight: 1,
            icon_width: 1
        };
        obj.staiconId = event[0].iconId;
        obj.stapositionx = event[0].position.x;
        obj.stapositiony = event[0].position.y;
        obj.Sta_heightcon = event[0].iconSprite_contrast_heigh;
        obj.Sta_widthcon = event[0].iconSprite_contrast_width;
        obj.chooseIndex = event[0].chosclasIndex;
        obj.staSprite = event[0].sprite;
        obj.url = event[0].url;
        this.style.metadata.sprite[ this.style.metadata.sprite.length - 1 ].url = event[0].url;
        obj.icon_hight = (event[0].iconSprite_hight /  event[0].iconSprite_contrast_heigh);
        obj.icon_width = (event[0].iconSprite_width / event[0].iconSprite_contrast_width);
        const arr = [];
        arr.push(obj);
        this.style.metadata.statistics.otherValue[3] = arr;
        this.style.metadata.statistics.otherValue[0] = this.style.metadata.statistics.otherValue[3][0].staiconId;


        if (this.fieldType === 'text') {
            this.style.layout[this.config.attribute[0]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
                this.style.metadata.statistics.layer_info[1][i][0] = this.style.metadata.statistics.layer_info[0][i][0];
                if (this.style.metadata.statistics.layer_info[2][i]) {
                    this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
                        .concat(this.style.metadata.statistics.layer_info[0][i]);
                }
            }
            this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
                .concat(this.style.metadata.statistics.otherValue[0]);

            this.style.layout[this.config.attribute[1]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
                if (this.style.metadata.statistics.layer_info[2][i]) {
                    this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                        .concat(this.style.metadata.statistics.layer_info[1][i]);
                }
            }
            this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                .concat(this.style.metadata.statistics.otherValue[1]);


        } else {
            this.style.layout[this.config.attribute[0]].default = this.style.metadata.statistics.otherValue[3][0].staiconId;

        }
    }
    /* 改变其他图标大小 */
    otherIconChangeSize(value: any) {
        this.style.metadata.statistics.otherValue[1] = parseInt(value);
        if (this.fieldType === 'text') {
            this.style.layout[this.config.attribute[1]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
                this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                    .concat(this.style.metadata.statistics.layer_info[1][i]);
            }
            this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                .concat(this.style.metadata.statistics.otherValue[1]);

        } else {

            this.style.layout[this.config.attribute[1]].default = parseInt(value);
        }
    }
    /* 改变图标大小方法 */
    iconChangeSize(index: any, value: any) {
        this.style.metadata.statistics.layer_info[1][index][1] = parseInt(value);
        if (this.fieldType === 'text') {
            this.style.layout[this.config.attribute[0]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
                this.style.metadata.statistics.layer_info[1][i][0] = this.style.metadata.statistics.layer_info[0][i][0];
                if (this.style.metadata.statistics.layer_info[2][i]) {
                    this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
                        .concat(this.style.metadata.statistics.layer_info[0][i]);
                }
            }
            this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
                .concat(this.style.metadata.statistics.otherValue[0]);
            this.style.layout[this.config.attribute[1]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
                this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                    .concat(this.style.metadata.statistics.layer_info[1][i]);
            }
            this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                .concat(this.style.metadata.statistics.otherValue[1]);

        } else {
            /* 改变style.layout中icon-size */
            if (this.style.metadata.statistics.layer_info[2][index]) {
                this.style.layout[this.config.attribute[1]].stops[index][1] = parseInt(value);
            }
        }
    }
    /* 处理分段值 number*/
    fieldNumberChange(index: any) {
        this.style.metadata.statistics.layer_info[1][index][0] = this.style.metadata.statistics.layer_info[0][index][0];
        this.style.layout[this.config.attribute[0]].stops = [];
        this.style.layout[this.config.attribute[1]].stops = [];
        for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
            if (this.style.metadata.statistics.layer_info[2][i]) {
                this.style.layout[this.config.attribute[0]].stops.push(this.style.metadata.statistics.layer_info[0][i]);
            }
        }
        for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
            if (this.style.metadata.statistics.layer_info[2][i]) {
                this.style.layout[this.config.attribute[1]].stops.push(this.style.metadata.statistics.layer_info[1][i]);
            }
        }
    }
    /* 处理分段值 text*/
    fieldTextChange() {
        this.style.layout[this.config.attribute[0]] = ['match', ['to-string', ['get', this.field]]];
        for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
            this.style.metadata.statistics.layer_info[1][i][0] = this.style.metadata.statistics.layer_info[0][i][0];
            if (this.style.metadata.statistics.layer_info[2][i]) {
                this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
                    .concat(this.style.metadata.statistics.layer_info[0][i]);
            }
        }
        this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
            .concat(this.style.metadata.statistics.otherValue[0]);
        this.style.layout[this.config.attribute[1]] = ['match', ['to-string', ['get', this.field]]];
        for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
            if (this.style.metadata.statistics.layer_info[2][i]) {
                this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                    .concat(this.style.metadata.statistics.layer_info[1][i]);
            }
        }
        this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
            .concat(this.style.metadata.statistics.otherValue[1]);
    }
    /* 是否被checked方法 */
    checkbox(event: any, index: any) {
        this.style.metadata.statistics.layer_info[2][index] = event.target.checked;
        if (this.fieldType === 'number') {
            /* number function */
            this.legendCommon(index);
        } else {
            /*  text function */
            this.legendTextCommon(index);

        }
    }
    /* text 选中判定 */
    legendTextCommon(index: any) {
        this.style.layout[this.config.attribute[0]] = ['match', ['to-string', ['get', this.field]]];
        for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
            this.style.metadata.statistics.layer_info[1][i][0] = this.style.metadata.statistics.layer_info[0][i][0];
            if (this.style.metadata.statistics.layer_info[2][i]) {
                this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
                    .concat(this.style.metadata.statistics.layer_info[0][i]);
            }
        }
        this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
            .concat(this.style.metadata.statistics.otherValue[0]);

        this.style.layout[this.config.attribute[1]] = ['match', ['to-string', ['get', this.field]]];
        for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
            if (this.style.metadata.statistics.layer_info[2][i]) {
                this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                    .concat(this.style.metadata.statistics.layer_info[1][i]);
            }
        }
        this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
            .concat(this.style.metadata.statistics.otherValue[1]);

    }
    legendCommon(index: any) {
        this.style.metadata.statistics.layer_info[1][index][0] = this.style.metadata.statistics.layer_info[0][index][0];
        this.style.layout[this.config.attribute[0]].stops = [];
        this.style.layout[this.config.attribute[1]].stops = [];
        for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
            if (this.style.metadata.statistics.layer_info[2][i]) {
                this.style.layout[this.config.attribute[0]].stops.push(this.style.metadata.statistics.layer_info[0][i]);
            }
        }
        for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
            if (this.style.metadata.statistics.layer_info[2][i]) {
                this.style.layout[this.config.attribute[1]].stops.push(this.style.metadata.statistics.layer_info[1][i]);
            }
        }
    }
    /*  进入页面初始化json */
    setLegendValue(obj: any, arr: any) {
        // 给style的sprite中添加默认的包含url的对象
        this.style.metadata.sprite = [] ;
        const icon_url = {
            url : '/handler/sprite/sprite2'
        };
        for ( let k = 0 ; k < arr.length + 1 ; k++ ) {
            this.style.metadata.sprite.push(icon_url);
        }
        this.iconsize = this.getImageSize(this.splite);
        if (obj.renderType === 'exponential') {
            this.mapRender = 'interval';
        } else {
            this.mapRender = obj.renderType;
        }
        this.field = obj.field;
        // this.style.metadata.statistics.field = this.fields;
        this.fieldType = obj.type; /* 传过来的类型 数值number 字符 text */
        this.style.isLegendType = this.fieldType;
        this.style.metadata.statistics.layer_info = [[], [], [], []];
        /* 默认图标位置 */
        const icon = {
            staiconId: 'G20101',
            stapositionx: 1,
            stapositiony: 1,
            Sta_heightcon: 1,
            Sta_widthcon: 1,
            chooseIndex: 0,
            staSprite: '/handler/sprite/sprite2@2x.png',
            icon_hight: this.iconsize[1],
            icon_width: this.iconsize[0],
            url: '/handler/sprite/sprite2@2x'
        };
        icon.stapositionx = this.splite['G20101'].x;
        icon.stapositiony = this.splite['G20101'].y;
        icon.Sta_heightcon = 30 / this.splite['G20101'].height;
        icon.Sta_widthcon = 30 / this.splite['G20101'].width;
        const iconArr = [];
        iconArr.push(icon);
        this.otherArray[0] = icon ;
        this.style.metadata.statistics.layer_info[0] = arr;
        /* 是否第一次设置默认图标以及属性 */
       /*  if (!this.style.metadata.statistics.otherValue) {
        } */
        this.style.metadata.statistics.otherValue = ['G20101', 1, 'G20101', []];
        this.style.metadata.statistics.otherValue[3] = iconArr;



        for (let i = 0; i < arr.length; i++) {
            this.style.metadata.statistics.layer_info[1].push([arr[i][0], 1]);
            this.style.metadata.statistics.layer_info[2].push(true);
            this.style.metadata.statistics.layer_info[3].push([]);
        }

        for (let i = 0; i < arr.length; i++) {
            this.style.metadata.statistics.layer_info[3][i] = iconArr;
        }

        if (this.fieldType === 'text') {
            this.style.layout[this.config.attribute[0]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[0].length; i++) {
                this.style.metadata.statistics.layer_info[1][i][0] = this.style.metadata.statistics.layer_info[0][i][0];
                this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
                    .concat(this.style.metadata.statistics.layer_info[0][i]);
            }
            this.style.layout[this.config.attribute[0]] = this.style.layout[this.config.attribute[0]]
                .concat(this.style.metadata.statistics.otherValue[0]);

            this.style.layout[this.config.attribute[1]] = ['match', ['to-string', ['get', this.field]]];
            for (let i = 0; i < this.style.metadata.statistics.layer_info[1].length; i++) {
                this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                    .concat(this.style.metadata.statistics.layer_info[1][i]);
            }
            this.style.layout[this.config.attribute[1]] = this.style.layout[this.config.attribute[1]]
                .concat(this.style.metadata.statistics.otherValue[1]);


        } else {
            this.style.layout[this.config.attribute[0]] = {
                property: this.field,
                stops: this.style.metadata.statistics.layer_info[0],
                default: this.style.metadata.statistics.otherValue[0],
                type: this.mapRender /* 渲染类型 */
            };
            this.style.layout[this.config.attribute[1]] = {
                property: this.field,
                stops: this.style.metadata.statistics.layer_info[1],
                default: this.style.metadata.statistics.otherValue[1],
                type: this.mapRender
            };
        }
    }
    getImageSize(json) {
        let imageWidth = 0, imageHeight = 0;
        for (const name in json) {
          if (json.hasOwnProperty(name)) {
            const right = json[name].x + json[name].width;
            const bottom = json[name].y + json[name].height;
            if ( right > imageWidth )
              imageWidth = right;
            if (bottom > imageHeight)
              imageHeight = bottom;
          }
        }
        /* this.iconSize = [imageWidth, imageHeight]; */
        return [imageWidth, imageHeight];
      }
}
