import {Component, OnInit, Input, NgModule} from '@angular/core';
import {HttpService} from '../../s-service/http.service';
import {ToastConfig, ToastType} from '../smx-toast/toast-model';
import {ToastService} from '../smx-toast/toast.service';
import {SmxModal} from '../../smx-component/smx-modal/directive/smx-modal';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {SmxUiSettingModule} from '../smx-ui-setting/smx-ui-setting.module';
import {SMXNAME} from '../../s-service/utils';

@Component({
  selector: 'smx-output-csv',
  templateUrl: './s-output-csv.component.html',
  styleUrls: ['./s-output-csv.component.scss']
})
export class SOutputCsvComponent implements OnInit {

  @Input() mData: any;
  @Input() outputType = 2;
  @Input() outputData: any[];

  createType = []; // etl上传文件数据类型数组
  createTableNameStatus = false;
  allChecked = true;

  constructor(
    private smxModalService: SmxModal,
    private toastService: ToastService,
    public httpService: HttpService) {
  }

  ngOnInit() {
    if (this.mData.name) {
      // this.createTableName = this.mData.name;
      this.createTable();
    }
    // 获取数据信息
    for (const i of this.mData.inputData.inputColumns) {
      i['use'] = true;
      i['output'] = i.name;
      i['ispk'] = false;
    }
    if (this.mData.inputData.upload_file) {
      for (const i of this.mData.inputData.inputColumns) {
        i['type'] = 'sys_ui_c_text';
        i['component_data_type_id'] = 'fm_ui_input_text';
      }
    }

    this.getSelectType(); // 从服务器获取类型字段
  }


  /**
   * 获取字段类型
   */
  getSelectType() {
    this.httpService.getData({'parent_id': 'sys_column_type'}, true,
      'execute', '6a35661d-7a2c-4a75-b3f2-e3a82ed953e0', '1')
      .subscribe(
        data => {
          if ((data as any).status > 0) {
            const array = ([] as any);
            for (const v of (data as any).data) {
              array.push({
                key: v.item_name,
                val: v.default_value
              });
            }

            this.createType = array;
          }

        },
        error => {
        }
      );
  }

  // 判断是否显示列表
  createTable() {
    // this.outputTableSelect = undefined;
    if (this.mData.name !== '' && this.mData.name !== undefined) {
      const test = SMXNAME.REG.test(this.mData.name);

      if (!test) {
        this.createTableNameStatus = false;
        const toastCfg = new ToastConfig(ToastType.WARNING, '', SMXNAME.MSG, 5000);
        this.toastService.toast(toastCfg);
      } else {
        this.createTableNameStatus = true;
      }
    } else {
      this.createTableNameStatus = false;
    }
  }

  /*
* 创建新表时选择主键
* */
  checkIspk(e: any, index: number) {
    if (e.target.checked) {
      this.mData.inputColumns[index].ispk = true;
    }
  }


  /*
* 输入字段选取事件
* */
  checkInputData(e: any) {
    if (e.target.checked) {

    } else {
      this.allChecked = false;
    }
  }

  /**
   * 全选全不选
   * @param e
   */
  changeChecked(e: any) {
    this.allChecked = e.target.checked;
    for (const v of this.mData.inputData.inputColumns) {
      v.use = e.target.checked;
    }
  }

}


@NgModule({
  declarations: [SOutputCsvComponent],
  imports: [CommonModule, FormsModule, NgZorroAntdModule, SmxUiSettingModule],
  exports: [SOutputCsvComponent]
})
export class SOutputCsvModule {
}
