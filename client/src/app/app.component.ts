import { Component } from '@angular/core';
import { AppService } from './app.service';
import { Router } from '@angular/router';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  isUser:boolean=true;
  userName;
  isLogin:boolean;
  isRegister:boolean;
  
  constructor(private appService: AppService, private router: Router,private route: ActivatedRoute){
  }
 ngOnInit(){
    this.appService.username.subscribe(result => {
    this.userName = result; 
  
      console.log(this.router);
      console.log(this.route);
     //this.isLogin= event['url'] =='/login'?true:false
     //this.isRegister= event['url'] =='/register'?true:false
    });
    
  console.log(this.isLogin,this.isRegister)
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
