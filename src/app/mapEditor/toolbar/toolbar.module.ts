import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ToolbarComponent} from './toolbar.component';

@NgModule({
  declarations: [ToolbarComponent],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  exports: [ToolbarComponent],
  providers: [],
  bootstrap: []
})
export class ToolbarModule {
}
