
const issueController = require("./../../app/controllers/issueController");
const appConfig = require("./../../config/appConfig")
const multer  = require('multer')
//to specify where multer will upload file
//this file is not statically accesible by default

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        //in end call callback ,pass error and path you want to strore file
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});

//now pass above to multer
const upload = multer({ storage:storage,limits: {
    fileSize: 1024 * 1024 * 10
} });

let setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}/issues`;

    // defining routes.

    app.get(baseUrl+'/all',issueController.getAllIssue);

    /**
	 * @api {get} /api/v1/issues/all Get all issues
	 * @apiVersion 0.0.1
	 * @apiGroup read
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  [
        {
            "issueId": "7Rfm-0d6q",
            "commets": [],
            "created": "2020-04-11T12:35:20.000Z",
            "watchers": [],
            "assignee": "",
            "reporter": "",
            "status": "",
            "description": "",
            "title": ""
        },
        {
            "issueId": "suhi6H-Ko",
            "commets": [],
            "created": "2020-04-11T12:43:41.000Z",
            "watchers": [
                "['Pragati','Gaurav']"
            ],
            "assignee": "Pragati",
            "reporter": "Gaurav",
            "status": "done",
            "description": "desc 2",
            "title": "Issue 2"
        }
    ]
	  @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Failed To Find Blog Details",
	    "status": 500,
	    "data": null
	   }
	 */


    app.get(baseUrl+'/view/:issueId',issueController.viewByIssueId);

    app.get(baseUrl+'/view/by/assignee/:assignee',issueController.viewByAssignee);

    app.get(baseUrl+'/view/by/status/:status',issueController.viewByStatus);

    app.post(baseUrl+'/:issueId/delete',issueController.deleteIssue);

    app.put(baseUrl+'/:issueId/edit',upload.array('files',10),issueController.editIssue);

    //app.post(baseUrl+'/create', upload.single('files'),issueController.createIssue);
    app.post(baseUrl+'/create', upload.array('files',10),issueController.createIssue);
    

}// end setRouter function 

module.exports = {
    setRouter: setRouter
}