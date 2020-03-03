import { Injectable } from '@angular/core';
import {TokenModel} from "../../models/token.model";
import {HttpClient} from "@angular/common/http";
import {UrlService} from "../url/url.service";
import {Observable} from "rxjs";
import {PackageModel} from "../../models/package.model";
import * as bcrypt from "../../../../node_modules/bcryptjs";


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: TokenModel = {id: 0, code:''};
  private interval;
  private clientSalt: string;
  private pepper: string = 'jmocha2020';

  constructor(private http: HttpClient, private url: UrlService) { }

  getClientSalt(): string{
    return this.clientSalt;
  }
  getPepper(): string {
    return this.pepper;
  }
  getToken(): TokenModel {
    return this.token;
  }

  isAuthenticated(){
    return (this.token.id > 0 && this.token.code != '');
  }

  hashPassword(password: string){
    return bcrypt.hashSync(this.pepper + password,this.clientSalt);
  }

  readClientSalt() {
    this.http.post<{salt: string}>(this.url.getDomain()+'/auth','', this.url.getHeaders())
      .subscribe((data: {salt: string} ) => {
        this.clientSalt = data.salt;
    });
  }

  createAuth(email: string, name: string, password: string) : Observable<PackageModel> {
    console.log('Creating Auth');
    return this.http.post<PackageModel>(
      this.url.getDomain()+'/auth/create',
      {email: email, name: name, password: password},
      this.url.getHeaders()
    );
  }
  readAuth(email: string, password: string): Observable<PackageModel> {
    console.log('Reading Auth');
    return this.http.post<PackageModel>(
      this.url.getDomain()+'/auth/read',
      {email: email, password: password},
      this.url.getHeaders()
    );
  }
  updateAuth(){
    console.log('Updating Auth Token');
    this.http.post<PackageModel>(
      this.url.getDomain()+'/auth/update',
      this.getToken(),
      this.url.getHeaders()
    ).subscribe( (pack: PackageModel) => {
      this.updateToken(pack.token);
    });
  }

  setAuthOnInterval(){
    console.log('Setting Auth Interval');
    this.interval = setInterval(()=>{this.updateAuth()}, 600000);
  }
  clearAuthOnInterval(){
    console.log('Clearing Auth Interval');
    clearInterval(this.interval);
  }

  deleteAuth(): Observable<PackageModel> {
    console.log('Deleting Auth Token');
    return this.http.post<PackageModel>(this.url.getDomain()+'/auth/delete', this.getToken(), this.url.getHeaders());
  }

  updateToken(token: TokenModel){
    this.token = token;
    console.log('New Token Updated');
  }

}
