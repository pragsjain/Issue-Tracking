import { Injectable } from '@angular/core';

import { Cookie } from 'ng2-cookies/ng2-cookies';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Observable,throwError, of } from 'rxjs';
import { map ,catchError} from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  //private url =  'https://chatapi.edwisor.com';
  private url =  'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
  ) {} 
  getUserInfoFromLocalstorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  } 
  setUserInfoInLocalStorage = (data) =>{
    localStorage.setItem('userInfo', JSON.stringify(data));
  }
  getTokenFromLocalstorage = () => {
    return JSON.parse(localStorage.getItem('authtoken'));
  } 
  setTokenInLocalStorage = (data) =>{
    localStorage.setItem('token', JSON.stringify(data));
  }

  usernameSource = new BehaviorSubject<string>(this.getUserInfoFromLocalstorage().userName);
  username = this.usernameSource.asObservable()


  signupFunction(formdata): Observable<any> {
    return this.http.post(`${this.url}/api/v1/users/signup`, formdata);
  } 

  signinFunction(formdata): Observable<any> {
    return this.http.post(`${this.url}/api/v1/users/login`, formdata);
  } 

  logout(userId): Observable<any> {
    return this.http.post(`${this.url}/api/v1/users/${userId}/delete`,userId);
  } 

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.url}/api/v1/users/all`)
    .pipe(map((response:any) =>{
        return response;
    }),catchError(<T>(error: any, result?: T) => {
      console.log(error);
      return this.handleError(error)
    }))
  } 

   getAllIssues(): Observable<any> {
    return this.http.get(`${this.url}/api/v1/issues/all`)
    .pipe(map((response:any) =>{
        return response;
    }),catchError(<T>(error: any, result?: T) => {
      console.log(error);
      return this.handleError(error)
    }))
  } 

   getIssueById(issueId): Observable<any> {
    return this.http.get(`${this.url}/api/v1/issues/view/${issueId}`);
  } 
    
  createIssue(formdata): Observable<any> {
    return this.http.post(`${this.url}/api/v1/issues/create`, formdata);
  } 
    
  editIssue(formdata): Observable<any> {
    return this.http.put(`${this.url}/api/v1/issues/${formdata.get('issueId')}/edit`, formdata);
  } 

  deleteIssue(issueId): Observable<any> {
    return this.http.post(`${this.url}/api/v1/issues/${issueId}/delete`,issueId);
  } 

  getFilesArray(files){
    let filesArray=[]
    files.forEach(element => {
      var image_data =  this.http.get<any>(element.url, { responseType: 'blob' as 'json' });
        image_data.subscribe
        (res => {
          var file_object = new File([res], element.name, { type: 'image/jpeg', lastModified:Date.now()});
          file_object['url']=element.url;
          filesArray.push(file_object);
        });
    });
    return filesArray;
  }

  




  private handleError(err: HttpErrorResponse) {

    let errorMessage = '';

    if (err.error instanceof Error) {

      errorMessage = `An error occurred: ${err.error.message}`;

    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.error.text}`;

    } // end condition *if

    this.toastr.error(err.error.text);
    return throwError(errorMessage);

  }  // END handleError

}
