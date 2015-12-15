
var mysql = require('../config/db').pool;
var nodemailer = require('nodemailer');
var userManager = require("../models/userModel");

var crypto = require('crypto');
var algorithm = 'aes-256-ctr'; //Algorithm used for encrytion
var password = 'd6F3Efeq'; //Encryption password

function encrypt(text){
    var cipher = crypto.createCipher(algorithm, password)
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

function getDate() {
    var d = new Date();
    var dt = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var selectdate = year + '-' + Pad("0", month, 2) + '-' + Pad("0", dt, 2);
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


exports.pages = function (req, res, next) {
    var role;

    var pagesjson = [
        { 'pagename': 'Store', 'href': 'store', 'id': 'a-la-cart', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Assign Rights', 'href': 'assign-right', 'id': 'value-pack', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
    ];

    if (req.session) {
        if (req.session.icon_UserName) {
            role = req.session.icon_UserRole;
            var pageData = getPages(role);
            res.render('index', { title: 'Express', username: req.session.icon_FullName, Pages: pageData, userrole: req.session.icon_UserType, lastlogin: " " + getDate(req.session.icon_lastlogin) + " " + getTime(req.session.icon_lastlogin) });
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    else {
        res.redirect('/accountlogin');
    }
}

//exports.login = function (req, res, next) {
//    if (req.session) {
//        if (req.session.icon_UserName) {
//            res.redirect("/#/plan-list");
//        }
//        else {
//            res.render('account-login', { error: '' });
//        }
//    }
//    else {
//        res.render('account-login', { error: '' });
//    }
//}
exports.login = function (req, res, next) {
    if(req.cookies.icon_remember == 1 && req.cookies.icon_username != '' ){
        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
            userManager.getIcnLoginDetails( connection_ikon_cms, decrypt(req.cookies.icon_username), decrypt(req.cookies.icon_password), function( err, row ){
                if (err) {
                    res.render('account-login', { error: 'Error in database connection' });
                } else {
                    if (row.length > 0) {
                        if (row[0].ld_active == 1) {
                            if(row[0].ld_user_type == 'Store Admin') {
                                connection_ikon_cms.release();

                                var session = req.session;
                                session.icon_UserId = row[0].ld_id;
                                session.icon_UserRole = row[0].ld_role;
                                session.icon_UserName =row[0].ld_user_name;
                                session.icon_Password = row[0].ld_user_pwd;
                                session.icon_FullName = row[0].ld_display_name;
                                session.icon_lastlogin = row[0].ld_last_login;
                                session.icon_UserType = row[0].ld_user_type;
                                if (req.session) {
                                    if (req.session.icon_UserName) {
                                        res.redirect("/");
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
                    }
                }
            });
        });
    }else if (req.session) {
        if (req.session.icon_UserName) {
            res.redirect("/#/plan-list");
        }
        else {
            res.render('account-login', { error: '' });
        }
    }
    else {
        res.render('account-login', { error: '' });
    }
}
exports.logout = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                //req.session = null;
               req.session.icon_UserId = null;
                req.session.icon_UserRole = null;
                req.session.icon_UserName = null;
                req.session.icon_Password = null;
                req.session.icon_FullName = null;
                req.session.icon_lastlogin = null;
                req.session.icon_UserType = null;
                res.clearCookie('icon_remember');
                res.clearCookie('icon_username');
                res.clearCookie('icon_password');
                res.redirect('/accountlogin');
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (error) {
        connection_central.end();
        res.render('account-login', { error: error.message });
    }
}
exports.authenticate = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
            if(req.body.rememberMe){
                var minute = 10080 * 60 * 1000;
                res.cookie('icon_remember', 1, { maxAge: minute });
                res.cookie('icon_username', encrypt(req.body.username), { maxAge: minute });
                res.cookie('icon_password', encrypt(req.body.password), { maxAge: minute });
            }
            userAuthDetails(connection_ikon_cms,req.body.username,req.body.password,req,res);
        });
    }
    catch (error) {
        res.render('account-login', { error: 'Error in database connection' });
    }
}


function userAuthDetails(dbConnection, username,password,req,res){
    userManager.getIcnLoginDetails( dbConnection, username, password, function( err, row ){
        if (err) {
            dbConnection.release();
            res.render('account-login', { error: 'Error in database connection' });
        } else {
            if (row.length > 0) {
                if (row[0].ld_active == 1) {
                    if(row[0].ld_user_type == 'Store Admin') {
                        var session = req.session;
                        session.icon_UserId = row[0].ld_id;
                        session.icon_UserRole = row[0].ld_role;
                        session.icon_UserName = req.body.username;
                        session.icon_Password = req.body.password;
                        session.icon_FullName = row[0].ld_display_name;
                        session.icon_lastlogin = row[0].ld_last_login;
                        session.icon_UserType = row[0].ld_user_type;//coming from new store's user table.
                        userManager.updateIcnLoginDetails( dbConnection, new Date, row[0].ld_id ,function(err,response){
                            if(err){
                                dbConnection.release();
                            }else{
                                dbConnection.release();
                                res.redirect('/');
                            }
                        });
                    } else {
                        dbConnection.release();
                        res.render('account-login', { error: 'Only Store Admin/Manager are allowed to login' });
                    }
                }
                else {
                    dbConnection.release();
                    res.render('account-login', { error: 'Your account has been disable' });
                }
            } else {
                dbConnection.release();
                if( req.body.username != undefined && req.body.username.length == 0  &&  req.body.password.length == 0 ) {
                    res.render('account-login', {error: 'Please enter username and password'});
                }else if(req.body.username != undefined && req.body.username.length != 0  &&  req.body.password.length == 0 ){
                    res.render('account-login', {error: 'Please enter password'});
                }
                else if(req.body.username != undefined && req.body.username.length == 0  &&  req.body.password.length != 0){
                    res.render('account-login', {error: 'Please enter username'});
                }
                else {
                    res.render('account-login', {error: 'Invalid Username / Password'});
                }
            }
        }
    });
}
function getPages(role) {

    var pagesjson = [
        { 'pagename': 'Add/Edit Store', 'href': 'add-store', 'id': 'store', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Assign Rights', 'href': 'assign-right', 'id': 'assign-right', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Manage Content', 'href': 'manage-content', 'id': 'manage-content', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Manage Country List', 'href': 'manage-country-list', 'id': 'manage-country-list', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
        ];

    return pagesjson;
}

exports.viewForgotPassword = function (req, res, next) {
    req.session = null;
    res.render('account-forgot', { error: '', msg: '' });
}

exports.forgotPassword = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_central) {
            userManager.getUserDetailsByIdByEmailId( connection_central, req.body.userid, req.body.emailid, function( err, row, fields ) {
                if (err) {
                    res.render('account-forgot', { error: 'Error in database connection.', msg: '' });
                }
                else {
                    if (row.length > 0) {

                        var smtpTransport = nodemailer.createTransport({
                            service: "Gmail",
                            auth: {
                                user: "jetsynthesis@gmail.com",
                                pass: "j3tsynthes1s"
                            }
                        });
                        var mailOptions = {
                            to: row[0].ld_email_id,
                            subject: 'Forgot Password',
                            html: "<p>Hi, " + row[0].ld_user_id + " <br />This is your password: " + row[0].ld_user_pwd + "</p>"
                        }
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                                res.end("error");
                            } else {
                                connection_central.release();
                                res.render('account-forgot', { error: '', msg: 'Please check your mail. Password successfully sent to your email' });
                                res.end("sent");
                            }
                        });
                    }
                    else {
                        connection_central.release();
                        res.render('account-forgot', { error: 'Invalid UserId / EmailId.', msg: '' });
                    }
                }
            });
        });
    }
    catch (err) {
        connection_central.end();
        res.render('account-forgot', { error: 'Error in database connection.' });
    }
}

exports.viewChangePassword = function (req, res, next) {
    req.session = null;
    res.render('account-changepassword', { error: '' });
}

exports.changePassword = function (req, res) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                var session = req.session;
                mysql.getConnection('CMS', function (err, connection_central) {
                    if (req.body.oldpassword == session.Password) {
                        userManager.updateUserDetails( connection_central, req.body.newpassword, new Date(), session.UserId, function (err, result) {
                            if (err) {
                                connection_central.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_central.release();
                                session.Password = req.body.newpassword;
                                res.send({ success: true, message: 'Password updated successfully.' });
                            }
                        });
                    }
                    else {
                        connection_central.release();
                        res.send({ success: false, message: 'Old Password does not match.' });
                    }
                })
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection_central.end();
        res.status(500).json(err.message);
    }
};
