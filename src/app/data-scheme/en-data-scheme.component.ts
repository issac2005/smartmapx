import {Component, OnInit} from '@angular/core';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';
import {HttpService} from '../s-service/http.service';
import {Router} from '@angular/router';
import {ActivatedRoute, Params} from '@angular/router';
// 导入服务
import {AppService} from '../s-service/app.service';
import {LocalStorage} from '../s-service/local.storage';
import {SMXNAME} from '../s-service/utils';

@Component({
  selector: 'app-data-scheme',
  templateUrl: 'en-data-scheme.component.html',
  styleUrls: ['en-data-scheme.component.scss']
})

export class EnDataSchemeComponent implements OnInit {

  pageConfig: any;
  /*************数据查询方案相关参数start*********************/
  enSql: any; // sql语句
  enData: any[];
  enTypes: any[];
  enType = 'query';  // 方案类型
  enInfo = '';
  enTestStatus = false;
  name = '';
  description = '';


  public searchKey: string; // 模态框回调

  paramTypes: any[];

  event_data: any;

  /******************end 路由获取参数****************/
  constructor(private httpService: HttpService,
              public toastService: ToastService,
              private appService: AppService,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private ls: LocalStorage) {


    activatedRoute.queryParams.subscribe(queryParams => {
      this.searchKey = queryParams.gobanckKey;
    });

  }

  ngOnInit() {

    // const info = (localStorage.getItem('enInfo') as any);
    // this.pageConfig = JSON.parse(info);
    this.pageConfig = this.ls.getObject('enInfo');
    const w = document.body.clientWidth;
    const h = document.body.clientHeight;

    this.enData = [
      {
        label: '',
        type: 'text',
        value: ''
      }
    ];

    this.paramTypes = [{
      label: '数值',
      value: 'number',
    }, {
      label: '字符串',
      value: 'text',
    }];
    this.enTypes = [
      {label: '全量返回', value: 'selects'},
      {label: '详情查询', value: 'select'},
      {label: '分页查询', value: 'query'},
      {label: '数据添加', value: 'insert'},
      {label: '数据删除', value: 'delete'},
      {label: '数据修改', value: 'update'}
    ];

    if (this.pageConfig.visit_type !== 2) {
      this.initData();
    }
  }


  initData() {
    const body = {service_event_id: this.pageConfig.service_event_id};
    this.httpService.getData(body,
      true, 'execute', 'fc6cfb1a-253b-4bb6-bfe0-33a13dab9dbc', 'en_data')
      .subscribe(
        data => {
          if ((data as any).status > 0 && (data as any).data.event_data) {
            this.event_data = (data as any).data.event_data;
            this.name = this.event_data.description;
            this.description = this.event_data.remark; // Ljy--数据查询方案描述
            this.enSql = this.event_data.service_event_parameters[0].content;
            this.enType = this.event_data.type;
            let strArray = [];
            if (this.event_data.service_event_parameters[0].expression) {
              strArray = this.event_data.service_event_parameters[0].expression.split(',');
            }
            this.enData = [];

            for (const v of strArray) {
              let type = 'text';
              let flag = '';
              if (this.event_data.service_event_config) {
                for (const w of this.event_data.service_event_config) {
                  if (w.name === v) {

                    if (this.enType === 'insert' && w.name === 'system_id') {
                      flag = 'insert';
                      break;
                    }

                    if (w.data_type === 'postgres_integer' || w.data_type === 'postgres_numeric' ||
                      w.data_type === 'postgres_bigint' || w.data_type === 'postgres_smallint' ||
                      w.data_type === 'postgres_double_precision') {
                      type = 'number';
                      break;
                    }
                  }

                }
              }

              if (flag !== 'insert') {
                this.enData.push({
                  label: v,
                  type: type,
                  value: ''
                });
              }

            }
          }
        },
        error => {
        }
      );
  }

  // 增加sql中条件的输入框
  addParam() {
    this.enData.push({
      label: '',
      type: 'text',
      value: ''
    });
  }

  removeParam(i: any) {
    this.enData.splice(i, 1);
  }

  /**
   * 方案Sql测试提交
   */
  testSQL(tag: any) {

    if (!this.enSql || this.enSql === '') {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', 'SQL不能为空!', 3000);
      this.toastService.toast(toastCfg);
      return;
    }
    if (this.name) {
      // const c = /^[\u4E00-\u9FA50-9A-Za-z_()]{1,40}$/;
      const test = SMXNAME.REG.test(this.name);
      if (!test) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
        // const toastCfg = new ToastConfig(ToastType.WARNING, '', '名称不能为空,并且只支持汉字,字母,数字,下划线以及小括弧!', 5000);
        this.toastService.toast(toastCfg);
        return;
      }
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '名称不能为空!', 3000);
      this.toastService.toast(toastCfg);
      return;
    }


    // 存放(input标签)Data[]中的key
    const inputKey = [];
    let inputKeyStr = '';
    for (const l of this.enData) {
      inputKey.push(l.label),
        inputKeyStr += l.label + ',';
    }
    inputKeyStr = inputKeyStr.substring(0, inputKeyStr.length - 1);
    console.log(this.description);
    const obj = ({
      definition: {
        content: this.enSql,
        expression: inputKeyStr,
        type: this.enType,
        name: this.name,
        description: this.description,
        service_id: 'fm_system_service_execute',
      }
    } as any);


    if (this.pageConfig.visit_type !== 2) {
      obj.definition['service_event_id'] = this.event_data.service_event_id;
    }

    for (const v of this.enData) {
      if (v.type === 'number') {
        obj[v.label] = Number(v.value);
      } else {
        obj[v.label] = v.value;
      }
    }


    if (tag === 'submit') {


      this.httpService.getData(obj, true, 'etl', 'createApi', 'en')
        .subscribe(
          data => {
            if ((data as any).status < 0 || (data as any).tag !== 'en') {
              const toast = new ToastConfig(ToastType.ERROR, '', '数据请求失败,请稍后再试！', 2000);
              this.toastService.toast(toast);
              return;
            }

            this.pageConfig.visit_type = 0;
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '保存成功！', 2000);
            this.toastService.toast(toastCfg);

          }
          ,
          error => {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '网络请求错误,请稍后再试！', 2000);
            this.toastService.toast(toastCfg);
          }
        );


    } else if (tag === 'test') {

      this.httpService.getData(obj, true, 'etl', 'testServiceEvent', '1')
        .subscribe(
          data => {
            if ((data as any).status < 0) {
              // 查询方案测试时判断数据是否锁定
              if ((data as any).status === -260) {
                const toastCf = new ToastConfig(ToastType.WARNING, '', '该数据正处于锁定状态，请稍后操作', 5000);
                this.toastService.toast(toastCf);
                return;
              }
              return;
            }

            this.enInfo = JSON.stringify((data as any).data, null, 4);

            this.enTestStatus = true;
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '测试通过!', 2000);
            this.toastService.toast(toastCfg);
          },
          error => {
          }
        );


    }

  }

  /*
*  返回按钮点击事件
* */
  goBack() {
    // 返回状态
    if (localStorage.getItem('goback_share') === '0') {
      localStorage.setItem('goback_share', '1');
    }
    /* 返回方法优化 */
    if (this.searchKey === '我的') {
      history.go(-1);
    } else {
      this.router.navigate(['/app/showenterprise'], {queryParams: {gobackKey: this.searchKey}});
    }

  }
}
