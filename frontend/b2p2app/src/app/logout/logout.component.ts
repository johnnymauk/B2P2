import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth/auth.service";
import {PackageModel} from "../models/package.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.deleteAuth().subscribe((data: PackageModel) => {
      this.authService.updateToken(data.token);
      this.authService.clearAuthOnInterval();
      this.router.navigate(['/login']);
    });
  }

}
