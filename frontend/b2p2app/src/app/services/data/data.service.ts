import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {UrlService} from "../url/url.service";
import {AuthService} from "../auth/auth.service";
import {DataModel} from "../../models/data.model";
import {PackageModel} from "../../models/package.model";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  data: DataModel[] = [];

  constructor(private http: HttpClient, private url: UrlService, private auth: AuthService) { }

  getData(): DataModel[] {
    return this.data;
  }

  createData(systolic: number, diastolic: number, pulse: number, dtime: string, note: string = ''): Observable<PackageModel> {
    return this.http.post<PackageModel>(this.url.getDomain()+'/user/data/create',
      {
        pressure: {systolic: systolic, diastolic: diastolic},
        bpm: pulse,
        dtime: dtime,
        note: note,
        id: this.auth.getToken().id,
        code: this.auth.getToken().code
      }, this.url.getHeaders());
  }

  readData(): Observable<PackageModel>{
    return this.http.post<PackageModel>(this.url.getDomain()+'/user/data/read',this.auth.getToken(), this.url.getHeaders());
  }

  readDataEntry(bpid: number): Observable<PackageModel>{
    return this.http.post<PackageModel>(this.url.getDomain()+'/user/data/read/entry', {
      bpid: bpid,
      id: this.auth.getToken().id,
      code: this.auth.getToken().code
    }, this.url.getHeaders());
  }

  updateData(bpid: number, systolic: number, diastolic: number, pulse: number, dtime: string, note: string = ''): Observable<PackageModel>{
    return this.http.post<PackageModel>(this.url.getDomain()+'/user/data/update',
      {
        bpid: bpid,
        pressure: {systolic: systolic, diastolic: diastolic},
        bpm: pulse,
        note: note,
        dtime: dtime,
        id: this.auth.getToken().id,
        code: this.auth.getToken().code
      }, this.url.getHeaders());
  }

  deleteData(bpid: number): Observable<PackageModel> {
    return this.http.post<PackageModel>(this.url.getDomain()+'/user/data/delete',
      {
        bpid: bpid,
        id: this.auth.getToken().id,
        code: this.auth.getToken().code
      }, this.url.getHeaders());
  }

  formatDateToUTC(dp: Date, tp: string, tpAP: string, offset: number): string{
    let temp = tp.split(':');
    let time = [ +temp[0]+(tpAP=="PM" ? 12 : 0), +temp[1] + offset];
    let date = new Date(dp.getFullYear(), dp.getMonth(), dp.getDate(), +time[0], +time[1]);
    let sDateTime = date.getFullYear() + '-';
    sDateTime += (date.getMonth()+1<10 ? '0':'') + (date.getMonth()+1) + '-';
    sDateTime += (date.getDate()<10 ? '0':'') + date.getDate() + ' ';
    sDateTime += date.getHours()+':'+date.getMinutes()+':00';
    return sDateTime;
  }

  formatUTCToDateTime(date: string): {date: string, time: string, ampm: string} {
    let cal = date.split(' ')[0].split('-');
    let time = date.split(' ')[1].split(':');
    let tempDate = new Date(+cal[0], +cal[1]-1 , +cal[2], +time[0], +time[1] - new Date().getTimezoneOffset() );
    let d = tempDate.getFullYear() + '/' + (tempDate.getMonth()+1) + '/' + tempDate.getDate();
    let t = (tempDate.getHours()>12? tempDate.getHours()-12 : tempDate.getHours()) + ':';
    t += (tempDate.getMinutes()<10 ? '0': '') + tempDate.getMinutes();

    return {date: d, time: t, ampm: (tempDate.getHours()>12 ? 'PM' : 'AM')};
  }

}
