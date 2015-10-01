/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var async = require("async");

exports.getAlacartNOfferData = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                        mainSitePackageData: function (callback) {
                            mainSiteManager.getMainSitePackageData( connection_ikon_cms, req.session.package_StoreId, function(err,mainSitePackageId){
                                callback(err, mainSitePackageId[0]);
                            })
                        },
                        DistributionChannel: function (callback) {
                            mainSiteManager.getDistributionChannels( connection_ikon_cms, req.session.package_StoreId,function(err,distributionChannels){
                                callback(err, distributionChannels);
                            })
                        },
                        ContentTypes: function (callback) {
                            mainSiteManager.getContentTypes( connection_ikon_cms, req.session.package_StoreId, function(err,ContentTypeData){
                                callback(err, ContentTypeData)
                            })
                        },
                        ContentTypeData: function (callback) {
                            mainSiteManager.getContentTypeData( connection_ikon_cms, req.session.package_StoreId, function(err,ContentTypeData){
                                callback(err, ContentTypeData)
                            });
                        },
                        OfferData: function (callback) {
                            mainSiteManager.getOfferData( connection_ikon_cms, req.session.package_StoreId, function(err,OfferData){
                                callback(err, OfferData)
                            });
                        }
                    },
                    function (err, results) {
                        console.log(results.mainSitePackageData)
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

exports.getAlacartNOfferDetails = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                mainSiteManager.getAlacartNOfferDetails(connection_ikon_cms, req.body.pkgId, function (err, mainSitePackageId) {
                    callback(err, mainSitePackageId[0]);
                })
            })
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};

exports.addAlacartPlanDetails = function (req,res,next){
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                    function(callback){
                        //Get store package
                        mainSiteManager.getMaxStorePackageId( connection_ikon_cms, function(err,MaxPkgId){
                            callback(err, MaxPkgId)
                        });
                    },
                    function(pkgId,callback){
                        mainSiteManager.getMaxAlacartOfferId( connection_ikon_cms, function(err,MaxPaosId){
                            callback(err, pkgId, MaxPaosId)
                        });
                    },
                    function (pkgId,paosId,callback){
                        var pkg_id = pkgId[0].pkg_id != null ?  parseInt(pkgId[0].pkg_id + 1) : 1;
                        var storePackage = {
                            sp_pkg_id: pkg_id,
                            sp_st_id: req.session.package_StoreId,
                            sp_dc_id: req.body.distributionChannelId,
                            sp_pkg_type: req.body.packageType, //site type
                            sp_is_active: 1
                        }
                        if(addStorePackage(connection_ikon_cms,storePackage)){
                            callback(null,pkg_id,paosId);
                        }else{
                            callback({message:'Store Package can not be added.'},pkg_id,paosId);
                        }
                    },

                    function (pkgId,paosId,callback){
                        var contentType = 0;
                        var paos_id = paosId[0].paos_id != null ?  parseInt(paosId[0].paos_id + 1) : 1;
                        var AlacartOfferData = {
                            paos_id: paos_id,
                            paos_sp_pkg_id: pkgId,
                            paos_op_id: req.body.offerId,
                            paos_is_active: 1
                        }
                        if(addAlacartOfferDetails(connection_ikon_cms,AlacartOfferData)){
                            callback(null,paos_id);
                        }else{
                            callback({message:'Alacart & Offer can not be added.'},paos_id);
                        }
                    },
                    function (paosId, callback) {
                        var ctCount = req.body.ContentTypes.length;
                       // console.log(ctCount)
                        var err = null;
                        var alacartPlansList = req.body.alacartPlansList;
                        for(var i = 0; i < ctCount; i++) {
                            (function() {
                                var j = i;
                                var ContentTypeId = req.body.ContentTypes[j].cd_id;
                                //console.log(req.body.alacartPlansList[ContentTypeId])
                                if(ContentTypeId in req.body.alacartPlansList){
                                    var downloadId = (('download' in req.body.alacartPlansList[ContentTypeId]))? req.body.alacartPlansList[ContentTypeId].download:'';
                                    var streamingId = (('download' in req.body.alacartPlansList[ContentTypeId]))? req.body.alacartPlansList[ContentTypeId].streaming:'';
                                    var ContentTypePlanData = {
                                        pct_paos_id: paosId,
                                        pct_content_type_id: ContentTypeId,
                                        pct_download_id: downloadId,
                                        pct_stream_id: streamingId,
                                        pct_is_active: 1
                                    }
                                    //console.log(ContentTypePlanData);
                                    process.nextTick(function() {
                                        if(!addAlacartPlans(connection_ikon_cms, ContentTypePlanData)){
                                            err = 'Alacart Plan can not be added.';
                                        }
                                    });
                                }
                                callback(err,paosId);
                            })();
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
            res.status(500).json(err.message);
            return false;
        }
    });
    return true;
}

function addAlacartOfferDetails( connection_ikon_cms, data ){
    mainSiteManager.addAlacartOfferDetails( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            res.status(500).json(err.message);
            return false;
        }
    });
    return true;
}
function addAlacartPlans( connection_ikon_cms, data ){
    mainSiteManager.addAlacartPlans( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            res.status(500).json(err.message);
            return false;
        }
    });
    return true;
}