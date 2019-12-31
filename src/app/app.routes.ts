import {Routes} from '@angular/router';
import {NotFoundComponent} from './notfound/NotFound.component';
// import {IndexComponent} from './index/index.component';

export const routes: Routes = [
  {path: '**', component: NotFoundComponent}
];



