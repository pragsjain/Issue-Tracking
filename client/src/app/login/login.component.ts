import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../app.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  createLoginForm: FormGroup;

  constructor(
    private appService: AppService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {}
  
  ngOnInit() {
    this.resetForm()
  }

  resetForm(){
    this.createLoginForm = this.fb.group({
      userName:['',Validators.required],
      password:['',Validators.required]
    })
  }

  goToSignup(){
    this.router.navigate(['/register']);
   }

  signinFunction: any = () => {
    let loginFormValue=this.createLoginForm.value;
      let data = {
        userName: loginFormValue.userName,
        password: loginFormValue.password
      }
      this.appService.signinFunction(data)
        .subscribe((apiResponse) => {
          if (apiResponse.status === 200) {
            console.log(apiResponse)
             this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)
             this.appService.setTokenInLocalStorage(apiResponse.data.token)
             this.appService.usernameSource.next(apiResponse.data.userDetails.userName);
             this.router.navigate(['/dashboard']);
          } else {
            this.toastr.error(apiResponse.message)
          }
        }, (err) => {
          this.toastr.error('some error occured')
        });
    } // end signinFunction

  } 

  

  

