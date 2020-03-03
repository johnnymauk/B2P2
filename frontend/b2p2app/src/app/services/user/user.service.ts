import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {UrlService} from "../url/url.service";
import {UserModel} from "../../models/user.model";
import {TokenModel} from "../../models/token.model";
import {Observable} from "rxjs";
import {PackageModel} from "../../models/package.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user: UserModel;

  constructor(private http: HttpClient, private auth: AuthService, private url: UrlService) { }

  getUser(): UserModel {
    return this.user;
  }

  setUser(email: string, name: string){
    this.user.email = email;
    this.user.name = name;
  }

  readUser(): Observable<PackageModel> {
    return this.http.post<PackageModel>(this.url.getDomain()+'/user/read', this.auth.getToken(), this.url.getHeaders());
  }

  updateUser(user: UserModel): Observable<PackageModel>{
    return this.http.post<PackageModel>(this.url.getDomain()+'/user/update',
      {
        email: user.email,
        name: user.name,
        id: this.auth.getToken().id,
        code: this.auth.getToken().code
      }, this.url.getHeaders() );
  }

  deleteUser(): Observable<PackageModel>{
    return this.http.post<PackageModel>(this.url.getDomain()+'/user/delete', this.auth.getToken(), this.url.getHeaders());
  }

}
