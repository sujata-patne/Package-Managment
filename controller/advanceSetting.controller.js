var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var advanceSettingManager = require('../models/advanceSettingModel');
var async = require("async");
var _ = require("underscore");
var formidable = require('formidable');
var fs = require('fs');
var inspect = require('util-inspect');
var shell = require('shelljs');

// var ffmpeg = require('ffmpeg');

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
                    },
                    CGImageData: function (callback) {
                        advanceSettingManager.CGImageExists(connection_ikon_cms,req.body.packageId, function (err, CGImageData) {
                            callback(err, CGImageData);
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

exports.UploadFile =  function (req, res, next) {
            var form = new formidable.IncomingForm();
            var template_id;
            var count = 0;
          
            form.parse(req, function (err, fields, files) {
                var newPath = __dirname + "/../public/contentFiles/"+files.file.name;
                var absPath = "/contentFiles/"+files.file.name;
                var tmp_path = files.file.path;
                  // console.log('Package Id :'+fields.packageId);
                fs.rename(tmp_path,newPath, function (err) {
                      if (err) console.log(err);
                       // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
                       fs.unlink(tmp_path, function() {
                        if (err) console.log(err);
                       });
                    mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                        async.series([
                           function(callback){
                                //Check whether CG image  exists : 
                               
                                advanceSettingManager.CGImageExists( connection_ikon_cms,fields.packageId,  function(err,response) {
                                    if(response.length > 0){
                                        advanceSettingManager.DeleteCGImage( connection_ikon_cms,fields.packageId, function( err,response) {
                                            if(err){

                                            }else{
                                                callback(err,'Updated Previous CG image to delete status');
                                            }
                                        });  
                                    }else{
                                        callback(err,'Previous record not found');
                                    }
                                });
                               
                            },function(callback){

                                absPath = "/contentFiles/"+files.file.name;
                                var cgdata = {
                                    pci_sp_pkg_id : fields.packageId,
                                    pci_image_size : '640X640',
                                    pci_cg_img_browse : absPath,
                                    pci_is_default : 1
                                }
                                advanceSettingManager.saveCGImageSetting(connection_ikon_cms,cgdata,function(err,InsertBaseCGImage){
                                        callback(err,'InsertBaseCGImage');
                                }); 
                            },
                            function(callback){
                                absPath = '/contentFiles/480_'+files.file.name;
                                shell.exec('ffmpeg -y  -i ' + newPath + ' -vf scale=480:480 ' + __dirname + '/../public/contentFiles/480_'+files.file.name);
                                var cgdata = {
                                    pci_sp_pkg_id : fields.packageId,
                                    pci_image_size : '480X480',
                                    pci_cg_img_browse : absPath,
                                    pci_is_default : 0
                                }
                                advanceSettingManager.saveCGImageSetting(connection_ikon_cms,cgdata,function(err,InsertBaseCGImage){
                                            callback(err,'InsertBaseCGImage');
                                 }); 
                            },
                            function(callback){
                                absPath = '/contentFiles/420_'+files.file.name;
                                shell.exec('ffmpeg -y  -i ' + newPath + ' -vf scale=420:420 ' + __dirname + '/../public/contentFiles/420_'+files.file.name);
                                var cgdata = {
                                    pci_sp_pkg_id : fields.packageId,
                                    pci_image_size : '420X420',
                                    pci_cg_img_browse : absPath,
                                    pci_is_default : 0
                                }
                                advanceSettingManager.saveCGImageSetting(connection_ikon_cms,cgdata,function(err,InsertBaseCGImage){
                                            callback(err,'InsertBaseCGImage');
                                 }); 
                            },
                            function(callback){
                                absPath = '/contentFiles/360_'+files.file.name;
                                    shell.exec('ffmpeg -y  -i ' + newPath + ' -vf scale=360:360 ' + __dirname + '/../public/contentFiles/360_'+files.file.name);
                                var cgdata = {
                                    pci_sp_pkg_id : fields.packageId,
                                    pci_image_size : '360X360',
                                    pci_cg_img_browse : absPath,
                                    pci_is_default : 0
                                }
                                advanceSettingManager.saveCGImageSetting(connection_ikon_cms,cgdata,function(err,InsertBaseCGImage){
                                            callback(err,'InsertBaseCGImage');
                                 }); 
                            }, function(callback){
                                absPath = '/contentFiles/320_'+files.file.name;
                                shell.exec('ffmpeg -y  -i ' + newPath + ' -vf scale=320:320 ' + __dirname + '/../public/contentFiles/320_'+files.file.name);
                                var cgdata = {
                                    pci_sp_pkg_id : fields.packageId,
                                    pci_image_size : '320X320',
                                    pci_cg_img_browse : absPath,
                                    pci_is_default : 0
                                }
                                advanceSettingManager.saveCGImageSetting(connection_ikon_cms,cgdata,function(err,InsertBaseCGImage){
                                            callback(err,'InsertBaseCGImage');
                                 }); 
                            }, function(callback){
                                absPath = '/contentFiles/240_'+files.file.name;
                                shell.exec('ffmpeg -y  -i ' + newPath + ' -vf scale=240:240 ' + __dirname + '/../public/contentFiles/240_'+files.file.name);
                                var cgdata = {
                                    pci_sp_pkg_id : fields.packageId,
                                    pci_image_size : '240X240',
                                    pci_cg_img_browse : absPath,
                                    pci_is_default : 0
                                }
                                advanceSettingManager.saveCGImageSetting(connection_ikon_cms,cgdata,function(err,InsertBaseCGImage){
                                            callback(err,'InsertBaseCGImage');
                                 }); 
                            }, function(callback){
                                absPath = '/contentFiles/176_'+files.file.name;
                                 shell.exec('ffmpeg -y  -i ' + newPath + ' -vf scale=176:176 ' + __dirname + '/../public/contentFiles/176_'+files.file.name);
                                var cgdata = {
                                    pci_sp_pkg_id : fields.packageId,
                                    pci_image_size : '176X176',
                                    pci_cg_img_browse : absPath,
                                    pci_is_default : 0
                                }
                                advanceSettingManager.saveCGImageSetting(connection_ikon_cms,cgdata,function(err,InsertBaseCGImage){
                                            callback(err,'InsertBaseCGImage');
                                 }); 
                            }
                        ],function(err,results){
                                if(err){

                                }else{
                                    connection_ikon_cms.release();
                                    console.log('Inserted All Images ');
                                }
                        });
                    });
                });
        });

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
console.log('req.body.valuePlanSetting')
                                    console.log(req.body.valuePlanSetting)
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

function saveValuePackForSetting(pvs_id,valueObj,contentTypeLength,toUpdate){
     var count = contentTypeLength;
     loop1(0);
     function loop1( cnt ) {
            var i = cnt;
            var data = {
                pass_pvs_id : parseInt(pvs_id),
                pass_content_type : parseInt(_.pairs(valueObj[pvs_id])[i][0]),
                pass_value :  _.pairs(valueObj[pvs_id])[i][1]
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
