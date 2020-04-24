const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const check = require('../libs/checkLib')
const passwordLib = require('./../libs/generatePasswordLib');
const token = require('../libs/tokenLib')

/* Models */
const UserModel = mongoose.model('User')
const AuthModel = mongoose.model('Auth')

let getAllUser = (req, res) => {
    UserModel.find()
        .select('-__v -_id')
        .lean() //make it plain javascript object,not mongoose object
        .exec((err, result) => { //trying to execute this function
            if (err) {
                logger.error(err, 'userController: getAllUser()', 5)
                let apiResponse = response.generate(true, 'Failed To Find Users', 500, null)
                res.send(apiResponse)
            } else if (result == undefined || result == null || result == '') {
                logger.error('No User Found', 'userController: getAllUser()', 5)
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all Users

let getAllAuth = (req, res) => {
   AuthModel.find()
        .select('-__v -_id')
        .lean() //make it plain javascript object,not mongoose object
        .exec((err, result) => { //trying to execute this function
            if (err) {
                logger.error(err, 'userController: getAllAuth()', 5)
                let apiResponse = response.generate(true, 'Failed To Find Auth', 500, null)
                res.send(apiResponse)
            } else if (result == undefined || result == null || result == '') {
                logger.error('No Auth Found', 'userController: getAllAuth()', 5)
                let apiResponse = response.generate(true, 'No Auth Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Auth Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}

// start user signup function 

let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.userName) {
                if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, '"password" parameter is missing"', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ userName: req.body.userName })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let fullName = req.body.firstName+' '+req.body.lastName +' (' +req.body.userName.toLowerCase()+')'
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            fullName: fullName,
                            userName: req.body.userName.toLowerCase(),
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this userName', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }// end create user function


    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })


}// end user signup function 

// start of login function 
let loginFunction = (req, res) => {

    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.userName) {
                console.log("req body userName is there");
                //console.log(req.body);
                UserModel.findOne({ userName: req.body.userName}, (err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User.Please Try Again !', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'Wrong Credentials.Please Try Again !', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });
               
            } else {
                let apiResponse = response.generate(true, '"userName" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword");
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let generateToken = (userDetails) => {
        console.log("generate token");
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    let saveAuthToken =(userDetails) =>{
        return new Promise((resolve, reject) => {
        let newAuth = new AuthModel({
            userId: userDetails.userId,
            authToken:userDetails.token,
            tokenSecret: 'IssueTrackingAppSecret',
            tokenGenerationTime :time.now()
        })
        newAuth.save((err, newAuth) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'userController: saveAuthToken', 10)
            let apiResponse = response.generate(true, 'Failed to create new Auth', 500, null)
            reject(apiResponse)
        } else {
            //console.log(newAuth)
            resolve(userDetails)
        }
        })
    })
    }
   

    findUser(req,res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveAuthToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}





let logout = (req, res) => {
    let AuthRemove =() =>{
        return new Promise((resolve, reject) => {     
       AuthModel.remove({ 'userId': req.params.userId }, (err, result) => {
            if (err) {
                logger.error(err, 'userController: logout()', 5)
                let apiResponse = response.generate(true, 'Failed To Delete Auth', 500, null)
                reject(apiResponse)
            } else if (result == undefined || result == null || result == '') {
                logger.error('No Auth Found', 'userController: logout()', 5)
                let apiResponse = response.generate(true, 'No Auth Found', 404, null)
                resolve(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Auth is Deleted Successfully', 200, result)
                resolve(apiResponse)
            }
        })
     })
    }
    AuthRemove(req,res)
    .then((resolve) => {
        res.send(resolve)
    })
    .catch((err) => {
        res.send(err)
    })

} // end of the logout function.


module.exports = {

    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout,
    getAllUser:getAllUser,
    getAllAuth:getAllAuth

}// end exports