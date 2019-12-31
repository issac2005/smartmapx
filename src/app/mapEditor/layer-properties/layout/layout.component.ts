import {
  AfterViewChecked,
  Component,
  Input,
  Output,
  OnChanges,
  QueryList,
  ElementRef,
  ViewChildren,
  HostListener,
  EventEmitter,
  OnInit
} from '@angular/core';
// import {MapEditorService} from '../../mapEditor.service';
import {HttpService} from '../../../s-service/http.service';
import {AppService} from '../../../s-service/app.service';
import {isUINumber} from '../../../s-service/utils';


@Component({
  selector: 'app-layouts',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnChanges {
  @Input() layer: any;
  @Input() patemter: any;
  @Input() ServiceEventId: any;
  layerInfo: any;
  attribute: any;
  showStyle: any;
  pattern: any;
  title: any;
  defau: any;
  defau_type;
  type: any;
  enclick: any;
  tooltip: any;
  styleDisplay = false;
  layerEditCheckBoolan: any = true;
  styleStatus = false;
  ExpressionEdite: any; //表达式绑定的值
  // 多级
  styleStatue_more = false;
  styleDisplay_more = false;
  layerEditCheckBoolan_more = true;

  choseIndex: any; //确认选择的哪个输入框

  midleValue: any;

  //判断选择框 状态
  isShow: any;
  ischeck: any;

  constructor(private mapEditorService: AppService,
              private elementRef: ElementRef,
              private httpService: HttpService) {
  }

  ngOnInit() {
    //this.layer.metadata.formulaOptons
    if (this.patemter.attribute === 'text-field') {
      if (this.layer.metadata.formulaOptons[this.patemter.attribute]) {
        this.ExpressionEdite = this.layer.metadata.formulaOptons[this.patemter.attribute];
      } else {
        this.ExpressionEdite = this.patemter.default;
      }
    }
  }

  ngOnChanges() {
    if (!this.layer[this.patemter.belong]) {
      this.layer[this.patemter.belong] = {};
    }
    this.layerInfo = this.layer[this.patemter.belong];
    this.attribute = this.patemter.attribute;
    if (this.layerInfo[this.attribute] === undefined) {
      this.pattern = this.patemter.pattern;
      this.title = this.patemter.title;
      this.defau = this.patemter.default;
      this.type = this.patemter.type;
      this.enclick = false;
      this.tooltip = this.patemter.tooltip;
    } else {
      this.pattern = this.patemter.pattern;
      this.title = this.patemter.title;
      this.defau = this.patemter.default;
      this.type = this.patemter.type;
      this.enclick = true;
      this.tooltip = this.patemter.tooltip;
    }
    if (this.patemter.attribute === 'text-field') {
      if (this.layer.metadata.formulaOptons[this.patemter.attribute]) {
        this.ExpressionEdite = this.layer.metadata.formulaOptons[this.patemter.attribute];
      } else {
        this.ExpressionEdite = this.patemter.default;
      }
    }
    if (this.patemter.attribute === 'text-field') {
      this.showStyle = typeof this.layer.metadata.formulaOptons[this.attribute];
    } else {
      this.showStyle = typeof this.layerInfo[this.attribute];
    }
    if (this.patemter.attribute === 'text-field') {
      console.log(this.ServiceEventId);
      setTimeout(() => {
        this.pattern = [];
        this.defau = [];
        this.defau_type = [];
        const id = this.layer.metadata.service_event_id;
        for (let i = 0; i < this.ServiceEventId.length; i++) {
          if (id === this.ServiceEventId[i].id) {
            for (let m = 0; m < this.ServiceEventId[i].name.length; m++) {
              this.pattern.push(this.ServiceEventId[i].name[m]);
              this.defau.push(this.ServiceEventId[i].description[m]);
              this.defau_type.push(this.ServiceEventId[i].type[m]);
            }
          }
        }
      }, 2500);
    }
  }

  clickButtom(value: any) {
    this.layerInfo[this.attribute] = value;
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  clickAdd(Attribute: any) {
    if (!this.enclick) {
      return;
    }
    if (Attribute === 'text-field') {
      this.layerInfo[this.attribute] = [
        'step',
        ['zoom'],
        this.layerInfo[this.attribute],
        10,
        this.layerInfo[this.attribute]
      ];
      const value = this.layer.metadata.formulaOptons[this.patemter.attribute];
      this.layer.metadata.formulaOptons[this.patemter.attribute] = [[6, value], [10, value]];
      this.showStyle = typeof this.layer.metadata.formulaOptons[this.patemter.attribute];
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
      this.styleDisplay = !this.styleDisplay;
    } else {
      this.layerInfo[this.attribute] = {
        'stops': [
          [6, this.layerInfo[this.attribute]], [10, this.layerInfo[this.attribute]]
        ]
      };
      this.showStyle = typeof this.layerInfo[this.attribute];
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }


  }

  clickNewButtom(item: any, value: any, index: any) {
    this.layerInfo[this.attribute].stops[index][1] = value;
  }

  remove(Attribute: any, index: any) {
    // 字段 删除处理
    if (Attribute === 'text-field') {
      this.layer.metadata.formulaOptons[this.attribute].splice(index, 1);
      const length = this.layer.metadata.formulaOptons[this.attribute].length;
      const value = this.layer.metadata.formulaOptons[this.attribute][length - 1];
      if (length <= 1) {
        this.layer.metadata.formulaOptons[this.attribute] = value[1];
        this.showStyle = typeof this.layer.metadata.formulaOptons[this.attribute];
        this.ExpressionEdite = this.layer.metadata.formulaOptons[this.attribute];
        this.changeStyle();
      } else {
        this.changeStyle();
      }
      this.styleDisplay = !this.styleDisplay;
    } else {
      this.layerInfo[this.attribute].stops.splice(index, 1);
      if (this.layerInfo[this.attribute].stops.length <= 1) {
        const value = this.layerInfo[this.attribute].stops[this.layerInfo[this.attribute].stops.length - 1][1];
        this.layerInfo[this.attribute] = value;
        this.showStyle = typeof this.layerInfo[this.attribute];
      }
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }
  }

  buttomAdd(Attribute: any) {
    if (Attribute === 'text-field') {
      const num = this.layer.metadata.formulaOptons[this.attribute].length - 1;
      const value = this.layer.metadata.formulaOptons[this.attribute][num][1];
      const index = this.layer.metadata.formulaOptons[this.attribute][num][0];
      this.layer.metadata.formulaOptons[this.attribute].push([Number(index) + 1, value]);
      this.changeStyle();
    } else {
      const num = this.layerInfo[this.attribute].stops.length - 1;
      const value = this.layerInfo[this.attribute].stops[num][1];
      const index = this.layerInfo[this.attribute].stops[num][0];
      this.layerInfo[this.attribute].stops.push([Number(index) + 1, value]);
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }
  }

  test(event: any, Attribute: any, index: any) {
    const pattern = /^((\d)|(1\d)|(2[0-4]))$/;
    const fall = pattern.test(event.target.value);
    if (Attribute === 'text-field') {
      if (!fall) {
        let min = 0;
        let max = 0;
        if (index === 0) {
          min = 0;
          max = this.layer.metadata.formulaOptons[this.attribute][index + 1][0];
        } else if (index === (this.layer.metadata.formulaOptons[this.attribute].length) - 1) {
          min = this.layer.metadata.formulaOptons[this.attribute][index - 1][0];
          max = 24;
        } else {
          min = this.layer.metadata.formulaOptons[this.attribute][index - 1][0];
          max = this.layer.metadata.formulaOptons[this.attribute][index + 1][0];
        }
        this.layer.metadata.formulaOptons[this.attribute][index][0] = Math.floor(Math.random() * (max - min) + min);
        this.changeStyle();
      } else {
        this.layer.metadata.formulaOptons[this.attribute][index][0] = Number(event.target.value);
        this.changeStyle();
      }
    } else {
      if (!fall) {
        let min = 0;
        let max = 0;
        if (index === 0) {
          min = 0;
          max = this.layerInfo[this.attribute].stops[index + 1][0];
        } else if (index === (this.layerInfo[this.attribute].stops.length) - 1) {
          min = this.layerInfo[this.attribute].stops[index - 1][0];
          max = 24;
        } else {
          min = this.layerInfo[this.attribute].stops[index - 1][0];
          max = this.layerInfo[this.attribute].stops[index + 1][0];
        }
        this.layerInfo[this.attribute].stops[index][0] = Math.floor(Math.random() * (max - min) + min);

      }
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }

  }

  change(event: any) {
    this.enclick = true;
    this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
  }

  //字段属性获取焦点
  focusFun() {
    this.styleDisplay = true;
    this.styleStatus = true;
  }

  changeEXstyle() {
    setTimeout(() => {
      this.changeStyle();
    }, 100);
  }

  // 选择框选择属性            并隐藏选择框
  layerEditclicks(event: any, index: any) {
    const value = '{' + this.defau[index] + '}';
    if (this.showStyle === 'string' || this.showStyle === 'undefined') {
      this.ExpressionEdite = this.ExpressionEdite + value;
      this.layer.metadata.formulaOptons[this.patemter.attribute] = this.ExpressionEdite;
    } else {
      this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] =
        this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] + value;
    }
    this.layerEditCheckBoolan = !this.layerEditCheckBoolan;
    // this.ischeck = false;
    this.changeEXstyle();
  }

  // + 显示选择框
  chageEvent(event: any) {

    this.isShow = true;

    this.styleStatus = true;
    this.layerEditCheckBoolan = !this.layerEditCheckBoolan;
    const iconChange = this.elementRef.nativeElement.getElementsByClassName('layerEdit-smartMapX-select-checkAll')[0];
    iconChange.style.position = 'fixed';
    iconChange.style.top = (event.clientY - event.offsetY + event.target.clientHeight - 110) + 'px'; // width = 182
    iconChange.style.left = (event.clientX - event.offsetX + event.target.clientWidth + 55) + 'px';

  }

  chageEventMore(event: any, index: any) {

    this.isShow = true;

    this.styleStatus = true;
    this.choseIndex = index;
    this.layerEditCheckBoolan = !this.layerEditCheckBoolan;
    const iconChange = this.elementRef.nativeElement.getElementsByClassName('layerEdit-smartMapX-select-checkAll')[0];
    iconChange.style.position = 'fixed';
    iconChange.style.top = (event.clientY - event.offsetY + event.target.clientHeight - 110) + 'px'; // width = 182
    iconChange.style.left = (event.clientX - event.offsetX + event.target.clientWidth + 55) + 'px';

  }

  buttonClickAdd() {
    if (this.showStyle === 'string' || this.showStyle === 'undefined') {
      this.ExpressionEdite = this.ExpressionEdite + '+';
      this.layer.metadata.formulaOptons[this.patemter.attribute] = this.ExpressionEdite;
    } else {
      this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] =
        this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] + '+';
    }
  }

  buttonClickSub() {
    if (this.showStyle === 'string' || this.showStyle === 'undefined') {
      this.ExpressionEdite = this.ExpressionEdite + '-';
      this.layer.metadata.formulaOptons[this.patemter.attribute] = this.ExpressionEdite;
    } else {
      this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] =
        this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] + '-';
    }
  }

  buttonClickMult() {
    if (this.showStyle === 'string' || this.showStyle === 'undefined') {
      this.ExpressionEdite = this.ExpressionEdite + '*';
      this.layer.metadata.formulaOptons[this.patemter.attribute] = this.ExpressionEdite;
    } else {
      this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] =
        this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] + '*';
    }
  }

  buttonClickDivi() {
    if (this.showStyle === 'string' || this.showStyle === 'undefined') {
      this.ExpressionEdite = this.ExpressionEdite + '/';
      this.layer.metadata.formulaOptons[this.patemter.attribute] = this.ExpressionEdite;
    } else {
      this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] =
        this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] + '/';
    }
  }

  buttonClickAnd() {
    if (this.showStyle === 'string' || this.showStyle === 'undefined') {
      this.ExpressionEdite = this.ExpressionEdite + '&';
      this.layer.metadata.formulaOptons[this.patemter.attribute] = this.ExpressionEdite;
    } else {
      this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] =
        this.layer.metadata.formulaOptons[this.patemter.attribute][this.choseIndex][1] + '&';
    }
  }


  /*视图选择装饰器函数(对应模板`<div class='sketch-picker'>`)*/
  //@ViewChildren('sketch-picker') unclick: QueryList<ElementRef>;
  @ViewChildren('smx_Allen_EX') unclick: QueryList<ElementRef>;

  /*监听dom*/
  @HostListener('document:click', ['$event']) bodyClick(e) {
    if (!getTrigger(this.unclick, 'smx_Allen_EX')) {
      this.styleDisplay = true;
      this.ischeck = true;
    }
    if (this.isShow === true) {
      this.layerEditCheckBoolan = false;
      this.isShow = false;
      return;
    } else if (this.isShow === false && getTrigger(this.unclick, 'smx_Allen_EX')) {
      this.layerEditCheckBoolan = true;
    }
    if (getTrigger(this.unclick, 'smx_Allen_EX')) {
      this.ischeck = false;
    }
    if (this.ischeck === false) {
      if (getTrigger(this.unclick, 'smx_Allen_EX')) {
        this.styleDisplay = false;
        this.layerEditCheckBoolan = true;
        /*  if (this.styleStatus) {
             this.changeStyle();
         } */
        this.styleStatus = false;
      }
    }


    function getTrigger(queryList, className?) {
      let flag = true;
      (<HTMLElement[]> e.path).forEach(i => {
        flag && queryList.forEach(el => {
          i.isEqualNode && i.isEqualNode(el.nativeElement) && (flag = false);
        });
        flag && i.className && i.className.indexOf && i.className.indexOf(className) > -1 && (flag = false);
      });
      return flag;
    }
  }


  //改变属性到style  -->  单一缩放级别
  changeStyle() {
    if (this.showStyle === 'string' || this.showStyle === 'undefined') {
      this.layer.metadata.formulaOptons[this.patemter.attribute] = this.ExpressionEdite;
      let concatJsonValue = this.changeJsonStyleFun(this.layer.metadata.formulaOptons[this.patemter.attribute]);
      this.layerInfo[this.attribute] = concatJsonValue;
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    } else {
      this.layerInfo[this.attribute] = [
        'step',
        ['zoom']
      ];
      let endStringArr = this.moreZoomStr(this.layer.metadata.formulaOptons[this.patemter.attribute]);
      this.layerInfo[this.attribute] = this.layerInfo[this.attribute].concat(endStringArr);
      this.mapEditorService.changeStyleEventEmitter.emit(this.layer);
    }
  }


  //处理字符串方法
  //判断数组中是否有 ''
  arrIsHavenull(arr: any) {
    if (arr.indexOf('') !== -1) {
      arr.splice(arr.indexOf(''), 1);
    }
    return arr;
  }

  //分割字符方法
  search_substr_pos(str: any, substr: any) {
    var _search_pos = str.indexOf(substr), _arr_positions = [];
    while (_search_pos > -1) {
      _arr_positions.push(_search_pos);
      _search_pos = str.indexOf(substr, _search_pos + 1);
    }
    return _arr_positions;
  }

  //排序方法
  sort(arr) {
    for (var i = 0; i < arr.length - 1; i++) {
      for (var j = 0; j < arr.length - 1 - i; j++) {
        if (arr[j] > arr[j + 1]) {
          var cur = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = cur;
        }
      }
    }
    return arr;
  }

//找出分割符之后 进行处理
  spliteStr(str: any, arr: any) {
    const arrAll = [];
    const arrAll_str = [];
    for (let i = 0; i < arr.length; i++) {
      if (i === 0) {

        var data_ = str.substring(0, arr[i + 1]);
        var reg = /^[\'\"]+|[\'\"]+$/g;
        data_ = data_.replace(reg, '');
        arrAll.push(data_);
        arrAll_str.push(data_);

      } else if (i === arr.length - 1) {
        var data_ = str.substring(arr[i] + 1, str.length);
        var icon_ = str.substring(arr[i], arr[i] + 1);
        var reg = /^[\'\"]+|[\'\"]+$/g;
        data_ = data_.replace(reg, '');
        arrAll.push(icon_);
        if (data_ !== '') {
          arrAll.push(data_);
          arrAll_str.push(data_);
        }
      } else {
        var data_ = str.substring(arr[i] + 1, arr[i + 1]);
        var icon_ = str.substring(arr[i], arr[i] + 1);
        var reg = /^[\'\"]+|[\'\"]+$/g;
        data_ = data_.replace(reg, '');
        arrAll.push(icon_);
        if (data_ !== '') {
          arrAll.push(data_);
          arrAll_str.push(data_);
        }
      }
    }
    return [arrAll, arrAll_str];
  }

//根据四则运算 和括号 找出计算顺序
  isOperator(value) {
    var operatorString = '+-*/()&';
    return operatorString.indexOf(value) > -1;
  }

  getPrioraty(value) {
    switch (value) {
      case '+':
      case '-':
        return 1;
      case '*':
      case '/':
        return 2;
      default:
        return 0;
    }
  }

  prioraty(o1, o2) {
    return this.getPrioraty(o1) <= this.getPrioraty(o2);
  }

  dal2Rpn(exp) {
    var inputStack = [];
    var outputStack = [];
    var outputQueue = [];
    for (var i = 0, len = exp.length; i < len; i++) {
      var cur = exp[i];
      if (cur != ' ') {
        inputStack.push(cur);
      }
    }
    while (inputStack.length > 0) {
      var cur = inputStack.shift();
      if (this.isOperator(cur)) {
        if (cur == '(') {
          outputStack.push(cur);
        } else if (cur == ')') {
          var po = outputStack.pop();
          while (po != '(' && outputStack.length > 0) {
            outputQueue.push(po);
            po = outputStack.pop();
          }
          if (po != '(') {
            throw 'error: unmatched ()';
          }
        } else {
          while (this.prioraty(cur, outputStack[outputStack.length - 1]) && outputStack.length > 0) {
            outputQueue.push(outputStack.pop());
          }
          outputStack.push(cur);
        }
      } else {
        outputQueue.push(cur);
      }
    }
    if (outputStack.length > 0) {
      if (outputStack[outputStack.length - 1] == ')' || outputStack[outputStack.length - 1] == '(') {
        throw 'error: unmatched ()';
      }
      while (outputStack.length > 0) {
        outputQueue.push(outputStack.pop());
      }
    }
    return outputQueue;

  }

//找出字符位置 拼接数组
  needArrFirst(str: any) {
    let arr = [0];
    const sub_jia = this.search_substr_pos(str, '+');
    const sub_jian = this.search_substr_pos(str, '-');
    const sub_cheng = this.search_substr_pos(str, '*');
    const sub_chu = this.search_substr_pos(str, '/');
    const sub_zuo = this.search_substr_pos(str, '(');
    const sub_you = this.search_substr_pos(str, ')');
    const sub_and = this.search_substr_pos(str, '&');
    arr = arr.concat(sub_jia);
    arr = arr.concat(sub_jian);
    arr = arr.concat(sub_cheng);
    arr = arr.concat(sub_chu);
    arr = arr.concat(sub_zuo);
    arr = arr.concat(sub_you);
    arr = arr.concat(sub_and);
    arr = this.sort(arr);
    return arr;
  }

  needANDFun(str: any) {
    const sub_and = this.search_substr_pos(str, '&');
    if (sub_and.length > 0) {
      for (let i = 0; i < sub_and.length; i++) {
        str.splice(str.indexOf('&'), 1);
      }
    }
    return str;
  }

  needArrTwo(str: any) {
    let arr = [];
    const sub_jia = this.search_substr_pos(str, '+');
    const sub_jian = this.search_substr_pos(str, '-');
    const sub_cheng = this.search_substr_pos(str, '*');
    const sub_chu = this.search_substr_pos(str, '/');
    const sub_zuo = this.search_substr_pos(str, '(');
    const sub_you = this.search_substr_pos(str, ')');
    arr = arr.concat(sub_jia);
    arr = arr.concat(sub_jian);
    arr = arr.concat(sub_cheng);
    arr = arr.concat(sub_chu);
    arr = arr.concat(sub_zuo);
    arr = arr.concat(sub_you);
    arr = this.sort(arr);
    return arr;
  }

//去除{}
  ObjectToString(tys: any) {
    let tys_number1 = tys.indexOf('{');
    let tys_number2 = tys.indexOf('}');
    tys = tys.substring(tys_number1 + 1, tys_number2);
    return tys;
  }

  changeJsonStyleFun(str: any) {
    let subString = [];
    let arr = [];
    let endStringArr = [];
    let positionSZ = [];
    let endTwoArr = [];
    let Arr_String_object = [];
    let find_AND_lab = [];
    let concatJsonValue = [];
    arr = this.needArrFirst(str);// 分割出 + - * / ( ) 位置
    subString = this.spliteStr(str, arr)[0];// 根据位置把 各个字符 分割出来
    subString = this.arrIsHavenull(subString);//判断是否空字符
    endStringArr = this.dal2Rpn(subString); // 根据（） 和 优先级 处理出字符顺序 
    endTwoArr = this.conatJson(endStringArr, str, 'one', 0); //先把 四则运算 的先拼接起来
    for (let i = 0; i < endTwoArr.length; i++) { //拼接to-string
      if (typeof endTwoArr[i] === 'object') {
        let addToString = ['to-string'];
        addToString[1] = endTwoArr[i];
        endTwoArr[i] = addToString;
      }
    }
    find_AND_lab = this.needANDFun(endTwoArr); //找出&符号位置 并去掉&
    concatJsonValue = this.finallyEndJson(find_AND_lab); // 对最后的字符进行拼接 加上concat
    return concatJsonValue;
  }

  moreZoomStr(str: any) {
    let dom = [];
    for (let i = 0; i < str.length; i++) {
      let subString = [];
      let arr = [];
      let endStringArr = [];
      endStringArr = this.changeJsonStyleFun(str[i][1]);
      if (i === 0) {
        dom.push(endStringArr);
      } else {
        dom.push(str[i][0]);
        dom.push(endStringArr);
      }
    }
    return dom;

  }

//拼接Json（字段）
  constJson_str(str: any) {
    let strA = [];
    strA.push('concat');
    for (let i = 0; i < str.length; i++) {
      if (str[i].indexOf('{') !== -1) {
        let str_ = this.ObjectToString(str[i]);
        if (this.defau.indexOf(str_) !== -1) {
          str_ = this.pattern[this.defau.indexOf(str_)];
        }
        let json = ['get', str_];
        strA.push(json);
      } else {

        strA.push(str[i]);
      }
    }
    return strA;
  }

//拼接四则运算
  needArrTest(str) {
    let arr = [];
    const sub_jia = this.search_substr_pos(str, '+');
    const sub_jian = this.search_substr_pos(str, '-');
    const sub_cheng = this.search_substr_pos(str, '*');
    const sub_chu = this.search_substr_pos(str, '/');
    arr = arr.concat(sub_jia);
    arr = arr.concat(sub_jian);
    arr = arr.concat(sub_cheng);
    arr = arr.concat(sub_chu);
    arr = this.sort(arr);
    return arr;
  }

  conatJson(str: any, reStr: any, TYPE: any, index: any) {
    let whileTrue = false;
    let new_arr = this.needArrTwo(str);
    let new_arr_s = this.needArrTest(reStr);
    let reBoolean = false;
    if (new_arr_s.length > 1) {
      for (let y = 0; y < new_arr_s.length - 1; y++) {
        if ((new_arr_s[y + 1] - new_arr_s[y]) < 2) {
          reBoolean = true;
        }
      }
    }
    if ((new_arr[0] < 2) || reBoolean) {
      if (TYPE === 'one') {
        this.layer.metadata.formulaOptons[this.patemter.attribute] = this.patemter.default.toString();
        //this.ExpressionEdite = this.patemter.default.toString();
      } else {
        this.layer.metadata.formulaOptons[this.patemter.attribute][index][1] = this.patemter.default.toString();
      }
      return this.patemter.default;
    } else {

      var is = 0;
      while (new_arr.length > 0) {
        whileTrue = true;
        new_arr[0] = new_arr[0] - is;
        var stringjson;
        //判断是字符 还是对象
        if (str[new_arr[0] - 2].indexOf('{') !== -1) { //第一个参数是对象
          str[new_arr[0] - 2] = this.ObjectToString(str[new_arr[0] - 2]);
          if (this.defau.indexOf(str[new_arr[0] - 2]) !== -1) {
            str[new_arr[0] - 2] = this.pattern[this.defau.indexOf(str[new_arr[0] - 2])];
          }
          if (str[new_arr[0] - 1].indexOf('{') !== -1) {//第二个对象是对象
            str[new_arr[0] - 1] = this.ObjectToString(str[new_arr[0] - 1]);
            if (this.defau.indexOf(str[new_arr[0] - 1]) !== -1) {
              str[new_arr[0] - 1] = this.pattern[this.defau.indexOf(str[new_arr[0] - 1])];
            }
            stringjson = [str[new_arr[0]], ['get', str[new_arr[0] - 2]], ['get', str[new_arr[0] - 1]]];
          } else if (Number(str[new_arr[0] - 1])) {
            str[new_arr[0] - 1] = Number(str[new_arr[0] - 1]);
            stringjson = [str[new_arr[0]], ['get', str[new_arr[0] - 2]], str[new_arr[0] - 1]];
          } else if (str[new_arr[0] - 1] === '0') {
            str[new_arr[0] - 1] = 0;
            stringjson = [str[new_arr[0]], ['get', str[new_arr[0] - 2]], str[new_arr[0] - 1]];
          } else {
            stringjson = [str[new_arr[0]], ['get', str[new_arr[0] - 2]], str[new_arr[0] - 1]];
          }
        } else if (Number(str[new_arr[0] - 2]) || str[new_arr[0] - 2] === '0') {
          if (str[new_arr[0] - 2] === '0') {
            str[new_arr[0] - 2] = 0;
          } else {
            str[new_arr[0] - 2] = Number(str[new_arr[0] - 2]);
          }
          if (str[new_arr[0] - 1].indexOf('{') !== -1) {//第二个对象是对象
            str[new_arr[0] - 1] = this.ObjectToString(str[new_arr[0] - 1]);
            if (this.defau.indexOf(str[new_arr[0] - 1]) !== -1) {
              str[new_arr[0] - 1] = this.pattern[this.defau.indexOf(str[new_arr[0] - 1])];
            }
            stringjson = [str[new_arr[0]], str[new_arr[0] - 2], ['get', str[new_arr[0] - 1]]];
          } else if (Number(str[new_arr[0] - 1]) || str[new_arr[0] - 1] === '0') {
            if (str[new_arr[0] - 1] === '0') {
              str[new_arr[0] - 1] = 0;
            } else {
              str[new_arr[0] - 1] = Number(str[new_arr[0] - 1]);
            }
            stringjson = [str[new_arr[0]], str[new_arr[0] - 2], str[new_arr[0] - 1]];
          } else {
            stringjson = [str[new_arr[0]], str[new_arr[0] - 2], str[new_arr[0] - 1]];
          }
        } else { //第一个不是对象
          if (str[new_arr[0] - 1].indexOf('{') !== -1) {//第二个对象是对象
            str[new_arr[0] - 1] = this.ObjectToString(str[new_arr[0] - 1]);
            if (this.defau.indexOf(str[new_arr[0] - 1]) !== -1) {
              str[new_arr[0] - 1] = this.pattern[this.defau.indexOf(str[new_arr[0] - 1])];
            }
            stringjson = [str[new_arr[0]], str[new_arr[0] - 2], ['get', str[new_arr[0] - 1]]];
          } else if (Number(str[new_arr[0] - 1]) || str[new_arr[0] - 1] === '0') {
            if (str[new_arr[0] - 1] === '0') {
              str[new_arr[0] - 1] = 0;
            } else {
              str[new_arr[0] - 1] = Number(str[new_arr[0] - 1]);
            }
            stringjson = [str[new_arr[0]], str[new_arr[0] - 2], str[new_arr[0] - 1]];
          } else {
            stringjson = [str[new_arr[0]], str[new_arr[0] - 2], str[new_arr[0] - 1]];
          }
        }
        str[new_arr[0]] = stringjson;
        str.splice(new_arr[0] - 2, 2);
        new_arr.splice(0, 1);

        is = is + 2;
      }
      return str;
    }

  }

  finallyEndJson(str: any) {
    const strEnd = ['concat'];
    for (let i = 0; i < str.length; i++) {
      if (typeof str[i] === 'string') {
        if (str[i].indexOf('{') !== -1) {
          str[i] = this.ObjectToString(str[i]);
          const strs = str[i];
          if (this.defau.indexOf(str[i]) !== -1) {
            str[i] = this.pattern[this.defau.indexOf(str[i])];
            // if ( this.defau_type[this.defau.indexOf(strs)] === 'fm_ui_input_integer8' ||
            //     this.defau_type[this.defau.indexOf(strs)] === 'fm_ui_input_integer' ||
            //     this.defau_type[this.defau.indexOf(strs)] === 'fm_ui_input_integer2' ||
            //     this.defau_type[this.defau.indexOf(strs)] === 'fm_ui_input_decimal' ||
            //     this.defau_type[this.defau.indexOf(strs)] === 'fm_ui_input_decimal8') {
            if (isUINumber(this.defau_type[this.defau.indexOf(strs)])) {
              str[i] = ['to-string', ['get', str[i]]];
            } else {
              str[i] = ['get', str[i]];
            }
          }

        }
      }
      strEnd.push(str[i]);
    }
    return strEnd;

  }

}
