var mysql = require('../config/db').pool;
//var Notification = require('../models/NotificationModel');
var mainSiteManager = require('../models/mainSiteModel');
var PackageManager = require('../models/packageListingModel');
var async = require("async");
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
                                        //console.log(results)
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
                        packs : function (callback){
                            mainSiteManager.getAllPacks(connection_ikon_cms,req.session.package_StoreId, function(err, packs){
                                callback(err,packs);
                            });
                        },
                        PackageName : function (callback){
                            PackageManager.getPackageByName(connection_ikon_cms,req.body.distributionChannelId,req.session.package_StoreId, function(err, packs){
                                callback(err,packs);
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
                            //console.log(results)
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