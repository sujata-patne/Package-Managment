var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var advanceSettingManager = require('../models/advanceSettingModel');
var async = require("async");
var _ = require("underscore");

exports.getData = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    ContentTypes: function (callback) {
                        mainSiteManager.getContentTypes(connection_ikon_cms, req.session.package_StoreId, function (err, ContentTypeData) {
                            callback(err, ContentTypeData)
                        })
                    },
                    ContentTypeData: function (callback) {
                        mainSiteManager.getContentTypeData(connection_ikon_cms, req.session.package_StoreId, function (err, ContentTypeData) {
                            callback(err, ContentTypeData)
                        });
                    },
                    PackageOffer: function (callback) {
                        mainSiteManager.getPackageOfferPlan( connection_ikon_cms,req.body.packageId, function(err,OfferData){
                            callback(err, OfferData)
                        });
                    },
                    PackageValuePacks: function (callback) {
                        mainSiteManager.getPackageValuePack(connection_ikon_cms,req.body.packageId, function (err, valuePackPlans) {
                            callback(err, valuePackPlans);
                        });
                    },
                    ValueDataForUpdate: function (callback) {
                        advanceSettingManager.getValuePlanSettingDataForUpdate(connection_ikon_cms,req.body.packageId, function (err, ValueDataForUpdate) {
                            callback(err, ValueDataForUpdate);
                        });
                    },
                    OfferDataForUpdate: function (callback) {
                        advanceSettingManager.getOfferPlanSettingDataForUpdate(connection_ikon_cms,req.body.packageId, function (err, OfferDataForUpdate) {
                            callback(err, OfferDataForUpdate);
                        });
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
                        console.log(results);
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

exports.addSetting = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    CreateOfferRow: function (callback) {
                        if(req.body.offerBuySetting[0] != undefined){
                                 var count = req.body.totalLength - 1;
                                 loop(0);
                                 function loop( cnt ) {
                                     var i = cnt;
                                     var data = {
                                        pass_paos_id : req.body.offerPackageSiteId,
                                        pass_content_type : parseInt(_.keys(req.body.offerBuySetting[i])),
                                        pass_buy :  parseInt(_.values(req.body.offerBuySetting[i])),
                                        pass_get :  parseInt(_.values(req.body.offerGetSetting[i]))
                                     }
                                     advanceSettingManager.saveAdvanceSetting( connection_ikon_cms,data,function(err,response){
                                            if(err){ 
                                            }else{
                                                if(cnt == count){
                                                    callback(err,null);
                                                }else{
                                                    // connection_ikon_cms.release();
                                                    cnt = cnt + 1;
                                                    loop(cnt);
                                                }
                                            }
                                     });
                                 }
                        }else{
                            callback(null);
                        }
                            
                    },
                  CreateValuePackRow: function (callback) {
                     if(Object.keys(req.body.valuePlanSetting).length > 0){
                            var count = req.body.valueLength - 1;
                            loop1(0);
                            function loop1( cnt ) {
                                var i = cnt;
                                saveValuePackForSetting(_.keys(req.body.valuePlanSetting)[i],req.body.valuePlanSetting,req.body.totalLength - 1,false);
                                if(cnt == count){
                                    callback(null);
                                }else{
                                    connection_ikon_cms.release();
                                    cnt = cnt + 1;
                                    loop1(cnt);
                                }
                            }
                     }else{
                        callback(null);
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


exports.editSetting = function(req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    EditOfferRow: function (callback) {
                        if(req.body.offerBuySetting[0] != undefined){
                                 var count = req.body.totalLength - 1;
                                 loop(0);
                                 function loop( cnt ) {
                                     var i = cnt;
                                     var data = {
                                        pass_paos_id : req.body.offerPackageSiteId,
                                        pass_content_type : parseInt(_.keys(req.body.offerBuySetting[i])),
                                        pass_buy :  parseInt(_.values(req.body.offerBuySetting[i])),
                                        pass_get :  parseInt(_.values(req.body.offerGetSetting[i]))
                                     }
                                     advanceSettingManager.updateOfferSetting(  connection_ikon_cms, data.pass_paos_id,data.pass_content_type, function(err,response){
                                        if(err){

                                        }else{
                                             advanceSettingManager.saveAdvanceSetting( connection_ikon_cms,data,function(err,response){
                                                    if(err){ 
                                                    }else{
                                                        if(cnt == count){
                                                            callback(err,null);
                                                        }else{
                                                                cnt = cnt + 1;
                                                                loop(cnt);
                                                        }
                                                    }
                                             });
                                        }
                                     });
                                 }
                        }else{
                            callback(null,1);
                        }                            
                    },
                  EditValuePackRow: function (callback) {
                       if(Object.keys(req.body.valuePlanSetting).length > 0){
                                var count = req.body.valueLength - 1;
                                loop1(0);
                                function loop1( cnt ) {
                                    var i = cnt;
                                    saveValuePackForSetting(_.keys(req.body.valuePlanSetting)[i],req.body.valuePlanSetting,req.body.totalLength - 1,true);
                                    if(cnt == count){
                                        // connection_ikon_cms.release();
                                        callback(null,'1');
                                    }else{
                                        // connection_ikon_cms.release();
                                        cnt = cnt + 1;
                                        loop1(cnt);
                                    }
                                }
                       }else{
                            callback(null,'2');
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

function saveValuePackForSetting(pvs_vp_id,valueObj,contentTypeLength,toUpdate){
     var count = contentTypeLength;
     loop1(0);
     function loop1( cnt ) {
            var i = cnt;
            var data = {
                pass_pvs_id : parseInt(pvs_vp_id),
                pass_content_type : parseInt(_.pairs(valueObj[pvs_vp_id])[i][0]),
                pass_value :  _.pairs(valueObj[pvs_vp_id])[i][1]
            }


            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    if(toUpdate == true){
                        advanceSettingManager.updateValueSetting(  connection_ikon_cms,data.pass_pvs_id, data.pass_content_type,  function(err,response){
                            if(err){}else{
                                    advanceSettingManager.saveAdvanceSetting( connection_ikon_cms,data,function(err,response){
                                            if(err){ 
                                            }else{
                                                if(cnt == count){
                                                    // callback(err,null);
                                                }else{
                                                     connection_ikon_cms.release();
                                                     cnt = cnt + 1;
                                                     loop1(cnt);
                                                 }
                                            }
                                      });
                                 }
                            });
                    }else{
                          advanceSettingManager.saveAdvanceSetting( connection_ikon_cms,data,function(err,response){
                                if(err){ 
                                }else{
                                    if(cnt == count){
                                        // callback(err,null);
                                    }else{
                                            connection_ikon_cms.release();
                                            cnt = cnt + 1;
                                            loop1(cnt);
                                    }
                                }
                            });
                    }
            });
     }
}
