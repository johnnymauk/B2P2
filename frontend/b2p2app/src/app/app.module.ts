import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {AuthService} from "./services/auth/auth.service";
import { HeaderComponent } from './header/header.component';
import { AuthComponent } from './auth/auth.component';
import { DataComponent } from './data/data.component';
import {HttpClientModule} from "@angular/common/http";
import { DataAddComponent } from './data/data-add/data-add.component';
import {FormsModule} from "@angular/forms";
import {AppRoutingModule} from "./app-routing.module";
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import {AuthGuardService} from "./services/auth/auth-guard.service";
import {DataService} from "./services/data/data.service";
import {UserService} from "./services/user/user.service";
import {UrlService} from "./services/url/url.service";
import { LogoutComponent } from './logout/logout.component';
import { DataTableComponent } from './data/data-table/data-table.component';
import { DataUpdateComponent } from './data/data-update/data-update.component';
import { UserComponent } from './user/user.component';
import { DataChartComponent } from './data/data-chart/data-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AuthComponent,
    DataComponent,
    DataAddComponent,
    PageNotFoundComponent,
    LogoutComponent,
    DataTableComponent,
    DataUpdateComponent,
    UserComponent,
    DataChartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [AuthService, AuthGuardService, DataService, UserService, UrlService],
  bootstrap: [AppComponent]
})
export class AppModule { }
