// importing mongoose module
const mongoose = require('mongoose')
// import schema 
const Schema = mongoose.Schema;

let CommentSchema =new Schema({
    userName: String,
    firstName: String,
    lastName: String,
    message: String,
    date: Date
})

let issueSchema = new Schema(
    {
        issueId: {
            type: String,
            unique: true
        },
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            default: ''
        },
        reporter: {
            type: String,
            default: ''
        },
        assignee: {
            type: String,
            default: ''
        },
        watchers:{
            type:[String],
            default: []
        },
        created: {
            type: Date,
            default: Date.now
        },
        comments: {
            type:[CommentSchema],
            default:[]
        },
        // files :{
        //     type: String,
        //     default: 'https://picsum.photos/id/1005/5760/3840'
        // },
        files :{
            type: Array,
            default: []
        }
    }
)

mongoose.model('Issue', issueSchema);