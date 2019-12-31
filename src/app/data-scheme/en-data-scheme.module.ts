import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';


import {EnDataSchemeComponent} from './en-data-scheme.component';

@NgModule({
    imports: [FormsModule, RouterModule, CommonModule],
    exports: [EnDataSchemeComponent],
    declarations: [EnDataSchemeComponent],
    providers: [],
})
export class EnDataSchemeModule {
}
