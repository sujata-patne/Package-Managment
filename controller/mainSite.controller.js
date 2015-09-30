/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');
var async = require("async");

exports.getContentTypes = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
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