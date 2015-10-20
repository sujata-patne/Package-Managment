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
                subscriptionPackManager.getSubscriptionDetailsByStoreId(  connection_ikon_cms, req.session.package_StoreId, req.body.distributionChannelId, function (err, subscriptionData ) {
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

exports.getSelectedSubscriptionPacks = function( req, res, next ) {
    try{
        if( req.session && req.session.package_UserName && req.session.package_StoreId ) {
            mysql.getConnection('CMS', function( err, connection_ikon_cms) {
                //console.log( req.body.packageId );
                subscriptionPackManager.getSelectedSubscriptionPacks( connection_ikon_cms, req.body.packageId, function( err, selectedSubscriptionPlans) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        connection_ikon_cms.release();
                        res.send( { selectedSubscriptionPlans : selectedSubscriptionPlans } );
                    }
                });
            });
        }
    } catch( err ) {
        res.status(500).json(err.message);
    }
}

exports.saveSubscriptionPackToMainSite = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                    function (callback) {
                        if(req.body.isChild !== true){
                            callback(err, {'exist': false, 'packageData': null});
                        }else {
                            mainSiteManager.getUniquePackageName(connection_ikon_cms, req.session.package_StoreId, req.body.packageName, function (err, result) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                    console.log(err.message)
                                } else {
                                    if (result.length > 0) {
                                        callback(err, {'exist': true, 'packageData': result});
                                    } else {
                                        callback(err, {'exist': false, 'packageData': result});
                                    }
                                }
                            })
                        }
                    },
                    function (data, callback) {
                        if (data.exist == true && data.packageData[0].sp_pkg_id != req.body.packageId) {
                            console.log('not unique')
                            callback(null, {'exist': data.exist, 'message': 'Package Name Must be Unique'});
                        } else {
                            console.log(' unique')

                            callback(null, {'exist': data.exist});
                        }
                    }
                ],
                function (err, results) {
                    if (results.message) {
                        connection_ikon_cms.release();
                        res.send({"success": false, "message": results.message});
                    } else {
                        mainSiteManager.getIndividualPackageData( connection_ikon_cms, req.session.package_StoreId,req.body.packageId, function( err, packageData ) {
                            var storePackage = {
                                sp_st_id: req.session.package_StoreId,
                                sp_package_name: 'MainSite '+req.body.selectedDistributionChannel,
                                sp_dc_id: req.body.selectedDistributionChannel,
                                sp_pkg_type: req.body.packageType,
                                sp_pk_id : 0, // pack id
                                sp_parent_pkg_id: req.body.parentPackageId,
                                sp_is_active: 1,
                                sp_created_on: new Date(),
                                sp_created_by: req.session.package_UserName,
                                sp_modified_on: new Date(),
                                sp_modified_by: req.session.package_UserName
                            };
                            if (req.body.parentPackageId != '' && req.body.parentPackageId != 0 && req.body.parentPackageId != undefined) {
                                storePackage.sp_package_name = req.body.packageName;
                                storePackage.sp_pk_id = req.body.packId;
                            }

                            if( packageData.length == 0 ) {
                                mainSiteManager.getMaxStorePackageId(connection_ikon_cms, function (err, MaxPkgId) {
                                    if (err) {
                                        console.log(err.message);
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        var pkgId = MaxPkgId[0].pkg_id != null ?  parseInt(MaxPkgId[0].pkg_id + 1) : 1;

                                        storePackage.sp_pkg_id  = pkgId;

                                        mainSiteManager.addStorePackage(connection_ikon_cms, storePackage, function (err, storePlan) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                            } else {
                                                addSubscriptionPackagePlan(req, res, connection_ikon_cms, storePackage );
                                            }
                                        });
                                    }
                                });
                            } else {
                                storePackage.sp_pkg_id  = req.body.packageId;
                                mainSiteManager.editStorePackage( connection_ikon_cms, storePackage, function(err,response ){
                                    if(err){
                                        connection_ikon_cms.release();
                                        console.log(err.message);
                                        return false;
                                    }else{
                                        addSubscriptionPackagePlan( req, res, connection_ikon_cms, storePackage );
                                    }
                                });
                            }
                        });
                    }
                })
            });
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
}

exports.saveSubscriptionToIndividual = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                    function (callback) {
                        mainSiteManager.getUniquePackageName(connection_ikon_cms, req.session.package_StoreId, req.body.packageName, function (err, result) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                                console.log(err.message)
                            } else {
                                if (result.length > 0) {
                                    callback(err, {'exist': true, 'packageData': result});
                                } else {
                                    callback(err, {'exist': false, 'packageData': result});
                                }
                            }
                        })
                    },
                    function (data, callback) {
                        if (data.exist == true && data.packageData[0].sp_pkg_id != req.body.packageId) {
                            console.log('not unique')
                            callback(null, {'exist': data.exist, 'message': 'Package Name Must be Unique'});
                        } else {
                            console.log(' unique')

                            callback(null, {'exist': data.exist});
                        }
                    }
                ],
                function (err, results) {
                    if (results.message) {
                        connection_ikon_cms.release();
                        res.send({"success": false, "message": results.message});
                    } else {
                        mainSiteManager.getIndividualPackageData( connection_ikon_cms, req.session.package_StoreId,req.body.packageId, function( err, packageData ) {
                            var storePackage = {
                                sp_st_id: req.session.package_StoreId,
                                sp_package_name: req.body.packageName,
                                sp_dc_id: req.body.selectedDistributionChannel,
                                sp_pkg_type: req.body.packageType,
                                sp_pk_id : req.body.packId, // pack id
                                sp_parent_pkg_id: 0,
                                sp_is_active: 1,
                                sp_created_on: new Date(),
                                sp_created_by: req.session.package_UserName,
                                sp_modified_on: new Date(),
                                sp_modified_by: req.session.package_UserName
                            };

                            if( packageData.length == 0 ) {
                                mainSiteManager.getMaxStorePackageId(connection_ikon_cms, function (err, MaxPkgId) {
                                    if (err) {
                                        console.log(err.message);
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        var pkgId = MaxPkgId[0].pkg_id != null ?  parseInt(MaxPkgId[0].pkg_id + 1) : 1;

                                        storePackage.sp_pkg_id  = pkgId;

                                        mainSiteManager.addStorePackage(connection_ikon_cms, storePackage, function (err, storePlan) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                            } else {
                                                addSubscriptionPackagePlan(req, res, connection_ikon_cms, storePackage );
                                            }
                                        });
                                    }
                                });
                            } else {
                                storePackage.sp_pkg_id  = req.body.packageId;
                                mainSiteManager.editStorePackage( connection_ikon_cms, storePackage, function(err,response ){
                                    if(err){
                                        connection_ikon_cms.release();
                                        console.log(err.message);
                                        return false;
                                    }else{
                                        addSubscriptionPackagePlan( req, res, connection_ikon_cms, storePackage );
                                    }
                                });
                            }
                        });
                    }
                })
            });
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
}


function addSubscriptionPackagePlan( req, res, connection_ikon_cms, packageData ) {

    var subscriptionPacks = req.body.selectedSubscriptionPlans;
    var addSubscriptionPackIds = subscriptionPacks.filter( function( el ) {
        return req.body.existingSubscriptionPackIds.indexOf( el ) < 0;
    });

    var deletePackIds = req.body.existingSubscriptionPackIds.filter( function( el ) {
        return subscriptionPacks.indexOf( el ) < 0;
    });

    var is_deleted = true;

    var deleteSubscriptionPackIds = [];

    async.parallel({

        deleteSubscriptionPackPlans: function (callback) {
            if( deletePackIds.length > 0 ) {
                subscriptionPackManager.getSubscriptionPacksByIds( connection_ikon_cms, deletePackIds, packageData.sp_pkg_id,  function( err, response ) {
                    //console.log( response );
                    if(response[0].sub_pack_ids !== null){
                        deleteSubscriptionPackIds = response[0].sub_pack_ids.split(',')
                            .map(function (element) {
                                return parseInt(element)
                            });
                    }
                    if( deleteSubscriptionPackIds.length > 0 ) {
                        loop(0);
                        var count = deleteSubscriptionPackIds.length;
                        function loop(cnt) {
                            var i = cnt;
                            subscriptionPackManager.deleteSubscriptionPack( connection_ikon_cms, deleteSubscriptionPackIds[i],packageData.sp_pkg_id, function (err, deleteStatus) {
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
        addSubscriptionPackPlans: function (callback) {
            if( addSubscriptionPackIds.length > 0 ) {
                var count = addSubscriptionPackIds.length;
                loop(0);
                function loop(cnt) {
                    var i = cnt;
                    //console.log( addSubscriptionPackIds[i] );
                    subscriptionPackManager.subscriptionPackExists( connection_ikon_cms, addSubscriptionPackIds[i], packageData.sp_pkg_id, function (err, response ) {
                        if( response != undefined && response.length > 0   ) {
                            subscriptionPackManager.updateSubscriptionPack(connection_ikon_cms, response[0].pss_id, function( err, response ) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {
                                    cnt = cnt + 1;
                                    if( cnt == count ) {
                                        callback(null, true);
                                    } else {
                                        loop(cnt);
                                    }
                                }
                            });
                        }
                        else {
                            subscriptionPackManager.getLastInsertedValueSubscriptionPlanId(connection_ikon_cms, function (err, lastInsertedId) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {
                                    var subscriptionPackData = {
                                        pss_id: lastInsertedId != null ? parseInt(lastInsertedId + 1) : 1,
                                        pss_sp_pkg_id: packageData.sp_pkg_id,
                                        pss_sp_id: addSubscriptionPackIds[i],
                                        pss_is_active: 1,
                                        pss_created_on: new Date(),
                                        pss_created_by: req.session.package_UserName,
                                        pss_modified_on: new Date(),
                                        pss_modified_by: req.session.package_UserName
                                    }
                                    subscriptionPackManager.createMainSiteSubscriptionPackPlan(connection_ikon_cms, subscriptionPackData, function (err, resp) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            cnt = cnt + 1;
                                            if( cnt == count ) {
                                                callback(null, true);
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
            res.send({
                 success: true,
                 "message": "Package Saved Successfully.",
                 "status": 200,
                 "pkgId": packageData.sp_pkg_id
            });
        }
    });
}


function addSubscriptionPackagePlan123( req, res, connection_ikon_cms, packageData ) {
    var subscriptionPacks = req.body.selectedSubscriptionPlans;
    var addSubscriptionPackIds = subscriptionPacks.filter( function( el ) {
        return req.body.existingSubscriptionPackIds.indexOf( el ) < 0;
    });

    var deletePackIds = req.body.existingSubscriptionPackIds.filter( function( el ) {
        return subscriptionPacks.indexOf( el ) < 0;
    });

    var is_deleted = true;

    var deleteSubscriptionPackIds = [];

    if( deletePackIds.length > 0 ) {

       subscriptionPackManager.getSubscriptionPacksByIds( connection_ikon_cms, deletePackIds, packageData.sp_pkg_id,  function( err, response ) {
            //console.log( response );
            if(response[0].sub_pack_ids !== null){
                deleteSubscriptionPackIds = response[0].sub_pack_ids.split(',')
                    .map(function (element) {
                        return parseInt(element)
                    });

            }
            if( deleteSubscriptionPackIds.length > 0 ) {
                loop(0);
                var count = deleteSubscriptionPackIds.length;
                function loop(cnt) {
                    var i = cnt;
                    subscriptionPackManager.deleteSubscriptionPack( connection_ikon_cms, deleteSubscriptionPackIds[i],packageData.sp_pkg_id, function (err, deleteStatus) {
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

    if( addSubscriptionPackIds.length > 0 ) {
        var count = addSubscriptionPackIds.length;
        loop(0);
        function loop(cnt) {
            var i = cnt;
            subscriptionPackManager.subscriptionPackExists( connection_ikon_cms, addSubscriptionPackIds[i], packageData.sp_pkg_id, function (err, response ) {
                if( response != undefined && response.length > 0   ) {
                    subscriptionPackManager.updateSubscriptionPack(connection_ikon_cms, response[0].pss_id, function( err, response ) {
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
                    subscriptionPackManager.getLastInsertedValueSubscriptionPlanId(connection_ikon_cms, function (err, lastInsertedId) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            var subscriptionPackData = {
                                pss_id: lastInsertedId != null ? parseInt(lastInsertedId + 1) : 1,
                                pss_sp_pkg_id: packageData.sp_pkg_id,
                                pss_sp_id: addSubscriptionPackIds[i],
                                pss_is_active: 1,
                                pss_created_on: new Date(),
                                pss_created_by: req.session.package_UserId,
                                pss_modified_on: new Date(),
                                pss_modified_by: req.session.package_UserId
                            }

                            subscriptionPackManager.createMainSiteSubscriptionPackPlan(connection_ikon_cms, subscriptionPackData, function (err, resp) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {
                                    cnt = cnt + 1;
                                    if( cnt == count ) {
                                        subscriptionPackManager.getSelectedSubscriptionPacks( connection_ikon_cms, packageData.sp_pkg_id, function( err, selectedSubscriptionPlans) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                                console.log(err.message)
                                            } else {
                                                connection_ikon_cms.release();
                                                res.send( { "success" : true,"status":200, "message":"Subscription pack plan successfully saved for site.",selectedSubscriptionPackPlans : selectedSubscriptionPlans } );
                                            }
                                        });
                                        /*connection_ikon_cms.release();
                                        res.send({
                                            success: true,
                                            "message": "Subscription pack plan successfully saved for site.",
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
    }
}


exports.addSubscriptionPackToMainSite123 = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                //Package type added to  getMainSitePackageData
                var searchData = {
                    storeId: req.session.package_StoreId,
                    dcId: req.body.distributionChannelId,
                    packageType: req.body.packageType
                }
                mainSiteManager.getMainSitePackageData( connection_ikon_cms, searchData, function( err, packageData ) {
                    //console.log( packageData.length );
                    if( packageData.length == 0 ) {
                        mainSiteManager.getMaxStorePackageId(connection_ikon_cms, function (err, MaxPkgId) {
                            if (err) {
                                console.log(err.message);
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            } else {
                                var pkgId = MaxPkgId[0].pkg_id != null ?  parseInt(MaxPkgId[0].pkg_id + 1) : 1;
                                data = {
                                    sp_pkg_id: pkgId,
                                    sp_st_id: req.session.package_StoreId,
                                    sp_package_name: 'MainSite '+req.body.selectedDistributionChannel,
                                    sp_dc_id: req.body.selectedDistributionChannel,
                                    sp_pkg_type: req.body.packageType,
                                    sp_pk_id : 0, // pack id
                                    sp_is_active: 1,
                                    sp_created_on: new Date(),
                                    sp_created_by: req.session.package_UserId,
                                    sp_modified_on: new Date(),
                                    sp_modified_by: req.session.package_UserId
                                };
                                //Individual Pack modifications
                                if(req.body.packageType == 1){
                                    data.sp_package_name = req.body.packageName;
                                    data.sp_pk_id = req.body.packId;
                                }

                                mainSiteManager.addStorePackage(connection_ikon_cms, data, function (err, storePlan) {
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
