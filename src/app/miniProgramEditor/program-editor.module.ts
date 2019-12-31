import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {EditPanelModule} from './edit-panel/edit-panel.module';
import {MapComponent} from './map/map.component';
import {ProgramEditorComponent} from './program-editor.component';
import {FormsModule} from '@angular/forms';
import {MiniProgramModalModule} from './mini-program-modal/mini-program-modal.module';


@NgModule({
  declarations: [
    ProgramEditorComponent,
    MapComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    EditPanelModule,
    MiniProgramModalModule
  ],
  providers: [],
  bootstrap: [ProgramEditorComponent]
})
export class ProgramEditorModule {
}
