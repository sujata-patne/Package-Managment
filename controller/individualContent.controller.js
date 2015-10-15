var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var individualContentManager = require('../models/individualContentModel');
var async = require("async");


exports.getIndividualContentData = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    ContentTypes: function (callback) {
                        mainSiteManager.getContentTypes(connection_ikon_cms, req.session.package_StoreId, function (err, ContentTypeData) {
                            callback(err, ContentTypeData)
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
                        //console.log(results);
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


exports.getAlacartPlansByContentType = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    AlaCartPlans: function (callback) {
                        individualContentManager.getAlacartPlansByContentType(connection_ikon_cms, req.session.package_StoreId,req.body.contentTypeId, function (err, AlaCartPlans) {
                            callback(err, AlaCartPlans)
                        })
                    },
                    ContentData: function (callback) {

                        individualContentManager.getContentData(connection_ikon_cms, req.body.contentTypeId,req.body.packId, function (err, ContentData) {
                            callback(err, ContentData)
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
                        //console.log(results);
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


exports.addIndividualContent = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
            	 var cnt = 0;
                 var count = req.body.selectedContents.length - 1;
                 loop(0);
                 function loop( cnt ) {
                 	var i = cnt;
                    individualContentManager.getLastInsertedIndividualContentId( connection_ikon_cms,function(err,response){
                        if(err){

                        }else{
                            var data = {
                                pic_id : response[0].maxId,
                                pic_st_id : req.session.package_StoreId,
                                pic_pk_id : req.body.packId,
                                pic_ap_id : req.body.alacartPlanId,
                                pic_pkg_id : req.body.packageId,
                                pic_cm_id :  req.body.selectedContents[i]
                            }
                            console.log(data);
                            individualContentManager.saveIndividualContent( connection_ikon_cms,data, function(err,response){
                                if(err){

                                }else{
                                    if( count == cnt ){  
                                        connection_ikon_cms.release();
                                        res.send({status:200,message:''})
                                    }else{
                                         cnt = cnt + 1;
                                         loop(cnt);
                                    }                           
                                }
                            }); 
                        }                            
                    });
                 }
            });
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};
