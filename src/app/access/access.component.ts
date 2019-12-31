import {Component, OnInit} from '@angular/core';
import {HttpService} from '../s-service/http.service';
import {dateFormat, toError} from '../smx-component/smx-util';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';

@Component({
  selector: 'app-access-selector',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss']
})

/*
* 访问统计
* */
export class AccessComponent implements OnInit {
  showType: number; // 显示类型 1、图表 2、表格

  data: any;

  // 下拉框
  selectedCity1: any;
  selectedCity2: any;
  cities1: any[];
  cities2: any[];
  value: any;

  accessStep: number; // 统计间隔

  constructor(private httpService: HttpService,
              private toastService: ToastService) {
    this.data = [];
  }


  /*
   * 初始化
   * */
  ngOnInit() {


    this.selectedCity1 = [];
    this.accessStep = 100;
    this.getAccessModule();
    this.showType = 1;

    this.cities1 = [];
    this.getTimeStep();
    this.selectedCity2 = this.cities2[0].value;
  }


  changeTime(e: any) {
    this.getMonitorData();
  }

  getMonitorData() {
    const postData = {
      filters: [
        {
          service_event_config_id: '51853b3b-0619-42b1-b273-761049932a06',
          rule: 'b7599da3-26e6-4c6c-a712-15d9f248da63',
          value: this.selectedCity1
        }, {
          service_event_config_id: '48bd594b-9345-4a09-a05b-d0eba9ad160e',
          rule: '596dd14b-a9e1-4344-90c0-dce71a530c2e',
          value: this.selectedCity2
        }, {
          service_event_config_id: '4f264e90-b15f-41a5-87e3-78ffd58bce39',
          rule: 'ef27a63c-5113-4e39-aa38-16918324235a',
          value: this.accessStep
        }
      ],
      limit: 0,
      conjunction: 'and'
    };
    this.httpService.getData(postData, true, 'execute', 'bc49497e-cc61-4f42-bcdf-22fca4c4b5df', '1')
      .subscribe(
        data => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }

          if (this.selectedCity1.length <= 0) {
            return;
          }

          const showData: any = [];
          for (const j of this.selectedCity1) {
            showData.push({
              label: this.cities1[this.cities1.map((select) => {
                return select.value;
              }).indexOf(j)].label,
              name: j,
              labelData: [],
              valueData: [],
              useLabel: [],
              useValue: []
            });
          }

          for (const i in (data as any).data.root) {
            if ((data as any).data.root[i]) {
              for (const j of showData) {
                if (j.name === (data as any).data.root[i].component_instance_event_id) {
                  j.labelData.push(
                    (data as any).data.root[i].reqtime
                  );
                  j.valueData.push(
                    (data as any).data.root[i].count
                  );
                }
              }
            }
          }

          const TIME_MAX = Math.max.apply(Math, (data as any).data.root.map((arr: any) => {
            return arr.reqtime;
          }));
          const TIME_MIN = Math.min.apply(Math, (data as any).data.root.map((arr: any) => {
            return arr.reqtime;
          }));
          const TIME_ARRAY = [];
          for (let i = 0; i < (TIME_MAX - TIME_MIN) / this.accessStep; i++) {
            TIME_ARRAY.push(TIME_MIN + (i * this.accessStep));
          }

          for (const n of showData) {
            for (let i = 0; i < n.labelData.length + 1; i++) {
              if (i === 0) {
                for (let j = 0; j < (n.labelData[i] - TIME_MIN) / this.accessStep; j++) {
                  n['useLabel'].push(TIME_MIN + j * this.accessStep);
                  n['useValue'].push(0);
                }
                n['useLabel'].push(n.labelData[i]);
                n['useValue'].push(n.valueData[i]);
              } else if (i === n.labelData.length) {
                for (let j = 0; j < (TIME_MAX - n.labelData[i - 1]) / this.accessStep; j++) {
                  n['useLabel'].push(n.labelData[i - 1] + (j + 1) * this.accessStep);
                  n['useValue'].push(0);
                }
              } else {
                for (let j = 0; j < (n.labelData[i] - n.labelData[i - 1]) / this.accessStep; j++) {
                  n['useLabel'].push(n.labelData[i - 1] + (j + 1) * this.accessStep);
                  n['useValue'].push(0);
                }
                n['useValue'].splice(n['useValue'].length - 1, 1, n.valueData[i]);
              }
            }
          }
          const dataSet = [];
          for (const n of showData) {
            dataSet.push({
              label: n.label,
              data: n.useValue,
              fill: false,
              lineTension: 0,
              borderWidth: 1,
              borderColor: '#4bc0c0',
              pointRadius: 0
            });
          }

          this.data = {
            labels: TIME_ARRAY.map((timeStep) => {
              return dateFormat(new Date(timeStep * 1000), 'dd/MM HH:mm:ss');
            }),
            datasets: dataSet,
            borderWidth: 1,
            options: {
              borderWidth: 1,
              animation: {
                duration: 0
              },
              hover: {
                animationDuration: 0
              },
              responsiveAnimationDuration: 0
            }
          };
        },
        error => {
          toError(error);
        }
      );
  }

  // 获取同级模块
  getAccessModule() {
    this.httpService.getData({}, true, 'execute', '776cb4f5-0a0e-4a45-befa-829973f32c0b', '1')
      .subscribe(
        data => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.cities1 = [];
          for (const i of (data as any).data) {
            this.cities1.push({
              label: i.event_desc,
              value: i.component_instance_event_id
            });
          }
          // this.selectedWay = this.wayList[0].value;
          this.getMonitorData();
        },
        error => {
          toError(error);
        }
      );
  }

  /*
  * 计算时间段起始时间戳
  * */
  getTimeStep() {
    this.cities2 = [
      {
        label: '1天',
        value: {min: Math.round(new Date().getTime() / 1000 - 86400), max: Math.round(new Date().getTime() / 1000)}
      },
      {
        label: '3天',
        value: {min: Math.round(new Date().getTime() / 1000 - 86400 * 3), max: Math.round(new Date().getTime() / 1000)}
      },
      {
        label: '7天',
        value: {min: Math.round(new Date().getTime() / 1000 - 86400 * 7), max: Math.round(new Date().getTime() / 1000)}
      },
      {
        label: '15天',
        value: {min: Math.round(new Date().getTime() / 1000 - 86400 * 15), max: Math.round(new Date().getTime() / 1000)}
      }
    ];
  }
}
