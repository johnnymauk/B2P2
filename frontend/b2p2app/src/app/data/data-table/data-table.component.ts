import { Component, OnInit } from '@angular/core';
import {DataService} from "../../services/data/data.service";
import {PackageModel} from "../../models/package.model";
import {DataModel} from "../../models/data.model";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit {

  data: DataModel[] = [];

  constructor(private dataService: DataService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.dataService.readData()
      .subscribe((data:PackageModel) => {
      if(data.completed){
        for( let point=0; point < data.data.length; point++){
          let temp = this.dataService.formatUTCToDateTime(data.data[point].dtime);
          this.data[point] = {
            id: data.data[point].id,
            systolic: data.data[point].systolic,
            diastolic: data.data[point].diastolic,
            pulse: data.data[point].pulse,
            date: temp.date,
            time: temp.time + ' ' + temp.ampm
          }
        }
        //this.data = data.data;
        this.authService.updateToken(data.token);
      }
    })
  }

  editEntry(bpid: number){
    this.router.navigate(['/user','data','read',bpid])
  }

}
