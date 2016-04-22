/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var valuePackManager = require('../models/valuePackModel');
var subscriptionPackManager = require('../models/subscriptionPackModel');
var alacartManager = require('../models/alacartModel');
var ArrangeManager = require('../models/ArrangePlansModel');
var userManager = require('../models/userModel');
var wlogger = require("../config/logger");
var config = require('../config')();

var async = require("async");
var fs = require("fs");
var reload = require('require-reload')(require);

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

exports.getStoreDetails = function(req, res){
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    ContentTypes: function (callback) {
                        if( req.query.packId != 'undefined' ) {
                            mainSiteManager.getContentTypesByPackId(connection_ikon_cms, req.session.package_StoreId, req.query.packId, function (err, ContentTypeData) {
                                    callback(err, ContentTypeData)
                            })
                            
                        } else  {
                            mainSiteManager.getContentTypes(connection_ikon_cms, req.session.package_StoreId, function (err, ContentTypeData) {
                                callback(err, ContentTypeData)
                            })
                        }
                    },
                    distributionChannels: function (callback) {
                        mainSiteManager.getAllDistributionChannelsByStoreId(connection_ikon_cms, req.session.package_StoreId, function (err, distributionChannels) {
                            callback(err, distributionChannels);
                        });
                    },
                    packs : function (callback){
                        mainSiteManager.getAllPacksByStoreId(connection_ikon_cms,{storeId:req.session.package_StoreId}, function(err, packs){
                            callback(err,packs);
                        });
                    },
                    OfferData: function (callback) {
                        mainSiteManager.getOfferDataByStoreId( connection_ikon_cms, {storeId:req.session.package_StoreId}, function(err,OfferData){
                            callback(err, OfferData)
                        });
                    },
                    alacartPackPlans: function (callback) {
                          userManager.getSelectedPaymentTypesByStoreId( connection_ikon_cms,req.session.package_StoreId,function(err,response) {
                            if(err){
                                 connection_ikon_cms.release();
                                 res.status(500).json(err.message);
                            }else{
                                if(response != undefined && response.length > 0 && response.length < 2){
                                    if(response[0].cmd_entity_detail == 2){
                                         alacartManager.getAlacartPackPlansByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId}, function (err, alacartPackPlans) {
                                            callback(err, alacartPackPlans)
                                         });
                                    }else{
                                        callback(err,'NoAlaCart');
                                    }
                                }else if(response != undefined && response.length > 0 && response.length == 2){
                                     alacartManager.getAlacartPackPlansByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId}, function (err, alacartPackPlans) {
                                        callback(err, alacartPackPlans)
                                     });
                                }
                            }
                        });
                    },
                    valuePackPlans: function (callback) {
                        valuePackManager.getValuePackPlansByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId}, function (err, valuePackPlans) {
                            callback(err, valuePackPlans);
                        });
                    },
                    subscriptionPackPlans: function (callback) {
                        userManager.getSelectedPaymentTypesByStoreId( connection_ikon_cms,req.session.package_StoreId,function(err,response) {
                            if(err){
                                 connection_ikon_cms.release();
                                 res.status(500).json(err.message);
                            }else{
                                if(response != undefined && response.length > 0 && response.length < 2){
                                    if(response[0].cmd_entity_detail == 1){
                                         subscriptionPackManager.getSubscriptionDetailsByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId},function (err, subscriptionPackPlans) {
                                            callback(err, subscriptionPackPlans);
                                         });
                                    }else{
                                        callback(err,'NoSub');
                                    }
                                }else if(response != undefined && response.length > 0 && response.length == 2){
                                    subscriptionPackManager.getSubscriptionDetailsByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId},function (err, subscriptionPackPlans) {
                                        callback(err, subscriptionPackPlans);
                                     });
                                }
                            }
                        });
                    }
                },
                function (err, results) {
                    if (err) {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'getStoreDetails',
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
                            action : 'getStoreDetails',
                            responseCode: 200,
                            message: 'Retrieved Store Details Successfully.'
                        }
                        wlogger.info(info); // for information
                        connection_ikon_cms.release();
                        //console.log(results);
                        res.send(results);
                    }
                })
            })
        }else{
            var error = {
                userName: "Unknown User",
                action : 'getStoreDetails',
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
            action : 'getStoreDetails',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};


exports.showPackageData = function(req, res, next)  {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    alacartPackPlans: function (callback) {
                        userManager.getSelectedPaymentTypesByStoreId( connection_ikon_cms,req.session.package_StoreId,function(err,response) {
                            if(err){
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }else{
                                if(response != undefined && response.length > 0 && response.length < 2){
                                    if(response[0].cmd_entity_detail == 2){
                                        alacartManager.getAlacartPackPlansByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId, dcId:req.body.distributionChannelId}, function (err, alacartPackPlans) {
                                            callback(err, alacartPackPlans)
                                        });
                                    }else{
                                        callback(err,'NoAlaCart');
                                    }
                                }else if(response != undefined && response.length > 0 && response.length == 2){
                                    alacartManager.getAlacartPackPlansByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId, dcId:req.body.distributionChannelId}, function (err, alacartPackPlans) {
                                        callback(err, alacartPackPlans)
                                    });
                                }
                            }
                        });
                    },                    
                    subscriptionPackPlans: function (callback) {
                        userManager.getSelectedPaymentTypesByStoreId( connection_ikon_cms,req.session.package_StoreId,function(err,response) {
                            if(err){
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }else{
                                if(response != undefined && response.length > 0 && response.length < 2){
                                    if(response[0].cmd_entity_detail == 1){
                                        subscriptionPackManager.getSubscriptionDetailsByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId, dcId:req.body.distributionChannelId},function (err, subscriptionPackPlans) {
                                            callback(err, subscriptionPackPlans);
                                        });
                                    }else{
                                        callback(err,'NoSub');
                                    }
                                }else if(response != undefined && response.length > 0 && response.length == 2){
                                    subscriptionPackManager.getSubscriptionDetailsByStoreId(connection_ikon_cms, {storeId:req.session.package_StoreId, dcId:req.body.distributionChannelId},function (err, subscriptionPackPlans) {
                                        callback(err, subscriptionPackPlans);
                                    });
                                }
                            }
                        });
                    },
                    mainSitePackageData : function (callback){
                        async.waterfall([
                                function (callback) {
                                    console.log('req.body');
                                    console.log(req.body);
 
                                    if (req.body.packageType === 1 ){

                                        mainSiteManager.getIndividualPackageData(connection_ikon_cms, req.session.package_StoreId,req.body.pkgId, function (err, packageDetails) {
                                            callback(err, packageDetails );
                                        })
                                    }else  if (req.body.pkgId && req.body.pkgId != null && req.body.pkgId != undefined && req.body.pkgId != '') {
                                        mainSiteManager.getIndividualPackageData(connection_ikon_cms, req.session.package_StoreId,req.body.pkgId, function (err, packageDetails) {
                                            callback(err, packageDetails);
                                        })
                                    }
                                    else{
                                        var searchData = {
                                            storeId: req.session.package_StoreId,
                                            dcId: req.body.distributionChannelId,
                                            packageType: req.body.packageType
                                        }

                                        mainSiteManager.getMainSitePackageData(connection_ikon_cms, searchData, function (err, packageDetails) {
                                            callback(err, packageDetails);
                                        })
                                    }
                                },
                                function (packageDetails, callback) {
                                    if (packageDetails != null && packageDetails.length > 0) {
                                        async.waterfall([
                                                function (callback) {
                                                    ArrangeManager.getArrangeSequenceData(connection_ikon_cms, packageDetails[0].sp_pkg_id, function (err, arrangeSequenceData) {
                                                        callback(err, arrangeSequenceData);
                                                    })
                                                },
                                                function (arrangeSequenceData, callback) {
                                                    alacartManager.getAlacartNOfferDetails(connection_ikon_cms, packageDetails[0].sp_pkg_id, function (err, alacartNOfferDetails) {
                                                        callback(err, arrangeSequenceData, alacartNOfferDetails);
                                                    })
                                                },
                                                function (arrangeSequenceData,alacartNOfferDetails,callback) {
                                                    if (alacartNOfferDetails != null && alacartNOfferDetails.length > 0) {
                                                        alacartManager.getContentTypeAlacartPlan(connection_ikon_cms, alacartNOfferDetails[0].paos_id, function (err, contentTypePlanData) {
                                                           callback(null, {arrangeSequenceData:arrangeSequenceData,packageDetails:packageDetails, alacartNOfferDetails:alacartNOfferDetails,contentTypePlanData:contentTypePlanData });
                                                        })
                                                    } else {
                                                        callback(null, {arrangeSequenceData:arrangeSequenceData,packageDetails:packageDetails,alacartNOfferDetails:alacartNOfferDetails,contentTypePlanData:null });
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
                                        callback(null, {packageDetails:packageDetails, arrangeSequenceData: null,alacartNOfferDetails:null,contentTypePlanData:null});
                                    }
                                }
                            ],
                            function (err, results) {
                                if (err) {
                                    var error = {
                                        userName: req.session.package_UserName,
                                        action : 'showPackageData',
                                        responseCode: 500,
                                        message: JSON.stringify(err.message)
                                    }
                                    wlogger.error(error); // for error
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
                            action : 'showPackageData',
                            responseCode: 500,
                            message: JSON.stringify(err.message)
                        }
                        wlogger.error(error); // for error
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                    } else {
                        var info = {
                            userName: req.session.package_UserName,
                            action : 'showPackageData',
                            responseCode: 200,
                            message: 'Retrieved Package Data successfully.'
                        }
                        wlogger.info(info); // for information
                        connection_ikon_cms.release();
                        res.send(results);
                    }
                })
            })
        }else{
            var error = {
                userName: "Unknown User",
                action : 'showPackageData',
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
            action : 'showPackageData',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};

exports.getMainSiteData = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    ContentTypes: function (callback) {
                       console.log("package data main site");
                        mainSiteManager.getContentTypes(connection_ikon_cms, req.session.package_StoreId, function (err, ContentTypeData) {
                            callback(err, ContentTypeData)
                        })
                    },
                    OfferData: function (callback) {
                        mainSiteManager.getOfferDataByStoreId( connection_ikon_cms,  {storeId:req.session.package_StoreId}, function(err,OfferData){
                            callback(err, OfferData)
                        });
                    },
                    distributionChannels: function (callback) {
                        mainSiteManager.getAllDistributionChannelsByStoreId(connection_ikon_cms, req.session.package_StoreId, function (err, distributionChannels) {
                            callback(err, distributionChannels);
                        });
                    },
                    packs : function (callback){
                        mainSiteManager.getAllPacksByStoreId(connection_ikon_cms,{storeId:req.session.package_StoreId}, function(err, packs){
                            callback(err,packs);
                        });
                    }
                },
                function (err, results) {

                    if (err) {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'getMainSiteData',
                            responseCode: 500,
                            message: JSON.stringify(err.message)
                        }
                        wlogger.error(error); // for error
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                    } else {
                        var info = {
                            userName: req.session.package_UserName,
                            action : 'getMainSiteData',
                            responseCode: 200,
                            message: 'Retrieved Mainsite Data successfully.'
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
                action : 'getMainSiteData',
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
            action : 'getMainSiteData',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};