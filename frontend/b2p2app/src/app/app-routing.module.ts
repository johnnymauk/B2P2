import { NgModule } from '@angular/core';

import {RouterModule, Routes} from "@angular/router";
import {AuthComponent} from "./auth/auth.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {AuthGuardService} from "./services/auth/auth-guard.service";
import {DataComponent} from "./data/data.component";
import {LogoutComponent} from "./logout/logout.component";
import {DataAddComponent} from "./data/data-add/data-add.component";
import {DataTableComponent} from "./data/data-table/data-table.component";
import {DataUpdateComponent} from "./data/data-update/data-update.component";

const routes: Routes = [
  {path:'', component: AuthComponent},
  {path:'login', component: AuthComponent},
  {path:'logout', component: LogoutComponent},
  {path:'user/data', canActivate:[AuthGuardService], component:DataComponent},
  {path:'user/data/create', canActivate:[AuthGuardService], component:DataAddComponent},
  {path:'user/data/read/:id', canActivate:[AuthGuardService], component: DataUpdateComponent },
  {path: 'not-found', component: PageNotFoundComponent},
  {path:'**', redirectTo: '/not-found'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ],
})

export class AppRoutingModule { }
