/**
 * Created by root on 1/10/15.
 */
/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var valuePackManager = require('../models/valuePackModel');
var mainSiteManager = require('../models/mainSiteModel');
var advanceSettingManager = require('../models/advanceSettingModel');
var async = require("async");

exports.getSelectedValuePacks = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                valuePackManager.getSelectedValuePacks(connection_ikon_cms, req.body.packageId, function (err, selectedValuePackPlans) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        connection_ikon_cms.release();
                        res.send({selectedValuePackPlans: selectedValuePackPlans});
                    }
                });
            });
        }
    } catch (err) {
        res.status(500).json(err.message);
    }
}
exports.saveValuePackToMainSite = function (req,res,next) {
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
                            callback(null, {'exist': data.exist, 'message': 'Package Name Must be Unique'});
                        } else {
                            callback(null, {'exist': data.exist});
                        }
                    }
                ],
                function (err, results) {
                    if (results.message) {
                        connection_ikon_cms.release();
                        res.send({"success": false, "message": results.message});
                    } else {
                        var searchData = {
                            storeId: req.session.package_StoreId,
                            dcId: req.body.selectedDistributionChannel,
                            packageType: req.body.packageType
                        }
                        mainSiteManager.getMainSitePackageData( connection_ikon_cms, searchData, function( err, packageData ) {
                            var storePackage = {
                                sp_st_id: req.session.package_StoreId,
                                sp_dc_id: req.body.selectedDistributionChannel,
                                sp_pkg_type: req.body.packageType,
                                sp_package_name: 'MainSite '+req.body.selectedDistributionChannel,
                                sp_pk_id : 0, // pack id
                                sp_is_active: 1,
                                sp_parent_pkg_id: req.body.parentPackageId,
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
                                mainSiteManager.getLastInsertedPackageId(connection_ikon_cms, function (err, lastInsertedId) {
                                    if (err) {
                                        console.log(err.message);
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        storePackage.sp_pkg_id = ( lastInsertedId != null ? parseInt(lastInsertedId + 1) : 1 );

                                        mainSiteManager.addStorePackage(connection_ikon_cms, storePackage, function (err, storePlan) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            } else {
                                                saveValuePackPlan(req, res, connection_ikon_cms, storePackage);
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
                                        saveValuePackPlan(req, res, connection_ikon_cms, storePackage);
                                    }
                                });
                            }
                        });
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

exports.saveValuePackToIndividual = function (req,res,next) {
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
                            callback(null, {'exist': data.exist, 'message': 'Package Name Must be Unique'});
                        } else {
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
                                sp_dc_id: req.body.selectedDistributionChannel,
                                sp_pkg_type: req.body.packageType,
                                sp_package_name: req.body.packageName,
                                sp_pk_id :  req.body.packId, // pack id
                                sp_is_active: 1,
                                sp_parent_pkg_id: req.body.parentPackageId,
                                sp_created_on: new Date(),
                                sp_created_by: req.session.package_UserName,
                                sp_modified_on: new Date(),
                                sp_modified_by: req.session.package_UserName
                            };
                            if( packageData.length == 0 ) {
                                mainSiteManager.getLastInsertedPackageId(connection_ikon_cms, function (err, lastInsertedId) {
                                    if (err) {
                                        console.log(err.message);
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        storePackage.sp_pkg_id = ( lastInsertedId != null ? parseInt(lastInsertedId + 1) : 1 );

                                        mainSiteManager.addStorePackage(connection_ikon_cms, storePackage, function (err, storePlan) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            } else {
                                                saveValuePackPlan(req, res, connection_ikon_cms, storePackage);
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
                                        saveValuePackPlan(req, res, connection_ikon_cms, storePackage);
                                    }
                                });
                            }
                        });
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

function saveValuePackPlan(req, res, connection_ikon_cms, packageData) {

    var valuePacks = req.body.selectedValuePacks;
    var addValuePackIds = valuePacks.filter(function (el) {
        return req.body.existingValuePackIds.indexOf(el) < 0;
    });

    var deletePackIds = req.body.existingValuePackIds.filter(function (el) {
        return valuePacks.indexOf(el) < 0;
    });

    var is_deleted = true;

    var deleteValuePackIds = [];
    async.parallel({
            deleteValuePackPlans: function (callback) {
                if (deletePackIds.length > 0) {
                    valuePackManager.getValuePacksByIds(connection_ikon_cms, deletePackIds, packageData.sp_pkg_id, function (err, response) {

                        if (response[0].value_pack_ids !== null) {
                            deleteValuePackIds = response[0].value_pack_ids.split(',')
                                .map(function (element) {
                                    return parseInt(element)
                                });
                        }
                        if (deleteValuePackIds.length > 0) {
                            loop(0);
                            var count = deleteValuePackIds.length;

                            function loop(cnt) {

                                var i = cnt;

                                //When value pack is removed .. removing its advance setting too..
                                advanceSettingManager.deleteValueSetting( connection_ikon_cms, deleteValuePackIds[i], function(err,deleteSetting){
                                    if(err){
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                });
                                //--------------------------------------------------------------

                                valuePackManager.deleteValuePack(connection_ikon_cms, deleteValuePackIds[i], packageData.sp_pkg_id, function (err, deleteStatus) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else if (deleteStatus != false) {
                                        cnt = cnt + 1;
                                        if (cnt == count) {
                                            is_deleted = true;
                                            callback(null, true);
                                        } else {

                                            loop(cnt);
                                        }
                                    }
                                });
                            }
                        }
                        else {
                            callback(null, true);
                        }
                    });
                } else {
                    callback(null, true);
                }
            },
            addValuePackPlans: function (callback) {
                if (addValuePackIds.length > 0) {
                    var count = addValuePackIds.length;
                    loop(0);
                    function loop(cnt) {
                        var i = cnt;
                        valuePackManager.valuePackExists(connection_ikon_cms, addValuePackIds[i], packageData.sp_pkg_id, function (err, response) {

                            if (response != undefined && response.length > 0) {
                                valuePackManager.updateValuePack(connection_ikon_cms, response[0].pvs_id, function (err, response) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        cnt = cnt + 1;
                                        if (cnt == count) {

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
                                            pvs_created_by: req.session.package_UserName,
                                            pvs_modified_on: new Date(),
                                            pvs_modified_by: req.session.package_UserName
                                        }

                                        valuePackManager.createMainSiteValuePackPlan(connection_ikon_cms, valuePackData, function (err, resp) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            } else {
                                                cnt = cnt + 1;
                                                if (cnt == count) {
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
                } else {
                    callback(null, true);
                }
            }
        },
        function (err, results) {
            if (err) {
                connection_ikon_cms.release();
                res.status(500).json(err.message);
                console.log(err.message)
            } else {
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

function addValuePackPlan123(req, res, connection_ikon_cms, packageData) {

    var valuePacks = req.body.selectedValuePacks;
    var addValuePackIds = valuePacks.filter(function (el) {
        return req.body.existingValuePackIds.indexOf(el) < 0;
    });

    var deletePackIds = req.body.existingValuePackIds.filter(function (el) {
        return valuePacks.indexOf(el) < 0;
    });

    var is_deleted = true;

    var deleteValuePackIds = [];
    if (deletePackIds.length > 0) {
        valuePackManager.getValuePacksByIds( connection_ikon_cms, deletePackIds, packageData.sp_pkg_id, function( err, response ) {
            if (response[0].value_pack_ids !== null) {
                deleteValuePackIds = response[0].value_pack_ids.split(',')
                    .map(function (element) {
                        return parseInt(element)
                    });

            }
            if (deleteValuePackIds.length > 0) {
                loop(0);
                var count = deleteValuePackIds.length;

                function loop(cnt) {
                    var i = cnt;
                    valuePackManager.deleteValuePack(connection_ikon_cms, deleteValuePackIds[i], packageData.sp_pkg_id, function (err, deleteStatus) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else if (deleteStatus != false) {
                            cnt = cnt + 1;
                            if (cnt == count) {
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
    if (addValuePackIds.length > 0) {
        var count = addValuePackIds.length;
        loop(0);
        function loop(cnt) {
            var i = cnt;
            valuePackManager.valuePackExists(connection_ikon_cms, addValuePackIds[i], packageData.sp_pkg_id, function (err, response) {

                if (response != undefined && response.length > 0) {
                    valuePackManager.updateValuePack(connection_ikon_cms, response[0].pvs_id, function (err, response) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            cnt = cnt + 1;
                            if (cnt == count) {
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
                                    if (cnt == count) {
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
    } else {
        valuePackManager.getSelectedValuePacks(connection_ikon_cms, req.body.packageId, function (err, selectedValuePackPlans) {
            if (err) {
                connection_ikon_cms.release();
                res.status(500).json(err.message);
                console.log(err.message)
            } else {
                connection_ikon_cms.release();
                res.send({
                    "success": true,
                    "status": 200,
                    "message": "Package Saved Successfully..",
                    selectedValuePackPlans: selectedValuePackPlans
                });
            }
        });
    }
}

exports.addValuePackToMainSite123 = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                //Package type added to  getMainSitePackageData
                var searchData = {
                    storeId: req.session.package_StoreId,
                    dcId: req.body.selectedDistributionChannel,
                    packageType: req.body.packageType
                }
                mainSiteManager.getMainSitePackageData( connection_ikon_cms, searchData, function( err, packageData ) {
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
                                    sp_pkg_type: req.body.packageType,
                                    sp_package_name: 'MainSite '+req.body.selectedDistributionChannel,
                                    sp_pk_id : 0, // pack id
                                    sp_is_active: 1,
                                    sp_created_on: new Date(),
                                    sp_created_by: req.session.package_UserName,
                                    sp_modified_on: new Date(),
                                    sp_modified_by: req.session.package_UserName

                                };

                                //Individual Pack modifications
                                if(req.body.packageType == 1){
                                    data.sp_package_name = req.body.packageName;
                                    data.sp_pk_id = req.body.packId;
                                }

                                mainSiteManager.addStorePackage(connection_ikon_cms, data, function (err, storePlan) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        addValuePackPlan(req, res, connection_ikon_cms, data);
                                    }
                                });
                            }
                        });
                    } else {
                        addValuePackPlan(req, res, connection_ikon_cms, packageData[0]);
                    }
                });

            });
        } else {
            res.redirect('/accountlogin');
        }
    } catch (err) {
        res.status(500).json(err.message);
    }
}
