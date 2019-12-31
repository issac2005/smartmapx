import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SmxModalModule} from '../smx-component/smx-modal/smx-modal.module';
import {MainComponent} from './c-main.component';
import {MainRouting} from './c-main-routing.module';
import {HttpService} from '../s-service/http.service';
// 首页
import {IndexModule} from './index/index.module';
// 工具栏
import {HomeModule} from './apphome/home.module';


import {DataGridModule} from '../datagrid/data-grid.module';
import {DataManagementModule} from '../data/dataManagement.module';
import {EnDataSchemeModule} from '../data-scheme/en-data-scheme.module';
import {MapEditorModule} from '../mapEditor/mapEditor.module';
import {ProgramEditorModule} from '../miniProgramEditor/program-editor.module';
import {EtlModule} from '../etl/etl.module';
import {SmxRasterModule} from '../raster/smx-raster.module';
// 标绘地图模块
import {PlotMapModule} from '../plotMap/plot-map.module';


// 用户中心
import {UserModule} from '../user/user.module';
import {SmxIconModule, ColorSketchModule, SmxProgressModule} from '../smx-component/smx.module';
import {NgZorroAntdModule} from 'ng-zorro-antd';

// 任务中心
import {TaskManageService} from './task-manager/task-manage.service';
import {TaskManagerComponent} from './task-manager/task-manager.component';
import {TaskComponent} from './task-manager/task/task.component';
import {ServicePublishModule} from '../service-publish/service-publish.module';


/**
 * 主体模块
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MainRouting,
    HomeModule,
    SmxModalModule,
    DataGridModule,
    DataManagementModule,
    MapEditorModule, // 地图样式编辑器
    ProgramEditorModule, // 地图小程序编辑器
    EnDataSchemeModule, // 企业查询方案
    UserModule, // 用户中心
    EtlModule, // ETL
    IndexModule,
    ColorSketchModule,
    NgZorroAntdModule,
    SmxRasterModule,
    PlotMapModule,
    SmxIconModule,
    SmxProgressModule,
    ServicePublishModule
  ],
  declarations: [
    MainComponent, TaskManagerComponent, TaskComponent
  ],
  exports: [
    MainComponent
  ],
  providers: [HttpService, TaskManageService]
})
export class MainModule {
}
