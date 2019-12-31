import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';
import {Router} from '@angular/router';
import {HttpService} from '../s-service/http.service';
import {AppService} from '../s-service/app.service';
import {PopueComponent} from '../data/modal/data-popue.component';
import {SmxModal} from '../smx-component/smx-modal/smx-modal.module';
import {PropPanelComponent} from './prop-panel/prop-panel.component';
import {LocalStorage} from '../s-service/local.storage';
import {toLog} from '../smx-component/smx-util';
import * as FileSaver from './FileSaver';
import {PlotStyleComponent} from './plot-style/plot-style.component';
import {PlotEditComponent} from './plot-edit/plot-edit.component';
import {getMapInstance} from '../s-service/smx-map';

@Component({
  selector: 'app-plot-map',
  templateUrl: './plot-map.component.html',
  styleUrls: ['./plot-map.component.scss']
})
export class PlotMapComponent implements OnInit, OnDestroy {

  @ViewChild(PropPanelComponent, {static: false}) propComponent: PropPanelComponent;
  @ViewChild(PlotStyleComponent, {static: false}) styleComponent: PlotStyleComponent;
  @ViewChild(PlotEditComponent, {static: false}) plotEditComponent: PlotEditComponent;
  // @ViewChild(LegendComponent, {static: false}) legendComponent: LegendComponent;

  loaded = false;
  slideOpen = false;
  plotList = [];
  map: any;
  mapObj: any;
  oindex: any;
  searchKey: any;
  plotListCopy: any;
  plotInfo: any;
  plotInfo_keys = [];

  info: any;
  inspect: any;
  postData: any;
  plotId: any;
  plotInfoIdList: any;
  plotType: any;
  interFaceList = {};
  updteKeyId: any;

  mapType: any;
  editStatus: any;
  listItem: any;
  publishHide = false;
  basemap_config: any;   // 地图配置
  mapJson: any;
  imgUrl: string;
  printStatus = false;

  visitInfo: any;
  title: any;
  isUpdateStyle = false;
  deleteItemInfo: object;
  plotView = true;
  mapSources: any;
  oldSource: any;
  madArray = [];
  madArray1 = [];
  previewStyle: any;
  coverShow = true;
  plotStatus: any;

  constructor(private modalService: SmxModal,
              private toastService: ToastService,
              private httpService: HttpService,
              private router: Router,
              private ls: LocalStorage,
              private localStorage: LocalStorage,
              private appService: AppService) {
  }

  ngOnInit() {
    this.info = this.ls.getObject('visitInfo');
    if (this.info.isEdit === 0) {
      this.plotView = false;
    }
    this.plotId = this.info.plotId;
    if (this.info !== '' && this.info) {
      this.mapType = this.info.type;
      this.editStatus = this.info.isEdit;
      if (this.info && this.info.type === 'plot') {
        this.plotId = this.info.plotId;
        this.getUserMap(this.plotId, this.info.version);
        if (this.info && this.info.isEdit === 0) {
          this.publishHide = true;
        }
      }
    }
    this.visitInfo = this.localStorage.getObject('visitInfo');


    // 获取标绘地图的增删改查接口
    this.getPlotSetting();

    // 获取标绘信息id对应关系
    this.getPlotInfoId();
    // todo 新增配置标会 沿路画面、画线 接口路径 及是否显示相应功能
    this.httpService.getFile('config/plotStyle.json').subscribe((res: any) => {
      this.plotStatus = res.plotEdit;
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  /**
   * 加载地图
   */
  getUserMap(plotID: any, version: any) {
    const postData = {plotID: plotID, version: version};
    this.httpService.getData(postData, true, 'execute', 'getMapPlotStyle', 'em', 'em')
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.getData(data.data);
        },
        error => {

        }
      );
  }


  getData(url: any): Promise<any> {
    const self = this;
    return this.httpService.getFile(url)
      .toPromise()
      .then((res) => {
        const mapData = res;
        self.mapJson = mapData;

        this.basemap_config = (mapData as any).metadata.basemap_config;
        const options = ({
          container: 'map',
          style: mapData,
          center: this.mapJson.center,
          zoom: this.mapJson.zoom,
          preserveDrawingBuffer: true
        } as any);
        // 限制条件
        if (this.info && (this.info.isEdit === '0' || this.info.isEdit === 0) && this.mapType === 'plot') {
          if (this.basemap_config && this.basemap_config.lock_min) {
            options.minZoom = this.basemap_config.minzoom;
          }
          if (this.basemap_config && this.basemap_config.lock_max) {
            options.maxZoom = this.basemap_config.maxzoom;
          }
          if (this.basemap_config && this.basemap_config.lock_bounds) {
            options.maxBounds = JSON.parse(this.basemap_config.bounds);
          }
        }

        this.map = getMapInstance('map', options);
        this.map.on('load', () => {
          this.title = this.map.name;
          this.loaded = true;

        });


        // 监听地图上更新标绘图案
        this.map.on('update.layer', (e) => {

        });

        // 监听地图上新增标绘图案，将标绘信息添加到左侧列表
        // todo 确保信息和编辑页面一致更改监听新增方法 updateUser: ruansong
        /*this.map.on('create.layer', (event) => {
          if (this.plotType !== 'draw_pendant_words' && this.plotType !== 'draw_pendant_image') {
            setTimeout(() => {
              // 增加左侧列表标绘信息
              let obj;
              obj = event.features[0].properties;
              obj['st_asgeojson'] = event.features[0].geometry;
              this.plotList.push(obj);
              // 添加标绘信息后，自动展开左侧面板
              this.editLayer(obj, this.plotList.length - 1, false);
            }, 500);
          }
        });*/
      })
      .catch(this.handleError);

  }

  addList(event) {
    if (this.plotType !== 'draw_pendant_words' && this.plotType !== 'draw_pendant_image') {
      setTimeout(() => {
        // 增加左侧列表标绘信息
        let obj;
        obj = event.properties;
        obj['st_asgeojson'] = event.geometry;
        this.plotList.push(obj);
        // 添加标绘信息后，自动展开左侧面板
        this.editLayer(obj, this.plotList.length - 1, false);
      }, 500);
    }
  }

  // 获取标绘信息id
  getPlotInfoId() {
    const postData = {entity_id: this.visitInfo.entity_id};
    this.httpService.getData(postData, true, 'execute', '62d3a388-c291-43cc-8a5e-7e4e35e5e7cd', '', '').subscribe(
      (data: any) => {
        if (data.status > 0) {
          this.plotInfoIdList = data.data;
          this.plotInfoIdList.forEach((v: any) => {
            if (v.config_type === 'updateKey') {
              this.updteKeyId = v.alias;
            }
          });
        } else {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
          this.toastService.toast(toastCfg);
        }
      },
      error => {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
        this.toastService.toast(toastCfg);
      }
    );
  }

  // 获取标绘地图增删改查
  getPlotSetting() {
    const postData = {entity_id: this.visitInfo.entity_id};
    this.httpService.getData(postData, true, 'execute', '54d3cc4d-28ba-45aa-899a-3b0016ddb55d', '', '').subscribe(
      (data: any) => {
        if (data.status > 0) {
          data.data.forEach((v: any) => {
            switch (v.operation_type) {
              case 'insert':
                this.interFaceList['insert'] = v.id;
                break;
              case 'delete':
                this.interFaceList['delete'] = v.id;
                break;
              case 'update':
                this.interFaceList['update'] = v.id;
                break;
              case 'query':
                this.interFaceList['query'] = v.id;
                break;
            }
          });
        } else {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
          this.toastService.toast(toastCfg);
        }
      },
      error => {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
        this.toastService.toast(toastCfg);
      }
    );
  }

  // 返回地图列表
  back() {
    this.router.navigate(['/app/plot'], {queryParams: {module: 'plot'}});
  }

  // 点击左侧标绘图层列表 showTemplateSyle - 是否请求后台获取模板样式
  editLayer(item: any, i: any, showTemplateSyle: boolean) {
    if (this.info.isEdit === 0) {
      const viewplot = {
        type: 'Feature',
        geometry: item.st_asgeojson,
        properties: {
          name: item.name,
          description: item.description,
          content: item.content,
          style: item.style,
          mode_type: item.mode_type,
          f_system_id: item.f_system_id,
          geom: item.geom,
          reference_style_id: item.reference_style_id
        }
      };
      this.plotEditComponent.viewSelect(viewplot);
    }
    this.oindex = i;
    this.plotType = item.mode_type;
    this.plotInfo_keys = [];
    this.isUpdateStyle = true;
    if (item.mode_type !== 'draw_pendant_words' && item.mode_type !== 'draw_pendant_image') {
      this.plotInfo = item;
    }

    if (this.plotInfo && this.plotInfo.content.keys) {
      const plotInfo_keys_list = this.plotInfo.content.keys.split(',');
      plotInfo_keys_list.forEach((v: any) => {
        this.plotInfo_keys.push({name: v, value: this.plotInfo.content[v]});
      });
    }

    if (this.info.isEdit !== 0) { // 编辑模式下执行以下代码
      if (item.content && item.content.status !== 0) {
        // 使选中的标绘图案高亮
        const feature = {
          type: 'Feature',
          geometry: item.st_asgeojson,
          properties: {
            name: item.name,
            description: item.description,
            content: item.content,
            style: item.style,
            mode_type: item.mode_type,
            reference_style_id: item.reference_style_id ? item.reference_style_id : null
          }
        };
        feature.properties[this.updteKeyId] = item[this.updteKeyId];
        this.plotEditComponent.selectGeometry(feature);
      }

      if (item.mode_type === 'draw_symbol') {
        const style = {
          'geo_type': 'draw_symbol',
          'style': {
            'icon-image': item.style['icon-image'],
            'icon-size': item.style['icon-size'],
            'icon-opacity': item.style['icon-opacity'],
            'positionx': item.style['positionx'],
            'positiony': item.style['positiony'],
            'iconSprite_width': item.style['iconSprite_width'],
            'sprite': item.style['sprite']
          }
        };

        this.appService.onSelectStyleEmitter.emit(style);

        // 获取图标列表
        setTimeout(() => {
          if (this.styleComponent.recentUse.draw_symbol.length === 0) {
            const symbolList = [];
            // 默认的最近使用图标
            const rencentSymbolId = ['110101', '120101', '130101', '130201'];
            this.httpService.getFile('/handler/sprite/sprite2@2x.json').subscribe(
              (data: any) => {
                const spriteImg = this.styleComponent.LegendCom.getUniqueSprite(data);
                const spriteImgSize = this.styleComponent.LegendCom.getImageSize(spriteImg);
                rencentSymbolId.forEach((v: any, i: any) => {
                  const symbolObj = {};
                  for (const key of Object.keys(spriteImg)) {
                    if (v === key) {
                      symbolObj['iconId'] = key;
                      symbolObj['positionx'] = data[key].x / 2;
                      symbolObj['positiony'] = data[key].y / 2;
                      symbolObj['iconSprite_width'] = spriteImgSize[0] / 2;
                      symbolObj['sprite'] = '/handler/sprite/sprite2@2x.png';
                      if (symbolList.length < 4) {
                        symbolList.push(symbolObj);
                      }
                    }
                  }
                });
                this.styleComponent.recentUse.draw_symbol = symbolList;
              });
          }
        }, 200);
        if (showTemplateSyle) {
          setTimeout(() => {
            this.styleComponent.drawType = item.mode_type;
            this.styleComponent.showStyle(style);
            this.styleComponent.recentUse[item.mode_type + '_item'] = style.style;
            // 使标绘工具栏相应工具高亮
            this.plotEditComponent.mode_type = item.mode_type;
          }, 300);
        }
      }

      if (item.mode_type === 'draw_pendant_words') { // 挂件 - 文字
        const styleObj = {
          geo_type: 'draw_pendant_words',
          style: {
            'text-size': item.style['fontSize'].replace('px', ''),
            'text-halo-width': item.style['fontWeight'] === 'normal' ? 0 : 1,
            'text-color': item.style['color'],
            'text-max-width': item.style['width'].replace('px', ''),
            'text-line-height': item.style['lineHeight']
          },
          waterMark: this.plotEditComponent.waterMark  // 传递点击的挂件图片实例
        };
        this.appService.onSelectStyleEmitter.emit(styleObj);
        setTimeout(() => {
          this.styleComponent.drawType = this.plotType;
          this.styleComponent.showStyle(styleObj);
          this.styleComponent.recentUse[this.plotType + '_item'] = styleObj;
        }, 300);

      }

      if (item.mode_type === 'draw_pendant_image') { // 挂件 - 图片
        const styleObj = {
          geo_type: 'draw_pendant_image',
          style: {
            'width': item.style['width'].replace('px', ''),
            'height': item.style['height'].replace('px', ''),
            'borderWidth': item.style['borderWidth'].replace('px', ''),
            'borderColor': item.style['borderColor'],
            'borderStyle': 'solid',
            'borderRadius': item.style['borderRadius'],
            'boxShadow': item.style['boxShadow'],
            'backgroundSize': item.style['width'] + ' ' + item.style['height']
          },
          waterMark: this.plotEditComponent.waterMark  // 传递点击的挂件图片实例
        };
        const emitStyle = {
          geo_type: 'draw_pendant_image',
          style: {
            'width': item.style['width'],
            'height': item.style['height'],
            'borderWidth': item.style['borderWidth'],
            'borderColor': item.style['borderColor'],
            'borderStyle': 'solid',
            'borderRadius': item.style['borderRadius'],
            'boxShadow': item.style['boxShadow'],
            'backgroundSize': item.style['width'] + ' ' + item.style['height']
          }
        };
        this.appService.onSelectStyleEmitter.emit(emitStyle);
        setTimeout(() => {
          this.styleComponent.drawType = this.plotType;
          this.styleComponent.showStyle(styleObj);
          this.styleComponent.recentUse[this.plotType + '_item'] = styleObj;
          // 使标绘工具栏相应工具高亮
          this.plotEditComponent.mode_type = item.mode_type;
        }, 300);
      }

      if (item.mode_type !== 'draw_symbol' && item.mode_type !== 'draw_pendant_image' && item.mode_type !== 'draw_pendant_words') {

        const styleObj = {};
        styleObj['geo_type'] = item.mode_type;
        styleObj['style'] = item.style;
        this.appService.onSelectStyleEmitter.emit(styleObj);

        // 当用户点击标绘工具在地图上创建标绘图案后，不需要再次从后台获取模板样式
        if (showTemplateSyle) {
          // 请求模板样式列表
          const postData = {geo_type: item.mode_type};
          this.httpService.getData(postData, true, 'execute', 'fa96d62f-5bcc-4af2-bc04-c2ef846edbe7', '', '').subscribe(
            (data: any) => {
              if (data.status > 0) {
                this.styleComponent.styleList = data.data;
                // 显示最近使用的图标
                this.styleComponent.recentUse[item.mode_type + '_list'] = data.data.slice(0, 4);

                // 显示标绘工具的相应模板和样式
                setTimeout(() => {
                  this.styleComponent.showStyle(styleObj);
                  this.styleComponent.recentUse[item.mode_type + '_item'] = styleObj;
                  this.styleComponent.drawType = item.mode_type;
                  // 使标绘工具栏相应工具高亮
                  this.plotEditComponent.mode_type = item.mode_type;
                }, 300);
              } else {
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', data.msg, 2000);
                this.toastService.toast(toastCfg);
              }
            },
            error => {
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '请求发送失败，请检查网络', 2000);
              this.toastService.toast(toastCfg);
            }
          );
        }
      }
    }

    if (!this.slideOpen && item.mode_type !== 'draw_pendant_words' && item.mode_type !== 'draw_pendant_image') {
      this.slideOpen = true;
      if (this.info.isEdit === 0 && !this.plotView) {
        this.slideOpen = false;
      }
    }
  }

  // 用户点击标绘工具后，此方法接收子组件回传的标绘类型
  drawChange(event: any) {
    // 点击标绘工具时，如果已选中左侧标绘信息，则取消高亮和选中
    this.oindex = null;
    if (this.isUpdateStyle) {
      this.isUpdateStyle = false;
    }
    if (this.slideOpen) {
      this.slideOpen = false;
    }

    // 用户选择的样式
    if (this.previewStyle && this.plotType !== event) {
      this.previewStyle = null;
    }

    // 根据选择的标绘工具类型来显示相应样式库和样式组件
    if (event === 'draw_route_line') {
      this.plotType = 'draw_line';
    } else if (event === 'draw_route_fill') {
      this.plotType = 'draw_fill';
    } else if (event === 'draw_pendant_words') { // 挂件文字
      this.plotType = 'draw_pendant_words';
    } else if (event === 'draw_pendant_image') { // 挂件图片
      this.plotType = 'draw_pendant_image';
    } else {
      this.plotType = event;
    }

    if (this.plotType === 'draw_symbol') {
      this.getSymbolList();

    } else if (this.plotType === 'draw_pendant_words') { // 挂件 - 文字
      const styleObj = {
        geo_type: 'draw_pendant_words',
        style: {
          'text-size': '16',
          'text-halo-width': 0,
          'text-color': '#000',
          'text-max-width': '100',
          'text-line-height': 1.6
        }
      };
      this.appService.onSelectStyleEmitter.emit(styleObj);
      setTimeout(() => {
        this.styleComponent.drawType = this.plotType;
        this.styleComponent.showStyle(styleObj);
        this.styleComponent.recentUse[this.plotType + '_item'] = styleObj;
      }, 300);
    } else if (this.plotType === 'draw_pendant_image') { // 挂件 - 图片
      const styleObj = {
        geo_type: 'draw_pendant_image',
        style: {
          'width': '100px',
          'height': '100px',
          'borderWidth': '1px',
          'borderColor': '#09c',
          'borderStyle': 'solid',
          'borderRadius': '20%',
          'boxShadow': '0px 0px 3px #ccc',
          'backgroundSize': '100px 100px'
        }
      };
      this.appService.onSelectStyleEmitter.emit(styleObj);
      setTimeout(() => {
        this.styleComponent.drawType = this.plotType;
        this.styleComponent.showStyle(styleObj);
        this.styleComponent.recentUse[this.plotType + '_item'] = styleObj;
      }, 300);
    } else {
      const postData = {geo_type: this.plotType};
      this.httpService.getData(postData, true, 'execute', 'fa96d62f-5bcc-4af2-bc04-c2ef846edbe7', '', '').subscribe(
        (data: any) => {
          if (data.status > 0) {
            // 给plotEdit组件发送默认样式
            if (this.previewStyle) {
              this.appService.onSelectStyleEmitter.emit(this.previewStyle);
            } else {
              this.appService.onSelectStyleEmitter.emit(data.data[0]);
            }

            setTimeout(() => {
              // 显示相应类型公共样式选择框
              const style = data.data[0];
              let styleObj = {};
              if (this.previewStyle) {
                styleObj = this.previewStyle;
              } else {
                styleObj['style'] = {};
                styleObj['geo_type'] = style.geo_type;
                for (const key of Object.keys(style.style)) {
                  styleObj['style'][key] = style.style[key];
                }
              }

              this.styleComponent.drawType = this.plotType;
              // 显示具体样式信息，默认显示公共样式中的第一个样式
              this.styleComponent.styleList = data.data;
              this.styleComponent.showStyle(styleObj);

              // 显示最近使用的图标
              this.styleComponent.recentUse[this.plotType + '_list'] = data.data.slice(0, 4);
              this.styleComponent.recentUse[this.plotType + '_item'] = styleObj;
            }, 300);

          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '请求发送失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        }
      );
    }
  }

  // 获取图标库
  getSymbolList() {
    // 获取图标样式
    const symbolList = [];
    // 默认的最近使用图标
    const rencentSymbolId = ['110101', '120101', '130101', '130201'];
    this.httpService.getFile('/handler/sprite/sprite2@2x.json').subscribe(
      (data: any) => {
        const spriteImg = this.styleComponent.LegendCom.getUniqueSprite(data);
        const spriteImgSize = this.styleComponent.LegendCom.getImageSize(spriteImg);
        console.log(spriteImg);
        rencentSymbolId.forEach((v: any, i: any) => {
          const symbolObj = {};
          for (const key of Object.keys(spriteImg)) {
            if (v === key) {
              symbolObj['iconId'] = key;
              symbolObj['positionx'] = data[key].x / 2;
              symbolObj['positiony'] = data[key].y / 2;
              symbolObj['iconSprite_width'] = spriteImgSize[0] / 2;
              symbolObj['sprite'] = '/handler/sprite/sprite2@2x.png';
              if (symbolList.length < 4) {
                symbolList.push(symbolObj);
              }
            }
          }
        });
        this.styleComponent.recentUse.draw_symbol = symbolList;

        let style = {};
        // 如果用户已选择图标，默认一直使用该图标
        if (this.previewStyle) {
          this.appService.onSelectStyleEmitter.emit({
            'geo_type': 'draw_symbol',
            'style': this.previewStyle
          });
        } else {
          const symbolStyle = JSON.parse(JSON.stringify(symbolList[0]));
          style['geo_type'] = 'draw_symbol';
          style['style'] = symbolStyle;
          style['style']['icon-image'] = symbolStyle.iconId;
          style['style']['icon-opacity'] = 1;
          style['style']['icon-size'] = 1;
          delete style['style']['iconId'];
          this.appService.onSelectStyleEmitter.emit(style);
        }

        setTimeout(() => {
          if (this.previewStyle) {
            style = {
              'geo_type': 'draw_symbol',
              'style': this.previewStyle
            };
          }
          this.styleComponent.drawType = this.plotType;
          this.styleComponent.showStyle(style);
          this.styleComponent.recentUse[this.plotType + '_item'] = style['style'];
        }, 300);
      }
    );
  }

  // 点击地图标绘图案
  clickLayer(event: any) {
    if (event.toString().length > 2) {
      const plotId = event.properties[this.updteKeyId];
      this.plotList.forEach((item: any, index: any) => {
        if (item[this.updteKeyId] === plotId) {
          this.oindex = index;
        }
      });

      // 用户点击标绘图案时，左侧视图范围外的标绘信息出现在可视范围
      const ele = document.getElementById('layer-list').getElementsByTagName('li')[this.oindex];
      if (ele) {
        ele.scrollIntoView(false);
      }
      event.properties['st_asgeojson'] = event.geometry;
      // 选中标绘图案时，左侧相应信息高亮，打开面板，展示相应样式组件
      this.editLayer(event.properties, this.oindex, true);

    } else {
      this.isUpdateStyle = false;
      this.oindex = null;
      this.plotType = null;
      this.plotEditComponent.mode_type = null;
      this.slideOpen = false;
    }
  }

  // 关闭属性面板
  closeDrawer() {
    this.slideOpen = false;
  }


  // 获取标会数据
  getPlotList() {
    const data = this.plotEditComponent.plot_source.features;
    const dataList = [];
    data.forEach((v: any, i: number) => {
      if (!v.properties.description) {
        v.properties['description'] = '导入数据';
      }
      if (!v.properties.content.img) {
        v.properties.content['img'] = [];
      }
      if (v.properties.mode_type !== 'draw_pendant_words' && v.properties.mode_type !== 'draw_pendant_image') {
        dataList.push(v.properties);
      }
      v.properties['st_asgeojson'] = v.geometry;
    });

    this.plotList = dataList;
    this.plotListCopy = this.plotList;
    this.coverShow = false;
  }


  // 隐藏图层
  hideLayer(item: any) {
    item.content['status'] = 0;
    const postData = {
      name: item.name,
      description: item.description,
      content: item.content,
      geom: item.st_asgeojson,
      style: item.style === '' ? {} : item.style,
      mode_type: item.mode_type,
      reference_style_id: item.reference_style_id ? item.reference_style_id : null
    };
    postData[this.updteKeyId] = item[this.updteKeyId];
    this.httpService.getData(postData, true, 'execute', this.interFaceList['update'], '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.plotEditComponent.clearEdit();
            // 隐藏标绘图案图层
            if (item.st_asgeojson.type === 'Polygon') {
              if (item.mode_type === 'draw_photo') {
                this.map.setLayoutProperty(item.content.image_source, 'visibility', 'none');
                this.map.setLayoutProperty(item[this.updteKeyId] + '_copy', 'visibility', 'none');
              } else {
                this.map.setLayoutProperty(item[this.updteKeyId] + '_copy', 'visibility', 'none');
              }
            }
            this.map.setLayoutProperty(item[this.updteKeyId], 'visibility', 'none');

            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '隐藏成功！', 2000);
            this.toastService.toast(toastCfg);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '发送请求失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });
  }

  // 显示图层
  showLayer(item: any) {
    item.content['status'] = 1;
    const postData = {
      name: item.name,
      description: item.description,
      content: item.content,
      geom: item.st_asgeojson,
      style: item.style === '' ? {} : item.style,
      mode_type: item.mode_type,
      reference_style_id: item.reference_style_id ? item.reference_style_id : null
    };
    postData[this.updteKeyId] = item[this.updteKeyId];
    this.httpService.getData(postData, true, 'execute', this.interFaceList['update'], '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            // 显示标绘图案图层
            if (item.st_asgeojson.type === 'Polygon') {
              if (item.mode_type === 'draw_photo') {
                this.map.setLayoutProperty(item.content.image_source, 'visibility', 'visible');
                this.map.setLayoutProperty(item[this.updteKeyId], 'visibility', 'visible');
                this.map.setLayoutProperty(item[this.updteKeyId] + '_copy', 'visibility', 'visible');
              } else {
                this.map.setLayoutProperty(item[this.updteKeyId], 'visibility', 'visible');
                this.map.setLayoutProperty(item[this.updteKeyId] + '_copy', 'visibility', 'visible');
              }
            } else {
              this.map.setLayoutProperty(item[this.updteKeyId], 'visibility', 'visible');
            }
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '显示成功！', 2000);
            this.toastService.toast(toastCfg);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '发送请求失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });
  }

  // 点击删除按钮
  deleteClick(content: any, item: any, index: any) {
    this.oindex = index;
    this.deleteItemInfo = item;
    this.modalService.open(content).result.then((result) => {
    }, (reason) => {
    });
  }

  // 删除标绘信息
  deleteplot(item: any, index: any, close: any) {
    // 关闭提示弹框
    close();
    // 未完成，需添加接口
    const postData = {};
    postData[this.updteKeyId] = item[this.updteKeyId];
    this.httpService.getData(postData, true, 'execute', this.interFaceList['delete'], '', '').subscribe(
      (data: any) => {
        if (data.status > 0) {
          // 删除列表中的数据
          const feature = {
            type: 'Feature',
            geometry: item.st_asgeojson,
            properties: {
              name: item.name,
              description: item.description,
              conetnt: item.content,
              style: item.style,
              mode_type: item.mode_type
            }
          };
          feature.properties[this.updteKeyId] = item[this.updteKeyId];
          this.plotEditComponent.deleteGeometry(feature);
          this.plotList.splice(index, 1);
          if (this.slideOpen) {
            this.slideOpen = false;
          }
          this.plotInfo = null;
          this.plotType = null;
          this.plotEditComponent.mode_type = null;
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功！', 2000);
          this.toastService.toast(toastCfg);
        } else {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', data.msg, 2000);
          this.toastService.toast(toastCfg);
        }
      },
      error => {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '请求发送失败，请检查网络', 2000);
        this.toastService.toast(toastCfg);
      }
    );

  }


  // 导入数据--李景阳
  importData() {

    const key_config = {
      create: {
        title: '导入数据',
        type: 0,
        url: '89ae7869-4904-4c78-a80e-69815e924de3',
        modal: {
          type: 15,
          config: {
            title: '导入数据',
            independence: 99,
            url: {
              queryLeft: '33c1174f-ff51-49f9-a635-7777cf503917',
              searchLeft: '03b5b9bc-f8de-4397-a594-d45731eac97d',
              searchRight: '3c744ced-c950-4bd8-b5d4-ab5547b0cd8d',
              queryRight: '66925d61-1b9d-46f8-9867-4f9c204f4f5e',
            },
            view: {
              action: 2, // 1自定义
              list: 2,
              leftTitle: '我的数据',
              rightTitle: '共享数据',
              id: 'service_event_id',
              name: 'description',
              description: 'description',
              img: 'thumbnail'
            }
          }
        }
      }
    };
    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.type = key_config.create.modal.type; // 类型
    modalRef.componentInstance.keyConfig = key_config.create.modal.config; // config
    modalRef.result.then((result) => {
        // Ljy--这里需要参数1.地图id 2.数据源id   传给接口
        const entity_id = result.checkedItem.entity_id;
        const importD = {plot_id: this.plotId, entity_id: entity_id};
        this.httpService.getData(importD, true, 'mapplot', 'data2plot', '')// ,
          .subscribe(
            (data: any) => {
              // Ljy--返回的data中是成功的标识--这个部分已经把导入的数据通过接口存入后台
              if ((data as any).data.result <= 0) {
                const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
                this.toastService.toast(toast);
                return;
              }

              this.plotEditComponent.importData();
              // Ljy--导入数据限制的提示
              if ((data as any).data.exceedLimit > 0) {
                const exceedCount = (data as any).data.exceedCount;
                const toast = new ToastConfig(ToastType.WARNING, '', '标绘地图最多显示5000条数据,本次有' + exceedCount + '条未导入!', 2000);
                this.toastService.toast(toast);
              } else {
                // this.getUserMap(this.plotId, this.info.version);
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '导入数据成功!', 2000);
                this.toastService.toast(toastCfg);
                return;
              }

            }
          );
      },

      (reason) => {
      });
  }


  // 导出数据
  exportData() {
    const postDataBody = this.plotEditComponent.plot_source;
    const blob = new Blob([JSON.stringify(postDataBody, null, 2)], {type: 'text / plain; charset = utf-8 '});
    FileSaver.saveAs(blob, 'export.json');
  }

  /**
   * 清除搜索--Ljy
   */
  clearInput() {
    this.searchKey = '';
    this.plotListCopy.forEach((p: any) => {
      p.content.status = 1;
      if (p.st_asgeojson.type === 'Polygon') {
        if (p.mode_type === 'draw_photo') {
          this.map.setLayoutProperty(p.content.image_source, 'visibility', 'visible');
        }
      }
      this.map.setLayoutProperty(p[this.updteKeyId], 'visibility', 'visible');
    });

    this.plotList = this.plotListCopy;
  }

  // 查找--按钮--Ljy
  searchMessage() {
    if (this.searchKey === '') {
      this.clearInput();
    } else {
      this.plotList = [];
      this.plotEditComponent.clearEdit();
      this.plotListCopy.forEach((p: any, index: any) => {
        const reg = RegExp(this.searchKey);
        if (reg.test(p.name)) {

          p.content.status = 1;
          this.map.setLayoutProperty(p[this.updteKeyId], 'visibility', 'visible'); // --查询时图层上的过滤--Ljy
          this.plotList.push(p);
        } else {// --查询时图层上的过滤--Ljy
          if (p.st_asgeojson.type === 'Polygon') {
            if (p.mode_type === 'draw_photo') {
              this.map.setLayoutProperty(p.content.image_source, 'visibility', 'none');
              this.map.setLayoutProperty(p[this.updteKeyId] + '_copy', 'visibility', 'none');
            } else {
              this.map.setLayoutProperty(p[this.updteKeyId] + '_copy', 'visibility', 'none');
            }
          }
          this.map.setLayoutProperty(p[this.updteKeyId], 'visibility', 'none');
        }
      });
    }
  }


  reaseView(e: any) {
    if (e === 'public') {    // 发布标绘地图
      const style = this.map.getStyle();
      this.mapJson = this.map.getStyle();
      // const style = this.map.getStyle();
      const zoom = this.map.getZoom();
      const center = this.map.getCenter();
      const bearing = this.map.getBearing();
      const pitch = this.map.getPitch();
      const refModal = this.modalService.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
      refModal.componentInstance.type = 16;
      refModal.componentInstance.keyConfig = {title: '发布预览'};
      refModal.componentInstance.modalData = {
        style: style,
        zoom: zoom,
        center: center,
        bearing: bearing,
        pitch: pitch
      };

      refModal.result.then(
        (result) => {
          this.publish(result);
        },
        (reason) => {
        });
    } else if (e === 'change') {  // 标绘地图切换底图
      const key_config = {
        chooseMap: {
          action: 2, // 1 有自定义 // 2 无自定义
          independence: 1, // 1 独立性  2 有关联
          title: '选择底图',
          modal: {
            leftTitle: '系统底图',
            rightTitle: '用户底图',
            id: 'map_id',
            name: 'name',
            description: 'description',
            img: 'thumbnail'
          },
          interface: {
            queryLeft: 'fa20136d-a6b2-40da-b8c5-29b3a361c42b', // 查询系统地图 do
            searchLeft: '5878e037-1c61-4c9a-9f4a-653e70c2d5c4', // 关键字搜索系统底图 do
            searchRight: '8b6f180d-63ee-44f9-99b6-334159fcc124', // 关键字搜索用户地图 do
            queryRight: '31a835e5-8e55-439a-9b63-3886cb08390e', // 查询用户地图 do
          }
        }
      };

      const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', keyboard: false, enterKeyId: 'smx-popule'});
      modalRef.componentInstance.keyConfig = key_config;
      modalRef.componentInstance.type = 'chooseMap';
      modalRef.result.then((result) => {
      }, (reason) => {
        if (reason && reason !== 'close') {

          const mapid = reason.checkedItem.map_id,
            version = reason.checkedItem.release_time;
          this.postData = {
            mapID: mapid,
            version: version
          };
          const layers = this.map.getStyle().layers;
          this.mapSources = this.map.getStyle().sources;
          for (let i = 0; i < layers.length; i++) {
            if (i === 2) {
              this.oldSource = layers[i].source;
            }
          }
          this.madArray = [];
          this.madArray1 = [];
          for (let i = 0; i < layers.length; i++) {
            if (i !== 0) {
              if (layers[i].source !== this.oldSource) {
                if (layers[i].hasOwnProperty('metadata')) {
                  this.madArray1.push(layers[i]);
                } else {
                  this.madArray.push(layers[i]);
                }
              }
            }
          }
          delete this.mapSources[this.oldSource];
          for (let i = 0; i < this.madArray1.length; i++) {
            delete this.mapSources[this.madArray1[i].source];
          }
          this.httpService.getData(this.postData, true, 'execute', 'getMapStyle', 'em', 'em')
            .subscribe(
              (data: any) => {
                this.getJson(data.data);
                const data1 = {
                  default_map_id: mapid,
                  plot_id: this.plotId
                };
                this.httpService.getData(data1, true, 'execute', 'fd7c4f10-48db-4415-abc8-cdc1f26d3805', '')// ,
                  .subscribe(
                    (data: any) => {
                      // this.plotEditComponent.changeMap();
                      toLog(data);
                    }
                  );
              }
            );
        }
      });


    } else if (e === 'close') {
      this.printStatus = false;
    } else {
      this.printStatus = true;
      this.imgUrl = e;
    }

  }

  // 异常
  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  getJson(url: any) {
    this.httpService.getFile(url).subscribe(res => {
      const mapData = res;
      this.mapJson = mapData;
      let x;
      for (x of Object.keys(this.mapSources)) {
        this.mapJson.sources[x] = this.mapSources[x];
      }
      for (let i = 0; i < this.madArray.length; i++) {
        this.mapJson.layers.push(this.madArray[i]);
      }
      this.map.setStyle(this.mapJson);
      // this.map.setZoom((mapData as any).zoom);
      // this.map.setCenter((mapData as any).center);
    }, error => {

    });
  }

  /**
   * 发布图片上传
   * @param imgUrl
   */
  publish(imgUrl: any) {
    // if (this.info.type === 'map') {
    if (this.info.type === 'plot') {
      const file = this.dataURLtoFile(imgUrl, this.plotId + '.jpg'); // 添加图片名称
      // const file = this.dataURLtoFile(imgUrl, 'map_id_23' + '.jpg'); // 添加图片名称
      // this.httpService.uploadFileRequest({forceDelete: true}, [file], 'map', 'img', 'fb')
      this.httpService.makeFileRequest('/upload/1.0.0/layer/img', {forceDelete: true}, [file])
        .subscribe(
          data => {
            if ((data as any).data && (data as any).data.upload_file && (data as any).data.upload_file.uploads) {
              this.publicStyle({
                thumbnail: (data as any).data.upload_file.uploads,
                plotID: this.plotId,
                version: 'release'
              }, 'getMapPlotStyle');
            }
          }, error => {
          }
        );
    }

  }


  /**
   * 发布样式
   * @param body
   * @param url
   */
  publicStyle(body: any, url: any) {
    this.httpService.getData(body, true, 'execute', url, 'em', 'em')
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          // imgUrl();
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '发布成功!', 2000);
          this.toastService.toast(toastCfg);
          return;
        }
      );
  }


  /**
   * base 转 file
   * @param dataurl
   * @param filename
   */
  dataURLtoFile(dataurl, filename) { // 将base64转换为文件
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let nl = bstr.length;
    const u8arr = new Uint8Array(nl);
    while (nl--) {
      u8arr[nl] = bstr.charCodeAt(nl);
    }
    return new File([u8arr], filename, {type: mime});
  }


  /*reciveInspectClick() {
    this.inspect.toggleInspector();
  }*/

  plotListView() {
    if (this.plotView === false) {
      this.plotView = true;
    } else {
      this.plotView = false;
      this.slideOpen = false;
    }
  }

  // 设置左侧面板“描述”与注记文字联动
  changeWords(event: any) {
    this.map.getSource(this.plotId).setData(this.plotEditComponent.plot_source);
    this.plotEditComponent.clearEdit();
  }

  // 接收图标选择框中选择的图标
  receiveChooseStyle(event: any) {
    this.previewStyle = event;
  }

  /**
   * */
  plotEditChange(event: any) {
    if (event.type === 'removeMark') {
      const marker = this.plotEditComponent.waterMark.properties.properties;
      const geoId = this.plotEditComponent.geoId;
      this.plotEditComponent.deleteMark(marker[geoId]);
    } else if (event.type === 'topShow') {
      this.plotEditComponent.markTop();
    }
  }
}
