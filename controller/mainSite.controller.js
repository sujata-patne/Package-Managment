/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var valuePackManager = require('../models/valuePackModel');
var subscriptionPackManager = require('../models/subscriptionPackModel');
var alacartManager = require('../models/alacartModel');
var ArrangeManager = require('../models/ArrangePlansModel');

var async = require("async");

exports.showPackageData = function(req, res, next)  {
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
                        mainSiteManager.getOfferData( connection_ikon_cms, req.session.package_StoreId, req.body.distributionChannelId, function(err,OfferData){
                            callback(err, OfferData)
                        });
                    },
                    distributionChannels: function (callback) {
                        mainSiteManager.getAllDistributionChannelsByStoreId(connection_ikon_cms, req.session.package_StoreId, function (err, distributionChannels) {
                            callback(err, distributionChannels);
                        });
                    },
                    alacartPackPlans: function (callback) {
                        alacartManager.getAlacartPackPlans(connection_ikon_cms, req.session.package_StoreId,req.body.distributionChannelId, function (err, ContentTypeData) {
                            callback(err, ContentTypeData)
                        });
                    },
                    valuePackPlans: function (callback) {
                        valuePackManager.getValuePackPlansByStoreId(connection_ikon_cms, req.session.package_StoreId, function (err, valuePackPlans) {
                            callback(err, valuePackPlans);
                        });
                    },
                    subscriptionPackPlans: function (callback) {
                        subscriptionPackManager.getSubscriptionDetailsByStoreId(connection_ikon_cms, req.session.package_StoreId, req.body.distributionChannelId,function (err, subscriptionPackPlans) {
                            callback(err, subscriptionPackPlans);
                        });
                    },
                    mainSitePackageData : function (callback){
                        async.waterfall([
                                function (callback) {
                                    if (req.body.packageType === 1 ){
                                        console.log('individual')

                                        mainSiteManager.getIndividualPackageData(connection_ikon_cms, req.session.package_StoreId,req.body.pkgId, function (err, packageDetails) {
                                            console.log(packageDetails)
                                            callback(err, packageDetails );
                                        })
                                    }else  if (req.body.pkgId && req.body.pkgId != null && req.body.pkgId != undefined && req.body.pkgId != '') {
                                        console.log('individual or mainsite')

                                        mainSiteManager.getIndividualPackageData(connection_ikon_cms, req.session.package_StoreId,req.body.pkgId, function (err, packageDetails) {
                                            callback(err, packageDetails);
                                        })
                                    }else{
                                        console.log('mainsite')

                                        mainSiteManager.getMainSitePackageData(connection_ikon_cms, req.session.package_StoreId,req.body.distributionChannelId,req.body.packageType, function (err, packageDetails) {
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
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                    } else {
                        connection_ikon_cms.release();
                        res.send(results);
                    }
                })
            })
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};

exports.getMainSiteData = function(req, res, next) {
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
                            mainSiteManager.getOfferData( connection_ikon_cms, req.session.package_StoreId, '', function(err,OfferData){
                                callback(err, OfferData)
                            });
                        },
                        distributionChannels: function (callback) {
                            mainSiteManager.getAllDistributionChannelsByStoreId(connection_ikon_cms, req.session.package_StoreId, function (err, distributionChannels) {
                                callback(err, distributionChannels);
                            });
                        },
                        packs : function (callback){
                            mainSiteManager.getAllPacks(connection_ikon_cms,req.session.package_StoreId, function(err, packs){
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