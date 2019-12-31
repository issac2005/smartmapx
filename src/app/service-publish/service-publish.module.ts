import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ServicePublishComponent} from './service-publish.component';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';



@NgModule({
  declarations: [
    ServicePublishComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule
  ]
})
export class ServicePublishModule { }
