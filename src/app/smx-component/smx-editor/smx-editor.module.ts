import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SEditorComponent} from './s-editor.component';

@NgModule({
  declarations: [SEditorComponent],
  imports: [
    CommonModule, FormsModule
  ],
  exports: [SEditorComponent]
})
export class SmxEditorModule {
}
