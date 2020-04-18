const express = require('express')
const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const appConfig = require("./../../config/appConfig")
//const formidable = require('formidable')

//Importing the model here 
const IssueModel = mongoose.model('Issue')

let getAllIssue = (req, res) => {
    IssueModel.find()
        .select('-__v -_id')
        .lean() //make it plain javascript object,not mongoose object
        .exec((err, result) => { //trying to execute this function
            if (err) {
                logger.error(err, 'issueController: getAllIssue()', 5)
                let apiResponse = response.generate(true, 'Failed To Find Issues', 500, null)
                res.send(apiResponse)
            } else if (result == undefined || result == null || result == '') {
                logger.error('No Issue Found', 'issueController: getAllIssue()', 5)
                let apiResponse = response.generate(true, 'No Issue Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Issue Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all issues

/**
 * function to get single issue.
 */
let viewByIssueId = (req, res) => {

    IssueModel.findOne({ 'issueId': req.params.issueId }, (err, result) => {

        if (err) {
            logger.error(err, 'issueController: viewByIssueId()', 5)
            let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            logger.error('No Issue Found', 'issueController: viewByIssueId()', 5)
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        } else {
            result=generateFileUrl(result)
            let apiResponse = response.generate(false, 'All Issue Details Found', 200, result)
            res.send(apiResponse)
        }
    })
}

/**
 * function to get issue by status.
 */
let viewByStatus = (req, res) => {

    IssueModel.find({ 'status': req.params.status }, (err, result) => {

        if (err) {
            logger.error(err, 'issueController: viewByStatus()', 5)
            let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            logger.error('No Issue Found', 'issueController: viewByStatus()', 5)
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        } else {
            result=generateFileUrl(result)
            let apiResponse = response.generate(false, 'All Issue Details Found', 200, result)
            res.send(apiResponse)
        }
    })
}

/**
 * function to get issue by assignee.
 */
let viewByAssignee = (req, res) => {

    IssueModel.find({ 'assignee': req.params.assignee }, (err, result) => {

        if (err) {
            logger.error(err, 'issueController: viewByAssignee()', 5)
            let apiResponse = response.generate(true, 'Failed To Find Issue Details', 500, null)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            logger.error('No Issue Found', 'issueController: viewByAssignee()', 5)
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        } else {
            result=generateFileUrl(result)
            let apiResponse = response.generate(false, 'All Issue Details Found', 200, result)
            res.send(apiResponse)
        }
    })
}

/**
 * function to edit issue by admin.
 */
let editIssue = (req, res) => {

    // console.log('issueId',issueId);
    // console.log('files',req.files)
    editIssue=req.body
    filespath=[]
    console.log(req);
    console.log('req.files->',req.files)
    if(req.files !==null){
        req.files.forEach(element => {
            filespath.push(element.path);
        });
    editIssue['files']=filespath
    }
    // console.log('filespath',filespath)
    //  console.log('title',req.body['title']);
    //  console.log('watchers',req.body.watchers);
    // console.log('comments',req.body.comments);


    console.log('édit Issue->',editIssue)
    IssueModel.findOneAndUpdate({ 'issueId': req.params.issueId }, {$set:editIssue}, { new: true }).exec((err, result) => {
        if (err) {
            logger.error(err, 'issueController: editIssue()', 5)
            let apiResponse = response.generate(true, 'Failed To Edit issue', 500, null)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            logger.error('No Issue Found', 'issueController: editIssue()', 5)
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        } else {
            result=generateFileUrl(result)
            let apiResponse = response.generate(false, 'All Issue Details Found', 200, result)
            res.send(apiResponse)
        }
    })
}


let deleteIssue = (req, res) => {
    IssueModel.remove({ 'issueId': req.params.issueId }, (err, result) => {
        if (err) {
            logger.error(err, 'issueController: deleteIssue()', 5)
            let apiResponse = response.generate(true, 'Failed To Delete Issue', 500, null)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            logger.error('No Issue Found', 'issueController: deleteIssue()', 5)
            let apiResponse = response.generate(true, 'No Issue Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Issue is Deleted Successfully', 200, result)
            res.send(apiResponse)
        }
    })
}


let createIssue = (req, res) => {
    let issueId = shortid.generate()
    console.log('issueId',issueId);
   // console.log(req.body);
    console.log('files',req.files)
    filespath=[]
    if(req.files){
        req.files.forEach(element => {
            filespath.push(element.path);
        });
    }
    // console.log('title',req.body['title']);
    // console.log('watchers',req.body.watchers);
    // console.log('comments',req.body.comments); 
    let newIssue = new IssueModel({
        issueId: issueId,
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        reporter: req.body.reporter,
        assignee: req.body.assignee,
        watchers: req.body.watchers,
        created: time.now(),
        comments: req.body.comments,
        files: filespath
    }) // end new issue model

    newIssue.save((err, result) => {
        if (err) {
            logger.error(err.message, 'issueController: createIssue', 10)
            let apiResponse = response.generate(true, 'Failed to create new Issue', 500, null)
            res.send(apiResponse);
        } else {
            result=generateFileUrl(result)
            let apiResponse = response.generate(false, 'All Issue Details Found', 200, result)
            res.send(apiResponse)   
        }        
    }) // end new issue save
}

generateFileUrl= (result) => {
    var files=[];
    if(result.files!==[]){
        result.files.forEach(element => {
        var fileObj={};
          fileObj['url']='http://localhost:3000/'+element;
          fileObj['name']= element.split('\\')[1];
          files.push(fileObj);
      });
    }
    result['files']=files
    //console.log('result files',files)
    return result;
}




module.exports = {
    getAllIssue: getAllIssue,
    createIssue: createIssue,
    viewByIssueId: viewByIssueId,
    viewByStatus: viewByStatus,
    viewByAssignee: viewByAssignee,
    editIssue: editIssue,
    deleteIssue: deleteIssue
}