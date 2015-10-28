var mysql = require('../config/db').pool;
var Notification = require('../models/NotificationModel');
var mainSiteManager = require('../models/mainSiteModel');
var PackageManager = require('../models/packageListingModel');
var async = require("async");
var moment = require("moment");

exports.getDistributionChannel = function(req, res, next) {
                try {
                    if (req.session && req.session.package_UserName && req.session.package_StoreId) {
                        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                            async.parallel({
                                    distributionChannels: function (callback) {
                                        mainSiteManager.getAllDistributionChannelsByStoreId(connection_ikon_cms, req.session.package_StoreId, function (err, distributionChannels) {
                                            callback(err, distributionChannels);
                                        });
                                    }
                                },
                                function (err, results) {

                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                        console.log(err.message)
                                    } else {
                                        connection_ikon_cms.release();
                                        res.send(results);
                                    }
                                });
                        });
                    }else{
                        res.redirect('/accountlogin');
                    }
                }catch(err){
                    res.status(500).json(err.message);
                }
            };
exports.getNotificationData = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                        PackageName : function (callback){
                            PackageManager.getPackageByName(connection_ikon_cms,req.body.distributionChannelId,req.session.package_StoreId, function(err, packs){
                                callback(err,packs);
                            });
                        },
                        ValuePacks : function (callback){
                            if(req.body.PackageId != undefined && req.body.PackageId != 0) {
                                Notification.getValuePacks(connection_ikon_cms, req.body.PackageId, function (err, ValuePacks) {
                                    callback(err,ValuePacks)
                                });
                            }
                            else{
                                callback(null,'');
                            }
                        },
                        SubscriptionPacks : function (callback){
                            if(req.body.PackageId != undefined && req.body.PackageId != 0) {
                                Notification.getSubscriptionPacks(connection_ikon_cms, req.body.PackageId, function (err,  SubscriptionPacks) {
                                    callback(err, SubscriptionPacks)
                                });
                            }
                            else{
                                callback(null,'');
                            }
                        },
                        NotificationData : function (callback){
                            if(req.body.pnId != undefined && req.body.pnId >= 0) {
                                Notification.getNotificationData(connection_ikon_cms, req.body.pnId, function (err,  NotificationData ) {
                                    callback(err,NotificationData )
                                });
                            }
                            else{
                                callback(null,'');
                            }
                        }
                    },

                    function (err, results) {

                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                            console.log(err.message)
                        } else {
                            connection_ikon_cms.release();
                            res.send(results);
                        }
                    });
            });
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};
exports.addNotificationData = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                var cnt = 0;
                var count = req.body.PlanId.length - 1;
                loop(0);
                function loop( cnt ) {
                    var i = cnt;
                    Notification.getLastInsertedNotificationId( connection_ikon_cms,function(err,response){
                        if(err){

                        }else {
                            var planId = parseInt(req.body.PlanId[i].split('_')[1]);
                            var planType = req.body.PlanId[i].split('_')[0];
                            //console.log(moment(req.body.PushFrom).format('YYYY-MM-DD, HH:mm:ss'))
                            var data = {
                                pn_id: response[0].maxId,
                                pn_sp_pkg_id: req.body.PackageId,
                                pn_plan_start: moment(new Date()).add(req.body.Days, 'days').add(req.body.Hours, 'h').format('YYYY-MM-DD'),
                                pn_plan_id: planId,
                                pn_plan_type: planType,
                                pn_after_day: req.body.Days,
                                pn_after_hour: req.body.Hours,
                                pn_cnt_logical_operator: req.body.Operator,
                                pn_cnt_conditional_usage: req.body.Percent,
                                pn_message: req.body.Message,
                                pn_push_from: moment(req.body.PushFrom).format('YYYY-MM-DD HH:mm:ss'),
                                pn_push_to: moment(req.body.PushTo).format('YYYY-MM-DD HH:mm:ss'),
                                pn_push_type: req.body.Push,
                                pn_is_active: 1
                            }
                            console.log(data);
                            Notification.saveNotificationData(connection_ikon_cms, data, function (err, response) {
                                if (err) {

                                } else {
                                    console.log('in save ..');
                                    if (count == cnt) {
                                        connection_ikon_cms.release();
                                        res.send({status: 200, message: ''})
                                    } else {
                                        cnt = cnt + 1;
                                        loop(cnt);
                                    }
                                }
                            });
                        }

                    });
                }
            });
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};
exports.listNotificationData = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                        ListNotification : function (callback) {
                            if (req.body.PlanId) {
                                var planId = parseInt(req.body.PlanId.split('_')[1]);
                                var planType = req.body.PlanId.split('_')[0];
                                Notification.listNotifications(connection_ikon_cms, req.body.PackageId, planId, planType, function (err, ListNotification) {
                                    callback(err, ListNotification);
                                });
                            }
                            else
                            {
                                callback(null,'');
                            }
                        }

                    },
                    function (err, results) {

                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                            console.log(err.message)
                        } else {
                            connection_ikon_cms.release();
                            res.send(results);
                        }

                    });
            });
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};
exports.n_delete = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    delete: function (callback) {
                        Notification.delete(connection_ikon_cms, req.body.pnId, function (err, response) {
                            callback(err, response);
                        });
                    }

                }, function (err, results) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message);
                    } else {
                        connection_ikon_cms.release();
                        res.send({success: true, message: ' Notification ' + req.body.Status + ' successfully.'});
                    }
                });
            });
        } else {
            res.redirect('/accountlogin');
        }
    } catch (err) {
        res.status(500).json(err.message);
    }
};
exports.n_blockUnBlockContentType = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName) {

            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    updateContentTypeStatus : function(callback){
                        Notification.updateContentTypeStatus( connection_ikon_cms,req.body.active, req.body.pnId, function(err,response){
                            callback(err, response);
                        });
                    }

                },function(err,results){
                    if(err){
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message);
                    }else{
                        connection_ikon_cms.release();
                        res.send({ success: true, message: ' Notification '  +  req.body.Status + ' successfully.' });
                    }
                });
            });
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }

};
exports.updateNotificationData  = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                        NotificationData: function (callback) {
                            var data = {
                                pn_plan_start: moment(new Date()).add(req.body.Days, 'days').add(req.body.Hours, 'h').format('YYYY-MM-DD'),
                                pn_after_day: req.body.Days,
                                pn_after_hour: req.body.Hours,
                                pn_cnt_logical_operator: req.body.Operator,
                                pn_cnt_conditional_usage: req.body.Percent,
                                pn_message: req.body.Message,
                                pn_push_from: moment(req.body.PushFrom).format('YYYY-MM-DD HH:mm:ss'),
                                pn_push_to: moment(req.body.PushTo).format('YYYY-MM-DD HH:mm:ss'),
                                pn_push_type: req.body.Push
                            }

                            Notification.updateNotificationData(connection_ikon_cms, data,req.body.pnId, function (err, response) {
                                callback(err, response);
                            });
                        }
                    },
                    function (err, results) {

                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                            console.log(err.message)
                        } else {
                            connection_ikon_cms.release();
                            res.send(results);
                        }
                    });
            });
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};