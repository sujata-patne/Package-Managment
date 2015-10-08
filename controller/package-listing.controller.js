var mysql = require('../config/db').pool;
var PackageManager = require('../models/packageListingModel');
var async = require("async");

exports.getStore = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                      
                          DistributionChannel: function (callback) {
                           PackageManager.getStore( connection_ikon_cms, req.session.package_StoreId, function(err,OfferData){
                                callback(err, OfferData)
                            });
                        }
                    },
                    
                    function (err, results) {
                        console.log(results.OfferData)
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
exports.getPackageDetail  = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                      
                          packageByName: function (callback) {
                            console.log(req.body);
                              var data = {
                                  storeId: req.session.package_StoreId,
                                  term:req.body.title_text,
                                  start_date:req.body.st_date,
                                  end_date:req.body.end_date,
                                  distributionChannelId: req.body.distributionChannelId
                              }
                            /* PackageManager.getPackageByName( connection_ikon_cms,req.body.distributionChannelId, req.session.package_StoreId, function(err,OfferData){
                                callback(err, OfferData)
                            });*/
                              PackageManager.getPackageByTitle( connection_ikon_cms, data, function(err,Package){
                                  callback(err, Package);
                              });
                        }
                         /*DistributionChannel: function (callback) {
                             mainSiteManager.getDistributionChannel( connection_ikon_cms, req.session.package_StoreId, function(err,OfferData){
                                callback(err, OfferData)
                            });
                        }*/
                    },
                    
                    function (err, results) {
                        console.log(results.OfferData)
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
exports.getPackageStartsWith = function (req, res, next) {
    try {   
            if (req.session && req.session.package_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                  console.log("in 1");
                    async.parallel({
                           Package: function (callback) {
                               var data = {
                                   storeId: req.session.package_StoreId,
                                   term:req.body.term,
                                   distributionChannelId: req.body.distributionChannelId
                               }
                              PackageManager.getAllPackageForListStartsWith( connection_ikon_cms,data, function(err,Package){
                                  console.log('in 2');
                                  console.log(Package);
                                  callback(err, Package);
                              });
                            }
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
                          }
                       )

                });

            }else{

            }
         }catch(err){

         }
} 
exports.getPackageByTitle = function (req, res, next) {
    try {   
            if (req.session && req.session.package_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    async.parallel({
                           Package: function (callback) {
                            var data = {
                              storeId: req.session.package_StoreId,
                              term:req.body.title_text,
                              start_date:req.body.st_date,
                              end_date:req.body.end_date, 
                              distributionChannelId: req.body.distributionChannelId
                            }
                              PackageManager.getPackageByTitle( connection_ikon_cms, data, function(err,Package){
                                  callback(err, Package);
                              });
                            }
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
                          }
                       )

                });

            }else{

            }
         }catch(err){

         }
}    


exports.blockUnBlockContentType = function (req, res, next) {
      try {   
            if (req.session && req.session.package_UserName) {

                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                         async.parallel({
                            updateContentTypeStatus : function(callback){
                             PackageManager.updateContentTypeStatus( connection_ikon_cms, req.body.packId,req.body.contentTypeId,req.body.active, function(err,response){
                                     callback(err, response);
                                });
                            }

                        },function(err,results){
                                    if(err){
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                        console.log(err.message);
                                     }else{
                                        connection_ikon_cms.release();
                                        res.send({ success: true, message: 'Content Type ' + req.body.Status + ' successfully.' });
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


exports.getContentTypesByPack = function (req, res, next) {
    try {   
            if (req.session && req.session.package_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    async.parallel({
                         PackContentTypes: function (callback) {

                            PackageManager.getContentTypesByPackId( connection_ikon_cms, req.body.packId, function(err,PackContentTypes){
                                callback(err, PackContentTypes);
                            });
                        }
                    },
                     function (err, results) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                                console.log(err.message);
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
