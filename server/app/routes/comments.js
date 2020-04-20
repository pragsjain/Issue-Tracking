
const commentController = require("./../../app/controllers/commentController");
const appConfig = require("./../../config/appConfig")

let setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}/comments`;

    // defining routes.
    app.get(baseUrl+'/all',commentController.getAllComment);

    app.get(baseUrl+'/view/:issueId',commentController.viewByIssueId);

    app.post(baseUrl+'/:commentId/delete',commentController.deleteComment);

    app.post(baseUrl+'/create',commentController.createComment);
    

}// end setRouter function 

module.exports = {
    setRouter: setRouter
}