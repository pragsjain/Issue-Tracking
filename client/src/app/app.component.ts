import { Component } from '@angular/core';
import { AppService } from './app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  isUser:boolean=true;
  userName;
  constructor(private appService: AppService, private router: Router,){
  }
 ngOnInit(){
    this.appService.username.subscribe(result => {
    this.userName = result; 
  });
 }

 logout(){
  let userId=this.appService.getUserInfoFromLocalstorage()['userId']
  this.appService.logout(userId).subscribe( (res) =>{
    console.log(res);
  })
  this.appService.usernameSource.next('');
  this.appService.setUserInfoInLocalStorage('')
  this.appService.setTokenInLocalStorage('')
  this.router.navigate(['/login']);
 }
}
