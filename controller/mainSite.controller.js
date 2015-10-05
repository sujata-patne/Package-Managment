/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var async = require("async");

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
                    },
                    mainSiteData: function (callback) {
                        async.waterfall([
                            function (callback) {
                                mainSiteManager.getMainSitePackageData(connection_ikon_cms, req.session.package_StoreId, function (err, mainSitePackageData) {
                                    callback(err, mainSitePackageData);
                                })
                            },
                            function (mainSitePackageData, callback) {
                                if (mainSitePackageData.length > 0) {
                                    mainSiteManager.getAlacartNOfferDetails(connection_ikon_cms, mainSitePackageData[0].sp_pkg_id, function (err, results) {
                                        // console.log(results)
                                        callback(err, {
                                            mainSitePackageData: mainSitePackageData[0],
                                            alacartNOfferDetails: results
                                        });
                                    })
                                } else {
                                    callback(err, {mainSitePackageData: null, alacartNOfferDetails: null});
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
