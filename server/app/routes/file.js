
const fileController = require("./../../app/controllers/fileController");
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
    let baseUrl = `${appConfig.apiVersion}/files`;

    // defining routes.
    app.get(baseUrl+'/all',fileController.getAllFile);

    app.get(baseUrl+'/view/:issueId',fileController.viewByIssueId);

    app.post(baseUrl+'/:fileId/delete',fileController.deleteFile);

    app.post(baseUrl+'/create',upload.single('file'),fileController.createFile);
    

}// end setRouter function 

module.exports = {
    setRouter: setRouter
}