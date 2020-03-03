import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormGroupDirective, NgForm} from "@angular/forms";
import * as M from "../../../../node_modules/materialize-css/dist/js/materialize";
import {DataService} from "../../services/data/data.service";
import {PackageModel} from "../../models/package.model";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-data-add',
  templateUrl: './data-add.component.html',
  styleUrls: ['./data-add.component.css']
})
export class DataAddComponent implements OnInit, AfterViewInit {


  @ViewChild('datepicker') datepicker : ElementRef;
  @ViewChild('timepicker') timepicker : ElementRef;

  datePickerInstance;
  timePickerInstance;


  constructor(private dataService: DataService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    console.log('hello there pickers');
    let currentDate = new Date();
    console.log('Current Date: '+ currentDate.getMonth());
    this.datePickerInstance = M.Datepicker.init(this.datepicker.nativeElement, {
        maxDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        format: 'yyyy-mm-dd'
      });

    this.timePickerInstance = M.Timepicker.init(this.timepicker.nativeElement, {
    })
  }


  onCreate(form: NgForm){
    let utcDate = this.dataService.formatDateToUTC(
      new Date(this.datePickerInstance.date),
      this.timePickerInstance.time,
      this.timePickerInstance.amOrPm,
      new Date().getTimezoneOffset());

    this.dataService.createData(form.value.systolic, form.value.diastolic, form.value.bpm, utcDate, form.value.note).subscribe( (data: PackageModel) => {
      if(data.completed){
        console.log('Completed!');
        M.toast({html: 'Entry Saved!'});
      }else{
        M.toast({html: 'Error: Please try later!'});
      }
      this.authService.updateToken(data.token);
      this.router.navigate(['/user','data']);

    })
  }

  onCancel(){
    this.router.navigate(['/user','data']);
  }

}
