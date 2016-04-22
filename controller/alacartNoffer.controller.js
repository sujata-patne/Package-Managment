/**
 * Created by sujata.patne on 05-10-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var alacartManager = require('../models/alacartModel');
var advanceSettingManager = require('../models/advanceSettingModel');
var fs = require("fs");
var async = require("async");
var wlogger = require("../config/logger");
var reload = require('require-reload')(require);
var config = require('../config')();
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
                                //callback(null, alacartNOfferDetails, contentTypePlanData);
                                callback(null, {alacartNOfferDetails:alacartNOfferDetails,contentTypePlanData:contentTypePlanData });

                            })
                        } else {
                            callback(null, {alacartNOfferDetails:alacartNOfferDetails,contentTypePlanData:null });
                        }
                    }
                ],
                function (err, results) {
                    if (err) {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'getAlacartNofferDetails',
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
                            action : 'getAlacartNofferDetails',
                            responseCode: 200,
                            message: 'Retrieved a-la-cart and offer data for Package Id '+req.body.packageId+' successfully.'
                        }
                        wlogger.info(info); // for information
                        connection_ikon_cms.release();
                        res.send(results);
                    }
                });
            })
        }else{
            var error = {
                userName: "Unknown User",
                action : 'getAlacartNofferDetails',
                responseCode: 500,
                message: 'Invalid User Session'
            }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }catch(err){
        var error = {
            userName: "Unknown User",
            action : 'getAlacartNofferDetails',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};

exports.editMainsiteAlacartPlanDetails = function (req,res,next){
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    updateAdvanceSetting:function(callback){
                        if(req.body.paosId && (req.body.paosId != undefined && req.body.paosId != '')) {
                            alacartManager.selectOfferIdByPAOSID(connection_ikon_cms, req.body.paosId, function (err, response) {
                                //console.log(response)
                                if (response && response.length > 0 && response[0].paos_op_id != req.body.paosId) {
                                    advanceSettingManager.deleteOfferSetting(connection_ikon_cms, req.body.paosId, function (err, result) {
                                        if (err) {

                                        } else {
                                            callback(null, '');
                                        }
                                    })
                                } else {
                                    callback(null, '');
                                }
                            });
                        }else{
                            callback(null, '');
                        }
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
                            var error = {
                                userName: req.session.package_UserName,
                                action : 'editMainsiteAlacartPlanDetails',
                                responseCode: 500,
                                message:  'Package cannot be updated.'
                            }
                            wlogger.error(error); // for error
                            callback({message: 'Package cannot be updated.'}, pkgId);
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
                                    paos_op_id: req.body.offerId == '' ? null :  req.body.offerId,
                                    paos_is_active: 1,
                                    paos_modified_on: new Date(),
                                    paos_modified_by: req.session.package_UserName
                                }
                                if (editAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                    callback(null, req.body.paosId);
                                } else {
                                    var error = {
                                        userName: req.session.package_UserName,
                                        action : 'editMainsiteAlacartPlanDetails',
                                        responseCode: 500,
                                        message: 'A-La-Cart & Offer cannot be updated.'
                                    }
                                    wlogger.error(error); // for error
                                    callback({message: 'A-La-Cart & Offer cannot be updated.'}, req.body.paosId);
                                }
                            } else {
                                alacartManager.getMaxAlacartOfferId(connection_ikon_cms, function (err, MaxPaosId) {
                                    var paosId = MaxPaosId[0].paos_id != null ? parseInt(MaxPaosId[0].paos_id + 1) : 1;
                                    var AlacartOfferData = {
                                        paos_id: paosId,
                                        paos_sp_pkg_id: req.body.packageId,
                                        paos_op_id: req.body.offerId == '' ? null :  req.body.offerId,
                                        paos_is_active: 1,
                                        paos_modified_on: new Date(),
                                        paos_modified_by: req.session.package_UserName
                                    }
                                    req.body.paosId = paosId;
                                    if (addAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                        callback(null, req.body.paosId);
                                    } else {
                                        var error = {
                                            userName: req.session.package_UserName,
                                            action : 'editMainsiteAlacartPlanDetails',
                                            responseCode: 500,
                                            message: 'A-La-Cart & Offer cannot be added.'
                                        }
                                        wlogger.error(error); // for error
                                        callback({message: 'A-La-Cart & Offer cannot be added.'}, paosId);
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
                            for (var i = 0; i < Object.keys(req.body.alacartPlansList).length; i++) {
                                var newContentTypeId = Object.keys(req.body.alacartPlansList)[i];

                                var downloadId = (req.body.alacartPlansList[newContentTypeId].download) ? req.body.alacartPlansList[newContentTypeId].download : null;
                                var streamingId = (req.body.alacartPlansList[newContentTypeId].streaming) ? req.body.alacartPlansList[newContentTypeId].streaming : null;

                                if ((downloadId !== '' && downloadId !== null && downloadId !== 0) || (streamingId !== '' && streamingId !== null && streamingId !== 0)) {
                                    newContentTypes = Object.keys(req.body.alacartPlansList)
                                        .map(function (element) {
                                            return parseInt(element)
                                        });
                                }
                            }
                            var deleteContentTypes = [];
                            var editContentTypes = [];
                            var addContentTypes = [];
                            mainSiteManager.existingContentTypesInPack(connection_ikon_cms, req.body.paosId, function (err, result) {
                                if (result[0].contentTypes != null && result[0].contentTypes != '' && result[0].contentTypes != undefined ) {
                                    existingContentTypes = result[0].contentTypes.split(',')
                                        .map(function (element) {
                                            return parseInt(element)
                                        });
                                }
                                if(newContentTypes != undefined && newContentTypes.length > 0){
                                    addContentTypes = newContentTypes.filter(function (el) {
                                        return existingContentTypes.indexOf(el) < 0;
                                    });
                                }

                                for (var i = 0; i < existingContentTypes.length; i++) {
                                    var ContentTypeId = existingContentTypes[i];
                                    var downloadId = (req.body.alacartPlansList[ContentTypeId].download) ? req.body.alacartPlansList[ContentTypeId].download : null;
                                    var streamingId = (req.body.alacartPlansList[ContentTypeId].streaming) ? req.body.alacartPlansList[ContentTypeId].streaming : null;

                                    if ((downloadId !== '' && downloadId !== null && downloadId !== 0) || (streamingId !== '' && streamingId !== null && streamingId !== 0)) {
                                        //if ((req.body.alacartPlansList[ContentTypeId].download && req.body.alacartPlansList[ContentTypeId].download != null && req.body.alacartPlansList[ContentTypeId].download != 0)
                                        //|| (req.body.alacartPlansList[ContentTypeId].streaming && req.body.alacartPlansList[ContentTypeId].streaming != null && req.body.alacartPlansList[ContentTypeId].streaming != 0)) {
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

                                editContentTypePack(connection_ikon_cms, contentTypePackData,req.session);
                                callback(err, contentTypePackData);
                            })
                        }
                    }
                },
                function (err, results) {
                    if (err) {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'editMainsiteAlacartPlanDetails',
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
                            action : 'editMainsiteAlacartPlanDetails',
                            responseCode: 200,
                            message: 'A-la-cart and offer data updated successfully.'
                        }
                        wlogger.info(info); // for information
                        connection_ikon_cms.release();
                        res.send({
                            "success": true,
                            "status": 200,
                            "message": "Package Id "+req.body.packageId+" Updated Successfully.",
                            pkgId: req.body.packageId
                        });
                    }
                });
            })
        }else{
            var error = {
                userName: "Unknown User",
                action : 'editMainsiteAlacartPlanDetails',
                responseCode: 500,
                message: 'Invalid User Session'
            }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }catch(err){
        var error = {
            userName: "Unknown User",
            action : 'editMainsiteAlacartPlanDetails',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};
exports.addMainsiteAlacartPlanDetails = function (req,res,next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                    function (callback) {
                        if(req.body.isChild !== true){
                            callback(err, {'exist': false, 'packageData': null});
                        }else {
                            //console.log('req.body.parentPackageId : ' + req.body.parentPackageId)
                            mainSiteManager.getUniquePackageName(connection_ikon_cms, req.session.package_StoreId, req.body.packageName, function (err, result) {
                                if (err) {
                                    var error = {
                                        userName: req.session.package_UserName,
                                        action : 'addMainsiteAlacartPlanDetails',
                                        responseCode: 500,
                                        message: JSON.stringify(err.message)
                                    }
                                    wlogger.error(error); // for error
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
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'addMainsiteAlacartPlanDetails',
                            responseCode: 500,
                            message: 'Package Name Must be Unique.'
                        }
                        wlogger.error(error); // for error
                        if (data.exist == true && data.packageData[0].sp_pkg_id != req.body.packageId) {
                            callback(null, {'exist': data.exist, 'message': 'Package Name Must be Unique'});
                        } else {
                            callback(null, {'exist': data.exist});
                        }
                    }
                ],
                function (err, results) {
                    if (results.message) {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'addMainsiteAlacartPlanDetails',
                            responseCode: 500,
                            message: JSON.stringify(err.message)
                        }
                        wlogger.error(error); // for error
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
                                                //console.log('pkgId' + pkgId)
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
                                                    var error = {
                                                        userName: req.session.package_UserName,
                                                        action : 'addMainsiteAlacartPlanDetails',
                                                        responseCode: 500,
                                                        message:  'Package cannot be added.'
                                                    }
                                                    wlogger.error(error); // for error
                                                    callback({message: 'Package cannot be added'}, pkgId);
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
                                            var AlacartOfferData = {
                                                paos_id: paosId,
                                                paos_sp_pkg_id: pkgId,
                                                paos_op_id: req.body.offerId == '' ? null :  req.body.offerId,
                                                paos_is_active: 1,
                                                paos_created_on: new Date(),
                                                paos_created_by: req.session.package_UserName,
                                                paos_modified_on: new Date(),
                                                paos_modified_by: req.session.package_UserName
                                            }
                                            if (addAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                                callback(null, pkgId, paosId);
                                            } else {
                                                var error = {
                                                    userName: req.session.package_UserName,
                                                    action : 'addMainsiteAlacartPlanDetails',
                                                    responseCode: 500,
                                                    message: 'A-La-Cart & Offer cannot be added.'
                                                }
                                                wlogger.error(error); // for error
                                                callback({message: 'A-La-Cart & Offer cannot be added.'}, pkgId, paosId);
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
                                    var error = {
                                        userName: req.session.package_UserName,
                                        action : 'addMainsiteAlacartPlanDetails',
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
                                        action : 'editMainsiteAlacartPlanDetails',
                                        responseCode: 200,
                                        message: 'A-la-cart and offer data added successfully.'
                                    }
                                    wlogger.info(info); // for information
                                    connection_ikon_cms.release();
                                    res.send({
                                        "success": true,
                                        "status": 200,
                                        "message": "Package Id "+results.pkgId+" added Successfully.",
                                        pkgId: results.pkgId
                                    });
                                }
                            });
                        }
                    }
                })
            })
        }else{var error = {
            userName: "Unknown User",
            action : 'addMainsiteAlacartPlanDetails',
            responseCode: 500,
            message: 'Invalid User Session'
        }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }catch(err){
        var error = {
            userName: "Unknown User",
            action : 'addMainsiteAlacartPlanDetails',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
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
                                    var error = {
                                        userName: req.session.package_UserName,
                                        action : 'editIndividualAlacartPlanDetails',
                                        responseCode: 500,
                                        message: JSON.stringify(err.message)
                                    }
                                    wlogger.error(error); // for error
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
                                var error = {
                                    userName: req.session.package_UserName,
                                    action : 'editIndividualAlacartPlanDetails',
                                    responseCode: 500,
                                    message: 'Package Name Must be Unique.'
                                }
                                wlogger.error(error); // for error
                                callback(null, {'exist':data.exist,'message': 'Package Name Must be Unique'});
                            }else{
                                callback(null, {'exist':data.exist});
                            }
                        }
                    ],
                    function(err, results) {
                        if (results.message) {
                            var error = {
                                userName: req.session.package_UserName,
                                action : 'editIndividualAlacartPlanDetails',
                                responseCode: 500,
                                message: JSON.stringify(err.message)
                            }
                            wlogger.error(error); // for error
                            connection_ikon_cms.release();
                            res.send({"success": false, "message": results.message});
                        } else {
                            if (req.body.packageId) {
                                async.parallel({
                                        updateAdvanceSetting:function(callback){
                                            alacartManager.selectOfferIdByPAOSID(connection_ikon_cms,req.body.paosId,function(err,response){
                                                //console.log(response)
                                                if(response.length > 0 && response[0].paos_op_id != req.body.paosId){
                                                    advanceSettingManager.deleteOfferSetting(connection_ikon_cms, req.body.paosId,function(err,result){
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
                                                var error = {
                                                    userName: req.session.package_UserName,
                                                    action : 'editIndividualAlacartPlanDetails',
                                                    responseCode: 500,
                                                    message:  'Package cannot be updated.'
                                                }
                                                wlogger.error(error); // for error
                                                callback({message: 'Package cannot be updated.'}, pkgId);
                                            }
                                        },
                                        alacartNOffer:function (callback) {
                                            if(req.body.paosId != undefined && req.body.paosId != null && req.body.paosId != ''){
                                                var AlacartOfferData = {
                                                    paos_id: req.body.paosId,
                                                    paos_sp_pkg_id: req.body.packageId,
                                                    paos_op_id: req.body.offerId == '' ? null :  req.body.offerId,
                                                    paos_is_active: 1,
                                                    paos_modified_on:  new Date(),
                                                    paos_modified_by: req.session.package_UserName
                                                }

                                                if (editAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                                    callback(null, req.body.paosId);
                                                } else {
                                                    var error = {
                                                        userName: req.session.package_UserName,
                                                        action : 'editIndividualAlacartPlanDetails',
                                                        responseCode: 500,
                                                        message: 'A-La-Cart & Offer cannot be updated.'
                                                    }
                                                    wlogger.error(error); // for error
                                                    callback({message: 'A-La-Cart & Offer cannot be updated.'}, req.body.paosId);
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
                                                            paos_op_id: req.body.offerId == '' ? null :  req.body.offerId,
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
                                                            var error = {
                                                                userName: req.session.package_UserName,
                                                                action : 'editIndividualAlacartPlanDetails',
                                                                responseCode: 500,
                                                                message: 'A-La-Cart & Offer cannot be added.'
                                                            }
                                                            wlogger.error(error); // for error
                                                            callback({message: 'A-La-Cart & Offer cannot be added.'}, paosId);
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
                                            for (var i = 0; i < Object.keys(req.body.alacartPlansList).length; i++) {
                                                var newContentTypeId = Object.keys(req.body.alacartPlansList)[i];

                                                var downloadId = (req.body.alacartPlansList[newContentTypeId].download) ? req.body.alacartPlansList[newContentTypeId].download : null;
                                                var streamingId = (req.body.alacartPlansList[newContentTypeId].streaming) ? req.body.alacartPlansList[newContentTypeId].streaming : null;

                                                if ((downloadId !== '' && downloadId !== null && downloadId !== 0) || (streamingId !== '' && streamingId !== null && streamingId !== 0)) {
                                                    newContentTypes = Object.keys(req.body.alacartPlansList)
                                                        .map(function (element) {
                                                            return parseInt(element)
                                                        });
                                                }
                                            }
                                            var deleteContentTypes = [];
                                            var editContentTypes = [];
                                            var addContentTypes = [];
                                            mainSiteManager.existingContentTypesInPack( connection_ikon_cms, req.body.paosId, function(err,result) {
                                                if (err) {
                                                    var error = {
                                                        userName: req.session.package_UserName,
                                                        action : 'editIndividualAlacartPlanDetails',
                                                        responseCode: 500,
                                                        message:  JSON.stringify(err.message)
                                                    }
                                                    wlogger.error(error); // for error
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
                                                    if(newContentTypes != undefined && newContentTypes.length > 0 ){
                                                        var addContentTypes = newContentTypes.filter(function (el) {
                                                            return existingContentTypes.indexOf(el) < 0;
                                                        });
                                                    }
                                                    for (var i = 0; i < existingContentTypes.length; i++) {
                                                        var ContentTypeId = existingContentTypes[i];
                                                        var downloadId = (req.body.alacartPlansList[ContentTypeId].download) ? req.body.alacartPlansList[ContentTypeId].download : null;
                                                        var streamingId = (req.body.alacartPlansList[ContentTypeId].streaming) ? req.body.alacartPlansList[ContentTypeId].streaming : null;

                                                        if ((downloadId !== '' && downloadId !== null && downloadId !== 0) || (streamingId !== '' && streamingId !== null && streamingId !== 0)) {
                                                            //if ((req.body.alacartPlansList[ContentTypeId].download && req.body.alacartPlansList[ContentTypeId].download != null && req.body.alacartPlansList[ContentTypeId].download != 0) || (req.body.alacartPlansList[ContentTypeId].streaming && req.body.alacartPlansList[ContentTypeId].streaming != null && req.body.alacartPlansList[ContentTypeId].streaming != 0)) {
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
                                                    editContentTypePack(connection_ikon_cms, contentTypePackData, req.session);
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
                                            var info = {
                                                userName: req.session.package_UserName,
                                                action : 'editIndividualAlacartPlanDetails',
                                                responseCode: 200,
                                                message: 'A-la-cart and offer data for Package Id '+req.body.packageId+' updated successfully.'
                                            }
                                            wlogger.info(info); // for information
                                            connection_ikon_cms.release();
                                            res.send({
                                                "success": true,
                                                "status": 200,
                                                "message": "Package Id "+req.body.packageId+" Saved Successfully",
                                                pkgId: req.body.packageId
                                            });
                                        }
                                    });
                            }
                        }
                    })

            })
        }else{
            var error = {
                userName: "Unknown User",
                action : 'editIndividualAlacartPlanDetails',
                responseCode: 500,
                message: 'Invalid User Session'
            }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }catch(err){
        var error = {
            userName: "Unknown User",
            action : 'editIndividualAlacartPlanDetails',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
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
                                            var error = {
                                                userName: req.session.package_UserName,
                                                action : 'addIndividualAlacartPlanDetails',
                                                responseCode: 500,
                                                message:  'Package cannot be added.'
                                            }
                                            wlogger.error(error); // for error
                                            callback({message: 'Package cannot be added.'}, pkgId);
                                        }
                                    });
                                },
                                function (pkgId, callback) {
                                    alacartManager.getMaxAlacartOfferId(connection_ikon_cms, function (err, MaxPaosId) {
                                        var paosId = MaxPaosId[0].paos_id != null ? parseInt(MaxPaosId[0].paos_id + 1) : 1;
                                        var AlacartOfferData = {
                                            paos_id: paosId,
                                            paos_sp_pkg_id: pkgId,
                                            paos_op_id: req.body.offerId == '' ? null :  req.body.offerId,
                                            paos_is_active: 1,
                                            paos_created_on: new Date(),
                                            paos_created_by: req.session.package_UserName,
                                            paos_modified_on: new Date(),
                                            paos_modified_by: req.session.package_UserName
                                        }
                                        if (addAlacartOfferDetails(connection_ikon_cms, AlacartOfferData)) {
                                            callback(null, pkgId, paosId);
                                        } else {
                                            var error = {
                                                userName: req.session.package_UserName,
                                                action : 'addIndividualAlacartPlanDetails',
                                                responseCode: 500,
                                                message:  'A-La-Cart & Offer cannot be added.'
                                            }
                                            wlogger.error(error); // for error
                                            callback({message: 'A-La-Cart & Offer cannot be added.'}, pkgId, paosId);
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
                                    var error = {
                                        userName: req.session.package_UserName,
                                        action : 'addIndividualAlacartPlanDetails',
                                        responseCode: 500,
                                        message:  JSON.stringify(err.message)
                                    }
                                    wlogger.error(error); // for error
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                    console.log(err.message)
                                } else {
                                    var info = {
                                        userName: req.session.package_UserName,
                                        action : 'addIndividualAlacartPlanDetails',
                                        responseCode: 200,
                                        message: 'Package Id '+results.pkgId+' Saved Successfully.'
                                    }
                                    wlogger.info(info); // for information
                                    connection_ikon_cms.release();
                                    res.send({
                                        "success": true,
                                        "status": 200,
                                        "message": 'Package Id '+results.pkgId+' Saved Successfully.',
                                        "pkgId": results.pkgId
                                    });
                                }
                            });
                        }
                    }
                })
            })
        }else{
            var error = {
                userName: "Unknown User",
                action : 'editMainsiteAlacartPlanDetails',
                responseCode: 500,
                message: 'Invalid User Session'
            }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }catch(err){
        var error = {
            userName: "Unknown User",
            action : 'editMainsiteAlacartPlanDetails',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};

function getPackageTypeData123( connection_ikon_cms, data, session ){
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
                        sp_st_id: session.package_StoreId,
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
                        var error = {
                            userName: session.package_UserName,
                            action : 'getPackageTypeData',
                            responseCode: 500,
                            message:  'Package cannot be added.'
                        }
                        wlogger.error(error); // for error
                        callback({message:'Package cannot be added.'},pkgId);
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
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'getPackageTypeData',
                            responseCode: 500,
                            message:  'Package cannot be added.'
                        }
                        wlogger.error(error); // for error
                        callback({message:'Package cannot be added.'},pkgId);
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
    console.log("===========");
    console.log(data)
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

function editContentTypePack(connection_ikon_cms,data,session){
    async.parallel({
        addContentTypePlans: function (callback) {
            if(data.addContentTypes && data.addContentTypes.length > 0) {
                addContentTypePlans(connection_ikon_cms, 0, data.addPlansData,session);
            }
            callback(null, data.addContentTypes);
        },
        editContentTypePlans: function (callback) {
            if(data.editContentTypes && data.editContentTypes.length > 0) {
                editContentTypePlans(connection_ikon_cms, 0, data.editPlansData,session);
            }
            callback(null, data.editContentTypes);
        },
        deleteAlacartPlans: function (callback) {
            if(data.deleteContentTypes && data.deleteContentTypes.length > 0){
                deleteAlacartPlans(connection_ikon_cms, 0, data.deletePlansData,session);
            }
            callback(null, data.deleteContentTypes);
        }
    },
    function (err, results) {
        if(err){
            var error = {
                userName: session.package_UserName,
                action : 'editContentTypePack',
                responseCode: 500,
                message:  JSON.stringify(err.message)
            }
            wlogger.error(error); // for error
            connection_ikon_cms.release();
            console.log(err.message);
            return false;
        }else{
            return true;
        }
    })
}

function addContentTypePlans(connection_ikon_cms,cnt,data,session) {
    var j = cnt;

    var ContentTypeId = data.ContentTypes[j];
    var plans = data.ContentTypes.length;
    var downloadId = ('download' in data.alacartPlansList[ContentTypeId]) ? data.alacartPlansList[ContentTypeId].download : null;
    var streamingId = ('streaming' in data.alacartPlansList[ContentTypeId]) ? data.alacartPlansList[ContentTypeId].streaming : null;

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
            var error = {
                userName: session.package_UserName,
                action : 'addContentTypePlans',
                responseCode: 500,
                message:  JSON.stringify(err.message)
            }
            wlogger.error(error); // for error
            connection_ikon_cms.release();
            console.log(err.message);
        }else{
            cnt++;
            if (cnt < plans) {
                addContentTypePlans(connection_ikon_cms,cnt,data,session);
            }
        }
    });
}

function editContentTypePlans(connection_ikon_cms,cnt,data,session) {
    var j = cnt;
    var plans = data.ContentTypes.length;
    var ContentTypeId = data.ContentTypes[j];

    var downloadId = ('download' in data.alacartPlansList[ContentTypeId]) ? data.alacartPlansList[ContentTypeId].download : null;
    var streamingId = ('streaming' in data.alacartPlansList[ContentTypeId]) ? data.alacartPlansList[ContentTypeId].streaming : null;

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
            var error = {
                userName: session.package_UserName,
                action : 'editContentTypePlans',
                responseCode: 500,
                message:  JSON.stringify(err.message)
            }
            wlogger.error(error); // for error
            connection_ikon_cms.release();
            console.log(err.message);
        }else{
            cnt++;
            if (cnt < plans) {
                editContentTypePlans(connection_ikon_cms,cnt,data,session);
            }
        }
    });
}

function deleteAlacartPlans(connection_ikon_cms,cnt,data,session) {
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
            var error = {
                userName: session.package_UserName,
                action : 'deleteAlacartPlans',
                responseCode: 500,
                message:  JSON.stringify(err.message)
            }
            wlogger.error(error); // for error
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
