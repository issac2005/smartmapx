import {NgModule, OnInit} from '@angular/core';
import {RouterModule, Routes, Router} from '@angular/router';

import {HomeComponent} from './apphome/home.component';
import {MainComponent} from './c-main.component';

// 面板
import {DataGridComponent} from '../datagrid/data-body.component';

// 专题面板
import {DataManagementComponent} from '../data/dataManagement.component';

import {EtlComponent} from '../etl/etl.component';
import {MonitorComponent} from '../monitor/monitor.component';
import {AccessComponent} from '../access/access.component';
import {EnDataSchemeComponent} from '../data-scheme/en-data-scheme.component';

// 编辑器
import {AppLayoutComponent} from '../mapEditor/app-layout/app-layout.component';

// 小程序编辑器
import {ProgramEditorComponent} from '../miniProgramEditor/program-editor.component';

// 用户中心
import {UserComponent} from '../user/user.component';

import {OrderComponent} from '../user/order/order.component';
import {IndexComponent} from './index/index.component';

//  标绘地图
import {PlotMapComponent} from '../plotMap/plot-map.component';
// 栅格图层
import {SmxRasterComponent} from '../raster/smx-raster.component';
import {ServicePublishComponent} from '../service-publish/service-publish.component';

/**
 * 主体路由
 * 之前使用懒加载的模块路由
 */
const mainRoutes: Routes = [
  {
    path: 'app',
    component: MainComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent // 首页
      },
      {
        path: 'showgeosf',
        component: DataManagementComponent,
        data: {module: 'geo'} // 地理专题
      },
      {
        path: 'showstasf',
        component: DataManagementComponent,
        data: {module: 'sta'}
      },
      {
        path: 'plot',
        component: DataManagementComponent,
        data: {module: 'plot'} // 标绘地图
      },
      {
        path: 'showmap',
        component: DataManagementComponent,
        data: {module: 'map'} // 地图列表
      },
      {
        path: 'showdata',
        component: DataManagementComponent,
        data: {module: 'da'}// 数据管理列表
      },
      {
        path: 'showapplet',
        component: DataManagementComponent,
        data: {module: 'ap'}// 小程序列表
      },
      {
        path: 'showenterprise',
        component: DataManagementComponent,
        data: {module: 'en'}   // 企业查询方案列表
      },
      {
        path: 'icon',
        component: DataManagementComponent,
        data: {module: 'icon'} // 系统符号库
      },
      {
        path: 'raster',
        component: DataManagementComponent, //  栅格
        data: {module: 'raster'} // 系统符号库
      },
      {
        path: 'service',
        component: DataManagementComponent,
        data: {module: 'service'} // 部署服务发布
      },
      {
        path: 'etl',
        component: EtlComponent // etlbody
      },
      {
        path: 'monitor',
        component: MonitorComponent // 监控body
      },
      {
        path: 'access',
        component: AccessComponent // 访问body
      },
      {
        path: 'data',
        component: DataGridComponent // 数据body
      },
      {
        path: 'geography',
        component: DataGridComponent // 地理body
      },
      {
        path: 'statistics',
        component: DataGridComponent // 统计body
      },
      {
        path: 'editor',
        component: AppLayoutComponent // 地图body
      },
      {
        path: 'programEditor',
        component: ProgramEditorComponent // 小程序body
      },
      {
        path: 'enDataSchema',
        component: EnDataSchemeComponent // 数据查询方案body
      },
      {
        path: 'user',
        component: UserComponent // 用户中心
      },
      {
        path: 'order',
        component: OrderComponent // 订单页面
      },
      {
        path: 'RasterHome',
        component: SmxRasterComponent
      },
      {
        path: 'plotEditor',
        component: PlotMapComponent // 标绘地图
      },
      {
        path: 'servicePublish',
        component: ServicePublishComponent // 标绘地图
      }
    ]
  },
  {
    path: '',
    component: MainComponent,
    children: [
      {path: '', component: IndexComponent},
      {path: 'index', component: IndexComponent},
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(mainRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class MainRouting {
}
