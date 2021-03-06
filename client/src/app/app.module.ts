import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule ,ReactiveFormsModule}   from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatIconModule} from '@angular/material/icon';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IssueDescComponent } from './issue-desc/issue-desc.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { QuillModule } from 'ngx-quill'
import { SocketioService } from './socketio.service';
import { SearchComponent } from './search/search.component';
import { JwtModule } from '@auth0/angular-jwt'
import { AuthguardService }from './auth/authguard.service'
import { AuthService }from './auth/auth.service'
import { TokenInterceptor } from './auth/token.interceptor';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent  },
  {path: 'dashboard',component: DashboardComponent,canActivate: [AuthguardService]},
  {path: 'search',component: SearchComponent },
  {path: 'issueDescription/:issueId',component: IssueDescComponent,},
  { path: '',redirectTo: '/login',pathMatch: 'full' },
  { path: '**', component: LoginComponent }
];

const toolbar= [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean'],                                         // remove formatting button
  ];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    IssueDescComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,MatInputModule,MatSelectModule,MatCardModule,MatDividerModule,MatTableModule,MatPaginatorModule,MatSortModule,MatIconModule,
    QuillModule.forRoot({
      modules: {
        toolbar: toolbar
      }
    }),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(), // ToastrModule added
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('token');
        },
        whitelistedDomains: ['http://localhost:4200/','http://52.66.252.216:3000']
      }
    })
  ],
  providers: [ AuthService,{provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
