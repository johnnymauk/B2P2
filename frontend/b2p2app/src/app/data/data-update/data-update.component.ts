import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, NgForm} from "@angular/forms";
import {PackageModel} from "../../models/package.model";
import {DataService} from "../../services/data/data.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";
import * as M from "../../../../node_modules/materialize-css/dist/js/materialize";
import {DataModel} from "../../models/data.model";

@Component({
  selector: 'app-date-update',
  templateUrl: './data-update.component.html',
  styleUrls: ['./data-update.component.css']
})
export class DataUpdateComponent implements OnInit, AfterViewInit {

  @ViewChild('datepicker') datepicker : ElementRef;
  @ViewChild('timepicker') timepicker : ElementRef;

  @ViewChild('dataUpdateForm') dataUpdateForm : NgForm;

  datePickerInstance;
  timePickerInstance;
  bpid: number = 0;
  date: string;
  time: string;
  ampm: string;


  constructor(private dataService: DataService, private router: Router, private authService: AuthService, private activatedRouter: ActivatedRoute) { }

  ngOnInit(): void {
    this.bpid = +this.activatedRouter.snapshot.params['id'];
  }

  ngAfterViewInit(){
    let currentDate = new Date();

    this.dataService.readDataEntry(this.bpid).subscribe((data: PackageModel) => {
      if(data.completed){
        let temp = this.dataService.formatUTCToDateTime(data.data[0].dtime);
        this.setDateTimeAMPM(temp.date, temp.time, temp.ampm);
        this.setFormInfo(data.data[0]);

        let tempDate = temp.date.split('-');
        let tempTime = temp.time.split(':');

        this.datePickerInstance = M.Datepicker.init(this.datepicker.nativeElement, {
          maxDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
          defaultDate: new Date(+tempDate[0], +tempDate[1]-1, +tempDate[2]),
          format: 'yyyy-mm-dd'
        });

        this.timePickerInstance = M.Timepicker.init(this.timepicker.nativeElement, {
          defaultTime: (tempTime[0] + (temp.ampm == 'PM'? 12:0)) + ':' + tempTime[1]
        });


      }
      this.authService.updateToken(data.token);
    })





  }

  setFormInfo(data: DataModel){
    this.dataUpdateForm.controls["systolic"].setValue(data.systolic);
    this.dataUpdateForm.controls["diastolic"].setValue(data.diastolic);
    this.dataUpdateForm.controls["bpm"].setValue(data.pulse);
    this.dataUpdateForm.controls["datepicker"].setValue(this.date);
    this.dataUpdateForm.controls["timepicker"].setValue(this.time + ' '+this.ampm);
    this.dataUpdateForm.controls["note"].setValue(data.note);
  }

  setDateTimeAMPM(date: string, time: string, ampm: string){
    this.date = date;
    this.time = time;
    this.ampm = ampm;
  }

  getDate(){
    if(this.datePickerInstance.date == undefined) {
      let temp = this.date.split('/');
      return new Date(+temp[0], +temp[1] - 1, +temp[2]);
    }else{
      return new Date(this.datePickerInstance.date);
    }
  }

  getTime(){
    return (this.timePickerInstance.time == undefined ? this.time : this.timePickerInstance.time);
  }

  getAMPM(){
    return (this.timePickerInstance.time == undefined ? this.ampm : this.timePickerInstance.amOrPm);
  }


  onUpdate(form: NgForm){

    let utcDate = this.dataService.formatDateToUTC(
      this.getDate(),
      this.getTime(),
      this.getAMPM(),
      new Date().getTimezoneOffset());

    this.dataService.updateData(this.bpid, form.value.systolic, form.value.diastolic, form.value.bpm, utcDate, form.value.note).subscribe( (data: PackageModel) => {
      if(data.completed){
        console.log('Completed!');
        M.toast({html: 'Entry updated!'});
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
