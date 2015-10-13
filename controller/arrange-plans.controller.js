var mysql = require('../config/db').pool;
var Arrangeplans = require('../models/ArrangePlansModel');
var mainSiteManager = require('../models/mainSiteModel');
var async = require("async");
exports.getArrangeData = function(req, res, next) {
    console.log('hjj')
    console.log('hjj')
    console.log('hjj')
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                        PackageOffer: function (callback) {
                            console.log('hjj1')
                            mainSiteManager.getPackageOfferPlan( connection_ikon_cms,req.body.packageId, function(err,OfferData){
                                callback(err, OfferData)
                            });
                        },
                        PackageValuePacks: function (callback) {
                            console.log('hjj2')
                            mainSiteManager.getPackageValuePack(connection_ikon_cms,req.body.packageId, function (err, valuePackPlans) {
                                callback(err, valuePackPlans);
                            });
                        },
                        PackageSubscriptionPacks: function (callback) {
                            console.log('hjj3')
                            Arrangeplans.getPackageSubscriptionPack(connection_ikon_cms,req.body.packageId, function (err, SubscriptionPlans) {
                                callback(err, SubscriptionPlans);
                            });
                        },
                    },
                    function (err, results) {
                        //console.log(results)
                        if (err) {
                            console.log('hjj')
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


