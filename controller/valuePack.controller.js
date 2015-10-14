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

exports.getSelectedValuePacks = function( req, res, next ) {
    try{
        if( req.session && req.session.package_UserName && req.session.package_StoreId ) {
            mysql.getConnection('CMS', function( err, connection_ikon_cms) {
                //console.log( req.body.packageId );
                valuePackManager.getSelectedValuePacks( connection_ikon_cms, req.body.packageId, function( err, selectedValuePackPlans) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        connection_ikon_cms.release();
                        res.send( { selectedValuePackPlans : selectedValuePackPlans } );
                    }
                });
            });
        }
    } catch( err ) {
        res.status(500).json(err.message);
    }
}

exports.addValuePackToMainSite = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                mainSiteManager.getMainSitePackageData( connection_ikon_cms, req.session.package_StoreId,req.body.selectedDistributionChannel, function( err, packageData ) {
                    //console.log( packageData.length );
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
                                    //console.log("coming");
                                  //  console.log(storePlan);
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        addValuePackPlan(req, res, connection_ikon_cms, data );
                                    }
                                });
                            }
                        });
                    } else {
                        //console.log("inside else");
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

    var valuePacks = req.body.selectedValuePacks;
    var addValuePackIds = valuePacks.filter( function( el ) {
        return req.body.existingValuePackIds.indexOf( el ) < 0;
    });

    var deletePackIds = req.body.existingValuePackIds.filter( function( el ) {
        return valuePacks.indexOf( el ) < 0;
    });

    var is_deleted = true;

    var deleteValuePackIds = [];
    async.parallel({
            deleteValuePackPlans: function (callback) {
                if( deletePackIds.length > 0 ) {
                    valuePackManager.getValuePacksByIds( connection_ikon_cms, deletePackIds, packageData.sp_pkg_id, function( err, response ) {

                        if(response[0].value_pack_ids !== null){
                            deleteValuePackIds = response[0].value_pack_ids.split(',')
                                .map(function (element) {
                                    return parseInt(element)
                                });
                        }
                        if( deleteValuePackIds.length > 0 ) {
                            loop(0);
                            var count = deleteValuePackIds.length;
                            function loop(cnt) {
                                var i = cnt;
                                valuePackManager.deleteValuePack( connection_ikon_cms, deleteValuePackIds[i], packageData.sp_pkg_id,  function (err, deleteStatus) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else if( deleteStatus != false ){
                                        cnt = cnt + 1;
                                        if(cnt == count) {
                                            is_deleted = true;
                                            callback(null, true);
                                        } else {
                                            loop(cnt);
                                        }
                                    }
                                });
                            }
                        }
                        else{
                            callback(null, true);
                        }
                    });
                }else{
                    callback(null, true);
                }
            },
            addValuePackPlans: function (callback) {
                if( addValuePackIds.length > 0 ) {
                    var count = addValuePackIds.length;
                    loop(0);
                    function loop(cnt) {
                        var i = cnt;
                        //console.log( addValuePackIds[i] );
                        valuePackManager.valuePackExists( connection_ikon_cms, addValuePackIds[i], packageData.sp_pkg_id, function (err, response ) {

                            if( response != undefined && response.length > 0   ) {
                                valuePackManager.updateValuePack(connection_ikon_cms, response[0].pvs_id, function( err, response ) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        //console.log("updateValuePack")
                                        cnt = cnt + 1;
                                        if( cnt == count ) {

                                            callback(null, true);

                                            /*connection_ikon_cms.release();
                                             res.send({
                                             success: true,
                                             "message": "Value pack plan successfully saved for site",
                                             "status": 200
                                             });*/
                                        } else {
                                            loop(cnt);
                                        }
                                    }
                                });
                            }
                            else {
                                //console.log("insertValuePack")

                                valuePackManager.getLastInsertedValuePackId(connection_ikon_cms, function (err, lastInsertedId) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        var valuePackData = {
                                            pvs_id: lastInsertedId != null ? parseInt(lastInsertedId + 1) : 1,
                                            pvs_sp_pkg_id: packageData.sp_pkg_id,
                                            pvs_vp_id: addValuePackIds[i],
                                            pvs_is_active: 1,
                                            pvs_created_on: new Date(),
                                            pvs_created_by: req.session.package_UserId,
                                            pvs_modified_on: new Date(),
                                            pvs_modified_by: req.session.package_UserId
                                        }

                                        valuePackManager.createMainSiteValuePackPlan(connection_ikon_cms, valuePackData, function (err, resp) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            } else {
                                                cnt = cnt + 1;
                                                if( cnt == count ) {
                                                    callback(null, true);

                                                    /* connection_ikon_cms.release();
                                                     res.send({
                                                     success: true,
                                                     "message": "Value pack plan successfully saved for site.",
                                                     "status": 200
                                                     });*/
                                                } else {
                                                    loop(cnt);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }else{
                    callback(null, true);
                }
            }
        },
        function (err, results) {
            //console.log(results)
            if (err) {
                connection_ikon_cms.release();
                res.status(500).json(err.message);
                console.log(err.message)
            } else {

                /*valuePackManager.getSelectedValuePacks( connection_ikon_cms, packageData.sp_pkg_id, function( err, selectedValuePackPlans) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        connection_ikon_cms.release();
                        res.send( { "success" : true,"status":200, "message":"Value pack plan successfully saved for site.",selectedValuePackPlans : selectedValuePackPlans } );
                    }
                });*/

                res.send({
                    success: true,
                    "message": "Value pack plan successfully saved for site",
                    "status": 200,
                    "pkgId": packageData.sp_pkg_id
                });
            }
        });

    /*else{
     valuePackManager.getSelectedValuePacks( connection_ikon_cms, req.body.packageId, function( err, selectedValuePackPlans) {
     if (err) {
     connection_ikon_cms.release();
     res.status(500).json(err.message);
     console.log(err.message)
     } else {
     connection_ikon_cms.release();
     res.send( { "success" : true,"status":200, "message":"Value pack plan successfully saved for site.",selectedValuePackPlans : selectedValuePackPlans } );
     }
     });
     }*/
}

function addValuePackPlan123( req, res, connection_ikon_cms, packageData ) {
    //console.log( packageData );

    var valuePacks = req.body.selectedValuePacks;
    var addValuePackIds = valuePacks.filter( function( el ) {
        return req.body.existingValuePackIds.indexOf( el ) < 0;
    });

    var deletePackIds = req.body.existingValuePackIds.filter( function( el ) {
        return valuePacks.indexOf( el ) < 0;
    });

    var is_deleted = true;

    var deleteValuePackIds = [];

    /*console.log( addValuePackIds );
    console.log("dlete");
    console.log( deletePackIds );*/

    if( deletePackIds.length > 0 ) {
        //console.log( deleteValuePackIds );
        valuePackManager.getValuePacksByIds( connection_ikon_cms, deletePackIds, packageData.sp_pkg_id, function( err, response ) {

            if(response[0].value_pack_ids !== null){
                deleteValuePackIds = response[0].value_pack_ids.split(',')
                    .map(function (element) {
                        return parseInt(element)
                    });

            }
            if( deleteValuePackIds.length > 0 ) {
                loop(0);
                var count = deleteValuePackIds.length;
                function loop(cnt) {
                    var i = cnt;
                    valuePackManager.deleteValuePack( connection_ikon_cms, deleteValuePackIds[i], packageData.sp_pkg_id,  function (err, deleteStatus) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else if( deleteStatus != false ){
                            cnt = cnt + 1;
                            if(cnt == count) {
                                is_deleted = true;
                            } else {
                                loop(cnt);
                            }
                        }
                    });
                }
            }
        });
    }
    if( addValuePackIds.length > 0 ) {
        var count = addValuePackIds.length;
        loop(0);
        function loop(cnt) {
            var i = cnt;
            //console.log( addValuePackIds[i] );
            valuePackManager.valuePackExists( connection_ikon_cms, addValuePackIds[i], packageData.sp_pkg_id, function (err, response ) {

                if( response != undefined && response.length > 0   ) {
                    valuePackManager.updateValuePack(connection_ikon_cms, response[0].pvs_id, function( err, response ) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            cnt = cnt + 1;
                            if( cnt == count ) {
                                connection_ikon_cms.release();
                                res.send({
                                    success: true,
                                    "message": "Value pack plan successfully saved for site",
                                    "status": 200
                                });
                            } else {
                                loop(cnt);
                            }
                        }
                    });
                } else {
                    console.log( "inside else ");
                    valuePackManager.getLastInsertedValuePackId(connection_ikon_cms, function (err, lastInsertedId) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            var valuePackData = {
                                pvs_id: lastInsertedId != null ? parseInt(lastInsertedId + 1) : 1,
                                pvs_sp_pkg_id: packageData.sp_pkg_id,
                                pvs_vp_id: addValuePackIds[i],
                                pvs_is_active: 1,
                                pvs_created_on: new Date(),
                                pvs_created_by: req.session.package_UserId,
                                pvs_modified_on: new Date(),
                                pvs_modified_by: req.session.package_UserId
                            }

                            valuePackManager.createMainSiteValuePackPlan(connection_ikon_cms, valuePackData, function (err, resp) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {
                                    cnt = cnt + 1;
                                    if( cnt == count ) {
                                        connection_ikon_cms.release();
                                        res.send({
                                            success: true,
                                            "message": "Value pack plan successfully saved for site.",
                                            "status": 200
                                        });
                                    } else {
                                        loop(cnt);
                                    }
                                }
                            });
                        }
                    });
                }
            });

        }
    } else{
        valuePackManager.getSelectedValuePacks( connection_ikon_cms, req.body.packageId, function( err, selectedValuePackPlans) {
            if (err) {
                connection_ikon_cms.release();
                res.status(500).json(err.message);
                console.log(err.message)
            } else {
                connection_ikon_cms.release();
                res.send( { "success" : true,"status":200, "message":"Package Saved Successfully..",selectedValuePackPlans : selectedValuePackPlans } );
            }
        });
    }
}