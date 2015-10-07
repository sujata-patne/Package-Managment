/**
 * Created by sujata.patne on 05-10-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var async = require("async");
/*A-la-cart-n-offer details for package*/

exports.editAlacartPackDetails = function (req,res,next){
    console.log('edit')
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    alacartNOffer:function (callback) {
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
                        var newContentTypes  = Object.keys(req.body.alacartPlansList)
                            .map(function (element) {
                                return parseInt(element)
                            });
                        var deleteContentTypes = [];
                        var editContentTypes = [];

                        mainSiteManager.existingContentTypesInPack( connection_ikon_cms, req.body.paosId, function(err,result) {
                            if(result[0].contentTypes !== null){
                                existingContentTypes = result[0].contentTypes.split(',')
                                    .map(function (element) {
                                        return parseInt(element)
                                    });
                            }
                            var addContentTypes = newContentTypes.filter( function( el ) {
                                return existingContentTypes.indexOf( el ) < 0;
                            });
                            for (var i = 0; i < existingContentTypes.length; i++) {
                                var ContentTypeId = existingContentTypes[i];
                                if((req.body.alacartPlansList[ContentTypeId].download != null && req.body.alacartPlansList[ContentTypeId].download != 0) || (req.body.alacartPlansList[ContentTypeId].streaming != null && req.body.alacartPlansList[ContentTypeId].streaming != 0)) {
                                    editContentTypes.push(ContentTypeId);
                                }else{
                                    deleteContentTypes.push(ContentTypeId);
                                }
                            }

                            var addPlansData = {alacartPlansList:req.body.alacartPlansList, paosId:req.body.paosId,packageUserName:req.session.package_UserName,ContentTypes:addContentTypes}

                            var editPlansData = {alacartPlansList:req.body.alacartPlansList, paosId:req.body.paosId,packageUserName:req.session.package_UserName,ContentTypes:editContentTypes}

                            var deletePlansData = {alacartPlansList:req.body.alacartPlansList, paosId:req.body.paosId,packageUserName:req.session.package_UserName,ContentTypes:deleteContentTypes}
                            async.parallel({
                                addContentTypePlans: function (callback) {
                                    if(addContentTypes && addContentTypes.length > 0) {
                                        addContentTypePlans(connection_ikon_cms, 0, addPlansData);
                                    }
                                    callback(err, addContentTypes);
                                },
                                editContentTypePlans: function (callback) {
                                    if(editContentTypes && editContentTypes.length > 0) {
                                        editContentTypePlans(connection_ikon_cms, 0, editPlansData);
                                    }
                                    callback(err, editContentTypes);
                                },
                                deleteAlacartPlans: function (callback) {
                                    if(deleteContentTypes && deleteContentTypes.length > 0){
                                        deleteAlacartPlans(connection_ikon_cms,0,deletePlansData);
                                    }
                                    callback(err, deleteContentTypes);
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
                        })

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
                            "message": "A-la-cart & Offer Plans updated successfully!."
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
exports.addAlacartPackDetails = function (req,res,next){
    console.log('add')
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                    function(callback){
                        //Get store package
                        mainSiteManager.getMainSitePackageData( connection_ikon_cms, req.session.package_StoreId, req.body.distributionChannelId,function( err, packageData ) {
                            if(packageData.length > 0){
                                callback(err, packageData[0].sp_pkg_id);
                            }else{
                                mainSiteManager.getMaxStorePackageId( connection_ikon_cms, function(err,MaxPkgId){
                                    var pkgId = MaxPkgId[0].pkg_id != null ?  parseInt(MaxPkgId[0].pkg_id + 1) : 1;
                                    var storePackage = {
                                        sp_pkg_id: pkgId,
                                        sp_st_id: req.session.package_StoreId,
                                        sp_dc_id: req.body.distributionChannelId,
                                        sp_pkg_type: req.body.packageType, //site type
                                        sp_is_active: 1
                                    };
                                    if(addStorePackage(connection_ikon_cms,storePackage)){
                                        callback(null,pkgId);
                                    }else{
                                        callback({message:'Store Package can not be added.'},pkgId);
                                    }
                                });
                            }
                        })
                    },
                    function(pkgId,callback){
                        mainSiteManager.getMaxAlacartOfferId( connection_ikon_cms, function(err,MaxPaosId){
                            console.log(MaxPaosId)

                            var paosId = MaxPaosId[0].paos_id != null ?  parseInt(MaxPaosId[0].paos_id + 1) : 1;
                            console.log("paosId : "+paosId)
                            var AlacartOfferData = {
                                paos_id: paosId,
                                paos_sp_pkg_id: pkgId,
                                paos_op_id: req.body.offerId,
                                paos_is_active: 1,
                                paos_created_on:  new Date(),
                                paos_created_by: req.session.package_UserName,
                                paos_modified_on:  new Date(),
                                paos_modified_by: req.session.package_UserName
                            }
                            if(addAlacartOfferDetails(connection_ikon_cms,AlacartOfferData)){
                                callback(null,paosId);
                            }else{
                                callback({message:'Alacart & Offer can not be added.'},paosId);
                            }
                        });
                    },
                    function (paosId, callback) {
                        var ctCount = req.body.ContentTypes.length;
                        var err = null;
                        var alacartPlansList = req.body.alacartPlansList;
                        var newContentTypes  = Object.keys(req.body.alacartPlansList)
                            .map(function (element) {
                                return parseInt(element)
                            });
                        var addPlansData = {alacartPlansList:req.body.alacartPlansList, paosId:paosId,packageUserName:req.session.package_UserName,ContentTypes:newContentTypes}
                        if(newContentTypes && newContentTypes.length > 0) {
                            addContentTypePlans(connection_ikon_cms, 0, addPlansData);
                        }
                        callback(null,newContentTypes);
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
                            "message": "A-la-cart & Offer Plans added successfully!."
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

function addAlacartOfferDetails( connection_ikon_cms, data ){
    mainSiteManager.addAlacartOfferDetails( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
            return false;
        }
    });
    return true;
}
function editAlacartOfferDetails( connection_ikon_cms, data ){
    mainSiteManager.editAlacartOfferDetails( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
            return false;
        }
    });
    return true;
}
function addAlacartPack( connection_ikon_cms, data ){
    mainSiteManager.addAlacartPack( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
            return false;
        }
    });
    return true;
}
function editAlacartPack( connection_ikon_cms, data ){
    mainSiteManager.editAlacartPack( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            console.log(err.message);
            return false;
        }
    });
    return true;
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
    mainSiteManager.addAlacartPack( connection_ikon_cms, ContentTypePlanData, function(err,response ){
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

    mainSiteManager.editAlacartPack( connection_ikon_cms, ContentTypePlanData, function(err,response ){

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

    mainSiteManager.editAlacartPack( connection_ikon_cms, ContentTypePlanData, function(err,response ){
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
