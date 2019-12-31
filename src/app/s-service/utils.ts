/**
 * Created by LLCN on 2017/9/14 16:04.
 *
 * name: utils.ts
 * description: 平台工具模块
 */


/**
 * ui类型对应关系
 * @param component
 */
// wb 添加了sys_ui_c_integer 选项fm_ui_input_integer8
export function getComponentType(component) {

  let componenttype = 'sys_ui_c_text';
  switch (component) {
    case 'fm_ui_image_upload':
      componenttype = 'sys_ui_c_upload';
      break;
    case 'fm_ui_select_json':
      componenttype = 'sys_ui_c_json';
      break;
    case 'fm_ui_pick_datetime':
      componenttype = 'sys_ui_c_datetime';
      break;
    case 'fm_ui_pick_date':
      componenttype = 'sys_ui_c_date';
      break;
    case 'fm_ui_pick_time':
      componenttype = 'sys_ui_c_time';
      break;
    case 'fm_ui_radio_boolean':
    case 'fm_ui_select_boolean':
    case 'fm_ui_switch_boolean':
      componenttype = 'sys_ui_c_boolean';
      break;
    case 'fm_ui_input_decimal':
    case 'fm_ui_input_decimal2':
    case 'fm_ui_input_decimal8':
    case 'fm_ui_input_numeric':
      componenttype = 'sys_ui_c_decimal';
      break;
    case 'fm_ui_input_integer':
    case 'fm_ui_input_integer2':
    case 'fm_ui_input_integer8':
      componenttype = 'sys_ui_c_integer';
      break;
    case 'fm_ui_input_text':
    case 'fm_ui_select_text':
    case 'fm_ui_html_text':
    case 'fm_ui_textarea_text':
      componenttype = 'sys_ui_c_text';
      break;
    case 'fm_ui_point_geo':
    case 'fm_ui_line_geo':
    case 'fm_ui_polygon_geo':
      componenttype = 'sys_ui_c_geo';
      break;
    default:
      return 'sys_ui_c_text';
  }

  return componenttype;
}


/**
 *  UI类型分类判断(是否数值)
 * @param id  类型id
 */
export function isUINumber(id: string) {

  const ui_number = ['fm_ui_input_integer', 'fm_ui_input_integer2',
    'fm_ui_input_integer8', 'fm_ui_input_numeric', 'fm_ui_input_decimal', 'fm_ui_input_decimal4', 'fm_ui_input_decimal8'];

  if (ui_number.includes(id)) {
    return true;
  } else {
    return false;
  }

}

/**
 * 平台文本校验规范
 * @constructor
 */
export const SMXNAME = {
  REG: /^[\u4E00-\u9FA50-9A-Za-z_()]{1,40}$/,
  MSG: '支持1-40个汉字 数字 字母 _ ()'
};
export const ICONNUM = {
  REG: /^[0-9]{7}$/,
  MSG: '只支7位数字编号'
};
export const NICKNAME = {
  REG: /^[\u4E00-\u9FA50-9A-Za-z_()]{1,12}$/,
  MSG: '支持1-12个汉字 数字 字母 _ ()'
};

export function regularName(value: string, reg: any, reg_msg: string, max = 40, min = 1) {
  const regstr = reg || '^[\u4E00-\u9FA50-9A-Za-z_()]{' + min + ',' + max + '}$';
  const c = new RegExp(regstr);
  if (!c.test(value)) {
    return reg_msg || '支持' + min + '-' + max + '个汉字 数字 字母 _ ()';
  } else {
    return false;
  }
}
