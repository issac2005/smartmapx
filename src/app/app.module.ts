// Import dependencies
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {NotFoundComponent} from './notfound/NotFound.component';
import {AppComponent} from './app.component';


import {routes} from './app.routes';

import {MainRouting} from './c-main/c-main-routing.module';


// modules
import {MainModule} from './c-main/c-main.module';
import {AppService} from './s-service/app.service';

// toast
import {ToastService} from './smx-unit/smx-toast/toast.service';
import {ToastBoxComponent} from './smx-unit/smx-toast/toast-box.component';
import {ToastComponent} from './smx-unit/smx-toast/toast.component';

// 登录、注册、修改密码modal
import {LoginModalComponent} from './c-main/modal/login-modal.component';

import {AppModalComponent} from './modal/app-modal.component';




// 新http
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';  // http
import {LocalStorage, DataStorage} from './s-service/local.storage';
import {HttpService} from './s-service/http.service';
import {InterceptorService} from './s-service/interceptor.service';


/** 配置 zorror**/
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {SmxModalModule} from './smx-component/smx-modal/smx-modal.module';
import {NZ_MESSAGE_CONFIG} from './smx-component/smx-message/smx-message-config';

@NgModule({
  // Define the root component
  bootstrap: [AppComponent],
  // Define other components in our module
  declarations: [
    NotFoundComponent, AppComponent, ToastBoxComponent,
    ToastComponent, LoginModalComponent, AppModalComponent
  ],
  // Define the services imported by our app
  imports: [HttpClientModule, BrowserModule, FormsModule, MainModule, NgZorroAntdModule,
    MainRouting, BrowserAnimationsModule, RouterModule.forRoot(routes, {
      useHash: true
    }), SmxModalModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: InterceptorService,
    multi: true
  }, {provide: NZ_MESSAGE_CONFIG, useValue: {nzTop: 80}}, LocalStorage, DataStorage, HttpService, AppService, ToastService],
  entryComponents: [LoginModalComponent, AppModalComponent],
  exports: [ToastBoxComponent]
})
export class AppModule {
}
