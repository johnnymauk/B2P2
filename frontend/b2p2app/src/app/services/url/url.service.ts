import { Injectable } from '@angular/core';
import {HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  private domain = 'http://localhost:3000';
  private headers = new HttpHeaders().set('Content-Type','application/json');

  constructor() { }

  getDomain(): string{
    return this.domain;
  }

  getHeaders(): {headers: HttpHeaders} {
    return {headers: this.headers};
  }
}
