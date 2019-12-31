import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {DragulaService} from 'ng2-dragula';
import {SmxTreeService} from './smx-tree.service';
import {PopueComponent} from '../../data/modal/data-popue.component';
import {SmxModal} from '../../smx-component/smx-modal/directive/smx-modal';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {LocalStorage} from '../../s-service/local.storage';
import {Subscription} from 'rxjs';
import {SmxTreeNodeComponent} from './smx-tree-node.component';
import {SmxDataSelectModalComponent} from '../../smx-unit/smx-unit.module';
import * as jwt_decode from '@smx/smartmapx-jwt-decode';

@Component({
  selector: 'smx-tree',
  templateUrl: './smx-tree.component.html',
  styleUrls: ['./smx-tree.component.scss']
})
export class SmxTreeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() map: any;
  @Input() maplayer: any;
  @Input() mapId: any;
  @Input() mapJson: any;
  @Input() panelShow: any;
  @ViewChild(SmxTreeNodeComponent, {static: false}) smxTreeNode: SmxTreeNodeComponent;
  @Output() layerClick: EventEmitter<any> = new EventEmitter();
  firstInit: any = true;
  jwt: any;
  layers: any;
  initJson: any = [];
  jsonTree: any;
  dropEvent: any;
  dropEnd: any;
  nestIndex: number;
  editable: any = false;
  copy_layers: any = [];     //复制图层的信息
  checked_layer: any = [];   //选中图层的信息
  split_value: any;    //拆分组的信息
  select_layer: any = [];
  union_icon: any = false;
  show_hide: any = true;
  selectAll: any = false;
  layerMask: boolean;

  des_checked: any;
  des_selected: any;
  des_split: any;
  node_change: any;
  subs = new Subscription();

  constructor(private dragulaService: DragulaService,
              private groupService: SmxTreeService,
              private modalService: SmxModal,
              private httpService: HttpService,
              private toastService: ToastService,
              private ls: LocalStorage) {
    this.dragulaService.createGroup('VAMPIRESS', {
      direction: 'horizontal',
      moves: (el, source, handle) => handle.className === 'group-handle'
    });

    /**
     * 对于嵌套组超过两级的分组，不能再拖入分组
     * */
    this.dragulaService.createGroup('VAMPIRES', {
      direction: 'horizontal',
      accepts: (el, target, source, sibling) => {
        this.nestIndex++;
        if ((el as any).lang) {
          if ((el as any).align === 'false' && (target as any).lang === '2') {
            if (this.nestIndex % 100 === 0) {
              console.log('图层组嵌套不能超过3级');
            }
            return false;
          } else {
            if ((target as any).lang === '3') {
              console.log('向3级图层');
              return false;
            } else {
              return true;
            }
          }
        } else {
          return true;
        }
      },
      moves: (el, source, handle) => {
        return (el as any).className !== 'false ng-star-inserted';
      }
    });

    /**
     * 每进行拖动就会触发事件，对拖动的图层/图层组分别做不同的处理
     * 同时对于他们的索引做更新
     * */
    this.dropEvent = dragulaService.dropModel('VAMPIRES').subscribe((value: any) => {
      let parent_id = '';
      let init_grade = null;
      const source_parent_id = value.item.parent_id;
      const target_parent_id = [value.targetModel[0].parent_id, value.targetModel[1].parent_id];
      const target_grade = [value.targetModel[0].init_grade, value.targetModel[1].init_grade];
      for (let i = 0; i < target_grade.length; i++) {
        if (!target_grade[i]) {
          target_grade[i] = (value.targetModel[i].grade) - 1;
        }
      }
      /**
       * 判断拖入分组的parent_id,给拖入的图层或图层组的parent_id赋值
       * */
      const index = target_parent_id.indexOf(source_parent_id);
      if (index === -1) {
        parent_id = target_parent_id[0];
        init_grade = target_grade[0];
      } else if (index === 1) {
        parent_id = target_parent_id[0];
        init_grade = target_grade[0];
      } else {
        parent_id = target_parent_id[1];
        init_grade = target_grade[1];
      }
      /**
       * 重置索引
       * */
      for (let i = 0; i < value.sourceModel.length; i++) {
        value.sourceModel[i].list = i;
      }
      for (let m = 0; m < value.targetModel.length; m++) {
        value.targetModel[m].list = m;
      }
      setTimeout(() => {
        const old_parent_id = JSON.parse(JSON.stringify(value.item.parent_id));
        this.changeState(value, parent_id);
        value.item.parent_id = parent_id;
        if (!value.item.group) {
          value.item.init_grade = init_grade;
        }
        this.move_layer(value);
      }, 10);
    });
    this.des_checked = this.groupService.checked.subscribe((value: any) => {
      if (value.checked) {
        this.checked_layer.push(value);
      } else {
        for (let i = 0; i < this.checked_layer.length; i++) {
          if (value.layers.id === this.checked_layer[i].layers.id) {
            this.checked_layer.splice(i, 1);
          }
        }
      }
      this.union_icon = false;
      this.selectAll = false;
      this.layerShowIcon();
    });

    /**
     * 点击分组触发的事件（清除单图层选中）
     * */
    this.des_split = this.groupService.split.subscribe((value: any) => {
      /**
       * 聚合图特殊处理
       * */
      if (value.juhetu) {
        this.layerClick.emit({type: 'click', item: value.children[0]});
      }
      this.union_icon = true;
      this.split_value = value;
      this.select_group(this.jsonTree, this.split_value);
      for (let i = 0; i < this.copy_layers.length; i++) {
        this.copy_layers[i].select = false;
        this.copy_layers[i].checked = false;
      }
      this.selectAll = false;
    });

    /**
     * 单图层选中事件
     * 清除shift影响，向父组件发射点击事件
     * */
    this.des_selected = this.groupService.selected.subscribe((value: any) => {
      this.union_icon = false;
      this.split_value = null;
      this.selectAll = false;
      this.select_group(this.jsonTree, value.layer.layers);
      if (!value.event.shiftKey || !this.select_layer) {
        this.select_layer = [];
        for (let i = 0; i < this.copy_layers.length; i++) {
          this.copy_layers[i].select = false;
          this.copy_layers[i].checked = false;
        }
        for (let i = 0; i < this.copy_layers.length; i++) {
          if (this.copy_layers[i].layers.id === value.layer.layers.id) {
            this.copy_layers[i].select = true;
            this.copy_layers[i].checked = true;
          }
        }
        this.checked_layer = [];
        this.select_layer.push(value.layer);
        this.layerClick.emit({type: 'click', item: value.layer});
        this.checked_layer.push(value.layer);
      } else {
        this.checked_layer = [];
        this.select_layer.push(value.layer);
        const index = [];
        for (let i = 0; i < this.copy_layers.length; i++) {
          for (let m = 0; m < this.select_layer.length; m++) {
            if (this.copy_layers[i].layers.id === this.select_layer[m].layers.id) {
              index.push(i);
            }
          }
        }
        const min = Math.min.apply(null, index);
        const max = Math.max.apply(null, index);
        for (let i = min; i <= max; i++) {
          if (this.copy_layers[i].layers.metadata.grouping) {
            i += 2;
            continue;
          }
          if (!this.copy_layers[i].layers.metadata.basemap) {
            this.copy_layers[i].select = true;
            this.copy_layers[i].checked = true;
            if (i === 0) {
              this.copy_layers[i].layers.metadata.previous = null;
            } else if (this.copy_layers[i].group) {
            } else {
              this.copy_layers[i].layers.metadata.previous = this.copy_layers[i - 1].layers.id;
            }
            this.checked_layer.push(this.copy_layers[i]);
          }
        }
      }
      this.layerShowIcon();
    });

    /**
     * 拖拽成功后触发事件，拖动后还在原地则不触发*/
    this.dropEnd = dragulaService.dragend('VAMPIRES').subscribe((value: any) => {
      this.nestIndex = 0;
    });
    this.node_change = this.groupService.change.subscribe((value: any) => {
      if (value.type === 'remove') {
        this.sigle_remove(value);
      } else if (value.type === 'copy') {
        this.copyLayer(value);
      } else if (value.type === 'loop') {
        const _that = this;
        this.loop_json(this.jsonTree, function(tree) {
          if (tree.dbclick) {
            _that.smxTreeNode.change_group_name1(tree);
            tree.dbclick = false;
          }
        });
      } else if (value.type === 'selectGroup') {
        this.checked_layer = value.checked;
      } else if (value.type === 'juhetu') {
        this.juhetuChange(value.info);
      } else if (value.type === 'juhetu_copy') {
        /**
         * 对添加的聚合图做特殊处理，添加后给他默认分组*/
        this.polymerization(value.data);
      }
    });
  }

  ngOnDestroy(): void {
    this.dragulaService.destroy('VAMPIRESS');
    this.dragulaService.destroy('VAMPIRES');
    // this.groupService.selected.unsubscribe();
    this.des_checked.unsubscribe();
    this.des_selected.unsubscribe();
    this.des_split.unsubscribe();
    this.dropEnd.unsubscribe();
    this.dropEvent.unsubscribe();
    this.node_change.unsubscribe();
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && this.maplayer && this.mapJson && this.firstInit) {
      this.firstInit = false;
      this.layers = this.mapJson.layers;
      this.initJson = this.mapJson.metadata.groups;
      for (let i = 0; i < this.initJson.length; i++) {
        if (!this.initJson[i].parent_id) {
          this.initJson[i].parent_id = 'map_group_id';
          this.initJson[i].grade = 2;
        } else {
          this.initJson[i].grade = 3;
        }
        if (this.initJson[i].id === 'map_group_id') {
          this.initJson[i].grade = 1;
        }
      }
      for (let i = 0; i < this.initJson.length; i++) {
        const index = [];
        for (let m = 0; m < this.layers.length; m++) {
          /**若instance_layer_id没有匹配到的话直接使用图层的id*/
          if (this.initJson[i].start === this.layers[m].metadata.instance_layer_id || (this.initJson[i].start === this.layers[m].id)) {
            index.push(m);
          }
          if ((this.initJson[i].end === this.layers[m].metadata.instance_layer_id) || (this.initJson[i].end === this.layers[m].id)) {
            index.push(m);
          }
        }
        /**若分组为聚合图，则index应该能匹配到4个图层,以此来区分是否为聚合图*/
        if (index.length > 2) {
          this.initJson[i].juhetu = true;
        }
        this.initJson[i].index = [index[0], index[index.length - 1]];
      }
      // console.log(this.initJson);
      this.copy_layers = [];
      for (let i = 0; i < this.layers.length; i++) {
        this.copy_layers.push({
          layers: this.layers[i],
          name: this.layers[i].metadata.name,
          init_grade: 0
        });
      }
      this.jwt = this.ls.get('id_token');
      const decodedJwt = this.jwt ? jwt_decode(this.jwt) : false;
      for (let i = 0; i < this.initJson.length; i++) {
        const num = this.initJson[i].index;
        for (let m = num[0]; m <= num[1]; m++) {
          if (this.initJson[i].grade > this.copy_layers[m].init_grade) {
            this.copy_layers[m].parent_id = this.initJson[i].id;
            this.copy_layers[m].init_grade = this.initJson[i].grade;
            this.copy_layers[m].index = m;
            this.copy_layers[m].group = false;
            this.copy_layers[m].checked = false;
            this.copy_layers[m].select = false;
            if (JSON.parse(decodedJwt.data).user_id === 'fm_system_user_root') {
              this.copy_layers[m].copy = false;
            } else {
              this.copy_layers[m].copy = this.copy_layers[m].layers.metadata.basemap;
            }
          }
        }
      }
      const show_json = this.arrayToJson(this.initJson, 'parent_id', 0);
      const ser_json = this.json_serialize(show_json);
      this.jsonTree = this.jsonTrees(ser_json, this.copy_layers);
      this.loop_json(this.jsonTree, function(tree) {
        /**针对聚合图处理*/
        if (tree.children.length > 0 && !tree.children[0].group) {
          if (tree.children[0].layers.metadata && tree.children[0].layers.metadata.grouping) {
            tree.allow_open = true;
            tree.juhetu = true;
          }
        }
      });
    }
  }

  /**
   *生成最终jsonTrees
   */
  jsonTrees(show_json, copy_layers) {
    //循环每个分组
    for (let i = 0; i < show_json.length; i++) {
      const array = [];
      //分组为第二层
      if (show_json[i].children && show_json[i].children.length > 0) {
        const min = show_json[i].index[0];
        const max = show_json[i].index[1];
        //循环分组中包括的图层
        for (let m = min; m <= max; m++) {
          if (copy_layers[m].parent_id === show_json[i].id) {
            array.push(copy_layers[m]);
          }
        }
        //向图层组中添加相应子图层
        show_json[i].children = this.partterns(show_json[i].children, array);
        //对分组中的分组再进行相同的操作
        this.jsonTrees(show_json[i].children, copy_layers);
      }
      //分组为最后一层
      if (show_json[i].children && show_json[i].children.length < 1) {
        const min = show_json[i].index[0];
        const max = show_json[i].index[1];
        for (let m = min; m <= max; m++) {
          if (copy_layers[m].parent_id === show_json[i].id) {
            array.push(copy_layers[m]);
          }
        }
        for (let j = 0; j < array.length; j++) {
          array[j].list = j;
        }
        show_json[i].children = array;
      }
    }
    return show_json;
  }

  /**
   *对从metadata中拿到的图层结构解析为tree结构
   */
  arrayToJson(data, parent_id, grade) {
    const result = [];
    let temp;
    grade++;  //区分分组的等级
    for (let i = 0; i < data.length; i++) {
      if (data[i].parent_id === parent_id) {
        //定义每个组拥有的属性及赋值
        const obj = {
          id: data[i].id,         //图层组id
          parent_id: parent_id,         //图层组父节点（高级别图层组）id
          name: data[i].name,     //图层组名称
          children: [],           //存放子图层
          index: data[i].index,   //初始索引（主要在初始化用）；
          grade: grade,           //区分图层组级别
          last: false,            //判断是否为最后一级图层组
          group: true,            //判断是否为图层组（和后续图层结构有关）
          close: false,            //控制分组能否打开
          allow_open: data[i].allow_open,
          select: false,
          dbclick: false
        };
        //做循环操作
        temp = this.arrayToJson(data, data[i].id, grade);
        if (temp.length > 0) {
          obj.last = false;  //判断分组是否为最后一层结构
          obj.children = temp;
        } else if (grade === 1) {
          obj.last = false;
        } else {
          obj.last = true;
        }
        result.push(obj);
      }
    }
    return result;
  }

  /*序列化jsonTree*/
  json_serialize(tree: any) {
    tree = this.quickSort(tree, 'init');
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].children.length > 0) {
        tree[i].children = this.json_serialize(tree[i].children);
      }
    }
    //返回输入数组并去重
    return tree;
  }

  /**
   *像每个图层组中添加子图层/图层组并对其进行去重
   */
  partterns(data1, data2) {
    let array = [];
    for (let i = 0; i < data1.length; i++) {
      if (data2.length > 0) {
        for (let m = 0; m < data2.length; m++) {
          if (data2[m].index < data1[i].index[0]) {
            array.push(data2[m]);
            // data2.shift();
          } else {
            array.push(data1[i]);
            if ((data1.length - 1) === i) {
              array = array.concat(data2.slice(m, data2.length));
            }
            break;
          }
        }
        if (data2[data2.length - 1].index < data1[i].index[0]) {
          array.push(data1[i]);
        }
      } else {
        array.push(data1[i]);
      }

    }
    //返回输入数组并去重
    return this.uniq(array);
  }

  /**
   *去重函数
   */
  uniq(array) {
    const temp = [];
    const tempObj = [];
    let index = 0;
    for (let i = 0; i < array.length; i++) {
      if (temp.indexOf(array[i].index) === -1) {
        array[i].list = index;
        temp.push(array[i].index);
        tempObj.push(array[i]);
        index++;
      }
    }
    return tempObj;
  }

  change_s(event) {
    this.jsonTree[0].children = event;
  };

  /**
   *获取每次图层变动后图层列表
   */
  getLayers(item: any) {
    let layers = [];
    for (let i = 0; i < item.length; i++) {
      if (item[i].children) {
        layers = layers.concat(this.getLayers(item[i].children));
      } else {
        layers.push(item[i].layers);
      }
    }
    return layers;
  }

  /**
   *获取每次图层变动后copy_layers
   */
  getCopyLayers(item: any) {
    let layers = [];
    for (let i = 0; i < item.length; i++) {
      if (item[i].children) {
        layers = layers.concat(this.getCopyLayers(item[i].children));
      } else {
        layers.push(item[i]);
      }
    }
    return layers;
  }

  /**
   *图层移动后各种参数的变更
   * 判断拖入的分组是否为最后一层分组，是：true  否： false
   */
  changeState(value: any, target_id) {
    const sourceIndex = Number(value.source.lang);
    const targetIndex = Number(value.target.lang);
    if (value.el.lang) {
      let parent_id = [];
      if (sourceIndex > targetIndex) {
        parent_id = [value.item.parent_id];
      } else if (sourceIndex < targetIndex) {
        parent_id = [target_id];
      } else {
        parent_id = [value.item.parent_id, target_id];
      }
      const data = this.jsonTree[0].children;
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < parent_id.length; j++) {
          if (data[i].group && (data[i].id === parent_id[j])) {
            let isLast = true;
            for (let m = 0; m < data[i].children.length; m++) {
              if (data[i].children[m].group) {
                isLast = false;
                break;
              }
            }
            if (isLast) {
              data[i].last = true;
            } else {
              data[i].last = false;
            }
          }
        }

      }
      value.item.grade = Number(value.target.lang) + 1;
      const index = Number(value.target.lang) + 1;
      if (value.item.group) {
        for (let n = 0; n < value.item.children.length; n++) {
          value.item.children[n].init_grade = index;
        }
      }
    }
  }

  /**
   * 对选中的图层进行分组
   * */
  union_layer() {
    if (this.split_value && this.split_value.juhetu) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '聚合图层组不可操作！', 3000);
      this.toastService.toast(toastCfg);
      console.log('聚合图层组不可操作');
      return;
    }
    if (this.checked_layer.length < 1) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择分组图层！', 3000);
      this.toastService.toast(toastCfg);
      console.log('请选择分组图层');
      return;
    }
    this.checked_layer = this.quickSort(this.checked_layer, 'check');
    const temp = [];
    for (let i = 0; i < this.checked_layer.length; i++) {
      if (temp.indexOf(this.checked_layer[i].parent_id) === -1) {
        temp.push(this.checked_layer[i].parent_id);
      }
    }
    if (temp.length > 1) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '不能对不同分组的图层进行编组！', 3000);
      this.toastService.toast(toastCfg);
      console.log('不能对不同分组的图层进行编组');
      return;
    }
    this.find_group(this.jsonTree, this.checked_layer[0].parent_id);
  }

  /**
   * 遍历整个jsonTree 找到被选中的图层
   * */
  find_group(tree, group_id) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].group) {
        if (tree[i].id === group_id) {
          if (tree[i].grade > 2) {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '图层组嵌套不能超过三级', 3000);
            this.toastService.toast(toastCfg);
            return;
          }
          const index = this.checked_layer[0].list;
          const params = [];
          for (let m = 0; m < this.checked_layer.length; m++) {
            params.push({
              'instance_layer_id': this.checked_layer[m].layers.metadata.instance_layer_id,
              'map_id': this.mapId,
              'previous': this.checked_layer[m].layers.metadata.previous
            });
          }
          let parent_layer_group_id = '';
          if (tree[i].grade < 2) {
            parent_layer_group_id = null;
          } else {
            parent_layer_group_id = tree[i].id;
          }

          const postData = {
            'instance_layer_ids': params,
            'name': '图层组',
            'parent_layer_group_id': parent_layer_group_id
          };
          this.httpService.getData(postData, true, 'execute', 'afcf5a3a-e61a-42ca-9ee6-5318649c17cf', 'em', '123')
            .subscribe((data: any) => {
                if (data.status < 0) {
                  const toastCfg1 = new ToastConfig(ToastType.ERROR, '', '分组失败，请稍后再试！', 3000);
                  this.toastService.toast(toastCfg1);
                  return;
                }
                tree[i].last = false;
                const newId = data.data.layer_group_id;
                const obj = {
                  id: newId,         //图层组id
                  parent_id: group_id,         //图层组父节点（高级别图层组）id
                  name: '',     //图层组名称
                  children: [],           //存放子图层
                  index: this.checked_layer[0].index,   //初始索引（主要在初始化用）；
                  grade: tree[i].grade + 1,           //区分图层组级别
                  last: true,            //判断是否为最后一级图层组
                  group: true,            //判断是否为图层组（和后续图层结构有关）
                  close: false,            //控制分组能否打开
                  list: 0,
                  allow_open: true,
                  dbclick: true
                };
                obj.children = this.checked_layer;
                for (let m = 0; m < this.checked_layer.length; m++) {
                  tree[i].children.splice(this.checked_layer[(this.checked_layer.length - 1) - m].list, 1);
                }
                for (let j = 0; j < obj.children.length; j++) {
                  obj.children[j].parent_id = newId;
                  obj.children[j].list = j;
                  obj.children[j].checked = false;
                  obj.children[j].select = false;
                  obj.children[j].init_grade = tree[i].grade + 1;
                }
                tree[i].children.splice(index, 0, obj);
                for (let m = 0; m < tree[i].children.length; m++) {
                  tree[i].children[m].list = m;
                }
                this.select_group(this.jsonTree, obj);
                this.split_value = obj;
                this.smxTreeNode.selectGroup = obj;
                this.union_icon = true;
                /*this.mapJson.layers = this.getLayers(this.jsonTree);
                this.map.setStyle(this.mapJson);*/
                this.updateMapStyle1();
                const length = postData.instance_layer_ids.length;
                let next_instance_layer_id = null;
                for (let m = 0; m < this.copy_layers.length; m++) {
                  if (this.copy_layers[m].layers.metadata.instance_layer_id === postData.instance_layer_ids[length - 1].instance_layer_id) {
                    if (m !== (this.copy_layers.length - 1)) {
                      next_instance_layer_id = this.copy_layers[m + 1].layers.metadata.instance_layer_id;
                    }
                  }
                }
                if (next_instance_layer_id) {
                  for (let j = 0; j < postData.instance_layer_ids.length; j++) {
                    this.map.moveLayer(postData.instance_layer_ids[j].instance_layer_id, next_instance_layer_id);
                  }
                } else {
                  for (let j = 0; j < postData.instance_layer_ids.length; j++) {
                    this.map.moveLayer(postData.instance_layer_ids[j].instance_layer_id);
                  }
                }
                this.checked_layer = [];
                this.select_layer = [];
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '图层分组成功!', 3000);
                this.toastService.toast(toastCfg);
              },
              error => {
              }
            );
          break;
        } else {
          if (!tree[i].last) {
            this.find_group(tree[i].children, group_id);
          }
        }
      }
    }
  }

  delete_select() {
    if (this.split_value && !this.split_value.juhetu) {
      if (this.split_value && !this.split_value.allow_open) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '引用分组不可操作！', 3000);
        this.toastService.toast(toastCfg);
        console.log('引用分组不可操作');
        return;
      }
    }
    this.delete_layers();
    this.union_icon = false;
    this.split_value = null;
  }

  /**
   *拆分图层组
   */
  split_layer() {
    if (this.split_value && this.split_value.juhetu) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '聚合图层组不可操作！', 3000);
      this.toastService.toast(toastCfg);
      console.log('聚合图层组不可操作');
      return;
    }
    if (!this.split_value.allow_open) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '引用分组不可操作！', 3000);
      this.toastService.toast(toastCfg);
      console.log('引用分组不可操作');
      return;
    }
    this.split_group(this.jsonTree, this.split_value);
  }

  split_group(tree, item) {
    const group_id = item.id;
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].group) {
        if (tree[i].id === group_id) {
          const params = {
            layer_group_id: group_id
          };
          this.httpService.getData(params, true, 'execute', 'b2a003de-6f5a-4ef6-b7b4-8cc2da09a4d2', 'em', '123')
            .subscribe((data: any) => {
                if (data.status < 0) {
                  const toastCfg1 = new ToastConfig(ToastType.ERROR, '', '拆分失败，请稍后再试！', 3000);
                  this.toastService.toast(toastCfg1);
                  return;
                }
                for (let j = 0; j < item.children.length; j++) {
                  item.children[j].parent_id = item.parent_id;
                  tree.splice(i + j, 0, item.children[j]);
                  if (j === (item.children.length - 1)) {
                    tree.splice(i + j + 1, 1);
                  }
                }
                for (let m = 0; m < tree.length; m++) {
                  tree[m].list = m;
                }
                this.union_icon = false;
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '图层组拆分成功!', 3000);
                this.toastService.toast(toastCfg);
                //console.log(tree);
              },
              error => {
              }
            );
        } else {
          if (!tree[i].last) {
            this.split_group(tree[i].children, item);
          }
        }
      }
    }
  }

  editor_layer() {
    if (this.editable) {
      this.editable = false;
      this.checked_layer = [];
      for (let i = 0; i < this.copy_layers.length; i++) {
        this.copy_layers[i].select = false;
        this.copy_layers[i].checked = false;
      }
    } else {
      this.editable = true;
    }
  }

  save_layer() {
    this.editable = false;
  }

  quickSort(arr, type) {
    //如果数组<=1,则直接返回
    if (arr.length <= 1) {
      return arr;
    }
    const pivotIndex = Math.floor(arr.length / 2);
    //找基准，并把基准从原数组删除
    const pivot = arr.splice(pivotIndex, 1)[0];
    //定义左右数组
    const left = [];
    const right = [];
    //比基准小的放在left，比基准大的放在right
    if (type === 'check') {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].list <= pivot.list) {
          left.push(arr[i]);
        } else {
          right.push(arr[i]);
        }
      }
    } else if (type === 'init') {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].index[0] <= pivot.index[0]) {
          left.push(arr[i]);
        } else {
          right.push(arr[i]);
        }
      }
    }
    // 递归
    return this.quickSort(left, type).concat([pivot], this.quickSort(right, type));
  }

  add_layer(layer: any) {
    this.jsonTree[0].children.push({
      checked: false,
      copy: false,
      group: false,
      index: this.jsonTree[0].children.length,
      layers: layer,
      list: this.jsonTree[0].children.length,
      name: layer.metadata.name,
      parent_id: 'map_group_id',
      select: false
    });
    // 加载雪碧图
    if (layer.metadata.sprite && (layer.metadata.sprite.length > 0)) {
      const needArr = [];
      for (let k of layer.metadata.sprite) {
        if (needArr.indexOf(k.url) === -1) {
          needArr.push(k.url);
        }
      }
      if (needArr.indexOf('/handler/sprite/sprite2') !== -1) {
        needArr.splice(needArr.indexOf('/handler/sprite/sprite2'), 1);
      }
      if (needArr.indexOf('') !== -1) {
        needArr.splice(needArr.indexOf(''), 1);
      }
      if (needArr.length > 0) {
        for (let m of needArr) {
          this.map.style.addSprite(m, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log('sprite成功!');
            }
          });
        }
      }
    }
    // ----
    this.map.addLayer(layer);
    this.updateMapStyle1();
  }

  // 添加图层
  openModal() {
    const key_config = {
      title: '添加图层',
      view: {
        showFilter: true, // 显示过滤框
        showCustom: true, // 显示自定义按钮
        showNum: true,
        tabs: [{
          title: '地理图层',
          id: 'layer_style_id',
          name: 'name',
          description: 'description',
          img: 'thumbnail',
          url: '1cbfa3b4-05cb-45df-a8af-702d270f3a7f',
          filter: '473c2477-2eb8-4303-bd02-3f7bab9cad51',
          tag: 200
        }, {
          title: '统计图层',
          id: 'layer_style_id',
          name: 'name',
          description: 'description',
          img: 'thumbnail',
          url: '1cbfa3b4-05cb-45df-a8af-702d270f3a7f',
          filter: '473c2477-2eb8-4303-bd02-3f7bab9cad51',
          tag: 10
        }, {
          title: '栅格图层',
          id: 'layer_style_id',
          name: 'name',
          description: 'description',
          img: 'thumbnail',
          url: '1cbfa3b4-05cb-45df-a8af-702d270f3a7f',
          filter: '473c2477-2eb8-4303-bd02-3f7bab9cad51',
          tag: 100
        }]
      }
    };

    const modalRef = this.modalService.open(SmxDataSelectModalComponent);
    modalRef.componentInstance.smxConfig = key_config;

    modalRef.result.then((result) => {
      if (result.checkedItem) {
        let custom;
        if (result.checkedItem.isCustom) {
          custom = 10;
        } else {
          custom = 1;
        }
        const paramData = {
          layer_id: result.checkedItem.layer_id,
          layer_style_id: result.checkedItem.layer_style_id,
          map_id: this.mapId,
          reference_type: custom
        };
        /* 判断是否存在流向图 */
        if (result.checkedItem.layer_statistics_id === '7154b538-3257-4c51-b1ec-cbfacafb05e5') {
          if (this.map.hasEcharts()) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '已存在流向图图层', 3000);
            this.toastService.toast(toastCfg);
            return;
          }
        }
        this.httpService.getData(paramData, true, 'execute', '2849943a-f5f4-4d79-bd24-27f1ced9dcea', '')
          .subscribe(
            (data: any) => {
              if ((data as any).status <= 0) {
                const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 3000);
                this.toastService.toast(toastCfg);
                return;
              }
              if (data.data.layer_style_id === '0') {
                const toastCfg = new ToastConfig(ToastType.ERROR, '', '此图层已存在', 3000);
                this.toastService.toast(toastCfg);
                return;
              }

              const layerParam = {
                layerStyleID: data.data.layer_style_id,
                themetype: result.tag === 0 ? '1' : result.tag === 1 ? '2' : '3',
                instance_layer_id: data.data.instance_layer_id,
                reference_type: custom
              };
              this.httpService.getData(layerParam, true, 'execute', 'getLayerStyle', 'em', 'em')
                .subscribe(
                  (res: any) => {
                    if (res.status < 0) {
                      return;
                    }
                    // 将数据库返回的图层对象放到图层列表数组中
                    for (const key in res.data.sources) {
                      if (key) {
                        this.mapJson.sources[key] = res.data.sources[key];
                      }
                      if (!this.map.getSource(key)) {
                        this.map.addSource(key, res.data.sources[key]);
                      }
                    }
                    if (res.data.layers[0].metadata.noSta) { // 非统计图层
                      res.data.layers[0].metadata.instance_layer_id = data.data.instance_layer_id;
                      // 给新添加的图层添加字段，用于图层选择小程序-刘超 20191106
                      res.data.layers[0].metadata.map_instance_layer_seq = data.data.instance_layer_id;
                      this.add_layer(res.data.layers[0]);
                    } else { // 统计图层
                      // 给新添加的图层添加字段，用于图层选择小程序-刘超 20191106
                      res.data.layers[0].metadata.map_instance_layer_seq = data.data.instance_layer_id;
                      if (res.data.layers[0].metadata.grouping) {
                        /**
                         * 对添加的聚合图做特殊处理，添加后给他默认分组*/
                        this.polymerization(res.data.layers);
                      } else {
                        this.add_layer(res.data.layers[0]);
                      }
                    }
                    // this.map.setStyle(this.mapJson);
                    const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '图层添加成功!', 3000);
                    this.toastService.toast(toastCfg);


                  }
                );
            },
            error => {
            }
          );
      } else {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '请查看是否存在已发布图层!', 3000);
        this.toastService.toast(toastCfg);
      }
    }, (reason) => {
    });
  }

  /**
   * 对添加的聚合图做特殊处理，加上默认分组
   * */
  polymerization(data: any) {
    const params = [{
      'instance_layer_id': data[0].metadata.instance_layer_id,
      'map_id': this.mapId,
      'previous': this.copy_layers[this.copy_layers.length - 1].layers.metadata.instance_layer_id
    }];
    const postData = {
      'instance_layer_ids': params,
      'name': data[0].metadata.name,
      'parent_layer_group_id': null
    };
    this.httpService.getData(postData, true, 'execute', 'afcf5a3a-e61a-42ca-9ee6-5318649c17cf', 'em', '123')
      .subscribe((res: any) => {
          if (res.status < 0) {
            const toastCfg1 = new ToastConfig(ToastType.ERROR, '', '分组失败，请稍后再试！', 3000);
            this.toastService.toast(toastCfg1);
            return;
          }
          const newId = res.data.layer_group_id;
          const obj = {
            id: newId,         //图层组id
            parent_id: null,         //图层组父节点（高级别图层组）id
            name: data[0].metadata.name,     //图层组名称
            children: [],           //存放子图层
            index: this.jsonTree[0].children.length,   //初始索引（主要在初始化用）；
            grade: 1,           //区分图层组级别
            last: true,            //判断是否为最后一级图层组
            group: true,            //判断是否为图层组（和后续图层结构有关）
            close: false,            //控制分组能否打开
            list: 0,
            allow_open: true,
            dbclick: false,
            juhetu: true
          };
          for (let i = 0; i < data.length; i++) {
            obj.children.push({
              checked: false,
              copy: false,
              group: false,
              index: this.jsonTree[0].children.length,
              layers: data[i],
              list: this.jsonTree[0].children.length,
              name: data[i].metadata.name,
              parent_id: newId,
              select: false
            });
            this.map.addLayer(data[i]);
          }
          this.jsonTree[0].children.push(obj);
          this.updateMapStyle1();
        },
        error => {
        }
      );
  }

  sigle_remove(value: any) {
    this.layerClick.emit({type: 'remove', item: value});
    this.updateMapStyle1();
    this.map.removeLayer(value.layer_id);
  }


  copyLayer(value: any) {
    const data = value.data;
    // 将数据库返回的图层对象放到图层列表数组中
    const info = JSON.stringify(value.item);
    const layers = JSON.parse(info);
    if (!value.group) { // 添加单个图层
      layers.id = data.instance_layer_id;
      layers.metadata.instance_layer_id = data.instance_layer_id;
      layers.metadata.layer_style_id = data.layer_style_id;
      this.jsonTree[0].children.push({
        checked: false,
        copy: false,
        group: false,
        index: this.jsonTree[0].children.length,
        layers: layers,
        list: this.jsonTree[0].children.length,
        name: layers.metadata.name,
        parent_id: 'map_group_id',
        select: false
      });
      this.map.addLayer(layers);
    } else { // 添加聚合图层-三个图层
      for (let i = 0; i < data.length; i++) {
        const layer = layers[i].layers;
        layer.id = data[i].instance_layer_id;
        layer.metadata.instance_layer_id = data[i].instance_layer_id;
        layer.metadata.layer_style_id = data[i].layer_style_id;
        this.jsonTree[0].children.push({
          checked: false,
          copy: false,
          group: false,
          index: this.jsonTree[0].children.length,
          layers: layer,
          list: this.jsonTree[0].children.length,
          name: layer.metadata.name,
          parent_id: 'map_group_id',
          select: false
        });
        this.map.addLayer(layer);
      }
    }
    this.mapJson.layers = this.getLayers(this.jsonTree);
    //this.mapJson.sources = Object.assign(this.mapJson.sources, data.data.sources);
    //this.map.setStyle(this.mapJson, {diff: true});
    this.copy_layers = this.getCopyLayers(this.jsonTree);
    const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '复制成功！', 2000);
    this.toastService.toast(toastCfg);
  }

  /**
   * 图层和图层组的移动
   * 针对图层和图层组通过不同的方式实现拖动
   * */
  move_layer(value) {
    this.delete_zero(this.jsonTree);
    if (value.item.group) {
      this.move_group(value);
    } else {
      this.move_single(value);
    }
  }

  /**
   * 移动单个图层
   * */
  move_single(value: any) {
    const instance_layer_id = value.item.layers.id;
    let parent_layer_group_id = '';
    let next_instance_layer_id = '';
    let always_next_layer_id = '';   //始终记录移动的前置图层的id
    let next_layer_group_id = '';
    if (value.item.init_grade > 1) {
      parent_layer_group_id = value.item.parent_id;
    } else {
      parent_layer_group_id = null;
    }
    for (let i = 0; i < value.targetModel.length; i++) {
      if (!value.targetModel[i].group) {
        if (instance_layer_id === value.targetModel[i].layers.id) {
          if (i === (value.targetModel.length - 1)) {
            const data = this.find_position(this.jsonTree, instance_layer_id, value.item.parent_id);
            next_instance_layer_id = data.next_instance_layer_id;
            next_layer_group_id = data.next_layer_group_id;
          } else {
            if (value.targetModel[i + 1].group) {
              if (value.targetModel[i + 1].allow_open) {
                if (value.targetModel[i + 1].children[0].group) {
                  next_instance_layer_id = value.targetModel[i + 1].children[0].children[0].layers.metadata.instance_layer_id;
                } else {
                  next_instance_layer_id = value.targetModel[i + 1].children[0].layers.metadata.instance_layer_id;
                }
                next_layer_group_id = null;
              } else {
                next_layer_group_id = value.targetModel[i + 1].id;
                next_instance_layer_id = null;
                if (value.targetModel[i + 1].children[0].group) {
                  always_next_layer_id = value.targetModel[i + 1].children[0].children[0].layers.metadata.instance_layer_id;
                } else {
                  always_next_layer_id = value.targetModel[i + 1].children[0].layers.metadata.instance_layer_id;
                }
              }
            } else {
              next_instance_layer_id = value.targetModel[i + 1].layers.metadata.instance_layer_id;
              next_layer_group_id = null;
            }
          }
        }
      }
    }
    const postData = {
      instance_layer_id: instance_layer_id,
      parent_layer_group_id: parent_layer_group_id,
      next_instance_layer_id: next_instance_layer_id,
      next_layer_group_id: next_layer_group_id
    };
    this.layerMask = true;
    console.log(postData);
    this.httpService.getData(postData, true, 'execute', '199a158b-1fdc-4d2a-8302-c7fb92f21add', '')
      .subscribe(
        (data: any) => {
          this.layerMask = false;
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          this.updateMapStyle1();  //更新地图样式
          if (next_instance_layer_id) {
            this.map.moveLayer(postData.instance_layer_id, next_instance_layer_id);
          } else if (next_layer_group_id && !next_instance_layer_id) {
            this.map.moveLayer(postData.instance_layer_id, always_next_layer_id);
          } else if (!next_instance_layer_id && !next_layer_group_id) {
            this.map.moveLayer(postData.instance_layer_id);
          }
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '图层移动成功', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  /**
   * 移动图层组
   * */
  move_group(value: any) {
    const layer_group_id = value.item.id;
    let parent_layer_group_id = '';
    let next_instance_layer_id = '';
    let next_layer_group_id = '';
    if (value.item.grade > 2) {
      parent_layer_group_id = value.item.parent_id;
    } else {
      parent_layer_group_id = null;
    }
    for (let i = 0; i < value.targetModel.length; i++) {

      if (layer_group_id === value.targetModel[i].id) {
        if (i === (value.targetModel.length - 1)) {
          const data = this.find_position(this.jsonTree, layer_group_id, value.item.parent_id);
          next_instance_layer_id = data.next_instance_layer_id;
          next_layer_group_id = data.next_layer_group_id;
        } else {
          if (value.targetModel[i + 1].group) {
            if (value.targetModel[i + 1].allow_open) {
              if (value.targetModel[i + 1].children[0].group) {
                next_instance_layer_id = value.targetModel[i + 1].children[0].children[0].layers.metadata.instance_layer_id;
              } else {
                next_instance_layer_id = value.targetModel[i + 1].children[0].layers.metadata.instance_layer_id;;
              }
              next_layer_group_id = null;
            } else {
              next_layer_group_id = value.targetModel[i + 1].id;
              next_instance_layer_id = null;
            }
          } else {
            next_instance_layer_id = value.targetModel[i + 1].layers.metadata.instance_layer_id;;
            next_layer_group_id = null;
          }
        }
      }
    }
    const postData1 = {
      layer_group_id: layer_group_id,
      parent_layer_group_id: parent_layer_group_id,
      next_instance_layer_id: next_instance_layer_id,
      next_layer_group_id: next_layer_group_id
    };
    this.layerMask = true;
    this.httpService.getData(postData1, true, 'execute', '3714a56d-22c6-40ef-aa05-9d527ef7dc8a', '')
      .subscribe(
        (data: any) => {
          this.layerMask = false;
          if ((data as any).status <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          this.updateMapStyle();  //更新地图样式
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '图层组移动成功', 2000);
          this.toastService.toast(toastCfg);
        }
      );
  }

  /**
   * 查找图层组拖动后的后置图层或者图层组
   * */
  find_position(tree, group_id, parent_id) {
    let obj = {
      next_instance_layer_id: '',
      next_layer_group_id: '',
      find_num: false
    };
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].group) {
        if (tree[i].id === parent_id) {
          if (i === (tree.length - 1)) {
            if (tree[i].grade === 1) {
              obj.next_instance_layer_id = null;
              obj.next_layer_group_id = null;
              obj.find_num = true;
            } else {
              obj = this.find_position(this.jsonTree, group_id, tree[i].parent_id);
            }
          } else {
            if (tree[i + 1].group) {
              if (tree[i + 1].allow_open) {
                if (tree[i + 1].children[0].group) {
                  obj.next_instance_layer_id = tree[i + 1].children[0].children[0].layers.metadata.instance_layer_id;
                } else {
                  obj.next_instance_layer_id = tree[i + 1].children[0].layers.metadata.instance_layer_id;
                }
                obj.next_layer_group_id = null;
              } else {
                obj.next_layer_group_id = tree[i + 1].id;
                obj.next_instance_layer_id = null;
              }
              obj.find_num = true;
            } else {
              obj.next_instance_layer_id = tree[i + 1].layers.metadata.instance_layer_id;
              obj.next_layer_group_id = null;
              obj.find_num = true;
            }
          }
          break;
        } else {
          obj = this.find_position(tree[i].children, group_id, parent_id);
          if (obj.find_num) {
            break;
          }
        }
      }
    }
    return obj;
  }

  /**
   * 批量删除图层
   * */
  delete_layers() {
    if (this.checked_layer.length < 1) {
      const toast = new ToastConfig(ToastType.WARNING, '', '无选中图层!', 2000);
      this.toastService.toast(toast);
      return;
    }
    const postData = [];
    for (let i = 0; i < this.checked_layer.length; i++) {
      postData.push({
        instance_layer_id: this.checked_layer[i].layers.metadata.instance_layer_id
      });
    }
    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.type = 11;
    modalRef.componentInstance.keyConfig = {
      title: '删除图层',
      view: '删除图层将不可恢复，确定要删除图层?'
    };
    modalRef.result.then((result) => {
      this.layerMask = true;
      this.httpService.getData(postData, true, 'execute', 'aa8bae0c-aaca-4f61-bf1c-8dec9d40ac61', '')
        .subscribe(
          (data: any) => {
            this.layerMask = false;
            /* 流向图删除 */
            /*if (item.metadata.flowgraph) {
              this.map.removeEcharts();
            }*/
            if ((data as any).status <= 0) {
              const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toast);
              return;
            }
            const layers = [];
            for (let i = 0; i < this.checked_layer.length; i++) {
              layers.push(this.checked_layer[i].layers);
              this.map.removeLayer(this.checked_layer[i].layers.id);
            }
            this.map.fire('layerDelete', {    //小程序监听图层删除事件
              layers: layers
            });
            this.delete_group(this.checked_layer);
            this.mapJson.layers = this.getLayers(this.jsonTree);
            //this.map.setStyle(this.mapJson, {diff: true});
            this.copy_layers = this.getCopyLayers(this.jsonTree);
            this.layerClick.emit({type: 'remove', item: 'value'});
            this.checked_layer = [];
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功!', 2000);
            this.toastService.toast(toastCfg);
          },
          error => {
          }
        );
    }, (reason) => {
    });
  }

  delete_group(item) {
    for (let i = 0; i < this.copy_layers.length; i++) {
      for (let m = 0; m < item.length; m++) {
        if (item[m].layers.id === this.copy_layers[i].layers.id) {
          this.copy_layers[i].delete = true;
        }
      }
    }
    this.delete_loop(this.jsonTree);
  }

  /**
   * 删除jsonTree中带delete的图层
   * */
  delete_loop(tree) {
    for (let i = (tree.length - 1); i >= 0; i--) {
      if (tree[i].group) {
        this.delete_loop(tree[i].children);
        if (tree[i].children.length < 1) {
          tree.splice(i, 1);
        }
      } else {
        if (tree[i].delete) {
          tree.splice(i, 1);
        }
      }
    }
    for (let m = 0; m < tree.length; m++) {
      tree[m].list = m;
    }
  }

  /**
   * 删除子元素为0的图层组
   * */
  delete_zero(tree) {
    for (let i = (tree.length - 1); i >= 0; i--) {
      if (tree[i].group) {
        if (tree[i].children.length > 0) {
          this.delete_zero(tree[i].children);
        } else {
          tree.splice(i, 1);
        }
      }
    }
    for (let m = 0; m < tree.length; m++) {
      tree[m].list = m;
    }
  }

  /*复制*/
  copy_group() {
    if (this.split_value && this.split_value.juhetu) {
      this.smxTreeNode.juhetuCopy(this.split_value.children);
      return;
    }
    if (this.split_value && !this.split_value.allow_open) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '引用分组不可操作！', 3000);
      this.toastService.toast(toastCfg);
      console.log('引用分组不可操作');
      return;
    }
    if (this.checked_layer.length < 1) {
      const toast = new ToastConfig(ToastType.WARNING, '', '无选中图层!', 2000);
      this.toastService.toast(toast);
      return;
    }
    this.smxTreeNode.addLayer(this.checked_layer, true, true);
  }

  select_group(tree, item) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].group) {
        if (tree[i].id === item.id) {
          tree[i].select = true;
        } else {
          tree[i].select = false;
        }
        this.select_group(tree[i].children, item);
      }
    }
  }

  /* /!**
    * 选中图层组，组中图层默认选中
    * *!/
   select_group_layer(tree, item) {
     for (let i = 0; i < tree.length; i++) {
       if (tree[i].group) {
         if (tree[i].id === item.id) {
           tree[i].select = true;
         } else {
           tree[i].select = true;
           tree[i].checked = true;
         }
         this.select_group_layer(tree[i].children, item);
       }
     }
   }*/

  layers_show() {
    if (this.checked_layer.length < 1) {
      const toast = new ToastConfig(ToastType.WARNING, '', '无选中图层!', 2000);
      this.toastService.toast(toast);
      return;
    }
  }

  /**
   * 隐藏图层
   * */
  hideLayer() {
    if (this.split_value && !this.split_value.juhetu) {
      if (this.split_value && !this.split_value.allow_open) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '引用分组不可操作！', 3000);
        this.toastService.toast(toastCfg);
        console.log('引用分组不可操作');
        return;
      }
    }
    if (this.checked_layer.length < 1) {
      const toast = new ToastConfig(ToastType.WARNING, '', '无选中图层!', 2000);
      this.toastService.toast(toast);
      return;
    }
    if (this.split_value && !this.split_value.juhetu) {
      if (this.split_value.juhetu || (this.split_value && !this.split_value.allow_open)) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '引用分组不可操作！', 3000);
        this.toastService.toast(toastCfg);
        console.log('引用分组不可操作');
        return;
      }
    }
    this.smxTreeNode.hideLayer(this.checked_layer, true, this.show_hide);
    this.show_hide = !this.show_hide;
  }

  /**
   * 显示图层
   * */
  showLayer() {
    if (this.split_value && !this.split_value.juhetu) {
      if (this.split_value.juhetu || (this.split_value && !this.split_value.allow_open)) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '引用分组不可操作！', 3000);
        this.toastService.toast(toastCfg);
        console.log('引用分组不可操作');
        return;
      }
    }
    if (this.checked_layer.length < 1) {
      const toast = new ToastConfig(ToastType.WARNING, '', '无选中图层!', 2000);
      this.toastService.toast(toast);
      return;
    }
    if (this.split_value && !this.split_value.juhetu) {
      if (this.split_value.juhetu || (this.split_value && !this.split_value.allow_open)) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '引用分组不可操作！', 3000);
        this.toastService.toast(toastCfg);
        console.log('引用分组不可操作');
        return;
      }
    }
    this.smxTreeNode.showLayer(this.checked_layer, true, this.show_hide);
    this.show_hide = !this.show_hide;
  }

  /**
   * 每次jsonTree图层顺序发生变化都会调用
   * 确保每次地图更新都为最新数据
   * */
  updateMapStyle() {
    this.mapJson.layers = this.getLayers(this.jsonTree);
    this.map.setStyle(this.mapJson, {diff: true});
    this.copy_layers = this.getCopyLayers(this.jsonTree);
  }

  updateMapStyle1() {
    this.mapJson.layers = this.getLayers(this.jsonTree);
    this.copy_layers = this.getCopyLayers(this.jsonTree);
  }

  /**
   * 控制批量选中图层时显隐图标的状态
   * */
  layerShowIcon() {
    if (this.checked_layer.length > 0) {
      let isShow = true;
      let hide_all = false;
      for (let i = 0; i < this.checked_layer.length; i++) {
        if (this.checked_layer[i].layers.layout && this.checked_layer[i].layers.layout.visibility && this.checked_layer[i].layers.layout.visibility === 'none') {
          isShow = false;
          break;
        }
      }
      for (let i = 0; i < this.checked_layer.length; i++) {
        const data1 = this.checked_layer[i].layers.layout;
        if (!this.checked_layer[i].layers.layout || !this.checked_layer[i].layers.layout.visibility || this.checked_layer[i].layers.layout.visibility === 'visible') {
          hide_all = true;
          break;
        }
      }
      if (isShow && hide_all) {
        this.show_hide = true;
      } else if (!isShow && hide_all) {
        this.show_hide = true;
      } else if (!isShow && !hide_all) {
        this.show_hide = false;
      }
    }
  }

  /**
   * 控制图层的全选/取消全选
   * 注：只针对有权限编辑的的图层，引用图层和图层组不可全选
   * */
  allSelect(event) {
    if (event.target.checked) {
      this.checked_layer = [];
      for (let i = 0; i < this.copy_layers.length; i++) {
        if (this.copy_layers[i].layers.metadata.grouping) {
          i += 2;
          continue;
        }
        if (!this.copy_layers[i].layers.metadata.basemap) {
          this.copy_layers[i].select = true;
          this.copy_layers[i].checked = true;
          this.checked_layer.push(this.copy_layers[i]);
        }
      }
      this.selectAll = true;
      this.split_value = null;
    } else {
      this.checked_layer = [];
      for (let i = 0; i < this.copy_layers.length; i++) {
        this.copy_layers[i].select = false;
        this.copy_layers[i].checked = false;
      }
      this.selectAll = false;
    }
  }

  /**
   * 循环jsonTree方法
   * */
  loop_json(tree, fn) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].group) {
        fn(tree[i]);
        this.loop_json(tree[i].children, fn);
      }
    }
  }

  /**
   * 聚合图操作方法
   * */
  juhetuChange(item: any) {
    this.split_value = item.value;
    this.checked_layer = item.value.children;
    if (item.type === 'delete') {
      this.delete_select();
    }
  }
}
