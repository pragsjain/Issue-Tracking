import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {AppService } from '../app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['status', 'title', 'reporter', 'date','delete'];
  ELEMENT_DATA: IssueElement[];
  dataSource: MatTableDataSource<IssueElement>
  isIssue:boolean=false;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private appService: AppService, private router: Router,private toastr: ToastrService,){
    
  }
  ngOnInit() {
    this.getAllIssues()
  }

  getAllIssues(){
    this.appService.getAllIssues().subscribe( (res) =>{
      console.log(res);
      if(!res.error && res.data){
      this.isIssue=true;
      var IssuesArray:any=[];
      res.data.forEach(element => {
        var obj={};
        obj['issueId']=element.issueId
        obj['status']=element.status;
        obj['title']=element.title;
        obj['reporter']=element.reporter;
        obj['date']=element.created;
        IssuesArray.push(obj);
      });
      this.ELEMENT_DATA =IssuesArray;
    }
    else{
     // this.toastr.error(res.message)
      this.isIssue=false;
      this.ELEMENT_DATA =[];
    }
    this.dataSource= new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    },(error)=>{
      console.log('error',error);
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  create(){
    this.router.navigate(['/issueDescription','']);
  }

  edit(issueId){
    console.log(issueId);
    this.router.navigate(['/issueDescription',issueId]);
  }

  delete(issueId){
    console.log('delete',issueId);
    this.appService.deleteIssue(issueId).subscribe( (res) =>{
      console.log(res);
      this.getAllIssues()
    })
  }
}


export interface IssueElement {
  issueId: string
  status: string;
  title: string;
  reporter: string;
  date: Date;
}
