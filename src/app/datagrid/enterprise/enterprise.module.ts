import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {EnterpriseComponent} from './enterprise.component';
import {EtPageComponent} from './et-page/etpage.component';
import {SmxEditorModule, SmxModalModule} from '../../smx-component/smx.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SmxModalModule,
    RouterModule,
    BrowserAnimationsModule,
    SmxEditorModule
  ],
  declarations: [EnterpriseComponent, EtPageComponent],
  entryComponents: [],
  exports: [EnterpriseComponent],
  providers: []
})


export class EnterPriseModule {
}
