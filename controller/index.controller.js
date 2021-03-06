
var mysql = require('../config/db').pool;
var fs = require('fs');
var nodemailer = require('nodemailer');
var userManager = require('../models/userModel');
var crypto = require('crypto');
var algorithm = 'aes-256-ctr'; //Algorithm used for encrytion
var password = 'd6F3Efeq'; //Encryption password
var wlogger = require("../config/logger");
var reload = require('require-reload')(require);
var config = require('../config')();

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
function getDate(val) {
    var d = new Date(val);
    var dt = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var selectdate = Pad("0", dt, 2) + '/' + Pad("0", month, 2)  + '/' + year;
    return selectdate;
}
function getTime(val) {
    var d = new Date(val);
    var minite = d.getMinutes();
    var hour = d.getHours();
    var second = d.getSeconds();
    var selectdate = Pad("0", hour, 2) + ':' + Pad("0", minite, 2) + ':' + Pad("0", second, 2);
    return selectdate;
}
function Pad(padString, value, length) {
    var str = value.toString();
    while (str.length < length)
        str = padString + str;

    return str;
}

exports.allAction = function (req, res, next) {
    var currDate = Pad("0",parseInt(new Date().getDate()), 2)+'_'+Pad("0",parseInt(new Date().getMonth() + 1), 2)+'_'+new Date().getFullYear();
    if (wlogger.logDate == currDate) {
        var logDir = config.log_path;
        var filePath = logDir + 'logs_'+currDate+'.log';
        fs.stat(filePath, function(err, stat) {
            if(err != null&& err.code == 'ENOENT') {
                wlogger = reload('../config/logger');
            }
        });
        next();
    } else {
        wlogger = reload('../config/logger');
        next();
    }
}
/**
 * @function pages
 * @param req
 * @param res
 * @param next
 * @description get list of menus with related pages
 */
exports.pages = function (req, res, next) {
    var role;

    var pagesjson = [
        { 'pagename': 'Main Site', 'href': 'main-site', 'id': 'main-site', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Attach Pack', 'href': 'attach-pack', 'id': 'attach-pack', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Package Listing', 'href': 'packageListing', 'id': 'packageListing', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Notifications', 'href': 'notifications', 'id': 'notifications', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
    ];

    if (req.session) {
        if (req.session.package_UserName) {
            if (req.session.package_StoreId) {
                role = req.session.package_UserRole;
                var pageData = getPages(role);
                var info = {
                    userName: req.session.package_UserName,
                    action : 'pages',
                    responseCode: 200,
                    message: 'Page data retrieved successfully.'
                }
                wlogger.info(info); // for information
                //res.render('index', { title: 'Express', username: req.session.package_UserName, Pages: pageData, userrole: req.session.package_UserRole });
                res.render('index', {
                    title: 'Express',
                    username: req.session.package_FullName,
                    Pages: pageData,
                    userrole: req.session.package_UserType,
                    lastlogin: " " + getDate(req.session.package_lastlogin) + " " + getTime(req.session.package_lastlogin)
                });
            }
            else {
                var error = {
                    userName: "Unknown User",
                    action: 'getData',
                    responseCode: 500,
                    message: 'Invalid User Session'
                }
                wlogger.error(error); // for error
                res.redirect('/accountlogin');
            }
        } else {
            var error = {
                userName: "Unknown User",
                action: 'getData',
                responseCode: 500,
                message: 'Invalid User Session'
            }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }else {
        var error = {
            userName: "Unknown User",
            action : 'getData',
            responseCode: 500,
            message: 'Invalid User Session'
        }
        wlogger.error(error); // for error
        res.redirect('/accountlogin');
    }
}

/**
 * @function login
 * @param req
 * @param res
 * @param next
 * @description user can login
 */
exports.login = function (req, res, next) {
    if(req.cookies.package_remember == 1 && req.cookies.package_username != '' ){
        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
            userManager.getUserDetails( connection_ikon_cms, decrypt(req.cookies.package_username), decrypt(req.cookies.package_password), function( err, userDetails ){
                if (err) {
                    var error = {
                        userName: req.session.package_UserName,
                        action : 'login',
                        responseCode: 500,
                        message: JSON.stringify(err.message)
                    }
                    wlogger.error(error); // for error
                    res.render('account-login', { error: 'Error in database connection' });
                } else {
                    if (userDetails.length > 0) {
                        if (userDetails[0].ld_active == 1) {
                            if(userDetails[0].ld_role == 'Store Manager') {
                                connection_ikon_cms.release();
                                var session = req.session;
                                session.package_UserId = userDetails[0].ld_id;
                                session.package_UserRole = userDetails[0].ld_role;
                                session.package_UserName = userDetails[0].ld_user_name;
                                session.package_Password = userDetails[0].ld_user_pwd;
                                session.package_Email = userDetails[0].ld_email_id;
                                session.package_FullName = userDetails[0].ld_display_name;
                                session.package_lastlogin = userDetails[0].ld_last_login;
                                session.package_UserType = userDetails[0].ld_user_type;
                                session.package_StoreId = userDetails[0].su_st_id;
                                if (req.session) {
                                    if (req.session.package_UserName) {
                                        if (req.session.package_StoreId) {
                                            var info = {
                                                userName: req.session.package_UserName,
                                                action : 'login',
                                                responseCode: 200,
                                                message: 'Logged in with Remember Me option successfully.'
                                            }
                                            wlogger.info(info); // for information
                                            res.redirect("/");
                                        }
                                        else {
                                            res.redirect("/accountlogin");
                                        }
                                    }
                                    else {
                                        res.render('account-login', { error: '' });
                                    }
                                }
                                else {
                                    res.render('account-login', { error: '' });
                                }
                           }
                       }
                        var info = {
                            userName: req.session.package_UserName,
                            action : 'login',
                            responseCode: 200,
                            message: 'Logged in with Remember Me option successfully.'
                        }
                        wlogger.info(info); // for information
                    }
                 }
            });
        });
    }else if (req.session) {
        if (req.session.package_UserName) {
            if (req.session.package_StoreId) {
                res.redirect("/#/main-site");
            }
            else {
                res.redirect("/accountlogin");
            }
        }
        else {
            res.render('account-login', { error: '' });
        }
    }
    else {
        res.render('account-login', { error: '' });
    }
}
/**
 * @function logout
 * @param req
 * @param res
 * @param next
 * @description user can logout
 */
exports.logout = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.package_UserName) {
                if (req.session.package_StoreId) {
                    //req.session = null;
                    var info = {
                        userName: req.session.package_UserName,
                        action : 'login',
                        responseCode: 200,
                        message: 'Logged out successfully.'
                    }
                    wlogger.info(info); // for information
                    req.session.package_UserId = null;
                    req.session.package_UserRole = null;
                    req.session.package_UserName = null;
                    req.session.package_Password = null;
                    req.session.package_Email = null;
                    req.session.package_FullName = null;
                    req.session.package_lastlogin = null;
                    req.session.package_UserType = null;
                    req.session.package_StoreId = null;
                    res.clearCookie('package_remember');
                    res.clearCookie('package_username');
                    res.clearCookie('package_password');

                    res.redirect('/accountlogin');
                }
                else {
                    var error = {
                        userName: req.session.package_UserName,
                        action : 'logout',
                        responseCode: 500,
                        message: 'Logged out successfully.'
                    }
                    wlogger.error(error); // for information
                    res.redirect('/accountlogin');
                }
            }else{
                var error = {
                    userName: 'Unknown User',
                    action : 'logout',
                    responseCode: 500,
                    message: 'Logged out successfully.'
                }
                wlogger.error(error); // for information
                res.redirect('/accountlogin');
            }
        }
        else {
            var error = {
                userName: 'Unknown User',
                action : 'logout',
                responseCode: 500,
                message: 'Logged out successfully.'
            }
            wlogger.error(error); // for information
            res.redirect('/accountlogin');
        }
    }
    catch (error) {
        var error = {
            userName: 'Unknown User',
            action : 'logout',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.render('account-login', { error: error.message });
    }
}
/**
 * @function authenticate
 * @param req
 * @param res
 * @param next
 * @description user is authenticated
 */
exports.authenticate = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
            if(req.body.rememberMe){
                var minute = 10080 * 60 * 1000;
                res.cookie('package_remember', 1, { maxAge: minute });
                res.cookie('package_username', encrypt(req.body.username), { maxAge: minute });
                res.cookie('package_password', encrypt(req.body.password), { maxAge: minute });
            }
            userAuthDetails(connection_ikon_cms,req.body.username,req.body.password,req,res);
        });
    }
    catch (err) {
        var error = {
            userName: 'Unknown User',
            action : 'authenticate',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.render('account-login', { error: 'Error in database connection' });
    }
}

function userAuthDetails(dbConnection, username,password,req,res){
        userManager.getUserDetails( dbConnection, username, password, function( err, userDetails ){
        if (err) {
            var error = {
                userName: req.session.package_UserName,
                action : 'userAuthDetails',
                responseCode: 500,
                message: JSON.stringify(err.message)
            }
            wlogger.error(error); // for error
            res.render('account-login', { error: 'Error in database connection' });
        } else {
            if (userDetails.length > 0) {
                if (userDetails[0].ld_active == 1) {
                    if(userDetails[0].ld_role == 'Store Manager') {
                        var session = req.session;
                        session.package_UserId = userDetails[0].ld_id;
                        session.package_UserRole = userDetails[0].ld_role;
                        session.package_UserName = req.body.username;
                        session.package_Password = req.body.password;
                        session.package_Email = userDetails[0].ld_email_id;
                        session.package_FullName = userDetails[0].ld_display_name;
                        session.package_lastlogin = userDetails[0].ld_last_login;
                        session.package_UserType = userDetails[0].ld_user_type;
                        session.package_StoreId = userDetails[0].su_st_id;//coming from new store's user table.
                        userManager.updateLastLoggedIn( dbConnection, userDetails[0].ld_id ,function(err,response){
                            if(err){
                                var error = {
                                    userName: req.session.package_UserName,
                                    action : 'userAuthDetails',
                                    responseCode: 500,
                                    message: JSON.stringify(err.message)
                                }
                                wlogger.error(error); // for error
                                dbConnection.release();
                            }else{
                                var info = {
                                    userName: req.session.package_UserName,
                                    action : 'userAuthDetails',
                                    responseCode: 200,
                                    message: 'User authenticated successfully.'
                                }
                                wlogger.info(info); // for information
                                  dbConnection.release();
                                  res.redirect('/');
                            }
                        })
                    } else {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'userAuthDetails',
                            responseCode: 500,
                            message: 'Only Store Admin/Manager are allowed to login.'
                        }
                        wlogger.error(error); // for error
                        dbConnection.release();
                        res.render('account-login', { error: 'Only Store Admin/Manager are allowed to login' });
                    }
                }
                else {
                    var error = {
                        userName: req.session.package_UserName,
                        action : 'userAuthDetails',
                        responseCode: 500,
                        message: 'Your account has been disabled.'
                    }
                    wlogger.error(error); // for error
                    dbConnection.release();
                    res.render('account-login', { error: 'Your account has been disable' });
                }
            } else {
                dbConnection.release();
                if( req.body.username != undefined && req.body.username.length == 0  &&  req.body.password.length == 0 ) {
                    var error = {
                        userName: req.session.package_UserName,
                        action : 'userAuthDetails',
                        responseCode: 500,
                        message: 'Please enter username and password.'
                    }
                    wlogger.error(error); // for error
                    res.render('account-login', {error: 'Please enter username and password'});
                }else if(req.body.username != undefined && req.body.username.length != 0  &&  req.body.password.length == 0 ){
                    var error = {
                        userName: req.session.package_UserName,
                        action : 'userAuthDetails',
                        responseCode: 500,
                        message: 'Please enter password.'
                    }
                    wlogger.error(error); // for error
                    res.render('account-login', {error: 'Please enter password'});
                }
                else if(req.body.username != undefined && req.body.username.length == 0  &&  req.body.password.length != 0){
                    var error = {
                        userName: req.session.package_UserName,
                        action : 'userAuthDetails',
                        responseCode: 500,
                        message: 'Please enter username.'
                    }
                    wlogger.error(error); // for error
                    res.render('account-login', {error: 'Please enter username'});
                }
                else {
                    var error = {
                        userName: req.session.package_UserName,
                        action : 'userAuthDetails',
                        responseCode: 500,
                        message: 'Invalid Username / Password.'
                    }
                    wlogger.error(error); // for error
                    res.render('account-login', {error: 'Invalid Username / Password'});
                }
            }
        }
    });
}
/**
 * #function getPages
 * @param role
 * @returns json array
 * @description get list of pages allowed as per user-role
 */
function getPages(role) {
    if (role == "Super Admin" || role == "Store Manager") {

        var pagesjson = [
            { 'pagename': 'Mainsite', 'href': 'main-site.alacart', 'id': 'main-site', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': []},
            { 'pagename': 'Map Mainsite', 'href': 'map-mainsite', 'id': 'map-mainsite', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': []},
            { 'pagename': 'Packs', 'href': 'pack-site.alacart', 'id': 'pack-site', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Package Listing', 'href': 'packageListing', 'id': 'package-listing', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Notifications', 'href': 'notifications.add', 'id': 'notifications', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
        ];
        return pagesjson;
    }
}
/**
 * @function viewForgotPassword
 * @param req
 * @param res
 * @param next
 * @description display forgot password page
 */
exports.viewForgotPassword = function (req, res, next) {
    //req.session = null;
    req.session.package_UserId = null;
    req.session.package_UserRole = null;
    req.session.package_UserName = null;
    req.session.package_Password = null;
    req.session.package_Email = null;
    req.session.package_FullName = null;
    req.session.package_lastlogin = null;
    req.session.package_UserType = null;
    req.session.package_StoreId = null;
    var info = {
        userName: req.session.package_UserName,
        action : 'viewForgotPassword',
        responseCode: 200,
        message: 'View Forgot Password Page.'
    }
    wlogger.info(info); // for information
    res.render('account-forgot', { error: '', msg: '' });
}
/**
 * @function forgotPassword
 * @param req
 * @param res
 * @param next
 * @description get forgot password for user
 */
exports.forgotPassword = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_ikon_cms) {

            userManager.getUserByUserIdByEmail( connection_ikon_cms, req.body.userid, req.body.emailid, function( err, userDetails ){
                //console.log( userDetails[0] );
                if (err) {
                    var error = {
                        userName: req.session.package_UserName,
                        action : 'forgotPassword',
                        responseCode: 500,
                        message: JSON.stringify(err.message)
                    }
                    wlogger.error(error); // for error
                    res.render('account-login', { error: 'Error in database connection' });
                } else {
                    if (userDetails.length > 0) {

                        var smtpTransport = nodemailer.createTransport({
                            service: "Gmail",
                            auth: {
                                user: "jetsynthesis@gmail.com",
                                pass: "j3tsynthes1s"
                            }
                        });
                        var mailOptions = {
                            to: req.body.emailid,//'sujata.patne@jetsynthesys.com',
                            subject: 'Forgot Password',
                            html: "<p>Hi, " + userDetails[0].ld_user_id + " <br />This is your password: " + userDetails[0].ld_user_pwd + "</p>"
                        }
                        smtpTransport.sendMail(mailOptions, function (err, response) {
                            if (err) {
                                var error = {
                                    userName: req.session.package_UserName,
                                    action : 'forgotPassword',
                                    responseCode: 500,
                                    message: JSON.stringify(err)
                                }
                                wlogger.error(error); // for error
                                console.log(err);
                                res.end("error");
                            } else {
                                var info = {
                                    userName: req.session.package_UserName,
                                    action : 'forgotPassword',
                                    responseCode: 200,
                                    message: 'Password successfully sent to your email.'
                                }
                                wlogger.info(info); // for information
                                connection_ikon_cms.release();
                                res.render('account-forgot', { error: '', msg: 'Password successfully sent to your email, Please Check' });
                                res.end("sent");
                            }
                        });
                    }
                    else {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'forgotPassword',
                            responseCode: 500,
                            message: 'Invalid UserId / EmailId.'
                        }
                        wlogger.error(error); // for error
                        connection_ikon_cms.release();
                        res.render('account-forgot', { error: 'Invalid UserId / EmailId.', msg: '' });
                    }
                }
            });
        });
    }
    catch (err) {
        var error = {
            userName: "Unknown User",
            action : 'forgotPassword',
            responseCode: 500,
            message: 'Invalid User Session'
        }
        wlogger.error(error); // for error
        res.render('account-forgot', { error: 'Error in database connection' });
    }
}
/**
 * @function viewChangePassword
 * @param req
 * @param res
 * @param next
 * @description displays change password page
 */
exports.viewChangePassword = function (req, res, next) {
    //req.session = null;
    var info = {
        userName: req.session.package_UserName,
        action : 'viewChangePassword',
        responseCode: 200,
        message: 'View Change Password Page.'
    }
    wlogger.info(info); // for information
    req.session.package_UserId = null;
    req.session.package_UserRole = null;
    req.session.package_UserName = null;
    req.session.package_Password = null;
    req.session.package_Email = null;
    req.session.package_FullName = null;
    req.session.package_lastlogin = null;
    req.session.package_UserType = null;
    req.session.package_StoreId = null;

    res.render('account-changepassword', { error: '' });
}
/**
 * @function changePassword
 * @param req
 * @param res
 * @description process change password request
 */
exports.changePassword = function (req, res) {
    try {
        if (req.session) {
            if (req.session.package_UserName) {
                var session = req.session;
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    if(req.body.oldpassword == session.package_Password) {
                        userManager.updateUser( connection_ikon_cms, req.body.newpassword, new Date(), session.package_UserId, function( err, response ) {
                            if (err) {
                                var error = {
                                    userName: req.session.package_UserName,
                                    action : 'changePassword',
                                    responseCode: 500,
                                    message: JSON.stringify(err.message)
                                }
                                wlogger.error(error); // for error
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }else {
                                session.package_Password = req.body.newpassword;
                                var smtpTransport = nodemailer.createTransport({
                                    service: "Gmail",
                                    auth: {
                                        user: "jetsynthesis@gmail.com",
                                        pass: "j3tsynthes1s"
                                    }
                                });
                                var mailOptions = {
                                    to: session.package_Email,
                                    subject: 'Change Password',
                                    html: "<p>Hi, " + session.package_UserName + " <br />This is your password: " + req.body.newpassword + "</p>"
                                }
                                smtpTransport.sendMail(mailOptions, function (error, response) {
                                    if (error) {
                                        var error = {
                                            userName: req.session.package_UserName,
                                            action : 'changePassword',
                                            responseCode: 500,
                                            message: JSON.stringify(err.message)
                                        }
                                        wlogger.error(error); // for error
                                        connection_ikon_cms.release();
                                        res.end("error");
                                    } else {
                                        var info = {
                                            userName: req.session.package_UserName,
                                            action : 'changePassword',
                                            responseCode: 200,
                                            message: 'Password updated successfully.'
                                        }
                                        wlogger.info(info); // for information
                                        connection_ikon_cms.release();
                                        res.send({ success: true, message: 'Password updated successfully. Please check your mail' });
                                    }
                                });
                            }
                        }); 
                    }else {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'changePassword',
                            responseCode: 500,
                            message: 'Old Password does not match.'
                        }
                        wlogger.error(error); // for error
                        connection_ikon_cms.release();
                        res.send({ success: false, message: 'Old Password does not match' });
                    }
                })
            }
            else {
                var error = {
                    userName: "Unknown User",
                    action : 'changePassword',
                    responseCode: 500,
                    message: 'Invalid User Session'
                }
                wlogger.error(error); // for error
                res.redirect('/accountlogin');
            }
        }else{
            var error = {
                userName: "Unknown User",
                action : 'changePassword',
                responseCode: 500,
                message: 'Invalid User Session'
            }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        var error = {
            userName: "Unknown User",
            action : 'changePassword',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};
