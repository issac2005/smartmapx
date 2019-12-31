import {
  Component,
  ElementRef,
  EventEmitter, HostListener,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import {DragulaService} from 'ng2-dragula';
import {SmxTreeService} from './smx-tree.service';
import {HttpService} from '../../s-service/http.service';
import {toError} from '../../smx-component/smx-util';
import {PopueComponent} from '../../data/modal/data-popue.component';
import {SmxModal} from '../../smx-component/smx-modal/directive/smx-modal';
import {AppService} from '../../s-service/app.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';

@Component({
  selector: 'smx-tree-node',
  templateUrl: './smx-tree-node.component.html',
  styleUrls: ['./smx-tree-node.component.scss']
})
export class SmxTreeNodeComponent implements OnInit, OnChanges {
  dropEvent: any;
  mouseEvent: any;
  selectGroup: any;
  selectLayer: any = [];
  @Input() tree_id: any;
  @Input() treeNode: any;
  @Input() grade: any;
  @Input() last: any;
  @Input() editable: boolean;
  @Input() map: any;
  @Input() mapId: any;
  @Output() treeNodeChange: EventEmitter<any> = new EventEmitter();
  union_layer: any;
  layer_id: any;

  /*视图选择装饰器函数(对应模板`<div class='tree-group'>`)*/
  // @ViewChildren('tree-group') unclick: QueryList<ElementRef>;
  @ViewChildren('tree-group') unclick: QueryList<ElementRef>;

  /*监听dom*/
  @HostListener('document:click', ['$event']) bodyClick(e) {
    if (getTrigger(this.unclick, 'iconStyle') && this.selectGroup) {
      this.change_group_name1(this.selectGroup);
      this.selectGroup.dbclick = false;
      this.selectGroup = null;
    }

    function getTrigger(queryList, className?) {
      let flag = true;
      (<HTMLElement[]> e.path).forEach((i) => {
        flag && queryList.forEach(el => {
          i.isEqualNode && i.isEqualNode(el.nativeElement) && (flag = false);
        });
        flag && i.className && i.className.indexOf && i.className.indexOf(className) > -1 && (flag = false);
      });
      return flag;
    }
  }

  constructor(private dragulaService: DragulaService,
              private zone: NgZone,
              private appService: AppService,
              private modalService: SmxModal,
              private httpService: HttpService,
              private toastService: ToastService,
              private groupService: SmxTreeService) {
    this.dropEvent = dragulaService.dropModel('VAMPIRES').subscribe((value: any) => {
    });
    /**
     * 鼠标监听事件
     */
    /*this.mouseEvent = this.appService.mouseEventEmitter.subscribe((value: any[]) => {
      console.log(111);
     /!* if (this.test) {
        this.test = false;
        document.getElementById('test').blur();
        this.change(this.layerInfo.metadata.name);
      }*!/
    });*/
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  change_group_name(item: any) {
    this.selectGroup = item;
    if (item.allow_open) {
      item.dbclick = true;
    }
  }

  change_group_name1(item: any) {
    const postData = {
      layer_group_id: item.id,
      name: item.name ? item.name : '图层组'
    };
    this.httpService.getData(postData, true, 'execute', 'c92c14e0-09d2-446f-aab1-4c5e8c74bfd6', 'em', 'e21m')
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          if (!item.name) {
            item.name = data.data.root[0].name;
          }
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);
          this.toastService.toast(toastCfg);
        },
        error => {
          toError(error);
        }
      );
    item.dbclick = false;
  }

  changes(event: any) {
    this.zone.run(() => {
      this.treeNodeChange.emit(event);
      this.treeNode = event;
    });
  }

  select_layer(item: any, event, index) {
    if (event.target.checked) {
      item.checked = true;
      item.select = true;
    } else {
      item.checked = false;
      item.select = false;
    }
    if ((index - 1) < 0) {
      item.layers.metadata.previous = null;
    } else if (this.treeNode[index - 1].group) {
      this.find_layer(this.treeNode[index - 1]);
      // console.log(this.);
    } else {
      item.layers.metadata.previous = this.treeNode[index - 1].layers.id;
    }
    this.groupService.checked.emit(item);
  }

  // 查找分组时图层前置图层在图层组中的情况
  find_layer(tree) {
    const child = tree.children[tree.children.length - 1];
    if (child.group) {
      this.find_layer(child);
    } else {
      return child;
    }
  }

  split_layer(item, event) {
    this.groupService.split.emit(item);
    setTimeout(() => {
      if (item.allow_open || item.juhetu) {
        this.selectLayer = this.select_group_layer(item.children);
      } else {
        this.selectLayer = [];
      }
      this.groupService.change.emit({
        type: 'selectGroup',
        checked: this.selectLayer,
      });
    }, 100);
  }

  /**
   * 选中图层组，组中图层默认选中
   * */
  select_group_layer(tree) {
    let selectLayer = [];
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].group) {
        tree[i].select = true;
        selectLayer = selectLayer.concat(this.select_group_layer(tree[i].children));
      } else {
        selectLayer.push(tree[i]);
        tree[i].select = true;
        tree[i].checked = true;
      }
    }
    return selectLayer;
  }

  show_layer(item, event) {
    this.layer_id = item.layers.id;
    // if (!event.shiftKey) {
    //   for (let i = 0; i < this.treeNode.length; i ++) {
    //     this.treeNode[i].select = false;
    //   }
    // }
    this.groupService.selected.emit({layer: item, event: event});
  }

  shift_select(event: any) {
    console.log(event.shiftKey);
  }

  show_group(item: any, event: any) {
    event.stopPropagation();
    if (item.allow_open) {
      item.close = !(item.close);
    }
    // console.log(item);
  }

  /**
   * 流向图显隐 */
  hideFlowGrap(layer: any) {
    layer.metadata.showflowgraph = false;
    this.map.hideEcharts(layer);
    this.hideLayer(layer, false, false);
  }

  showFlowGrap(layer: any) {
    layer.metadata.showflowgraph = true;
    this.map.showEcharts(layer);
    this.showLayer(layer, false, true);
  }

  // 图层显示、隐藏
  showLayer(item: any, group: boolean, show: boolean) {
    let postData, layertype, id, visibility, length;
    if (group) {
      postData = [];
      if (item.juhetu) {
        length = 1;
      } else {
        length = item.length;
      }
      for (let i = 0; i < length; i++) {
        if (item[i].layers.metadata.flowgraph) {
          item[i].layers.metadata.showflowgraph = true;
        }
        if (item[i].layers.metadata.reference_type) {
          layertype = '1'; // 引用图层
          id = item[i].layers.metadata.instance_layer_id;
          visibility = 'visible';
        } else {
          layertype = '10'; // 复制自定义图层
          id = item[i].layers.metadata.layer_style_id;
          visibility = item[i].layers;
          if (!visibility.layout) {
            visibility.layout = {};
          }
          visibility.layout.visibility = 'visible';
        }
        postData.push({
          id: id,
          layer_type: layertype,
          visibility: visibility
        });
      }
      if (item[0].layers.metadata.grouping) {
        const layers = [];
        for (let i = 0; i < item.length; i++) {
          if (!item[i].layers.layout) {
            item[i].layers.layout = {};
          }
          item[i].layers.layout.visibility = 'visible';
          layers.push(item[i].layers);
        }
        postData[0].visibility = layers;
      }
    } else {
      if (item.metadata.flowgraph) {
        item.metadata.showflowgraph = true;
      }
      if (item.metadata.reference_type) {
        layertype = '1'; // 引用图层
        // const oind = this.listItem.indexOf(item);
        id = item.metadata.instance_layer_id;
        visibility = 'visible';
      } else {
        layertype = '10'; // 复制自定义图层
        id = item.metadata.layer_style_id;
        visibility = item;
        if (!visibility.layout) {
          visibility.layout = {};
        }
        visibility.layout.visibility = 'visible';
      }
      postData = [{
        id: id,
        layer_type: layertype,
        visibility: visibility
      }];
    }
    this.httpService.getData(postData, true, 'execute', 'reviseLayerVisibility', 'em', 'em')
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }

          if (group) {
            for (let i = 0; i < item.length; i++) {
              if (item[i].layers.layout === undefined) {
                item[i].layers.layout = {};
                item[i].layers.layout['visibility'] = 'visible';
                this.map.setLayoutProperty(item[i].layers.id, 'visibility', 'visible');
              } else {
                item[i].layers.layout['visibility'] = 'visible';
                this.map.setLayoutProperty(item[i].layers.id, 'visibility', 'visible');
              }
              if (item[i].layers.metadata.flowgraph) {
                this.map.showEcharts(item[i].layers);
              }
            }
            show = true;
          } else {
            if (item.metadata.grouping) { // 如果有关联图层（统计图）

            } else {
              if (item.layout === undefined) {
                item.layout = {};
                item.layout = {'visibility': 'visible'};
                this.map.setLayoutProperty(item.id, 'visibility', 'visible');
              } else {
                item.layout['visibility'] = 'visible';
                this.map.setLayoutProperty(item.id, 'visibility', 'visible');
              }
            }
            if (item.metadata.flowgraph) {
              this.map.showEcharts(item);
            }
          }
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);
          this.toastService.toast(toastCfg);
        },
        error => {
          toError(error);
        }
      );
  }

  /**
   * 图层隐藏功能
   * 图层和图层组调用
   * */
  hideLayer(item: any, group: boolean, hide: boolean) {
    let postData, layertype, id, visibility, length;
    if (group) {
      postData = [];
      if (item[0].layers.metadata.grouping) {
        length = 1;
      } else {
        length = item.length;
      }
      for (let i = 0; i < length; i++) {
        if (item[i].layers.metadata.flowgraph) {
          item[i].layers.metadata.showflowgraph = false;
        }
        if (item[i].layers.metadata.reference_type) {
          layertype = '1'; // 引用图层
          id = item[i].layers.metadata.instance_layer_id;
          visibility = 'none';
        } else {
          layertype = '10'; // 复制自定义图层
          id = item[i].layers.metadata.layer_style_id;
          visibility = item[i].layers;
          if (!visibility.layout) {
            visibility.layout = {};
          }
          visibility.layout.visibility = 'none';
        }
        postData.push({
          id: id,
          layer_type: layertype,
          visibility: visibility
        });
      }
      if (item[0].layers.metadata.grouping) {
        const layers = [];
        for (let i = 0; i < item.length; i++) {
          if (!item[i].layers.layout) {
            item[i].layers.layout = {};
          }
          item[i].layers.layout.visibility = 'none';
          layers.push(item[i].layers);
        }
        postData[0].visibility = layers;
      }
    } else {
      if (item.metadata.flowgraph) {
        item.metadata.showflowgraph = false;
      }
      if (item.metadata.reference_type) {
        layertype = '1'; // 引用图层
        id = item.metadata.instance_layer_id;
        visibility = 'none';
      } else {
        layertype = '10'; // 复制自定义图层
        id = item.metadata.layer_style_id;
        visibility = item;
        if (!visibility.layout) {
          visibility.layout = {};
        }
        visibility.layout.visibility = 'none';
      }
      postData = [{
        id: id,
        layer_type: layertype,
        visibility: visibility
      }];
    }

    this.httpService.getData(postData, true, 'execute', 'reviseLayerVisibility', 'em', 'em')
      .subscribe(
        (data: any) => {
          const self = this;
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          if (group) {
            for (let i = 0; i < item.length; i++) {
              if (item[i].layers.layout === undefined) {
                item[i].layers.layout = {};
                item[i].layers.layout['visibility'] = 'none';
                this.map.setLayoutProperty(item[i].layers.id, 'visibility', 'none');
              } else {
                item[i].layers.layout['visibility'] = 'none';
                this.map.setLayoutProperty(item[i].layers.id, 'visibility', 'none');
              }
              if (item[i].layers.metadata.flowgraph) {
                this.map.hideEcharts(item[i].layers);
              }
            }
            hide = false;
          } else {
            if (item.metadata.grouping) { // 如果有关联图层（统计图）

            } else {
              if (item.layout === undefined) {
                item.layout = {};
                item.layout['visibility'] = 'none';
                this.map.setLayoutProperty(item.id, 'visibility', 'none');
              } else {
                item.layout['visibility'] = 'none';
                this.map.setLayoutProperty(item.id, 'visibility', 'none');
              }
            }
            if (item.metadata.flowgraph) {
              this.map.hideEcharts(item);
            }
          }
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '设置成功!', 2000);
          this.toastService.toast(toastCfg);
          // this.appService.layerEditorEventEmitter.emit([this.listItem[oind], oind]);
        },
        error => {
          toError(error);
        }
      );
  }

  // 删除图层
  deleteLayer(item: any) {
    // const number = this.listItem.indexOf(item);

    const postData = {
      instance_layer_id: item.metadata.instance_layer_id
    };
    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.type = 11;
    modalRef.componentInstance.keyConfig = {
      title: '删除图层',
      view: '删除图层将不可恢复，确定要删除图层?'
    };
    modalRef.result.then((result) => {
      this.httpService.getData(postData, true, 'execute', 'aa8bae0c-aaca-4f61-bf1c-8dec9d40ac61', '')
        .subscribe(
          (data: any) => {

            /* 流向图删除 */
            if (item.metadata.flowgraph) {
              this.map.removeEcharts();
            }
            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }
            /*if (item.id === this.layerId) {
              // 关闭详情面板
              this.panelShow = false;
            }
            const oind = this.listItem.indexOf(item);
            if (item.metadata.grouping) {
              this.listItem.splice(oind, 3);
            } else {
              this.listItem.splice(oind, 1);
            }*/
            for (let i = 0; i < this.treeNode.length; i++) {
              if (this.treeNode[i].layers && (this.treeNode[i].layers.id === item.id)) {
                this.treeNode.splice(i, 1);
              }
            }
            for (let m = 0; m < this.treeNode.length; m++) {
              this.treeNode[m].list = m;
            }
            // this.map.removeLayer(item.id);
            // this.map.setStyle(this.mapJson, {diff: true});
            this.groupService.change.emit({
              type: 'remove',
              layer_id: item.id,
            });
            this.map.fire('layerDelete', {
              layers: [item]
            });
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 2000);
            this.toastService.toast(toastCfg);
          },
          error => {
            toError(error);
          }
        );
    }, (reason) => {

    });
  }


  // 复制图层
  copyLayer(item: any) {
    // 判断是否为引用图层
    if (item.metadata.reference_type) {
      const toastCfg = new ToastConfig(ToastType.ERROR, '', '引用图层不可复制', 2000);
      this.toastService.toast(toastCfg);
      return;
    }

    this.addLayer(item, true, false);
  }

  /**
   * 聚合图复制
   * */
  juhetuCopy(item: Object) {
    const postData = {
      layer_id: item[0].layers.metadata.layer_id,
      layer_style_id: item[0].layers.metadata.layer_style_id,
      map_id: this.mapId,
      reference_type: 10
    };
    this.httpService.getData(postData, true, 'execute',
      '2849943a-f5f4-4d79-bd24-27f1ced9dcea', '')// 1.请求的参数 2.是否带token值 3，模块分类 4，路径方式 (数字地址tag中不能加em)
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          if (data.data.layer_style_id === 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '此图层已存在', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          const layers = [];
          const info = JSON.stringify(item);
          const old_item = JSON.parse(info);
          for (let i = 0; i < old_item.length; i++) {
            old_item[i].layers.id = data.data.instance_layer_id + i;
            old_item[i].layers.metadata.instance_layer_id = data.data.instance_layer_id;
            old_item[i].layers.metadata.layer_style_id = data.data.layer_style_id;
            layers.push(old_item[i].layers);
          }
          this.groupService.change.emit({
            type: 'juhetu_copy',
            data: layers
          });
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '复制成功！', 2000);
          this.toastService.toast(toastCfg);
        },
        error => {
          toError(error);
        }
      );
  }

  // 复制图层
  addLayer(item: any, isCustom: any, group: boolean) {
    let referenceType;
    if (isCustom) {
      referenceType = 10;
    } else {
      referenceType = 1;
    }
    let postData;
    if (group) {
      postData = [];
      const data = [];
      for (let i = 0; i < item.length; i++) {
        data.push(item[i].layers);
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i].metadata.reference_type) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '选中图层中的引用图层不能复制!', 2000);
          this.toastService.toast(toastCfg);
          item.splice(i, 1);
        } else if (data[i].metadata.flowgraph) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '选中图层中的流向图不能复制!', 2000);
          this.toastService.toast(toastCfg);
          item.splice(i, 1);
        } else {
          postData.push({
            layer_id: data[i].metadata.layer_id,
            layer_style_id: data[i].metadata.layer_style_id,
            map_id: this.mapId,
            reference_type: referenceType
          });
        }
      }
      if (postData.length < 1) {
        return;
      }
    } else {
      postData = {
        layer_id: item.metadata.layer_id,
        layer_style_id: item.metadata.layer_style_id,
        map_id: this.mapId,
        reference_type: referenceType
      };
    }
    this.httpService.getData(postData, true, 'execute',
      '2849943a-f5f4-4d79-bd24-27f1ced9dcea', '')// 1.请求的参数 2.是否带token值 3，模块分类 4，路径方式 (数字地址tag中不能加em)
      .subscribe(
        (data: any) => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          if (data.data.layer_style_id === 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '此图层已存在', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.groupService.change.emit({
            type: 'copy',
            data: data.data,
            item: item,
            group: group
          });
        },
        error => {
          toError(error);
        }
      );
  }

  /**
   * 最佳视野************************
   * */
  bestCenter(layer_style: any) {
    if (layer_style.metadata.status === 10) {
      return;
    }
    const postData = {layer_style_id: layer_style.metadata.layer_style_id};
    this.httpService.getData(postData, true, 'execute', 'getDataBox', 'em', 'em')// 1.请求的参数 2.是否带token值 3，模块分类 4，路径方式
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            const box = data.data.slice(4, -1).split(',');
            const bounds = [box[0].split(' '), box[1].split(' ')];
            if (this.getLayerZoom(layer_style)[0] > this.getBestZoom(bounds)[0]) {
              const lng = (Number(bounds[0][0]) + Number(bounds[1][0])) / 2;
              const lat = (Number(bounds[0][1]) + Number(bounds[1][1])) / 2;
              this.map.jumpTo({center: [lng, lat], zoom: this.getLayerZoom(layer_style)[0]});
            } else {
              this.map.fitBounds(bounds, {
                padding: {top: 50, bottom: 50, left: 50, right: 50},
                animate: false
              });
            }
          }
        },
        error => {
          toError(error);
        }
      );
  }

  /*getBestCenter() {
    const layer_style = this.listItem[this.listItem.length - 1];
    if (this.bounds) {
      if (this.getLayerZoom(layer_style)[0] > this.getBestZoom(this.bounds)[0]) {
        const lng = (Number(this.bounds[0][0]) + Number(this.bounds[1][0])) / 2;
        const lat = (Number(this.bounds[0][1]) + Number(this.bounds[1][1])) / 2;
        this.map.jumpTo({center: [lng, lat], zoom: this.getLayerZoom(layer_style)[0]});
      } else {
        this.map.fitBounds(this.bounds, {
          padding: {top: 50, bottom: 50, left: 50, right: 50},
          animate: false
        });
      }
    } else {
      this.bestCenter(layer_style);
    }
  }
*/
  getBestZoom(bound: any) {
    const grade = [];
    let zoom = [];
    for (let m = 0; m < 23; m++) {
      grade.push(((85.05113 + 85.05113) / 512) * Math.pow(2, -m));
    }
    const dimensions = this.map._containerDimensions();
    const width = dimensions[0];
    const height = dimensions[1];
    const dissX = Math.abs(bound[0][0] - bound[1][0]) / width;
    const dissY = Math.abs(bound[0][1] - bound[1][1]) / height;
    const grade1 = Math.min(dissX, dissY);
    for (let i = 0; i < grade.length; i++) {
      if (grade[i] > grade1 && grade1 > grade[i + 1]) {
        zoom = [i, Number(i + 1)];
      } else {
      }
    }
    return zoom;
  }

  getLayerZoom(layer) {
    const min = layer.minzoom;
    const max = layer.maxzoom;
    const zoom = [min ? min : 0, max ? max : 24];
    return zoom;
  }

  /**
   * 点击图层组时触发
   * */
  closeGroup() {
    this.groupService.change.emit({
      type: 'loop',
    });
  }

  /**
   * 查看一个组中有多少哥图层
   * */
  loop_child(tree) {
    let length = 0;
    for (let i = 0; i < tree.children.length; i++) {
      if (tree.children[i].group) {
        length += this.loop_child(tree.children[i]);
      } else {
        length++;
      }
    }
    return length;
  }

  /**
   * 聚合图操作方法
   * */
  juhetuChange(value: any, type: any) {
    this.groupService.change.emit({
      type: 'juhetu',
      info: {
        type: type,
        value: value,
      }
    });
  }
}
