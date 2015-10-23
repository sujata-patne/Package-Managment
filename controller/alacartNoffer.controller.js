/**
 * Created by sujata.patne on 05-10-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var alacartManager = require('../models/alacartModel');
var advanceSettingManager = require('../models/advanceSettingModel');
var async = require("async");
/*A-la-cart-n-offer details for package*/

exports.getAlacartNofferDetails = function (req,res,next){
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                    function (callback) {
                        alacartManager.getAlacartNOfferDetails(connection_ikon_cms, req.body.packageId, function (err, alacartNOfferDetails) {
                            callback(err, alacartNOfferDetails);
                        })
                    },
                    function (alacartNOfferDetails,callback) {
                        if (alacartNOfferDetails != null && alacartNOfferDetails.length > 0) {
                            alacartManager.getContentTypeAlacartPlan(connection_ikon_cms, alacartNOfferDetails[0].paos_id, function (err, contentTypePlanData) {
                                callback(null, {alacartNOfferDetails:alacartNOfferDetails,contentTypePlanData:contentTypePlanData });
                            })
                        } else {
                            callback(null, {alacartNOfferDetails:alacartNOfferDetails,contentTypePlanData:null });
                        }
                    }
                ],
                function (err, results) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        connection_ikon_cms.release();
                        res.send(results);
                    }
                });
            })
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};
exports.editMainsiteAlacartPlanDetails = function (req,res,next){
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    updateAdvanceSetting:function(callback){
                        alacartManager.selectOfferIdByPAOSID(connection_ikon_cms,req.body.paosId,function(err,res){
                            if(res[0].paos_op_id != req.body.paosId){
                                advanceSettingManager.deleteOfferSetting(connection_ikon_cms, req.body.paosId,function(err,res){
                                    if(err){}else{
                                        callback(null,'');
                                    }
                                })
                            }else{
                                callback(null,'');
                            }
                            
                        });
                    },
                    updateStorePackage:function (callback) {
                        var pkgId = req.body.packageId;
                        var storePackage = {
                            sp_pkg_id: pkgId,
                            sp_package_name: req.body.packageName,
                            sp_pk_id: req.body.packId, //pack id
                            sp_st_id: req.session.package_StoreId,
                            sp_dc_id: req.body.distributionChannelId,
                            sp_pkg_type: req.body.packageType, //site type
                            sp_is_active: 1,
                            sp_parent_pkg_id: req.body.parentPackageId,
                            sp_modified_on:  new Date(),
                            sp_modified_by: req.session.package_UserName
                        };
                        if (editStorePackage(connection_ikon_cms, storePackage)) {
                            callback(null, pkgId);
                        } else {
                            callback({message: 'Package can not be updated.'}, pkgId);
                        }
                    },
                    alacartNOffer:function (callback) {
                        if(req.body.parentPackageId != '' && req.body.parentPackageId != 0 && req.body.parentPackageId != undefined) {
                            callback(null, req.body.packageId);
                        }else {
                            if (req.body.paosId != undefined && req.body.paosId != null && req.body.paosId != '') {
                                var AlacartOfferData = {
                                    paos_id: req.body.paosId,
                                    paos_sp_pkg_id: req.body.packageId,
                                    paos_op_id: req.body.offerId,
                                    paos_is_active: 1,
                                    paos_modified_on: new Date(),
                                    paos_modified_by: req.session.package_UserName
                                }

                                if (editAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                    callback(null, req.body.paosId);
                                } else {
                                    callback({message: 'Alacart & Offer can not be updated.'}, req.body.paosId);
                                }
                            } else {
                                alacartManager.getMaxAlacartOfferId(connection_ikon_cms, function (err, MaxPaosId) {
                                    var paosId = MaxPaosId[0].paos_id != null ? parseInt(MaxPaosId[0].paos_id + 1) : 1;
                                    var AlacartOfferData = {
                                        paos_id: paosId,
                                        paos_sp_pkg_id: req.body.packageId,
                                        paos_op_id: req.body.offerId,
                                        paos_is_active: 1,
                                        paos_modified_on: new Date(),
                                        paos_modified_by: req.session.package_UserName
                                    }
                                    req.body.paosId = paosId;
                                    if (addAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                        callback(null, req.body.paosId);
                                    } else {
                                        callback({message: 'Alacart & Offer can not be added.'}, paosId);
                                    }
                                });
                            }
                        }
                    },
                    contentTypePlans:function ( callback) {
                        if(req.body.parentPackageId != '' && req.body.parentPackageId != 0 && req.body.parentPackageId != undefined) {
                            callback(null, req.body.packageId);
                        } else {
                            var ctCount = req.body.ContentTypes.length;
                            var err = null;
                            var alacartPlansList = req.body.alacartPlansList;
                            var contentTypes = [];
                            var existingContentTypes = [];

                            for (var i = 0; i < ctCount; i++) {
                                (function () {
                                    var j = i;
                                    var ContentTypeId = req.body.ContentTypes[j].cd_id;
                                    process.nextTick(function () {
                                        contentTypes.push(ContentTypeId);
                                    })
                                })();
                            }
                            var newContentTypes = [];
                            for (var i = 0; i < req.body.alacartPlansList.length; i++) {
                                var newContentTypeId = req.body.alacartPlansList[i];

                                if ((req.body.alacartPlansList[newContentTypeId].download && req.body.alacartPlansList[newContentTypeId].download != null && req.body.alacartPlansList[newContentTypeId].download != 0)
                                || (req.body.alacartPlansList[newContentTypeId].streaming && req.body.alacartPlansList[newContentTypeId].streaming != null && req.body.alacartPlansList[newContentTypeId].streaming != 0)) {

                                    var newPlan = Object.keys(req.body.alacartPlansList)
                                        .map(function (element) {
                                            return parseInt(element)
                                        });
                                    newContentTypes.push(newPlan);
                                }
                            }
                            var deleteContentTypes = [];
                            var editContentTypes = [];

                            mainSiteManager.existingContentTypesInPack(connection_ikon_cms, req.body.paosId, function (err, result) {
                                if (result[0].contentTypes != null && result[0].contentTypes != '' && result[0].contentTypes != undefined ) {
                                    existingContentTypes = result[0].contentTypes.split(',')
                                        .map(function (element) {
                                            return parseInt(element)
                                        });
                                }
                                var addContentTypes = newContentTypes.filter(function (el) {
                                    return existingContentTypes.indexOf(el) < 0;
                                });

                                for (var i = 0; i < existingContentTypes.length; i++) {
                                    var ContentTypeId = existingContentTypes[i];
                                    console.log('req.body.alacartPlansList[ContentTypeId]')
                                    console.log(req.body.alacartPlansList[ContentTypeId])
                                    if ((req.body.alacartPlansList[ContentTypeId].download && req.body.alacartPlansList[ContentTypeId].download != null && req.body.alacartPlansList[ContentTypeId].download != 0)
                                        || (req.body.alacartPlansList[ContentTypeId].streaming && req.body.alacartPlansList[ContentTypeId].streaming != null && req.body.alacartPlansList[ContentTypeId].streaming != 0)) {
                                        editContentTypes.push(ContentTypeId);
                                    } else {
                                        deleteContentTypes.push(ContentTypeId);
                                    }
                                }

                                var addPlansData = {
                                    alacartPlansList: req.body.alacartPlansList,
                                    paosId: req.body.paosId,
                                    packageUserName: req.session.package_UserName,
                                    ContentTypes: addContentTypes
                                }

                                var editPlansData = {
                                    alacartPlansList: req.body.alacartPlansList,
                                    paosId: req.body.paosId,
                                    packageUserName: req.session.package_UserName,
                                    ContentTypes: editContentTypes
                                }

                                var deletePlansData = {
                                    alacartPlansList: req.body.alacartPlansList,
                                    paosId: req.body.paosId,
                                    packageUserName: req.session.package_UserName,
                                    ContentTypes: deleteContentTypes
                                }
                                var contentTypePackData = {
                                    addContentTypes: addContentTypes,
                                    editContentTypes: editContentTypes,
                                    deleteContentTypes: deleteContentTypes,
                                    addPlansData: addPlansData,
                                    editPlansData: editPlansData,
                                    deletePlansData: deletePlansData
                                }

                                editContentTypePack(connection_ikon_cms, contentTypePackData);
                                callback(err, contentTypePackData);
                            })
                        }
                    }
                },
                function (err, results) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        connection_ikon_cms.release();
                        res.send({
                            "success": true,
                            "status": 200,
                            "message": "Package Saved Successfully.",
                            pkgId: req.body.packageId
                        });
                    }
                });
            })
    }else{
        res.redirect('/accountlogin');
    }
    }catch(err){
        res.status(500).json(err.message);
    }
};
exports.addMainsiteAlacartPlanDetails = function (req,res,next) {
    console.log('add mainsite child')
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
                        if (!req.body.packageId || req.body.packageId === '' || req.body.packageId == undefined || req.body.packageId === null) {
                            async.waterfall([
                                function (callback) {
                                    var searchData = {
                                        storeId: req.session.package_StoreId,
                                        dcId: req.body.distributionChannelId,
                                        packageType: req.body.packageType
                                    }
                                    mainSiteManager.getMainSitePackageData(connection_ikon_cms, searchData, function (err, packageData) {
                                        if (packageData.length > 0 && req.body.isChild !== true ) {
                                            callback(err, packageData[0].sp_pkg_id);
                                        } else {
                                            mainSiteManager.getMaxStorePackageId(connection_ikon_cms, function (err, MaxPkgId) {
                                                var pkgId = MaxPkgId[0].pkg_id != null ? parseInt(MaxPkgId[0].pkg_id + 1) : 1;
                                                console.log('pkgId' + pkgId)
                                                //Main site
                                                var storePackage = {
                                                    sp_pkg_id: pkgId,
                                                    sp_package_name: 'MainSite ' + req.body.distributionChannelId,
                                                    sp_pk_id: 0, //pack id
                                                    sp_st_id: req.session.package_StoreId,
                                                    sp_dc_id: req.body.distributionChannelId,
                                                    sp_pkg_type: req.body.packageType, //site type
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

                                                if (addStorePackage(connection_ikon_cms, storePackage)) {
                                                    callback(null, pkgId);
                                                } else {
                                                    callback({message: 'Package can not be added.'}, pkgId);
                                                }
                                            });
                                        }
                                    })
                                },
                                function (pkgId, callback) {
                                    if (req.body.parentPackageId != '' && req.body.parentPackageId != 0 && req.body.parentPackageId != undefined) {
                                        callback(null, pkgId, null);
                                    } else {
                                        alacartManager.getMaxAlacartOfferId(connection_ikon_cms, function (err, MaxPaosId) {
                                            var paosId = MaxPaosId[0].paos_id != null ? parseInt(MaxPaosId[0].paos_id + 1) : 1;
                                            console.log("paosId : " + paosId)
                                            var AlacartOfferData = {
                                                paos_id: paosId,
                                                paos_sp_pkg_id: pkgId,
                                                paos_op_id: req.body.offerId,
                                                paos_is_active: 1,
                                                paos_created_on: new Date(),
                                                paos_created_by: req.session.package_UserName,
                                                paos_modified_on: new Date(),
                                                paos_modified_by: req.session.package_UserName
                                            }
                                            if (addAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                                callback(null, pkgId, paosId);
                                            } else {
                                                callback({message: 'Alacart & Offer can not be added.'}, pkgId, paosId);
                                            }
                                        });
                                    }
                                },
                                function (pkgId, paosId, callback) {
                                    if (req.body.parentPackageId != '' && req.body.parentPackageId != 0 && req.body.parentPackageId != undefined) {
                                        callback(null, {pkgId: pkgId, paosId: null});
                                    } else {
                                        var ctCount = req.body.ContentTypes.length;
                                        var err = null;
                                        var alacartPlansList = req.body.alacartPlansList;
                                        var newContentTypes = Object.keys(req.body.alacartPlansList)
                                            .map(function (element) {
                                                return parseInt(element)
                                            });
                                        var addPlansData = {
                                            alacartPlansList: req.body.alacartPlansList,
                                            pkgId: pkgId,
                                            paosId: paosId,
                                            packageUserName: req.session.package_UserName,
                                            ContentTypes: newContentTypes
                                        }
                                        if (newContentTypes && newContentTypes.length > 0) {
                                            addContentTypePlans(connection_ikon_cms, 0, addPlansData);
                                        }
                                        callback(null, {pkgId: pkgId, paosId: paosId});
                                    }
                                }
                            ],
                            function (err, results) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                    console.log(err.message)
                                } else {
                                    connection_ikon_cms.release();
                                    res.send({
                                        "success": true,
                                        "status": 200,
                                        "message": "Package Saved Successfully.",
                                        pkgId: results.pkgId

                                    });
                                }
                            });
                        }
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

exports.editIndividualAlacartPlanDetails = function (req,res,next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                    function (callback) {
                        mainSiteManager.getUniquePackageName( connection_ikon_cms, req.session.package_StoreId, req.body.packageName,function( err, result ) {
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
                    function(data, callback){
                        if(data.exist == true && data.packageData[0].sp_pkg_id != req.body.packageId ){
                            callback(null, {'exist':data.exist,'message': 'Package Name Must be Unique'});
                        }else{
                            callback(null, {'exist':data.exist});
                        }
                    }
                ],
                function(err, results) {
                    if (results.message) {
                        connection_ikon_cms.release();
                        res.send({"success": false, "message": results.message});
                    } else {
                        if (req.body.packageId) {
                            async.parallel({
                                updateAdvanceSetting:function(callback){
                                    alacartManager.selectOfferIdByPAOSID(connection_ikon_cms,req.body.paosId,function(err,res){
                                        if(res[0].paos_op_id != req.body.paosId){
                                            advanceSettingManager.deleteOfferSetting(connection_ikon_cms, req.body.paosId,function(err,res){
                                                if(err){}else{
                                                    callback(null,'');
                                                }
                                            })
                                        }else{
                                            callback(null,'');
                                        }
                                        
                                    });
                                },
                                updateStorePackage:function (callback) {
                                    var pkgId = req.body.packageId;
                                    var storePackage = {
                                        sp_pkg_id: pkgId,
                                        sp_package_name: req.body.packageName,
                                        sp_pk_id: req.body.packId, //pack id
                                        sp_st_id: req.session.package_StoreId,
                                        sp_dc_id: req.body.distributionChannelId,
                                        sp_pkg_type: req.body.packageType, //site type
                                        sp_is_active: 1,
                                        sp_parent_pkg_id: 0,
                                        sp_modified_on:  new Date(),
                                        sp_modified_by: req.session.package_UserName
                                    };
                                    if (editStorePackage(connection_ikon_cms, storePackage)) {
                                        callback(null, pkgId);
                                    } else {
                                        callback({message: 'Package can not be updated.'}, pkgId);
                                    }
                                },
                                alacartNOffer:function (callback) {
                                    if(req.body.paosId != undefined && req.body.paosId != null && req.body.paosId != ''){
                                        var AlacartOfferData = {
                                            paos_id: req.body.paosId,
                                            paos_sp_pkg_id: req.body.packageId,
                                            paos_op_id: req.body.offerId,
                                            paos_is_active: 1,
                                            paos_modified_on:  new Date(),
                                            paos_modified_by: req.session.package_UserName
                                        }

                                        if (editAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                            callback(null, req.body.paosId);
                                        } else {
                                            callback({message: 'Alacart & Offer can not be updated.'}, req.body.paosId);
                                        }
                                    }else{
                                        alacartManager.getMaxAlacartOfferId( connection_ikon_cms, function(err,MaxPaosId){
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                                console.log(err.message)
                                            } else {
                                                var paosId = MaxPaosId[0].paos_id != null ? parseInt(MaxPaosId[0].paos_id + 1) : 1;
                                                var AlacartOfferData = {
                                                    paos_id: paosId,
                                                    paos_sp_pkg_id: req.body.packageId,
                                                    paos_op_id: req.body.offerId,
                                                    paos_is_active: 1,
                                                    paos_created_on: new Date(),
                                                    paos_created_by: req.session.package_UserName,
                                                    paos_modified_on: new Date(),
                                                    paos_modified_by: req.session.package_UserName
                                                }
                                                req.body.paosId = paosId;
                                                if (addAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                                    callback(null, req.body.paosId);
                                                } else {
                                                    callback({message: 'Alacart & Offer can not be added.'}, paosId);
                                                }
                                            }
                                        });
                                    }
                                },
                                contentTypePlans:function ( callback) {
                                    var ctCount = req.body.ContentTypes.length;
                                    var err = null;
                                    var alacartPlansList = req.body.alacartPlansList;
                                    var contentTypes = [];
                                    var existingContentTypes = [];

                                    for (var i = 0; i < ctCount; i++) {
                                        (function () {
                                            var j = i;
                                            var ContentTypeId = req.body.ContentTypes[j].cd_id;
                                            process.nextTick(function() {
                                                contentTypes.push(ContentTypeId);
                                            })
                                        })();
                                    }
                                    var newContentTypes = [];
                                    for (var i = 0; i < req.body.alacartPlansList.length; i++) {
                                        var newContentTypeId = req.body.alacartPlansList[i];

                                        if ((req.body.alacartPlansList[newContentTypeId].download && req.body.alacartPlansList[newContentTypeId].download != null && req.body.alacartPlansList[newContentTypeId].download != 0)
                                            || (req.body.alacartPlansList[newContentTypeId].streaming && req.body.alacartPlansList[newContentTypeId].streaming != null && req.body.alacartPlansList[newContentTypeId].streaming != 0)) {

                                            var newPlan = Object.keys(req.body.alacartPlansList)
                                                .map(function (element) {
                                                    return parseInt(element)
                                                });
                                            newContentTypes.push(newPlan);
                                        }
                                    }
                                    /*var newContentTypes  = Object.keys(req.body.alacartPlansList)
                                        .map(function (element) {
                                            return parseInt(element)
                                        });*/
                                    var deleteContentTypes = [];
                                    var editContentTypes = [];

                                    mainSiteManager.existingContentTypesInPack( connection_ikon_cms, req.body.paosId, function(err,result) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                            console.log(err.message)
                                        } else {
                                            if (result[0].contentTypes !== null) {
                                                existingContentTypes = result[0].contentTypes.split(',')
                                                    .map(function (element) {
                                                        return parseInt(element)
                                                    });
                                            }
                                            var addContentTypes = newContentTypes.filter(function (el) {
                                                return existingContentTypes.indexOf(el) < 0;
                                            });
                                            for (var i = 0; i < existingContentTypes.length; i++) {
                                                var ContentTypeId = existingContentTypes[i];
                                                if ((req.body.alacartPlansList[ContentTypeId].download && req.body.alacartPlansList[ContentTypeId].download != null && req.body.alacartPlansList[ContentTypeId].download != 0) || (req.body.alacartPlansList[ContentTypeId].streaming && req.body.alacartPlansList[ContentTypeId].streaming != null && req.body.alacartPlansList[ContentTypeId].streaming != 0)) {
                                                    editContentTypes.push(ContentTypeId);
                                                } else {
                                                    deleteContentTypes.push(ContentTypeId);
                                                }
                                            }

                                            var addPlansData = {
                                                alacartPlansList: req.body.alacartPlansList,
                                                paosId: req.body.paosId,
                                                packageUserName: req.session.package_UserName,
                                                ContentTypes: addContentTypes
                                            }

                                            var editPlansData = {
                                                alacartPlansList: req.body.alacartPlansList,
                                                paosId: req.body.paosId,
                                                packageUserName: req.session.package_UserName,
                                                ContentTypes: editContentTypes
                                            }

                                            var deletePlansData = {
                                                alacartPlansList: req.body.alacartPlansList,
                                                paosId: req.body.paosId,
                                                packageUserName: req.session.package_UserName,
                                                ContentTypes: deleteContentTypes
                                            }

                                            var contentTypePackData = {
                                                addContentTypes: addContentTypes,
                                                editContentTypes: editContentTypes,
                                                deleteContentTypes: deleteContentTypes,
                                                addPlansData: addPlansData,
                                                editPlansData: editPlansData,
                                                deletePlansData: deletePlansData
                                            }
                                            editContentTypePack(connection_ikon_cms, contentTypePackData);
                                            callback(err, contentTypePackData);
                                        }
                                    })
                                }
                            },
                            function (err, results) {
                                console.log(err)
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                    console.log(err.message)
                                } else {
                                    console.log('edit individaul results')
                                    console.log(results)
                                    connection_ikon_cms.release();
                                    res.send({
                                        "success": true,
                                        "status": 200,
                                        "message": "Package Saved Successfully.",
                                        pkgId: req.body.packageId
                                    });
                                }
                            });
                        }
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

exports.addIndividualAlacartPlanDetails = function (req,res,next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                    function (callback) {
                        mainSiteManager.getUniquePackageName( connection_ikon_cms, req.session.package_StoreId, req.body.packageName,function( err, result ) {
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
                    function(data, callback){
                        if(data.exist == true && data.packageData[0].sp_pkg_id != req.body.packageId ){
                            callback(null, {'exist':data.exist,'message': 'Package Name Must be Unique'});
                        }else{
                            callback(null, {'exist':data.exist});
                        }
                    }
                ],
                function(err, results) {
                    if (results.message) {
                        connection_ikon_cms.release();
                        res.send({"success": false, "message": results.message});
                    } else {
                        if (req.body.packageId === 0 || req.body.packageId === '' || req.body.packageId == undefined || req.body.packageId === null) {
                            async.waterfall([
                                function (callback) {
                                    mainSiteManager.getMaxStorePackageId(connection_ikon_cms, function (err, MaxPkgId) {
                                        var pkgId = MaxPkgId[0].pkg_id != null ? parseInt(MaxPkgId[0].pkg_id + 1) : 1;
                                        //Main site
                                        var storePackage = {
                                            sp_pkg_id: pkgId,
                                            sp_package_name: req.body.packageName,
                                            sp_pk_id: req.body.packId, //pack id
                                            sp_st_id: req.session.package_StoreId,
                                            sp_dc_id: req.body.distributionChannelId,
                                            sp_pkg_type: req.body.packageType, //site type
                                            sp_is_active: 1,
                                            sp_parent_pkg_id: 0,
                                            sp_created_on: new Date(),
                                            sp_created_by: req.session.package_UserName,
                                            sp_modified_on:	new Date(),
                                            sp_modified_by: req.session.package_UserName
                                        };
                                        if (addStorePackage(connection_ikon_cms, storePackage)) {
                                            callback(null, pkgId);
                                        } else {
                                            callback({message: 'Package can not be added.'}, pkgId);
                                        }
                                    });
                                },
                                function (pkgId, callback) {
                                    alacartManager.getMaxAlacartOfferId(connection_ikon_cms, function (err, MaxPaosId) {
                                        var paosId = MaxPaosId[0].paos_id != null ? parseInt(MaxPaosId[0].paos_id + 1) : 1;
                                        var AlacartOfferData = {
                                            paos_id: paosId,
                                            paos_sp_pkg_id: pkgId,
                                            paos_op_id: req.body.offerId,
                                            paos_is_active: 1,
                                            paos_created_on: new Date(),
                                            paos_created_by: req.session.package_UserName,
                                            paos_modified_on: new Date(),
                                            paos_modified_by: req.session.package_UserName
                                        }
                                        if (addAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                            callback(null, pkgId, paosId);
                                        } else {
                                            callback({message: 'Alacart & Offer can not be added.'}, pkgId, paosId);
                                        }
                                    });
                                },
                                function (pkgId, paosId, callback) {
                                    var ctCount = req.body.ContentTypes.length;
                                    var err = null;

                                    var newContentTypes = Object.keys(req.body.alacartPlansList)
                                        .map(function (element) {
                                            return parseInt(element)
                                        });

                                    var addPlansData = {
                                        alacartPlansList: req.body.alacartPlansList,
                                        pkgId: pkgId,
                                        paosId: paosId,
                                        packageUserName: req.session.package_UserName,
                                        ContentTypes: newContentTypes
                                    }
                                    if (newContentTypes && newContentTypes.length > 0) {
                                        addContentTypePlans(connection_ikon_cms, 0, addPlansData);
                                    }
                                    callback(null, {pkgId: pkgId, paosId: paosId});
                                }
                            ],
                            function (err, results) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                    console.log(err.message)
                                } else {
                                    connection_ikon_cms.release();
                                    res.send({
                                        "success": true,
                                        "status": 200,
                                        "message": "Package Saved Successfully.",
                                        pkgId: results.pkgId
                                    });
                                }
                            });
                        }
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

function getPackageTypeData( connection_ikon_cms, data, session ){
    if(data.packageType === 1 ) {
       /* var functionName = 'getIndividualPackageData('+session.package_StoreId+','+data.pkgId+')';
    }else{
        var functionName = 'getMainSitePackageData('+session.package_StoreId+','+data.distributionChannelId+','+data.packageType+')';
    }*/
        mainSiteManager.getIndividualPackageData(connection_ikon_cms, session.package_StoreId, req.body.pkgId, function (err, packageData) {
            if(packageData.length > 0){
                callback(err, packageData[0].sp_pkg_id);
            }else{
                mainSiteManager.getMaxStorePackageId( connection_ikon_cms, function(err,MaxPkgId){
                    var pkgId = MaxPkgId[0].pkg_id != null ?  parseInt(MaxPkgId[0].pkg_id + 1) : 1;

                    //Main site
                    var storePackage = {
                        sp_pkg_id: pkgId,
                        sp_package_name: 'MainSite '+req.body.distributionChannelId,
                        sp_pk_id : 0, //pack id
                        sp_st_id: req.session.package_StoreId,
                        sp_dc_id: req.body.distributionChannelId,
                        sp_pkg_type: req.body.packageType, //site type
                        sp_is_active: 1
                    };

                    //Individual Pack modifications
                    if(req.body.packageType == 1){
                        storePackage.sp_package_name = req.body.packageName;
                        storePackage.sp_pk_id = req.body.packId;
                    }

                    if(addStorePackage(connection_ikon_cms,storePackage)){
                        callback(null,pkgId);
                    }else{
                        callback({message:'Package can not be added.'},pkgId);
                    }
                });
            }
        })
    }else {
        var searchData = {
            storeId: req.session.package_StoreId,
            dcId: req.body.distributionChannelId,
            packageType: req.body.packageType
        }
        mainSiteManager.getMainSitePackageData(connection_ikon_cms, searchData, function (err, packageData) {
            if(packageData.length > 0){
                callback(err, packageData[0].sp_pkg_id);
            }else{
                mainSiteManager.getMaxStorePackageId( connection_ikon_cms, function(err,MaxPkgId){
                    var pkgId = MaxPkgId[0].pkg_id != null ?  parseInt(MaxPkgId[0].pkg_id + 1) : 1;

                    //Main site
                    var storePackage = {
                        sp_pkg_id: pkgId,
                        sp_package_name: 'MainSite '+req.body.distributionChannelId,
                        sp_pk_id : 0, //pack id
                        sp_st_id: req.session.package_StoreId,
                        sp_dc_id: req.body.distributionChannelId,
                        sp_pkg_type: req.body.packageType, //site type
                        sp_is_active: 1
                    };

                    //Individual Pack modifications
                    if(req.body.packageType == 1){
                        storePackage.sp_package_name = req.body.packageName;
                        storePackage.sp_pk_id = req.body.packId;
                    }

                    if(addStorePackage(connection_ikon_cms,storePackage)){
                        callback(null,pkgId);
                    }else{
                        callback({message:'Package can not be added.'},pkgId);
                    }
                });
            }
        })
    }
}
function addStorePackage( connection_ikon_cms, data ){
    mainSiteManager.addStorePackage( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
            return false;
        }
    });
    return true;
}
function editStorePackage( connection_ikon_cms, data ){
    mainSiteManager.editStorePackage( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
            return false;
        }
    });
    return true;
}

function addAlacartOfferDetails( connection_ikon_cms, data ){
    alacartManager.addAlacartOfferDetails( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
            return false;
        }
    });
    return true;
}
function editAlacartOfferDetails( connection_ikon_cms, data ){
    alacartManager.editAlacartOfferDetails( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
            return false;
        }
    });
    return true;
}

function editContentTypePack(connection_ikon_cms,data){
    async.parallel({
        addContentTypePlans: function (callback) {
            if(data.addContentTypes && data.addContentTypes.length > 0) {
                addContentTypePlans(connection_ikon_cms, 0, data.addPlansData);
            }
            callback(null, data.addContentTypes);
        },
        editContentTypePlans: function (callback) {
            if(data.editContentTypes && data.editContentTypes.length > 0) {
                editContentTypePlans(connection_ikon_cms, 0, data.editPlansData);
            }
            callback(null, data.editContentTypes);
        },
        deleteAlacartPlans: function (callback) {
            if(data.deleteContentTypes && data.deleteContentTypes.length > 0){
                deleteAlacartPlans(connection_ikon_cms, 0, data.deletePlansData);
            }
            callback(null, data.deleteContentTypes);
        }
    },
    function (err, results) {
        console.log('function results')
        console.log(results)
        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
            return false;
        }else{
            return true;
        }
    })
}

function addContentTypePlans(connection_ikon_cms,cnt,data) {
    var j = cnt;

    var ContentTypeId = data.ContentTypes[j];
    var plans = data.ContentTypes.length;
    var downloadId = ('download' in data.alacartPlansList[ContentTypeId]) ? data.alacartPlansList[ContentTypeId].download : '';
    var streamingId = ('streaming' in data.alacartPlansList[ContentTypeId]) ? data.alacartPlansList[ContentTypeId].streaming : '';

    var ContentTypePlanData = {
        pct_paos_id: data.paosId,
        pct_content_type_id: ContentTypeId,
        pct_download_id: downloadId,
        pct_stream_id: streamingId,
        pct_is_active: 1,
        pct_created_on:  new Date(),
        pct_created_by: data.packageUserName,
        pct_modified_on:  new Date(),
        pct_modified_by: data.packageUserName
    }
    alacartManager.addAlacartPack( connection_ikon_cms, ContentTypePlanData, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
        }else{
            cnt++;
            if (cnt < plans) {
                addContentTypePlans(connection_ikon_cms,cnt,data);
            }
        }
    });
}

function editContentTypePlans(connection_ikon_cms,cnt,data) {
    var j = cnt;
    var plans = data.ContentTypes.length;
    var ContentTypeId = data.ContentTypes[j];

    var downloadId = ('download' in data.alacartPlansList[ContentTypeId]) ? data.alacartPlansList[ContentTypeId].download : '';
    var streamingId = ('streaming' in data.alacartPlansList[ContentTypeId]) ? data.alacartPlansList[ContentTypeId].streaming : '';

    var ContentTypePlanData = {
        pct_paos_id: data.paosId,
        pct_content_type_id: ContentTypeId,
        pct_download_id: downloadId,
        pct_stream_id: streamingId,
        pct_is_active: 1,
        pct_modified_on:  new Date(),
        pct_modified_by: data.packageUserName
    }

    alacartManager.editAlacartPack( connection_ikon_cms, ContentTypePlanData, function(err,response ){

        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
        }else{
            cnt++;
            if (cnt < plans) {
                editContentTypePlans(connection_ikon_cms,cnt,data);
            }
        }
    });
}

function deleteAlacartPlans(connection_ikon_cms,cnt,data) {
    var j = cnt;
    var plans = data.ContentTypes.length;
    var ContentTypeId = data.ContentTypes[j];

    var ContentTypePlanData = {
        pct_paos_id: data.paosId,
        pct_content_type_id: ContentTypeId,
        pct_crud_isactive: data.paosId,
        pct_modified_on:  new Date(),
        pct_modified_by: data.packageUserName
    }

    alacartManager.editAlacartPack( connection_ikon_cms, ContentTypePlanData, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            //res.status(500).json(err.message);
            console.log(err.message)
        }else{
            cnt++;
            if (cnt < plans) {
                deleteAlacartPlans(connection_ikon_cms,cnt,data);
            }
        }
    });
}
