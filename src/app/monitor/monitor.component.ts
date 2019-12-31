import {Component, OnInit} from '@angular/core';
import {HttpService} from '../s-service/http.service';
import {ToastConfig, ToastType, ToastService} from '../smx-unit/smx-unit.module';
import {dateFormat, toError} from '../smx-component/smx-util';

const Chart = require('chart.js');

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})

/*
* 监控页面
* */
export class MonitorComponent implements OnInit {
  data: any;
  items: any[];

  // 下拉框
  selectedSever: any;
  selectedCity2: any;
  severList: any[];
  cities2: any[];
  selectedWay: any;
  wayList: any[];

  value: any;
  selectedSevers: any[];
  serviceList: any[]; // 服务接口列表

  constructor(private httpService: HttpService, private toastService: ToastService) {
    this.data = [];
  }


  /*
   * 初始化
   * */
  ngOnInit() {


    this.getMonitorSever();
    this.getServiceMonitor();
    this.serviceList = [];
    this.severList = [
      {label: '选择一个主机', value: null}
    ];
    this.wayList = [
      {label: '选择一个指标', value: null}
    ];
    this.getTimeStep();
    this.selectedCity2 = this.cities2[0].value;
    this.selectedSevers = [];
  }


  changeTime(type: number, e: any) {
    if (type === 1) { // 选择主机服务器
      this.selectedSever = e;
      this.getMonitorWay();
    } else if (type === 2) { // 选择指标
      this.selectedWay = e;
      this.getMonitorData();
    } else { // 选择日期时间
      this.getMonitorData();
    }
  }

  // 获取监控数据
  getMonitorData() {
    let selectedWayLabel: any;
    for (const i of this.wayList) {
      if (i.value === this.selectedWay) {
        selectedWayLabel = i.label;
      }
    }
    const postData = {
      filters: [
        {
          service_event_config_id: 'ef734eeb-1825-4af2-badd-6ef236108885',
          rule: '4f1392a2-491f-42b3-81ff-73f3f98e555b',
          value: this.selectedWay
        }, {
          service_event_config_id: 'b07df6dd-c855-45e2-a81e-9b0358fe825b',
          rule: '596dd14b-a9e1-4344-90c0-dce71a530c2e',
          value: this.selectedCity2
        }
      ],
      limit: 0,
      conjunction: 'and'
    };
    this.httpService.getData(postData, true, 'execute', '73b0194a-9d58-4b82-962d-d162a466f25c', '1')
      .subscribe(
        data => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          const testLabelData: any[] = [];
          const testValueData: any[] = [];
          for (const i in (data as any).data.root) {
            /*if (parseInt(i, 10) % Math.round((data as any).data.root.length / 9) !== 0) {
                testLabelData[i] = '';
            } else {
                testLabelData[i] = (data as any).data.root[i];
            }*/
            if ((data as any).data.root[i]) {
              testLabelData.push(
                dateFormat(new Date((data as any).data.root[i].update_time * 1000), 'dd/MM HH:mm:ss')
              );
              testValueData.push((data as any).data.root[i].value);
            }
          }
          this.data = {
            labels: testLabelData,
            datasets: [
              {
                label: selectedWayLabel,
                data: testValueData,
                fill: false,
                lineTension: 0,
                borderWidth: 1,
                borderColor: '#4bc0c0',
                pointRadius: 0
              }
            ],
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

  // 获取监控服务器
  getMonitorSever() {
    this.httpService.getData({
      limit: 0
    }, true, 'execute', '63140946-47ae-4bf0-bb58-4ad5e38273a3', '1')
      .subscribe(
        data => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.severList = [{
            label: '所有服务器',
            value: ''
          }];
          for (const i of (data as any).data.root) {
            this.severList.push({
              label: i.name,
              value: i.server_id
            });
          }
          this.selectedSever = this.severList[0].value;
          this.getMonitorWay();
        },
        error => {
          toError(error);
        }
      );
  }

  // 获取设备指标
  getMonitorWay() {
    const postData = this.selectedSever ? {
      filters: [
        {
          service_event_config_id: '20835aaa-a658-41eb-9a06-06a5a38053b7',
          rule: '4f1392a2-491f-42b3-81ff-73f3f98e555b',
          value: this.selectedSever
        }
      ],
      limit: 0,
      conjunction: 'and'
    } : {limit: 0};
    this.httpService.getData(postData, true, 'execute', '4da52379-c3b0-4d5b-91e2-142c6accebc0', '1')
      .subscribe(
        data => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.wayList = [];
          for (const i of (data as any).data.root) {
            this.wayList.push({
              label: i.name,
              value: i.server_monitor_item_id
            });
          }
          this.selectedWay = this.wayList[0].value;
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

  /*
  * 获取服务监控
  * */
  getServiceMonitor() {
    const postData = {
      filters: [
        {
          service_event_config_id: '5c0e8960-8785-4f0e-b26d-19305c18843f',
          rule: 'b7599da3-26e6-4c6c-a712-15d9f248da63',
          value: this.selectedSevers
        }
      ],
      limit: 0,
      conjunction: 'and'
    };
    this.httpService.getData(postData,
      true, 'execute', 'd74144a3-77b4-4121-9a0b-31eaff514fe2', '1')
      .subscribe(
        data => {
          if ((data as any).status <= 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            return;
          }
          this.serviceList = (data as any).data.root;
        },
        error => {
        }
      );
  }


  changeService(e: any) {
    this.getServiceMonitor();
  }
}
