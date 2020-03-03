import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../services/auth/auth.service";
import {PackageModel} from "../models/package.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  isLogin: boolean;
  errorOccured: boolean;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.isLogin = true;
    this.errorOccured = false;
  }

  onLogin(form: NgForm){
    this.authService.readAuth(form.value.email, this.authService.hashPassword(form.value.password))
      .subscribe((data: PackageModel) => {
        if(data.completed){
          this.errorOccured = false;
          this.authService.updateToken(data.token);
          this.authService.setAuthOnInterval();
          this.router.navigate(['/user','data']);
        }else{
          this.errorOccured = true;
        }
      })
  }

  onCreate(form: NgForm){
    return this.authService.createAuth(form.value.email, form.value.name, this.authService.hashPassword(form.value.password))
      .subscribe((data: PackageModel) => {
        if(data.completed){
          this.errorOccured = false;
          this.authService.updateToken(data.token);
          this.authService.setAuthOnInterval();
          this.router.navigate(['/user','data']);

        }else{
          this.errorOccured = true;
        }
      });
  }

}
