import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { AppService } from '../app.service';
import { Router,ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-issue-desc',
  templateUrl: './issue-desc.component.html',
  styleUrls: ['./issue-desc.component.css']
})
export class IssueDescComponent implements OnInit {

  issueId='';
  issue;
  createForm: FormGroup;
  filesArray: File[] =[]; 
  statusList :String[] = ['In Progress', 'Done', 'Not picked'];
  editorStyle={height:'150px',background: '#fff'}
  date=new Date();
  isAttachmentChanged=false;
  isCreateNewIssue=true;
  isIssue=false;
  isEdit=false;
  isWatcher=false;
  isUserList=false;
  userList=[];
  comments=[
    {
      senderId:'1',
      message:'message1',
      createdOn:this.date,
      senderName:'Pragati'
    },
    {
      senderId:'2',
      message:'message2',
      createdOn:this.date,
      senderName:'Garav'
    },
    {
      senderId:'3',
      message:'message3',
      createdOn:this.date,
      senderName:'Dhyan'
    }
  ]
  userInfo= {
    userId:1
  }
  @ViewChild('scrollMe', { read: ElementRef }) 
  scrollMe: ElementRef;
  scrolltop:number = null

  constructor(private appService: AppService, private fb: FormBuilder, private router:Router,
    private route:ActivatedRoute,private toastr: ToastrService,) { 
   this.resetForm()
  }
  
    ngOnInit(): void {
      this.route.params.subscribe(params =>{
        console.log('params.issueId->',params.issueId);
        if(params.issueId!==''){
          this.isCreateNewIssue=false;
          this.issueId=params.issueId;
    
          //get issue by issueId
          this.appService.getIssueById(this.issueId).subscribe( (res) =>{
            console.log('res',res);
            if(!res.error){
            this.isIssue=true;
            this.setFormValue(res.data);
            }
            else{
             //this.toastr.error(res.message)
            }
          },(error)=>{
            console.log('error',error);
          })
        }
      })

      //get all users
      this.appService.getAllUsers().subscribe( (res) =>{
        console.log('res',res);
        if(!res.error){
        this.isUserList=true;
        this.userList=res.data;
        //set full name of assignee and reporter according to assignee id and reporter id
          if(this.issueId){
            this.issue.assigneeFullName= this.getFullName(this.issue.assignee,this.userList)
            this.issue.resporterFullName= this.getFullName(this.issue.reporter,this.userList)
            let userName= this.appService.getUserInfoFromLocalstorage().userName;
            this.isWatcher=this.issue.watchers.indexOf(userName)==-1?false:true;
          }
        }
        else{
          console.log(res.message);
          //this.toastr.error(res.message)
          }
        },(error)=>{
          console.log('error',error);
        })
    
  }


  resetForm(){
    this.createForm = this.fb.group({
     issueId:[''],
     title:['',Validators.required],
     description:[''],
     status:['',Validators.required],
     assignee:['',Validators.required],
     reporter:['',Validators.required],
     watchers:[[]],
     created:[this.date],
     comments:[[]],
     files:File
    })
   }

   getFullName(userName,userList){
    let user= userList.filter(function (el) {
      return el.userName == userName
    })['0'];
    return `${user.firstName} ${user.lastName} (${user.userName})`;
   }

   setFormValue(res){
    this.issue=res;
    this.filesArray=this.appService.getFilesArray(this.issue.files);
    this.scrolltop = this.scrollMe.nativeElement.scrollHeight
    console.log('this.filesArray->',this.filesArray);
      this.createForm.get('title').setValue(this.issue.title);
      this.createForm.get('description').setValue(this.issue.description);
      this.createForm.get('status').setValue(this.issue.status);
      this.createForm.get('assignee').setValue(this.issue.assignee);
      this.createForm.get('reporter').setValue(this.issue.reporter);
      this.createForm.get('watchers').setValue(this.issue.watchers);
      if(this.issueId==''){
        this.createForm.get('created').setValue(new Date());
      }else{
        this.createForm.get('created').setValue(this.issue.created);
      }
      this.createForm.get('comments').setValue(this.issue.comments);
   }

   createFormData(){
    console.log(this.createForm.value)
    console.log('FilesArray->',this.filesArray);
     let issue=this.createForm.value;
     var formData = new FormData();
      if(this.issueId)
      formData.append('issueId',this.issueId)
      formData.append('title',issue.title)
      formData.append('description',issue.description)
      formData.append('status',issue.status)
      formData.append('assignee',issue.assignee)
      formData.append('reporter',issue.reporter)
      formData.append('created',issue.created)
      if(this.filesArray.length>0){
      this.filesArray.forEach(element => {
        formData.append('files',element, element.name);
      });
      }else{
        formData.append('files','');
      }
     
    return formData;
     //you cant console.log formdata directly
      console.log(formData.get('title'));
   }

  saveClicked(){
    this.isEdit=false;
    let formData = this.createFormData();
    if(this.issueId==''){
      this.appService.createIssue(formData).subscribe((res)=>{
        console.log(res);
      })
    }else{
      this.editIssue(formData)
    }
  }

  editIssue(formData){
    this.appService.editIssue(formData).subscribe((res)=>{
      console.log(res);
      this.issue=res.data;
      //set full name of assignee and reporter according to assignee id and reporter id
      this.issue.assigneeFullName= this.getFullName(res.data.assignee,this.userList)
      this.issue.resporterFullName= this.getFullName(res.data.reporter,this.userList)
    })
  }

  onFileSelected(event) {
    this.isAttachmentChanged=true;
    this.filesArray.push(<File>event.target.files[0]);
  }

  removeFile(i){
    this.isAttachmentChanged=true;
    this.filesArray.splice(i, 1);
  }

  addWatcher(){
    var formData = new FormData();
    let userName= this.appService.getUserInfoFromLocalstorage().userName;
    console.log(this.issue.watchers);
    if(this.issue.watchers.indexOf(userName)==-1)
    this.issue.watchers.push(userName);
    formData.append('watchers',this.issue.watchers);
    formData.append('issueId',this.issue.issueId);
    if(this.filesArray.length>0){
      this.filesArray.forEach(element => {
        formData.append('files',element, element.name);
      });
    }else{
        formData.append('files','');
    }
    this.editIssue(formData);
   }

   removeWatcher(){
    var formData = new FormData();
    let userName= this.appService.getUserInfoFromLocalstorage().userName;
    var filtered = this.issue.watchers.filter(function(value){ return value == userName});
    formData.append('watchers',filtered);
    formData.append('issueId',this.issue.issueId);
    if(this.filesArray.length>0){
      this.filesArray.forEach(element => {
        formData.append('files',element, element.name);
      });
    }else{
        formData.append('files','');
    }
    this.editIssue(formData);
   }


}
