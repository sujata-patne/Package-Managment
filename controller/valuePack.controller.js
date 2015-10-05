/**
 * Created by root on 1/10/15.
 */
/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var valuePackManager = require('../models/valuePackModel');
var mainSiteManager = require('../models/mainSiteModel');
var async = require("async");

exports.addValuePackToMainSite = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                mainSiteManager.getMainSitePackageData( connection_ikon_cms, req.session.package_StoreId, function( err, packageData ) {
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
                                mainSiteManager.createMainSiteStorePackagePlan(connection_ikon_cms, data, function (err, storePlan) {
                                    console.log("coming");
                                    console.log(storePlan);
                                    if (err) {
                                        connection_ikon_cms.release();
                                    } else {
                                        addValuePackPlan(req, res, connection_ikon_cms, data );
                                    }
                                });
                            }
                        });
                    } else {
                        addValuePackPlan( req, res, connection_ikon_cms, packageData[0] );
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

function addValuePackPlan( req, res, connection_ikon_cms, packageData ) {
    console.log( packageData );
    for (var i = 0; i < req.body.selectedValuePacks.length; i++) {
        (function () {
            var j = i;
            process.nextTick(function () {
                valuePackManager.getLastInsertedValuePackId(connection_ikon_cms, function (err, lastInsertedId) {
                    if (err) {
                        connection_ikon_cms.release();
                    } else {
                        var valuePackData = {
                            pvs_id: lastInsertedId != null ? parseInt(lastInsertedId + 1) : 1,
                            pvs_sp_pkg_id: packageData.sp_pkg_id,
                            pvs_vp_id: req.body.selectedValuePacks[j],
                            pvs_is_active: 1,
                            pvs_created_on: new Date(),
                            pvs_created_by: req.session.package_UserId,
                            pvs_modified_on: new Date(),
                            pvs_modified_by: req.session.package_UserId
                        }

                        valuePackManager.createMainSiteValuePackPlan(connection_ikon_cms, valuePackData, function (err, resp) {
                            if (err) {

                            } else {
                                if (j == req.body.selectedValuePacks.length - 1) {
                                    res.send({
                                        success: true,
                                        "message": "Value pack plan successfully saved for site",
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
