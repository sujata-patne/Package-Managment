var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var individualContentManager = require('../models/individualContentModel');
var async = require("async");
var moment = require("moment");


exports.getIndividualContentData = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    ContentTypes: function (callback) {
                        mainSiteManager.getContentTypes(connection_ikon_cms, req.session.package_StoreId, function (err, ContentTypeData) {
                            callback(err, ContentTypeData)
                        })
                    },
                    IndividualContentData: function (callback) {
                      if(req.body.getDataForUpdate){
                            individualContentManager.getIndividualContentData(connection_ikon_cms, req.session.package_StoreId,req.body.packageId,req.body.packId,req.body.planId, function (err, IndividualContentData) {
                                callback(err, IndividualContentData)
                            });
                      }else{
                        callback(err,'');
                      }
                    },
                },
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
                 //console.log("individual..");
                 //console.log(count);
                 loop(0);
                 function loop( cnt ) {
                    var i = cnt;
                    //console.log(cnt);
                    individualContentManager.getLastInsertedIndividualContentId( connection_ikon_cms,function(err,response){
                        if(err){

                        }else{
                             var validDate;
                             if(req.body.validDate !== undefined && req.body.validDate != ""){
                                 validDate = moment(req.body.validDate);
                                 validDate = validDate.format('YYYY-MM-DD');
                             }else{
                                 validDate = '2050-01-01'
                             }

                            var data = {
                                pic_id : response[0].maxId,
                                pic_st_id : req.session.package_StoreId,
                                pic_pk_id : req.body.packId,
                                pic_ap_id : req.body.alacartPlanId,
                                pic_pkg_id : req.body.packageId,
                                pic_cm_id :  req.body.selectedContents[i],
                                pic_valid_till : validDate
                            }
                            individualContentManager.saveIndividualContent( connection_ikon_cms,data, function(err,response){
                                if(err){

                                }else{
                                   // console.log('count '+count+'=== cnt '+cnt);

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


exports.editIndividualContent = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.series([
                    function(callback){
                        if(req.body.selectedContents.length != 0){
                            individualContentManager.checkRecordExists( connection_ikon_cms, req.session.package_StoreId,req.body.packId,req.body.alacartPlanId,req.body.packageId,function(err,response){
                                if(err){

                                }else{
                                    if(response.length > 0){
                                      //  console.log('in update');
                                        individualContentManager.updateIndividualContentRecord( connection_ikon_cms, req.session.package_StoreId,req.body.packId,req.body.alacartPlanId,req.body.packageId,function(err,response){
                                            callback(err,'updated');
                                        });
                                    }else{
                                        callback(err,'record not found');
                                    }
                                }
                            });
                        }else{
                            //If nothing is updated : 
                            //Just update the date : 
                             var validDate;
                             if(req.body.validDate !== undefined && req.body.validDate != "" && req.body.validDate != null){
                                 validDate = moment(req.body.validDate);
                                 validDate = validDate.format('YYYY-MM-DD');
                             }else{
                                 validDate = '2050-01-01'
                             }
                            var data = {
                                        pic_st_id : req.session.package_StoreId,
                                        pic_pk_id : req.body.packId,
                                        pic_ap_id : req.body.alacartPlanId,
                                        pic_pkg_id : req.body.packageId,
                                        pic_valid_till : validDate
                                    }
                                individualContentManager.updateIndividualContentDate( connection_ikon_cms, data, function(err,response){
                                    if(err){

                                    }else{
                                        callback(null,'');
                                    }
                                });
                        }
                            
                    },
                ],
                function(err,results){
                     var cnt = 0;
                     var count = req.body.selectedContents.length;
                     if(count == 0){
                        connection_ikon_cms.release();
                        res.send({status:200,message:''})
                     }else{
                          count = count - 1;
                          loop(0);
                          function loop( cnt ) {
                           // console.log('cnt '+cnt);
                            //console.log('count '+count);
                            var i = cnt;
                            individualContentManager.getLastInsertedIndividualContentId( connection_ikon_cms,function(err,response){
                                if(err){

                                }else{

                                     var validDate;
                                     if(req.body.validDate !== undefined && req.body.validDate != ""){
                                         validDate = moment(req.body.validDate);
                                         validDate = validDate.format('YYYY-MM-DD');
                                     }else{
                                        validDate = '2050-01-01'
                                     }

                                    var data = {
                                        pic_id : response[0].maxId,
                                        pic_st_id : req.session.package_StoreId,
                                        pic_pk_id : req.body.packId,
                                        pic_ap_id : req.body.alacartPlanId,
                                        pic_pkg_id : req.body.packageId,
                                        pic_cm_id :  req.body.selectedContents[i],
                                        pic_valid_till : validDate
                                    }
                                    //console.log(data);

                                    individualContentManager.saveIndividualContent( connection_ikon_cms,data, function(err,response){
                                        if(err){

                                        }else{
                                            //console.log('else cnt '+cnt);
                                           // console.log('else count '+count);
                                            if( count == cnt ){  
                                                connection_ikon_cms.release();
                                                res.send({status:200,message:''})
                                            }else{
                                                //console.log('inside else '+cnt);
                                                 cnt = cnt + 1;
                                                 loop(cnt);
                                            }                           
                                        }
                                    }); 
                                }                            
                            });
                        }
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
