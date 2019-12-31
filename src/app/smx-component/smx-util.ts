/**
 * @author  keiferju
 * @time    2019-05-28 08:38
 * @title  工具类
 * @description
 *
 */
import {environment} from '../../environments/environment';

/**
 * 转换
 * @param value
 */
export function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

export function toString(value: any): string {
  return (value !== undefined && value !== null) ? `${value}` : '';
}


/**
 * 判断
 * @param value
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return !isNaN(toInteger(value));
}

export function isInteger(value: any): value is number {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

export function isDefined(value: any): boolean {
  return value !== undefined && value !== null;
}


export function isEmpty(value: any): boolean {
  return value == null || typeof value === 'string' && value.length === 0;
}


export function isNotEmpty(value: any): boolean {
  return !this.isEmpty(value);
}


export function isArray(value: any): boolean {
  return Array.isArray(value);
}


export function isObject(value: any): boolean {
  return typeof value === 'object' && !this.isArray(value);
}


export function padNumber(value: number) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return '';
  }
}

export function regExpEscape(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function hasClassName(element: any, className: string): boolean {
  return element && element.className && element.className.split &&
    element.className.split(/\s+/).indexOf(className) >= 0;
}


/**
 * 获取
 * @param value
 * @param max
 * @param min
 */
export function getValueInRange(value: number, max: number, min = 0): number {
  return Math.max(Math.min(value, max), min);
}


/**
 * 数组元素交换位置
 * @param {array} arr 数组
 * @param {number} index1 添加项目的位置
 * @param {number} index2 删除项目的位置
 * index1和index2分别是两个数组的索引值，即是两个要交换元素位置的索引值，如1，5就是数组中下标为1和5的两个元素交换位置
 */
export function smxSwapArray(arr, index1, index2) {
  arr[index1] = arr.splice(index2, 1, arr[index1])[0];
  return arr;
}

// 上移 将当前数组index索引与后面一个元素互换位置，向数组后面移动一位

export function smxIndexUp(arr, index, length) {
  if (index + 1 !== length) {
    return smxSwapArray(arr, index, index + 1);
  } else {
    return false;
  }
}

// 下移 将当前数组index索引与前面一个元素互换位置，向数组前面移动一位


export function smxIndexDown(arr, index, length) {
  if (index !== 0) {
    return smxSwapArray(arr, index, index - 1);
  } else {
    return false;
  }
}


// 置底，即将当前元素移到数组的第一位
export function smxIndexBottom(arr, index, length) {
  if (index !== 0) {

    // 首先判断当前元素需要上移几个位置,置底移动到数组的第一位
    const moveNum = index - 0;

    // 循环出需要一个一个上移的次数
    for (let i = 0; i < moveNum; i++) {

      return smxSwapArray(arr, index, index - 1);

      index--;

    }
  } else {
    return false;
  }
}


// 置顶，即将当前元素移到数组的最后一位
export function smxIndexTop(arr, index, length) {
  if (index + 1 !== length) {

    // 首先判断当前元素需要上移几个位置,置底移动到数组的第一位
    const moveNum = length - 1 - index;

    // 循环出需要一个一个上移的次数
    for (let i = 0; i < moveNum; i++) {

      return smxSwapArray(arr, index, index + 1);

      index++;

    }
  } else {
    return false;
  }
}


/**
 * 日期对象转为日期字符串
 * @param date 需要格式化的日期对象
 * @param sFormat 输出格式,默认为yyyy-MM-dd                         年：y，月：M，日：d，时：h，分：m，秒：s
 * @example  dateFormat(new Date())                                "2017-02-28"
 * @example  dateFormat(new Date(),'yyyy-MM-dd')                   "2017-02-28"
 * @example  dateFormat(new Date(),'yyyy-MM-dd hh:mm:ss')         "2017-02-28 09:24:00"
 * @example  dateFormat(new Date(),'hh:mm')                       "09:24"
 * @example  dateFormat(new Date(),'yyyy-MM-ddThh:mm:ss+08:00')   "2017-02-28T09:24:00+08:00"
 * @returns {string}
 */
export function dateFormat(date: Date, sFormat: String = 'yyyy-MM-dd'): string {
  const time = {
    Year: 0,
    TYear: '0',
    Month: 0,
    TMonth: '0',
    Day: 0,
    TDay: '0',
    Hour: 0,
    THour: '0',
    hour: 0,
    Thour: '0',
    Minute: 0,
    TMinute: '0',
    Second: 0,
    TSecond: '0',
    Millisecond: 0
  };
  time.Year = date.getFullYear();
  time.TYear = String(time.Year).substr(2);
  time.Month = date.getMonth() + 1;
  time.TMonth = time.Month < 10 ? '0' + time.Month : String(time.Month);
  time.Day = date.getDate();
  time.TDay = time.Day < 10 ? '0' + time.Day : String(time.Day);
  time.Hour = date.getHours();
  time.THour = time.Hour < 10 ? '0' + time.Hour : String(time.Hour);
  time.hour = time.Hour < 13 ? time.Hour : time.Hour - 12;
  time.Thour = time.hour < 10 ? '0' + time.hour : String(time.hour);
  time.Minute = date.getMinutes();
  time.TMinute = time.Minute < 10 ? '0' + time.Minute : String(time.Minute);
  time.Second = date.getSeconds();
  time.TSecond = time.Second < 10 ? '0' + time.Second : String(time.Second);
  time.Millisecond = date.getMilliseconds();

  return sFormat.replace(/yyyy/ig, String(time.Year))
    .replace(/yyy/ig, String(time.Year))
    .replace(/yy/ig, time.TYear)
    .replace(/y/ig, time.TYear)
    .replace(/MM/g, time.TMonth)
    .replace(/M/g, String(time.Month))
    .replace(/dd/ig, time.TDay)
    .replace(/d/ig, String(time.Day))
    .replace(/HH/g, time.THour)
    .replace(/H/g, String(time.Hour))
    .replace(/hh/g, time.Thour)
    .replace(/h/g, String(time.hour))
    .replace(/mm/g, time.TMinute)
    .replace(/m/g, String(time.Minute))
    .replace(/ss/ig, time.TSecond)
    .replace(/s/ig, String(time.Second))
    .replace(/fff/ig, String(time.Millisecond));
}


/**
 * 打印日志方法
 * @param text
 * @param tag
 */
export function toLog(text: any, tag?: any) {
  const value = tag ? tag + ':::' + text : text;
  if (!environment.production) {
    console.log(value);
  }
}


export function toError(text: any, tag?: any) {
  const value = tag ? tag + ':::' + text : text;
  console.error(value);
}


/**
 * 获取随机数
 */
export function guid() {
  function S4() {
    return ((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
}

/**
 * 深copy
 */

export function deepCopy(obj: any) {
  let nObj;
  if (obj) {
    if (typeof obj === 'object') {
      nObj = JSON.parse(JSON.stringify(obj));
    } else {
      nObj = obj;
    }
  }
  return nObj;
}


/**
 * 获取url参数
 */
export function getQueryString(url: string) {
  // const url = this.location.path(); // 获取url中"?"符后的字串
  const theRequest = new Object();
  if ((url as any).indexOf('?') !== -1) {
    const str = (url as any).substr(1);
    const strs1 = str.split('?');
    let strs;
    if (strs1[1]) {
      strs = strs1[1].split('&');
    } else {
      strs = strs1[0].split('&');
    }

    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = strs[i].split('=')[1];
    }
  }

  return theRequest;
}


/**
 * ls存储
 * @param key
 * @param value
 */
export function set(key: string, value: string): void {
  localStorage[key] = value;
}

export function get(key: string): string {
  return localStorage[key] || false;
}

export function setObject(key: string, value: any): void {
  localStorage[key] = JSON.stringify(value);
}


export function getObject(key: string): any {
  return JSON.parse(localStorage[key] || '{}');
}


export function remove(key: string): any {
  localStorage.removeItem(key);
}


/**
 * 转JSON树
 * @param a  原始数组
 * @param idStr   id
 * @param pidStr  父id
 * @param chindrenStr   子节点
 */
export function transData(a, idStr, pidStr, childrenStr) {
  const r = [];
  const hash = {};
  const id = idStr;
  const pid = pidStr;
  const children = childrenStr;
  let i = 0;
  let j = 0;
  const len = a.length;
  for (; i < len; i++) {
    hash[a[i][id]] = a[i];
  }
  for (; j < len; j++) {
    const aVal = a[j], hashVP = hash[aVal[pid]];
    if (hashVP) {
      if (!hashVP[children]) {
        hashVP[children] = [];
      }
      hashVP[children].push(aVal);
    } else {
      r.push(aVal);
    }
  }
  return r;
}


/**
 * 是否空对象
 * @param e
 */
export function isEmptyObject(e) {
  for (const t in e) {
    if (t) {
      return !1;
    }
  }
  return !0;
}
