import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sOutputCsv'
})
export class SOutputCsvPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (args === 'type') {

      if (value === 'sys_ui_c_text') {
        return '文本';
      }
      if (value === 'sys_ui_c_integer') {
        return '整数';
      }

      if (value === 'sys_ui_c_decimal') {
        return '小数';
      }

      if (value === 'sys_ui_c_time') {
        return '时间';
      }

      if (value === 'sys_ui_c_date') {
        return '日期';
      }

      if (value === 'sys_ui_c_datetime') {
        return '时间日期';
      }
      if (value === 'sys_ui_c_boolean') {
        return '布尔值';
      }
      if (value === 'sys_ui_c_json') {
        return '集合';
      }
      if (value === 'sys_ui_c_upload') {
        return '上传';
      }
      if (value === 'sys_ui_c_geo') {
        return '空间字段';
      }
    }

    if (args === 'control') {
      if (value === 'fm_ui_input_text') {
        return '文本输入框';
      }

      if (value === 'fm_ui_input_integer' || value === 'fm_ui_input_integer2'  || value === 'fm_ui_input_integer8' || value === 'fm_ui_input_decimal' || value === 'fm_ui_input_numeric' || value === 'fm_ui_input_decimal8') {
        return '数值输入框';
      }

      if (value === 'fm_ui_select_text' || value === 'fm_ui_select_boolean') {
        return '下拉列表框';
      }

      if (value === 'fm_ui_select_json') {
        return '多选下拉框';
      }

      if (value === 'fm_ui_textarea_text') {
        return '多行文本';
      }
      if (value === 'fm_ui_radio_boolean') {
        return '单选框';
      }
      if (value === 'fm_ui_switch_boolean') {
        return '开关';
      }
      if (value === 'fm_ui_html_text') {
        return 'html编辑器';
      }

      if (value === 'fm_ui_pick_date') {
        return '日期控件';
      }
      if (value === 'fm_ui_pick_time') {
        return '时间控件';
      }
      if (value === 'fm_ui_pick_datetime') {
        return '组合控件';
      }
      if (value === 'fm_ui_image_upload') {
        return '图片上传';
      }
      if (value === 'fm_ui_point_geo') {
        return '点';
      }
      if (value === 'fm_ui_line_geo') {
        return '线';
      }
      if (value === 'fm_ui_polygon_geo') {
        return '面';
      }
    }
    return null;
  }

}
