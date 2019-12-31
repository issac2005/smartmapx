import {isUINumber} from '../../s-service/utils';
import {Component, enableProdMode, Input, OnChanges, OnInit, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {HttpService} from '../../s-service/http.service';
import {AppService} from '../../s-service/app.service';
import {toError} from '../../smx-component/smx-util';

enableProdMode();

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit, OnChanges {
  @Input() layerInfo: any;
  @Input() layerIndex: any;
  @Input() layerEditor: any;
  @Input() mapType: any;
  @Input() mapObj: any;
  myTextarea: any;
  radius: any = 1;
  layerData: any;
  ServiceEventId: any = [];
  HasEventId: any = false;
  splite: any;
  type: any;
  lineJoin: any;
  lineHoinBoolean: any;
  properties: any; // 配置文件
  sprite: any; // 图片路径
  panels: any = [];

  constructor(private appService: AppService, private httpService: HttpService,
              private elementRef: ElementRef, private render2: Renderer2) {

  }

  ngOnInit() {
    this.getInfo();
    this.panels = [
      {
        active: true,
        name: '图层信息',
        disabled: false,
        customStyle: {
          'background': '#e7ecee',
          'color': '#666666'
        }
      },
      {
        active: false,
        disabled: false,
        name: '绘制属性',
        customStyle: {
          'background': '#e7ecee'
        }
      },
      {
        active: false,
        disabled: false,
        name: '图标属性',
        customStyle: {
          'background': '#e7ecee'
        }
      }
    ];
  }

  ngOnChanges() {
    this.HasEventId = false;
    if (this.layerInfo !== undefined) {
      const id = this.layerInfo.metadata.service_event_id;
      if (this.ServiceEventId.length === 0) {
        this.httpService.getData({limit: -1, service_event_id: this.layerInfo.metadata.service_event_id},
          true, 'execute', '86104465-ea69-4f8d-85a7-88a71c745f3c', '')
          .subscribe(
            (data: any) => {
              const pattern = [];
              const defau = [];
              const type = [];
              // 数值类型
              const pattern_num = [];
              const defau_num = [];
              const type_num = [];
              for (let m = 0; m < data.data.root.length; m++) {
                // 结构变化 在用表达式 修改
                /* pattern.push(data.data.root[m].name);
                defau.push(data.data.root[m].description);
                type.push(data.data.root[m].data_type); */
                /*  pattern.push(data.data.root[m].column_name);
                 defau.push(data.data.root[m].description);
                 type.push(data.data.root[m].data_type); */
                // if ( data.data.root[m].component_data_type_id === 'fm_ui_input_integer8' ||
                //      data.data.root[m].component_data_type_id === 'fm_ui_input_integer' ||
                //      data.data.root[m].component_data_type_id === 'fm_ui_input_integer2' ||
                //      data.data.root[m].component_data_type_id === 'fm_ui_input_decimal' ||
                //      data.data.root[m].component_data_type_id === 'fm_ui_input_decimal8') {
                if (isUINumber(data.data.root[m].component_data_type_id)) {
                  pattern_num.push(data.data.root[m].column_name);
                  if (data.data.root[m].description === '') {
                    defau_num.push(data.data.root[m].column_name);
                  } else {
                    defau_num.push(data.data.root[m].description);
                  }
                  type_num.push(data.data.root[m].component_data_type_id);

                  pattern.push(data.data.root[m].column_name);
                  if (data.data.root[m].description === '') {
                    defau.push(data.data.root[m].column_name);
                  } else {
                    defau.push(data.data.root[m].description);
                  }
                  type.push(data.data.root[m].component_data_type_id);
                } else {
                  pattern.push(data.data.root[m].column_name);
                  if (data.data.root[m].description === '') {
                    defau.push(data.data.root[m].column_name);
                  } else {
                    defau.push(data.data.root[m].description);
                  }
                  type.push(data.data.root[m].component_data_type_id);
                }


              }
              this.ServiceEventId.push({
                id: id,
                name: pattern,
                description: defau,
                type: type,
                name_num: pattern_num,
                desc_num: defau_num,
                type_num: type_num
              });
            },
            error => {
              toError(error);
            }
          );
      } else {
        for (let i = 0; i < this.ServiceEventId.length; i++) {
          if (id === this.ServiceEventId[i].id) {
            this.HasEventId = true;
            break;
          }
        }
        if (!this.HasEventId) {
          this.httpService.getData({limit: -1, service_event_id: this.layerInfo.metadata.service_event_id},
            true, 'execute', '86104465-ea69-4f8d-85a7-88a71c745f3c', '')
            .subscribe(
              (data: any) => {
                const pattern = [];
                const defau = [];
                const type = [];
                // 数值类型
                const pattern_num = [];
                const defau_num = [];
                const type_num = [];
                for (let m = 0; m < data.data.root.length; m++) {
                  // if (data.data.root[m].component_data_type_id === 'fm_ui_input_integer8' ||
                  //   data.data.root[m].component_data_type_id === 'fm_ui_input_integer' ||
                  //   data.data.root[m].component_data_type_id === 'fm_ui_input_integer2' ||
                  //   data.data.root[m].component_data_type_id === 'fm_ui_input_decimal' ||
                  //   data.data.root[m].component_data_type_id === 'fm_ui_input_decimal8') {
                  if (isUINumber(data.data.root[m].component_data_type_id)) {
                    pattern_num.push(data.data.root[m].column_name);
                    defau_num.push(data.data.root[m].column_name);
                    type_num.push(data.data.root[m].component_data_type_id);
                    pattern.push(data.data.root[m].column_name);
                    if (data.data.root[m].description === '') {
                      defau.push(data.data.root[m].column_name);
                    } else {
                      defau.push(data.data.root[m].description);
                    }
                    type.push(data.data.root[m].component_data_type_id);
                  } else {
                    pattern.push(data.data.root[m].column_name);
                    if (data.data.root[m].description === '') {
                      defau.push(data.data.root[m].column_name);
                    } else {
                      defau.push(data.data.root[m].description);
                    }
                    type.push(data.data.root[m].component_data_type_id);
                  }
                }
                this.ServiceEventId.push({
                  id: id,
                  name: pattern,
                  description: defau,
                  type: type,
                  name_num: pattern_num,
                  desc_num: defau_num,
                  type_num: type_num
                });
              },
              error => {
                toError(error);
              }
            );
        }
      }

    }

    setTimeout(() => {
      const num = document.getElementsByClassName('card-header');
      for (let i = 0; i < num.length; i++) {
        const isclick = num[i].firstElementChild.getAttribute('aria-expanded');
        if (isclick === 'false') {
          num[i].getElementsByTagName('a')[0].click();
        }
      }
    }, 50);
    if (this.layerInfo !== undefined) {
      if (this.layerInfo.maxzoom === undefined) {
        this.layerInfo.maxzoom = 24;
      }
      if (this.layerInfo.minzoom === undefined) {
        this.layerInfo.minzoom = 0;
      }
    }
    this.myTextarea = JSON.stringify(this.layerInfo, null, 2);
    if (this.layerInfo !== undefined) {
      if (this.layerInfo.type === 'symbol') {
        this.type = '图标';
      } else if (this.layerInfo.type === 'line') {
        this.type = '线';
      } else if (this.layerInfo.type === 'fill') {
        this.type = '面';
      } else if (this.layerInfo.type === 'circle') {
        this.type = '圆';
      } else if (this.layerInfo.type === 'background') {
        this.type = '背景';
      } else if (this.layerInfo.type === 'fill-extrusion') {
        this.type = '高程面';
      }
    }
  }

  getInfo() {
    this.httpService.getFile('config/editorConfig.json').subscribe(res => {
      this.layerData = res;
      /*this.httpService.getData({}, false, '/handler/sprite/', 'get', 'sprite', 'sprite')
        .subscribe((data) => {
            /!*const json = (data as any).sprite.x2.json + '?t=' + new Date().getTime();
            this.sprite = (data as any).sprite.x2.image + '?t=' + new Date().getTime();*!/
            const json = {};
            this.splite = {};
            return;
            this.httpService.getFile(json).subscribe(result => {
              this.splite = result;
            }, error => {
              this.utils.toError(error);
            });
          },
          error => {
            this.utils.toError(error);
          }
        );*/
    }, error => {
      toError(error);
    });


  }

  public beforeChange($event: any) {
    const parent = document.getElementById($event.panelId + '-header');
    if ($event.nextState) {
      this.render2.addClass(parent.children[0].children[0].children[1], 'ngb-sort-up');
    } else {
      this.render2.removeClass(parent.children[0].children[0].children[1], 'ngb-sort-up');
    }

  }
}
