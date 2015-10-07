/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var valuePackManager = require('../models/valuePackModel');
var subscriptionPackManager = require('../models/subscriptionPackModel');

var async = require("async");

exports.showPackageData = function(req, res, next)  {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                    function (callback) {
                        mainSiteManager.getMainSitePackageData(connection_ikon_cms, req.session.package_StoreId,req.body.distributionChannelId, function (err, mainSitePackageData) {
                            callback(err, mainSitePackageData);
                        })
                    },
                    function (mainSitePackageData, callback) {
                        if (mainSitePackageData != null && mainSitePackageData.length > 0) {
                            async.parallel({
                                mainSitePackageData: function (callback) {
                                    callback(err, mainSitePackageData);
                                },
                                alacartNOfferDetails: function (callback) {
                                    async.waterfall([
                                        function (callback) {
                                            mainSiteManager.getAlacartNOfferDetails(connection_ikon_cms, mainSitePackageData[0].sp_pkg_id, function (err, alacartNOfferDetails) {
                                                callback(err, alacartNOfferDetails);
                                            })
                                        },
                                        function (alacartNOfferDetails,callback) {
                                            if (alacartNOfferDetails != null && alacartNOfferDetails.length > 0) {
                                                mainSiteManager.getContentTypeAlacartPlan(connection_ikon_cms, alacartNOfferDetails[0].paos_id, function (err, contentTypePlanData) {
                                                    alacartNOfferDetails.push({contentTypePlanData:contentTypePlanData})
                                                    callback(err, alacartNOfferDetails);
                                                })
                                            } else {
                                                alacartNOfferDetails.push({contentTypePlanData:null})

                                                callback(null, alacartNOfferDetails, {contentTypePlanData:null});
                                            }
                                        }
                                    ],
                                    function (err, results) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            console.log('results inner first : ')

                                            console.log(results)
                                            callback(err, results);
                                        }
                                    })
                                },
                                valuePackDetails: function (callback) {
                                    valuePackManager.getSelectedValuePacks( connection_ikon_cms, mainSitePackageData[0].sp_pkg_id, function( err, valuePackDetails) {
                                        callback(err, valuePackDetails);
                                    })
                                },
                                subscriptionDetails: function (callback) {
                                    subscriptionPackManager.getSelectedSubscriptionPacks( connection_ikon_cms, mainSitePackageData[0].sp_pkg_id, function( err, subscriptionDetails) {
                                        callback(err, subscriptionDetails);
                                    })
                                }
                            },
                            function (err, results) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {

                                    callback(err, results);
                                }
                            })
                        } else {
                            callback(null, {mainSitePackageData:mainSitePackageData, alacartNOfferDetails:null,subscriptionDetails:null,valuePackDetails:null,contentTypePlanData:null});
                        }
                    }
                ],
                function (err, results) {
                    console.log('results outer: ')
                    console.log(results)
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                    } else {
                        connection_ikon_cms.release();
                        //var data = ({mainSitePackageData: mainSitePackageData, alacartNOfferDetails: alacartNOfferDetails, contentTypePlanData:null});

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
                    ContentTypeData: function (callback) {
                        mainSiteManager.getContentTypeData(connection_ikon_cms, req.session.package_StoreId, function (err, ContentTypeData) {
                            callback(err, ContentTypeData)
                        });
                    },
                    OfferData: function (callback) {
                        mainSiteManager.getOfferData( connection_ikon_cms, req.session.package_StoreId, function(err,OfferData){
                            callback(err, OfferData)
                        });
                    },
                    distributionChannels: function (callback) {
                        mainSiteManager.getAllDistributionChannelsByStoreId(connection_ikon_cms, req.session.package_StoreId, function (err, distributionChannels) {
                            callback(err, distributionChannels);
                        });
                    },
                    valuePackPlans: function (callback) {
                        mainSiteManager.getValuePackPlansByStoreId(connection_ikon_cms, req.session.package_StoreId, function (err, valuePackPlans) {
                            callback(err, valuePackPlans);
                        });
                    }
                },
                function (err, results) {
                    //console.log(results)
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
