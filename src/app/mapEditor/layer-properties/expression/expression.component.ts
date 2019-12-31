import { Component, Input, OnChanges, OnInit, HostListener, QueryList, ViewChildren, EventEmitter, ElementRef, Renderer2, Output } from '@angular/core';

import {AppService} from '../../../s-service/app.service';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../s-service/http.service';


@Component({
  selector: 'app-expression',
  templateUrl: './expression.component.html',
  styleUrls: ['./expression.component.scss']
})
export class ExpressionComponent implements OnInit {
  @Input() layer: any;
  @Input() patemter: any;
  @Input() attribute: any;
  @Input() showStyle: any;
  @Input() layerInfo: any;
  @Input() ExpressionEdite: any;
  @Input() layerEditCheckNumber: any ;
  @Input() chooseIndex: any;
  @Input() chooseOne: any; // 偏移 double-input
  @Input() isChecked: any;
  @Input() ServiceEventId: any; // 选择框 属性字段
  @Output() changeExample = new EventEmitter();

  styleInStatus: any = false; // 是否点击输入框
  Thisattribute: any; // 确定是哪个属性字段
  pattern: any;
  defau: any;
  styleNumDisplay: any = false;
  constructor(private mapEditorService: AppService,
              private elementRef: ElementRef,
              private renderer: Renderer2,
              private httpService: HttpService,
              private httpClient: HttpClient) { }

  ngOnInit() {
  }
  ngOnChanges () {
        setTimeout(() => {
            this.pattern = [];
            this.defau = [];
            const id = this.layer.metadata.service_event_id;
            for (let i = 0; i < this.ServiceEventId.length; i++) {
                if (id === this.ServiceEventId[i].id) {
                    for (let m = 0; m < this.ServiceEventId[i].name_num.length; m++) {
                        this.pattern.push(this.ServiceEventId[i].name_num[m]);
                        this.defau.push(this.ServiceEventId[i].desc_num[m]);
                    }
                }
            }
        }, 2500);
  }

 // checkbox框 选择属性
 layerEditNumclicks(event: any, index: any, Attribut: any){
  const value = '{' + this.defau[index] + '}';
  let type = 1;
  if (this.showStyle === 'string' || this.showStyle === 'number' || this.showStyle === 'undefined') {
      this.ExpressionEdite = this.ExpressionEdite + value ;
      this.layer.metadata.formulaOptons[Attribut] = this.ExpressionEdite;
      type = 1;
  }else {
      this.layer.metadata.formulaOptons[Attribut][this.chooseIndex][1] =
      this.layer.metadata.formulaOptons[Attribut][this.chooseIndex][1] + value;
      type = 2;
  }
  this.layerEditCheckNumber = !this.layerEditCheckNumber;
  if ( type === 1 ) {
      this.changeExample.emit(
          {number:this.layerEditCheckNumber , type:type ,value:this.ExpressionEdite, boolean:false , isUse:1 ,isvalue:true });
  } else {
      this.changeExample.emit(
          {number:this.layerEditCheckNumber , type:type ,value:this.ExpressionEdite, boolean:false , isUse:2 ,
        format: this.layer.metadata.formulaOptons[Attribut] , isvalue:true});
  }
  this.isChecked = true;
}
  /* 加减乘除方法 */
buttonClickAdd(Attribut: any){
  if (this.showStyle === 'string' || this.showStyle === 'undefined' || this.showStyle === 'number' ) {
    this.ExpressionEdite = this.ExpressionEdite + '+' ;
    this.layer.metadata.formulaOptons[Attribut] = this.ExpressionEdite;
    this.changeExample.emit({number:0 , type:1 , value:this.ExpressionEdite , boolean:true , isUse:1 });
  }else {
    this.layer.metadata.formulaOptons[Attribut][this.chooseIndex][1] =
    this.layer.metadata.formulaOptons[Attribut][this.chooseIndex][1] + '+';
    this.changeExample.emit({number:0 , type:2 , value:this.ExpressionEdite , boolean:true , isUse:2 ,
        format: this.layer.metadata.formulaOptons[Attribut] });
  }
}
buttonClickSub(Attribut: any){
  if (this.showStyle === 'string' || this.showStyle === 'undefined' || this.showStyle === 'number' ) {
    this.ExpressionEdite = this.ExpressionEdite + '-' ;
    this.layer.metadata.formulaOptons[Attribut] = this.ExpressionEdite;
    this.changeExample.emit({number:0 , type:1 , value:this.ExpressionEdite , boolean:true , isUse:1 });
  }else {
    this.layer.metadata.formulaOptons[Attribut][this.chooseIndex][1] =
    this.layer.metadata.formulaOptons[Attribut][this.chooseIndex][1] + '-';
    this.changeExample.emit({number:0 , type:2 , value:this.ExpressionEdite , boolean:true , isUse:2 ,
        format: this.layer.metadata.formulaOptons[Attribut] });
  }
}
buttonClickMult(Attribut: any){
  if (this.showStyle === 'string' || this.showStyle === 'undefined' || this.showStyle === 'number' ) {
    this.ExpressionEdite = this.ExpressionEdite + '*' ;
    this.layer.metadata.formulaOptons[Attribut] = this.ExpressionEdite;
    this.changeExample.emit({number:0 , type:1 , value:this.ExpressionEdite , boolean:true , isUse:1 });
  }else {
    this.layer.metadata.formulaOptons[Attribut][this.chooseIndex][1] =
    this.layer.metadata.formulaOptons[Attribut][this.chooseIndex][1] + '*';
    this.changeExample.emit({number:0 , type:2 , value:this.ExpressionEdite , boolean:true , isUse:2  ,
        format: this.layer.metadata.formulaOptons[Attribut]});
  }
}
buttonClickDivi(Attribut: any){
  if (this.showStyle === 'string' || this.showStyle === 'undefined' || this.showStyle === 'number' ) {
    this.ExpressionEdite = this.ExpressionEdite + '/' ;
    this.layer.metadata.formulaOptons[Attribut] = this.ExpressionEdite;
   this.changeExample.emit({number:0 , type:1 , value:this.ExpressionEdite , boolean:true , isUse:1 });
  }else {
    this.layer.metadata.formulaOptons[Attribut][this.chooseIndex][1] =
    this.layer.metadata.formulaOptons[Attribut][this.chooseIndex][1] + '/';
    this.changeExample.emit({number:0 , type:2 , value:this.ExpressionEdite , boolean:true , isUse:2  ,
        format: this.layer.metadata.formulaOptons[Attribut]});
  }
}
buttonClickAnd(Attribut: any){
    this.changeExample.emit({number:0 , type:1 , value:this.ExpressionEdite , boolean:true , isUse:1 });
    return;
  }

ExamplesOneFunction(str: any){
  if (str === '' || str === undefined) {
    str = this.patemter.default.toString();
  }
  let label_arr = [];
  let labelString_arr = [];
  let endString = [] ;
  let endEXcaple;
  const TYPE = 'one';
  label_arr = this.needArrFirst(str);  // 分割出 + - * / ( ) 位置
  labelString_arr = this.spliteStr_num(str,label_arr)[0]; // 根据位置把 各个字符 分割出来
  endString = this.dal2Rpn_num(labelString_arr); // 根据（） 和 优先级 处理出字符顺序
  endEXcaple = this.conatJson(endString,str,TYPE,0); // 拼接字符Json
  if (Number(endEXcaple)) {
    return Number(endEXcaple);
  } else if (endEXcaple === '0') {
    return 0 ;
  } else {
    return endEXcaple;
  }
}
ExamplesMoreFunction(strs: any){
  for (let v = 0 ; v < strs.length ; v ++) {
      if (strs[v][1] === '' || strs[v][1] === undefined) {
        strs[v][1] = this.patemter.default.toString();
      }
  }
  let endEXArr = [];
  for (let i = 0 ; i < strs.length ; i ++) {
    let label_arr = [];
    let labelString_arr = [];
    let endString = [] ;
    let endEXcaple = [] ;
    const TYPE = 'two';
    label_arr = this.needArrFirst(strs[i][1]);  // 分割出 + - * / ( ) 位置
    labelString_arr = this.spliteStr_num(strs[i][1],label_arr)[0]; // 根据位置把 各个字符 分割出来
    endString = this.dal2Rpn_num(labelString_arr); // 根据（） 和 优先级 处理出字符顺序
    endEXcaple = this.conatJson(endString,strs[i][1],TYPE,i); // 拼接字符Json
    if (Number(endEXcaple)) {
      endEXArr.push(strs[i][0]);
      endEXArr.push( Number(endEXcaple));
    }else {
      endEXArr.push(strs[i][0]);
      endEXArr.push(endEXcaple);
    }
  }
  return endEXArr;
}


  /* ===================处理四则运算的方法================================ */
  //分割字符方法
  search_substr_pos_num(str: any, substr: any) {
    var _search_pos = str.indexOf(substr), _arr_positions = [];
    while (_search_pos > -1) {
          _arr_positions.push(_search_pos);
          _search_pos = str.indexOf(substr, _search_pos + 1);
        }
    return _arr_positions;
  }
  //排序方法
  sort_num(arr){
    for (var i = 0; i < arr.length-1; i++) {
        for (var j = 0; j < arr.length-1-i; j++) {
            if(arr[j]>arr[j+1]){
                var cur = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = cur;
            }
        }
    }
    return arr
}
//找出分割符之后 进行处理
spliteStr_num(str: any, arr: any){
    const arrAll = [] ;
    const arrAll_str = [] ;
    for ( let i = 0 ; i < arr.length ; i ++ ) {
        if ( i === 0 ) {
            var data_ = str.substring( 0 ,arr[i+1]);
            var reg = /^[\'\"]+|[\'\"]+$/g;
            data_=data_.replace(reg,"");
            arrAll.push(data_);
            arrAll_str.push(data_);
        } else if ( i === arr.length-1 ) {
            var data_ = str.substring( arr[i]+1 ,str.length);
            var icon_ = str.substring(arr[i],arr[i]+1);
            var reg = /^[\'\"]+|[\'\"]+$/g;
            data_=data_.replace(reg,"");
            arrAll.push(icon_);
            if(data_ !== '') {
                arrAll.push(data_);
                arrAll_str.push(data_);
            }
        } else {
            var data_ = str.substring(arr[i]+1,arr[i+1]);
            var icon_ = str.substring(arr[i],arr[i]+1);
            var reg = /^[\'\"]+|[\'\"]+$/g;
            data_=data_.replace(reg,"");
            arrAll.push(icon_);
            if(data_ !== '') {
                arrAll.push(data_);
                arrAll_str.push(data_);
            }
        }
    }
    return [arrAll , arrAll_str];
}

//根据四则运算 和括号 找出计算顺序
 isOperator(value){
    var operatorString = "+-*/()";
    return operatorString.indexOf(value) > -1;
}

 getPrioraty(value){
    switch(value){
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
prioraty(o1, o2){
    return this.getPrioraty(o1) <= this.getPrioraty(o2);
}
dal2Rpn_num(exp){
    var inputStack = [];
    var outputStack = [];
    var outputQueue = [];
    for(var i = 0, len = exp.length; i < len; i++){
        var cur = exp[i];
        if(cur != ' ' ){
            inputStack.push(cur);
        }
    }
    while(inputStack.length > 0){
        var cur = inputStack.shift();
        if(this.isOperator(cur)){
            if(cur == '('){
                outputStack.push(cur);
            }else if(cur == ')'){
                var po = outputStack.pop();
                while(po != '(' && outputStack.length > 0){
                    outputQueue.push(po);
                    po = outputStack.pop();
                }
                if(po != '('){
                    throw "error: unmatched ()";
                }
            }else{
                while(this.prioraty(cur, outputStack[outputStack.length - 1]) && outputStack.length > 0){
                    outputQueue.push(outputStack.pop());
                }
                outputStack.push(cur);
            }
        }else{
            outputQueue.push(cur);
        }
    }
    if(outputStack.length > 0){
        if(outputStack[outputStack.length - 1] == ')' || outputStack[outputStack.length - 1] == '('){
            throw "error: unmatched ()";
        }
        while(outputStack.length > 0){
            outputQueue.push(outputStack.pop());
        }
    }
    return outputQueue;

}
//找出字符位置 拼接数组
needArrFirst(str: any) {
        let arr = [0];
        const sub_jia = this.search_substr_pos_num(str,'+');
        const sub_jian = this.search_substr_pos_num(str,'-');
        const sub_cheng = this.search_substr_pos_num(str,'*');
        const sub_chu = this.search_substr_pos_num(str,'/');
        const sub_zuo = this.search_substr_pos_num(str,'(');
        const sub_you = this.search_substr_pos_num(str,')');
        arr = arr.concat(sub_jia);
        arr = arr.concat(sub_jian);
        arr = arr.concat(sub_cheng);
        arr = arr.concat(sub_chu);
        arr = arr.concat(sub_zuo);
        arr = arr.concat(sub_you);
        arr = this.sort_num(arr);
        return arr;
}

needArrTwo(str: any) {
    let arr = [];
    const sub_jia = this.search_substr_pos_num(str,'+');
    const sub_jian = this.search_substr_pos_num(str,'-');
    const sub_cheng = this.search_substr_pos_num(str,'*');
    const sub_chu = this.search_substr_pos_num(str,'/');
    const sub_zuo = this.search_substr_pos_num(str,'(');
    const sub_you = this.search_substr_pos_num(str,')');
    arr = arr.concat(sub_jia);
    arr = arr.concat(sub_jian);
    arr = arr.concat(sub_cheng);
    arr = arr.concat(sub_chu);
    arr = arr.concat(sub_zuo);
    arr = arr.concat(sub_you);
    arr = this.sort_num(arr);
    return arr;
}

needArrTest(str){
    let arr = [];
    const sub_jia = this.search_substr_pos_num(str,'+');
    const sub_jian = this.search_substr_pos_num(str,'-');
    const sub_cheng = this.search_substr_pos_num(str,'*');
    const sub_chu = this.search_substr_pos_num(str,'/');
    arr = arr.concat(sub_jia);
    arr = arr.concat(sub_jian);
    arr = arr.concat(sub_cheng);
    arr = arr.concat(sub_chu);
    arr = this.sort_num(arr);
    return arr;
}
//去除{}
ObjectToString(tys: any){
    let tys_number1 = tys.indexOf('{');
    let tys_number2 = tys.indexOf('}');
    tys = tys.substring(tys_number1+1,tys_number2);
    return tys;
}



//拼接JSON (数值)
conatJson(str: any,reStr: any,TYPE: any ,index: any){
    let whileTrue = false;
    let new_arr = this.needArrTwo(str);
    let new_arr_s = this.needArrTest(reStr);
    let reBoolean = false
    if (new_arr_s.length > 1) {
      for (let y = 0 ; y < new_arr_s.length-1 ; y++) {
        if ( (new_arr_s[y+1] - new_arr_s[y]) < 2 ) {
          reBoolean = true;
        }
      }
    }
    if ( (new_arr[0] < 2) || reBoolean ) {
      if (TYPE === 'one'){
        this.layer.metadata.formulaOptons[this.attribute] = this.patemter.default.toString();
        this.ExpressionEdite = this.patemter.default.toString();
        this.changeExample.emit([0 , 1 , this.ExpressionEdite ]);
      } else {
        this.layer.metadata.formulaOptons[this.attribute][index][1] =this.patemter.default.toString();
      }
      return this.patemter.default;
    }  else {

            var is = 0;
            while ( new_arr.length > 0 ) {
                whileTrue = true;
                new_arr[0] = new_arr[0] - is ;
                var stringjson;
                //判断是字符 还是对象
                if ( str[new_arr[0]-2].indexOf('{') !== -1 ) { //第一个参数是对象
                    str[new_arr[0]-2] = this.ObjectToString(str[new_arr[0]-2]);
                    if ( this.defau.indexOf(str[new_arr[0]-2]) !== -1 ) {
                        str[new_arr[0]-2] = this.pattern[this.defau.indexOf(str[new_arr[0]-2])];
                    }
                    if ( str[new_arr[0]-1].indexOf('{') !== -1) {//第二个对象是对象
                        str[new_arr[0]-1] = this.ObjectToString(str[new_arr[0]-1]);
                        if ( this.defau.indexOf(str[new_arr[0]-1]) !== -1 ) {
                            str[new_arr[0]-1] = this.pattern[this.defau.indexOf(str[new_arr[0]-1])];
                        }
                        stringjson = [ str[new_arr[0]] ,[ 'get' ,  str[new_arr[0]-2] ],[ 'get' , str[ new_arr[0] - 1]] ];
                    }else if ( Number(str[new_arr[0]-1]) ) {
                        str[new_arr[0]-1] = Number(str[new_arr[0]-1]);
                        stringjson = [ str[new_arr[0]] ,[ 'get' ,  str[new_arr[0]-2] ],str[ new_arr[0] - 1] ];
                    }else if (str[new_arr[0]-1] === '0'  ) {
                        str[new_arr[0]-1] = 0;
                        stringjson = [ str[new_arr[0]] ,[ 'get' ,  str[new_arr[0]-2] ],str[ new_arr[0] - 1] ];
                    } else {
                        stringjson = [ str[new_arr[0]] ,[ 'get' ,  str[new_arr[0]-2] ],str[ new_arr[0] - 1] ];
                    }
                }else if (Number(str[new_arr[0]-2]) || str[new_arr[0]-2] === '0') {
                    if (str[new_arr[0]-2] === '0') {
                      str[new_arr[0]-2] = 0 ;
                    } else {
                      str[new_arr[0]-2] = Number(str[new_arr[0]-2]);
                    }
                    if ( str[new_arr[0]-1].indexOf('{') !== -1) {//第二个对象是对象
                      str[new_arr[0]-1] = this.ObjectToString(str[new_arr[0]-1]);
                      if ( this.defau.indexOf(str[new_arr[0]-1]) !== -1 ) {
                        str[new_arr[0]-1] = this.pattern[this.defau.indexOf(str[new_arr[0]-1])];
                      }
                      stringjson = [ str[new_arr[0]] ,str[new_arr[0]-2],[ 'get' , str[ new_arr[0] - 1]] ];
                    }else if ( Number(str[new_arr[0]-1]) || str[new_arr[0]-1] === '0') {
                        if (str[new_arr[0]-1] === '0') {
                          str[new_arr[0]-1] = 0;
                        }else {
                          str[new_arr[0]-1] = Number(str[new_arr[0]-1]);
                        }
                        stringjson = [ str[new_arr[0]] ,str[new_arr[0]-2],str[ new_arr[0] - 1] ];
                    }else {
                        stringjson = [ str[new_arr[0]] ,str[new_arr[0]-2], str[ new_arr[0] - 1] ];
                    }
                } else { //第一个不是对象
                    if ( str[new_arr[0]-1].indexOf('{') !== -1) {//第二个对象是对象
                        str[new_arr[0]-1] = this.ObjectToString(str[new_arr[0]-1]);
                        if ( this.defau.indexOf(str[new_arr[0]-1]) !== -1 ) {
                            str[new_arr[0]-1] = this.pattern[this.defau.indexOf(str[new_arr[0]-1])];
                        }
                        stringjson = [ str[new_arr[0]] , str[new_arr[0]-2] ,[ 'get' , str[ new_arr[0] - 1]] ];
                    }else if (Number(str[new_arr[0]-1]) || str[new_arr[0]-1] === '0') {
                      if (str[new_arr[0]-1] === '0') {
                        str[new_arr[0]-1] = 0;
                      }else {
                        str[new_arr[0]-1] = Number(str[new_arr[0] - 1]);
                      }
                        stringjson = [ str[new_arr[0]] , str[new_arr[0] - 2], str[ new_arr[0] - 1] ];
                    } else {
                        stringjson = [ str[new_arr[0]] , str[new_arr[0] - 2] , str[ new_arr[0] - 1] ];
                    }
                }
                str[new_arr[0]] = stringjson;
                str.splice(new_arr[0] - 2, 2);
                new_arr.splice(0, 1);
                is = is + 2 ;
            }
            if (whileTrue === false) {
                if (new_arr.length === 0 && str.length > 0) {
                                if ( str[0].indexOf('{') !== -1 ) {
                                    str[0] = this.ObjectToString(str[0]);
                                    if (this.defau.indexOf(str[0]) !== -1) {
                                        str[0] = this.pattern[this.defau.indexOf(str[0])];
                                        str[0] = [ 'get' , str[0] ];
                                    }
                                } else if (Number(str[0]) || str[0] === '0') {
                                    if (str[0] === '0') {
                                        str[0] = 0;
                                    } else {
                                        str[0] = Number(str[0]);
                                    }
                                } else {
                                    str[0] = this.patemter.default;
                                    if (TYPE === 'one'){
                                        this.layer.metadata.formulaOptons[this.attribute] = this.patemter.default.toString();
                                      } else {
                                        this.layer.metadata.formulaOptons[this.attribute][index][1] = this.patemter.default.toString();
                                      }
                                }
                            }
            }
            return str[0];
    }

  }


}
