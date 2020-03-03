import {Component, OnInit} from '@angular/core';
import {AuthService} from "./services/auth/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'b2p2app';

  constructor(private authService: AuthService){}


  ngOnInit(): void {
    this.authService.readClientSalt();
  }

  printClientSalt(){
    console.log(this.authService.getClientSalt());
  }
}
