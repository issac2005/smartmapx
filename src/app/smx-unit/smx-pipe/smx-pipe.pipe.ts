/**
 * Created by LLCN on 2018/9/14 16:06.
 *
 * name: user.pipe.ts
 * description: 全局管道服务
 */

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'SmxPipe'
})
export class SmxPipe implements PipeTransform {


  transform(value: any, args?: any): any {


    // 列字段类型
    if (args === 'ColumnType') {
      if (value === 'postgres_bigint') {
        return '大数型数值';
      }

      if (value === 'postgres_boolean') {
        return '布尔值';
      }

      if (value === 'postgres_double_precision') {
        return '浮点数值';
      }

      if (value === 'postgres_character_varying') {
        return '字符串';
      }

      if (value === 'postgres_timestamp') {
        return '时间';
      }
      if (value === 'postgres_date') {
        return '日期';
      }
      if (value === 'postgres_integer') {
        return '整数型数值';
      }
      if (value === 'postgres_bytea') {
        return '日期';
      }
      if (value === 'postgres_inet') {
        return '网址';
      }
    }


    // poi 类型
    if (args === 'geoType') {
      if (value === 0 || value === '0' || value === '') {
        return '非空间数据';
      }

      if (value === 10 || value === '10' || value === 'POINT') {
        return '点';
      }

      if (value === 20 || value === '20' || value === 'LINESTRING') {
        return '线';
      }

      if (value === 30 || value === '30' || value === 'POLYGON') {
        return '面';
      }

    }

    // 数据属性类型
    if (args === 'dataType') {
      if (args === 0 || args === '0' || value === '') {
        return '属性数据';
      } else {
        return '空间数据';
      }


    }


    // 表类型
    if (args === 'tableType') {
      if (value === 'view') {
        return '虚拟表';
      } else {
        return '实体表';
      }
    }

    // 统计图类型
    if (args === 'staType') {
      if (value === '7154b538-3257-4c51-b1ec-cbfacafb05e5') {
        return '流向图';
      }

      if (value === '6a66b3a7-d49a-44a4-bd5f-374dc9a06c9c') {
        return '等级设色';
      }


      if (value === '22c8992e-9714-48cd-8795-e377a9117f36') {
        return '行政区域设色';
      }


      if (value === '70d9e333-a40c-49d0-a88c-fbf156a37766') {
        return '定点符号图';
      }

      if (value === 'd20fb4db-484b-4408-a59b-dc96812c6d5e') {
        return '柱状图';
      }

      if (value === 'c40527b1-c55a-4922-9e2d-351897741583') {
        return '饼状图';
      }

      if (value === 'b8e4c3c0-55ec-4c47-b28f-6b2572bd48cd') {
        return '灯光图';
      }

      if (value === '1b42b204-a0a7-47a9-8ad3-934f03d2ed49') {
        return '热力图';
      }


      if (value === '05e20d72-c000-4f59-af97-8adb31bcc522') {
        return '聚合图';
      }

      if (value === 'cb1a9c12-e64a-11e8-b3e0-0242ac120002') {
        return '图标符号图';
      }
    }


    // 用户中心app
    if (args === 'appType') {
      if (value === 1 || value === '1') {
        return '小程序';
      }

      if (value === 2 || value === '2') {
        return 'Android';
      }

      if (value === 4 || value === '4') {
        return 'IOS';
      }

      if (16 <= value && value <= 112) {
        return '浏览器';
      }

      if (value > 112) {
        return '服务器';
      }

      return '未识别';
    }


    // 用户中心订单
    if (args === 'orderType') {
      // 版本id
      if (value === 'c4985149-6e9a-4f3b-8c8f-f35fc05dbbef') {
        return '基础版';
      }

      if (value === 'a997aa02-550c-40b2-95fc-160dd265d738') {
        return '高级版';
      }

      if (value === '9c5893d7-b025-405e-9fe0-4ee5d25d6ef8') {
        return '专业版';
      }

      if (value === 'c0b69e46-4f37-40b8-b757-e775b3861a5c') {
        return '企业版';
      }


      // 年份id
      if (value === 'cfeacf7d-db61-450f-9251-095f1942dfad') {
        return '半个月';
      }

      if (value === 'd359b272-cbc0-495a-b759-beeb81f82051' || value === '801cba91-fd34-4f31-a31c-fa886215ef5d') {
        return '一个月';
      }

      if (value === 'fa5a9ce2-3994-41c4-ae32-98aecdb9187b' || value === 'bdb5b8d0-bc2e-4656-a4d8-94ed846e341d') {
        return '两个月';
      }

      if (value === '97548891-8f82-4a40-95be-2f500206204d' || value === '3bfa961c-164a-4c08-aed7-8cf850308e26') {
        return '三个月';
      }

      if (value === '7f2f89a0-bce4-4981-b0be-00836519a76c' || value === 'd0d3d870-c341-47d4-aab2-616b04acb1be') {
        return '半年';
      }
      if (value === '9a6a42c0-f72b-4efd-8306-9c9e72e160a2' || value === '95c3ded1-8db9-4d1c-8225-468811f95c22') {
        return '1年';
      }
      if (value === 'a77aa68b-b578-4ae2-b27a-bd3dbb5d5129' || value === '7bb2f2c7-974c-432c-abb7-e7abfa176f13') {
        return '2年';
      }
      if (value === 'ce92d3ad-3f21-4c36-8b7f-37b39acfbec8' || value === 'a8b71ef0-5de9-464a-bf73-54ed7c9096bb') {
        return '3年';
      }
      if (value === '5e127793-d4bd-466b-ae2e-412d3052e0ad' || value === '6a4d330c-5d9b-4fe2-8c67-a79f854d4ffb') {
        return '5年';
      }
    }
    return value;
  }

}
