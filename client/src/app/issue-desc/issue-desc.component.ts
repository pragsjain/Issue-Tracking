import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { AppService } from '../app.service';
import { Router,ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-issue-desc',
  templateUrl: './issue-desc.component.html',
  styleUrls: ['./issue-desc.component.css']
})
export class IssueDescComponent implements OnInit {

  issueId='';
  issue;
  createForm: FormGroup;
  commentForm: FormGroup;
  filesArray: File[] =[]; 
  statusList :String[] = ['In Progress', 'Done', 'Not picked'];
  editorStyle={height:'150px',background: '#fff'}
  date=new Date();
  isForm=true;
  isWatcher=false;
  isUserList=false;
  userList=[];
  user;
  comments;
  noIssueDetail;
  reporterFullName='';
  fieldsChanged=[];

  @ViewChild('scrollMe', { read: ElementRef }) 
  scrollMe: ElementRef;
  scrolltop:number = null

  constructor(private appService: AppService, private fb: FormBuilder, private router:Router,
    private route:ActivatedRoute,private toastr: ToastrService,private socketService:SocketioService,) { 
   this.resetForm()
  }
  
    ngOnInit(): void {
      this.user=this.appService.getUserInfoFromLocalstorage()
      this.route.params.subscribe(params =>{
        //console.log('params.issueId->',params.issueId);
        if(params.issueId!==''){
          this.issueId=params.issueId;
          this.isForm=false;
          //get issue by issueId
          this.appService.getIssueById(this.issueId).subscribe( (res) =>{
            //console.log('res',res);
            if(!res.error){
            this.setFormValue(res.data);
            }
            else{
             this.toastr.error(res.message)
            }
          },(error)=>{
            console.log('error',error);
          })
        }
      })

      //get all users
      this.appService.getAllUsers().subscribe( (res) =>{
        //console.log('res',res);
        if(!res.error){
        this.isUserList=true;
        this.userList=res.data;
        }
        else{
          this.toastr.error(res.message)
          }
        },(error)=>{
          console.log('error',error);
        })

      if(this.issueId){
      //get all Comments
      this.getCommentbyIssueId(this.issueId);

      //get all Files
      this.getFilebyIssueId(this.issueId);
      }
  
  }

  resetForm(){
    //create form initially reporter will be user
    this.appService.fullName.subscribe(val=>
      this.reporterFullName= val );
    this.createForm = this.fb.group({
     issueId:[''],
     title:['',Validators.required],
     description:[''],
     status:['',Validators.required],
     assignee:['',Validators.required],
     reporter:[this.reporterFullName,Validators.required],
     watchers:[[]],
     created:[this.date],
    })
   
    this.commentForm = this.fb.group({
      comment:['',Validators.required]
    })
   }

   //set form according to response if issue id is not null
   setFormValue(res){
    this.issue=res;
    //console.log('this.filesArray->',this.filesArray);
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
      this.isWatcher=this.issue.watchers.indexOf(this.user.fullName)==-1?false:true;
      this.onFormChanges()
   }

   createFormData(){
    //console.log('saved form value->',this.createForm.value)
     let issue=this.createForm.value;
     var formData = {};
      if(this.issueId)
      formData['issueId']=this.issueId
      formData['title']=issue.title
      formData['description']=issue.description
      formData['status']=issue.status
      formData['assignee']=issue.assignee
      formData['reporter']=issue.reporter
      formData['created']=issue.created
      return formData;
   }

  saveClicked(){
    this.isForm=false;
    let formData = this.createFormData();
    if(this.issueId==''){
      this.appService.createIssue(formData).subscribe((res)=>{
        //console.log(res);
        this.router.navigate(['/dashboard']);
      })
    }else{
      this.editIssue(formData);
      //Send Notification
      var notificationMessage =`${this.user.fullName} has edited following fields in Issue Id: ${this.issueId}-`
      this.fieldsChanged.forEach(el=>{
        notificationMessage=notificationMessage+' ' +el+',';
      })
      notificationMessage=notificationMessage.substring(0,notificationMessage.length-1)
      this.sendNotification(notificationMessage)
    }
  }

  editIssue(formData){
    //console.log(formData);
    this.appService.editIssue(formData).subscribe((res)=>{
      //console.log(res);
      this.issue=res.data;
      this.isWatcher=this.issue.watchers.indexOf(this.user.fullName)==-1?false:true;
    })
  }

  onFileSelected(event) {
    this.isForm=false;
    var formData = new FormData();
    let element=<File>event.target.files[0]
    formData.append('issueId',this.issueId);
    formData.append('userName',this.user.userName);
    formData.append('userFullName',this.user.fullName);
    formData.append('url',"");
    formData.append('file',element, element.name);
    this.appService.createFile(formData).subscribe((res)=>{
      if(!res.error){
        console.log(res.message);
        this.getFilebyIssueId(this.issueId);
      }
      else{
        console.log(res.message);
      }
    });
    //Send Notification
    var notificationMessage =`${this.user.fullName} has added files in Issue Id: ${this.issueId}-`
    
    this.sendNotification(notificationMessage)
  }
  
  removeFile(fileId){
    this.isForm=false;
    this.appService.deleteFile(fileId).subscribe((res)=>{
      if(!res.error){
        //console.log(res.message);
        this.getFilebyIssueId(this.issueId);
      }
      else{
        console.log(res.message);
      }
    })
    //Send Notification
    var notificationMessage =`${this.user.fullName} has removed files in Issue Id: ${this.issueId}-`
    
    this.sendNotification(notificationMessage)
  }

  addWatcher(){
    var formData = {};
    if(this.issue.watchers.indexOf(this.user.fullName)==-1){
    this.issue.watchers.push(this.user.fullName);
    formData['watchers']=this.issue.watchers;
    formData['issueId']=this.issue.issueId;
    this.editIssue(formData);
    }
    var notificationMessage =`${this.user.fullName} is watching Issue Id: ${this.issueId}-`
    
    this.sendNotification(notificationMessage)
   }

   removeWatcher(){
    var formData = {};
    let fullName= this.user.fullName;
    var filtered = this.issue.watchers.filter(function(value){ return value !== fullName});
    formData['watchers']=filtered;
    formData['issueId']=this.issue.issueId;
    this.editIssue(formData);
    var notificationMessage =`${this.user.fullName} is no longer watching Issue Id: ${this.issueId}-`
    
    this.sendNotification(notificationMessage)
   }

   sendComment(){
    var formData={}
    formData['issueId']=this.issue.issueId;
    formData['userName']=this.user.userName;
    formData['userFullName']=this.user.fullName;
    formData['message']=this.commentForm.value.comment;

    this.appService.createComment(formData).subscribe((res)=>{
      //console.log(res);
      if(!res.error)
      this.getCommentbyIssueId(this.issueId);
      else{
        console.log(res.message);
      }
    })

      //reset form
      this.commentForm = this.fb.group({
        comment:['',Validators.required]
      })
      var notificationMessage =`${this.user.fullName} has commented on Issue Id: ${this.issueId}-`
      this.sendNotification(notificationMessage)
      
  }

getCommentbyIssueId(issueId){
  this.appService.getCommentbyIssueId(issueId).subscribe((res)=>{
    //console.log(res);
    this.scrolltop = this.scrollMe.nativeElement.scrollHeight
    if(!res.error){
    this.comments=res.data
    }
    else{
      this.comments=[]
      console.log(res.message);
    }
  })
}

getFilebyIssueId(issueId){
  this.appService.getFilebyIssueId(issueId).subscribe((res)=>{
    //console.log('filesArray',res);
    if(!res.error){
    this.filesArray=res.data
    }
    else{
      this.filesArray=[]
      console.log(res.message);
    }
  })
}

  //to notify what user has changed
  onFormChanges(): void {
    //console.log('onChanges');
    this.createForm.get('title').valueChanges.subscribe(val => {
      if(this.fieldsChanged.indexOf('Title')==-1)
      this.fieldsChanged.push('Title');
    });
    this.createForm.get('description').valueChanges.subscribe(val => {
      if(this.fieldsChanged.indexOf('Description')==-1)
      this.fieldsChanged.push('Description');
    });
    this.createForm.get('status').valueChanges.subscribe(val => {
      if(this.fieldsChanged.indexOf('Status')==-1)
      this.fieldsChanged.push('Status');
    });
    this.createForm.get('assignee').valueChanges.subscribe(val => {
      if(this.fieldsChanged.indexOf('Assignee')==-1)
      this.fieldsChanged.push('Assignee');
    });
    this.createForm.get('watchers').valueChanges.subscribe(val => {
      if(this.fieldsChanged.indexOf('Watchers')==-1)
      this.fieldsChanged.push('Watchers');
    }); 
    
  }

  sendNotification(notificationMessage){
    let notification={}
    notification['message']=notificationMessage;
    notification['userFullName']=this.user.fullName;
    notification['issueId']=this.issueId;
    this.socketService.socket.emit('sendnotification', notification);
  }
}
