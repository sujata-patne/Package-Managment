/**
 * Created by root on 1/10/15.
 */
/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var subscriptionPackManager = require('../models/subscriptionPackModel');
var mainSiteManager = require('../models/mainSiteModel');
var async = require("async");

exports.getSubscriptionDetails = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                subscriptionPackManager.getSubscriptionDetailsByStoreId(  connection_ikon_cms, req.session.package_StoreId, function (err, subscriptionData ) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        connection_ikon_cms.release();
                        res.send( { subscriptionPlans : subscriptionData } );
                    }
                });
            });
        }
    } catch( err ) {
        res.status(500).json(err.message);
    }
}

exports.addSubscriptionPackToMainSite = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                mainSiteManager.getMainSitePackageData( connection_ikon_cms, req.session.package_StoreId, function( err, packageData ) {
                    console.log( packageData.length );
                    if( packageData.length == 0 ) {
                        mainSiteManager.getLastInsertedPackageId(connection_ikon_cms, function (err, lastInsertedId) {
                            if (err) {
                                console.log(err.message);
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            } else {
                                data = {
                                    sp_pkg_id: ( lastInsertedId != null ? parseInt(lastInsertedId + 1) : 1 ),
                                    sp_st_id: req.session.package_StoreId,
                                    sp_dc_id: req.body.selectedDistributionChannel,
                                    sp_pkg_type: 0,
                                    sp_is_active: 1,
                                    sp_created_on: new Date(),
                                    sp_created_by: req.session.package_UserId,
                                    sp_modified_on: new Date(),
                                    sp_modified_by: req.session.package_UserId

                                };
                                mainSiteManager.addStorePackage(connection_ikon_cms, data, function (err, storePlan) {
                                    console.log("coming");
                                    console.log(storePlan);
                                    if (err) {
                                        connection_ikon_cms.release();
                                    } else {
                                        addSubscriptionPackagePlan(req, res, connection_ikon_cms, data );
                                    }
                                });
                            }
                        });
                    } else {
                        addSubscriptionPackagePlan( req, res, connection_ikon_cms, packageData[0] );
                    }
                });

            });
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
}

function addSubscriptionPackagePlan( req, res, connection_ikon_cms, packageData ) {
    console.log( packageData );
    for (var i = 0; i < req.body.selectedSubscriptionPlans.length; i++) {
        (function () {
            var j = i;
            process.nextTick(function () {
                subscriptionPackManager.getLastInsertedValueSubscriptionPlanId(connection_ikon_cms, function (err, lastInsertedId) {
                    if (err) {
                        connection_ikon_cms.release();
                    } else {
                        var subscriptionPackData = {
                            pss_id: lastInsertedId != null ? parseInt(lastInsertedId + 1) : 1,
                            pss_sp_pkg_id: packageData.sp_pkg_id,
                            pss_sp_id: req.body.selectedSubscriptionPlans[j],
                            pss_is_active: 1,
                            pss_created_on: new Date(),
                            pss_created_by: req.session.package_UserId,
                            pss_modified_on: new Date(),
                            pss_modified_by: req.session.package_UserId
                        }

                        subscriptionPackManager.createMainSiteSubscriptionPackPlan(connection_ikon_cms, subscriptionPackData, function (err, resp) {
                            if (err) {

                            } else {
                                if (j == req.body.selectedSubscriptionPlans.length - 1) {
                                    res.send({
                                        success: true,
                                        "message": "Subscription plan successfully saved for site",
                                        "status": 200
                                    });
                                }
                            }
                        });
                    }
                });
            });
        })();
    }
}
