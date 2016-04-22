/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var valuePackManager = require('../models/valuePackModel');
var subscriptionPackManager = require('../models/subscriptionPackModel');
var alacartManager = require('../models/alacartModel');
var wlogger = require("../config/logger");
var async = require("async");
var fs = require("fs");
var reload = require('require-reload')(require);
var config = require('../config')();

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

exports.showPackSitePackageData = function(req, res, next)  {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    ContentTypes: function (callback) {
                        mainSiteManager.getContentTypes(connection_ikon_cms, req.session.package_StoreId, function (err, ContentTypeData) {
                            callback(err, ContentTypeData)
                        })
                    },
                    OfferData: function (callback) {
                        mainSiteManager.getOfferDataByStoreId( connection_ikon_cms, {storeId:req.session.package_StoreId, dcId:req.body.distributionChannelId}, function(err,OfferData){
                            callback(err, OfferData)
                        });
                    },
                    distributionChannels: function (callback) {
                        mainSiteManager.getAllDistributionChannelsByStoreId(connection_ikon_cms, req.session.package_StoreId, function (err, distributionChannels) {
                            callback(err, distributionChannels);
                        });
                    },
                    alacartPackPlans: function (callback) {
                        alacartManager.getAlacartPackPlansByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId, dcId:req.body.distributionChannelId}, function (err, ContentTypeData) {
                            callback(err, ContentTypeData)
                        });
                    },
                    valuePackPlans: function (callback) {
                        valuePackManager.getValuePackPlansByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId, dcId:req.body.distributionChannelId}, function (err, valuePackPlans) {
                            callback(err, valuePackPlans);
                        });
                    },
                    subscriptionPackPlans: function (callback) {
                        subscriptionPackManager.getSubscriptionDetailsByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId, dcId:req.body.distributionChannelId},function (err, subscriptionPackPlans) {
                            callback(err, subscriptionPackPlans);
                        });
                    },
                    packSitePackageData : function (callback){
                        async.waterfall([
                            function (callback) {
                                var searchData = {
                                    storeId: req.session.package_StoreId,
                                    dcId: req.body.distributionChannelId,
                                    packageType: req.body.packageType
                                }
                                mainSiteManager.getMainSitePackageData(connection_ikon_cms, searchData, function (err, packageDetails) {
                                    callback(err, packageDetails);
                                })
                            },
                            function (packageDetails, callback) {
                                if (packageDetails != null && packageDetails.length > 0) {
                                    async.waterfall([
                                        function (callback) {
                                            alacartManager.getAlacartNOfferDetails(connection_ikon_cms, packageDetails[0].sp_pkg_id, function (err, alacartNOfferDetails) {
                                                callback(err, alacartNOfferDetails);
                                            })
                                        },
                                        function (alacartNOfferDetails,callback) {
                                            if (alacartNOfferDetails != null && alacartNOfferDetails.length > 0) {
                                                alacartManager.getContentTypeAlacartPlan(connection_ikon_cms, alacartNOfferDetails[0].paos_id, function (err, contentTypePlanData) {
                                                    callback(null, {packageDetails:packageDetails, alacartNOfferDetails:alacartNOfferDetails,contentTypePlanData:contentTypePlanData });
                                                })
                                            } else {
                                                callback(null, {packageDetails:packageDetails,alacartNOfferDetails:alacartNOfferDetails,contentTypePlanData:null });
                                            }
                                        }
                                    ],
                                    function (err, results) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            callback(err, results);
                                        }
                                    })
                                } else {
                                    callback(null, {packageDetails:packageDetails, alacartNOfferDetails:null,contentTypePlanData:null});
                                }
                            }
                        ],
                        function (err, results) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            } else {

                                callback(err, results);
                                //res.send(results);
                            }
                        })
                    }
                },
                function (err, results) {
                    if (err) {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'showPackSitePackageData',
                            responseCode: 500,
                            message: JSON.stringify(err.message)
                        }
                        wlogger.error(error); // for error
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        var info = {
                            userName: req.session.package_UserName,
                            action : 'showPackSitePackageData',
                            responseCode: 200,
                            message: 'Pack Site Package Data retrieved successfully.'
                        }
                        wlogger.info(info); // for information
                        res.send(results);
                       // callback(err, results);
                    }
                })
            })
        }else{
            var error = {
                userName: "Unknown User",
                action : 'showPackSitePackageData',
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
            action : 'showPackSitePackageData',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};

exports.getPackSiteData = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    ContentTypes: function (callback) {
                        console.log("inside package data");
                        mainSiteManager.getContentTypes(connection_ikon_cms, req.session.package_StoreId, function (err, ContentTypeData) {
                            callback(err, ContentTypeData)
                        })
                    },
                    OfferData: function (callback) {
                        mainSiteManager.getOfferDataByStoreId( connection_ikon_cms, req.session.package_StoreId, '', function(err,OfferData){
                            callback(err, OfferData)
                        });
                    },
                    distributionChannels: function (callback) {
                        mainSiteManager.getAllDistributionChannelsByStoreId(connection_ikon_cms, req.session.package_StoreId, function (err, distributionChannels) {
                            callback(err, distributionChannels);
                        });
                    },
                    packs : function (callback){
                        mainSiteManager.getAllPacksByStoreId(connection_ikon_cms,req.session.package_StoreId, function(err, packs){
                            callback(err,packs);
                        });
                    }
                },
                function (err, results) {
                    if (err) {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'getPackSiteData',
                            responseCode: 500,
                            message: JSON.stringify(err.message)
                        }
                        wlogger.error(error); // for error
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        var info = {
                            userName: req.session.package_UserName,
                            action : 'getPackSiteData',
                            responseCode: 200,
                            message: 'Pack Site Data retrieved successfully.'
                        }
                        wlogger.info(info); // for information
                        connection_ikon_cms.release();
                        res.send(results);
                    }
                });
            });
        }else{
            var error = {
                userName: "Unknown User",
                action : 'getPackSiteData',
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
            action : 'getPackSiteData',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};
