import smartmapx from '@smx/api';
import * as SmartMapxInspect from '@smx/smartmapx-gl-inspect';

const config = require('../../config/config.json');

/**
 * 创建地图实例
 * @param element
 * @param options
 */
export function getMapInstance(element: string, options = {}) {
  console.log(config);
  (options as any).container = element;

  if (!(options as any).map_id && !(options as any).style) {
    (options as any).map_id = 'map_id_1';
  }

  // if ((options as any).center && (options as any).zoom) {
  //   (options as any).center = (options as any).center ? (options as any).center : [116.39738, 39.90579];
  //   (options as any).zoom = (options as any).zoom ? (options as any).zoom : 10;
  // }


  smartmapx.mapbase = config.serviceIP.basemap || '';
  smartmapx.apikey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE1MzcxODM1OTgsImRhdGEiOiJ7XCJsb2dpbl9uYW1lXCI6XCJyb290XCIsXCJnZW5kZXJcIjoyLFwidXNlcl9pZFwiOlwiZm1fc3lzdGVtX3VzZXJfcm9vdFwiLFwidXNlcl9uYW1lXCI6XCJyb290XCIsXCJ1c2VyX29yaWdpbl9pZFwiOlwiZm1fbG9jYWxcIixcInByb2R1Y3RfaWRcIjpcIlwiLFwiZXhwaXJlX3RpbWVcIjpcIlwiLFwic291cmNlX2lkXCI6XCJcIixcInR5cGVcIjpcIlwiLFwiY29ycF9pZFwiOlwiZm1fc3lzdGVtX2NvcnBcIn0iLCJleHAiOjQwOTI1OTkzNDksImp0aSI6ImFfNjhmZjBhZGY5OTcxNDQ0NThjNzViZWFiN2FjNTkzYWYifQ.W122WkT6QR4HZWbpalkpmirV9JWkDYcCkmNZoxCB_z8';
  return new smartmapx.Map(options);
}

/**
 * 移除地图实例
 * @param map
 */
export function removeMapInstance(map: any) {
  map.remove();
}


/**
 * 添加控件
 * @param map
 * @param type
 * @param options
 */
export function addMapControl(map: any, type: string, position: string = 'top-right', options?: any) {

  if (!map) {
    console.log(`初始化${type}插件时未能获取到地图对象`);
    return;
  }


  // 全屏
  if (type === 'fullscreen') {
    const control = new smartmapx.FullscreenControl(options);
    if (position) {
      map.addControl(control, position);
    } else {
      map.addControl(control);
    }

    return control;
  }


  // 导航
  if (type === 'navigation') {
    const control = new smartmapx.NavigationControl(options);
    if (position) {
      map.addControl(control, position);
    } else {
      map.addControl(control);
    }
    return control;
  }


  // 比例尺
  if (type === 'scale') {
    if (!options) {
      options = {
        displayControlsDefault: false,
        controls: {
          point: true,
          line_string: true,
          polygon: true,
          trash: true
        }
      };
    }
    const control = new smartmapx.ScaleControl({maxWidth: 100, unit: 'm'});
    if (position) {
      map.addControl(control, position);
    } else {
      map.addControl(control);
    }
    return control;
  }


  // 绘制
  if (type === 'draw') {
    const drawControl = new (smartmapx as any).DrawControl(options);
    if (position) {
      map.addControl(drawControl, position);
    } else {
      map.addControl(drawControl);
    }
    return drawControl;
  }


  // popue
  if (type === 'popup') {
    return new smartmapx.Popup({
      closeButton: true,
      closeOnClick: true
    });
  }


  // 检视
  if (type === 'inspect') {
    const inspect = new SmartMapxInspect({
      popup: new smartmapx.Popup({
        closeButton: true,
        closeOnClick: true,
      }),
      showInspectMap: false,
      showMapPopupOnHover: true,
      showInspectMapPopupOnHover: true,
      showInspectButton: false,
    });
    if (position) {
      map.addControl(inspect, position);
    } else {
      map.addControl(inspect);
    }
    return inspect;
  }


  // 测量
  if (type === 'measure') {
    const measure = new smartmapx.MeasureControl(options);
    if (position) {
      map.addControl(measure, position);
    } else {
      map.addControl(measure);
    }
    return measure;
  }

}
