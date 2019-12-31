import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {EditPanelComponent} from './edit-panel.component';
import {JsEditPanelComponent} from './js-edit-panel/js-edit-panel.component';
import {JsonEditPanelComponent} from './json-edit-panel/json-edit-panel.component';
import {SourcePanelComponent} from './source-panel/source-panel.component';
import {SettingPanelComponent} from './setting-panel/setting-panel.component';
import {SmxModalModule} from '../../smx-component/smx-modal/smx-modal.module';
import {MultiplexsModule} from '../../multiplex/multiplexs.module';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {SmxEditorModule, SmxSelectModule} from '../../smx-component/smx.module';

@NgModule({
  declarations: [
    EditPanelComponent,
    JsEditPanelComponent,
    JsonEditPanelComponent,
    SourcePanelComponent,
    SettingPanelComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    SmxModalModule,
    MultiplexsModule,
    NgZorroAntdModule,
    SmxEditorModule,
    SmxSelectModule
    // RouterModule.forRoot(ROUTES)
  ],
  exports: [EditPanelComponent],
  providers: [],
  bootstrap: []
})

export class EditPanelModule {
}
