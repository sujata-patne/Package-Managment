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
                        /// console.log(results.OfferData)
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

                var data = {
                    storeId: req.session.package_StoreId,
                    term:req.body.title_text,
                    start_date:req.body.st_date,
                    end_date:req.body.end_date,
                    distributionChannelId: req.body.distributionChannelId
                }

                PackageManager.getAllPackageForList( connection_ikon_cms, data, function(err,Package){
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        var searchData = [];
                        Package.forEach(function(pkg) {
                            var sp_pkg_id = pkg.sp_pkg_id;
                            async.parallel({
                                    packName: function (callback) {
                                        PackageManager.packUsedInPackage( connection_ikon_cms,sp_pkg_id, function(err,packname){
                                            callback(err,packname)
                                        });
                                    },
                                    alacartPackPlanCount: function (callback) {
                                        PackageManager.countOfferPlans(connection_ikon_cms, sp_pkg_id, function (err, offerCount) {
                                            async.waterfall([
                                                    function (callback) {
                                                        PackageManager.existAlacartPackByPkgId(connection_ikon_cms, sp_pkg_id, function (err, result) {
                                                            callback(err, result);
                                                        })
                                                    },
                                                    function (exist, callback) {
                                                        if (exist.length > 0) {
                                                            PackageManager.countAlacartPackPlans(connection_ikon_cms, sp_pkg_id, function (err, count) {
                                                                callback(err, count);
                                                            })
                                                        } else {
                                                            callback(err, 0);
                                                        }
                                                    }
                                                ],
                                                function (err, results) {
                                                    callback(err, results+offerCount);
                                                });
                                        })
                                    },
                                    valuePackPlanCount: function (callback) {
                                        async.waterfall([
                                                function (callback) {
                                                    PackageManager.existValuePackByPkgId(connection_ikon_cms, sp_pkg_id, function (err, result) {
                                                        callback(err, result);
                                                    })
                                                },
                                                function (exist, callback) {
                                                    if (exist.length > 0) {
                                                        PackageManager.countValuePackPlans(connection_ikon_cms, sp_pkg_id, function (err, count) {
                                                            callback(err, count);
                                                        })
                                                    } else {
                                                        callback(err, 0);
                                                    }
                                                }
                                            ],
                                            function (err, results) {
                                                callback(err, results);
                                            });
                                    },
                                    subscriptionPlanCount: function (callback) {
                                        /*count for subscription*/
                                        async.waterfall([
                                                function (callback) {

                                                    PackageManager.existSubscriptionByPkgId(connection_ikon_cms, sp_pkg_id, function (err, result) {
                                                        callback(err, result);
                                                    })
                                                },
                                                function (exist, callback) {
                                                    if (exist.length > 0) {
                                                        PackageManager.countSubscriptionPlans(connection_ikon_cms, sp_pkg_id, function (err, count) {
                                                            callback(err, count);
                                                        })
                                                    } else {
                                                        callback(err, 0);
                                                    }
                                                }
                                            ],
                                            function (err, results) {
                                                callback(err, results);
                                            });
                                    }
                                },
                                function (err, results) {
                                    if (err) {
                                        //console.log('fgcfgcfhhfchfch1111');
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        pkg['packName'] = (results.packName.length > 0) ? results.packName[0].pk_name : '';
                                        pkg['alacartPackPlanCount'] = results.alacartPackPlanCount;
                                        pkg['subscriptionPlanCount'] = results.subscriptionPlanCount;
                                        pkg['valuePackPlanCount'] = results.valuePackPlanCount;
                                        searchData.push(pkg);
                                    }
                                })
                        })
                        setTimeout(function(){
                            //console.log(searchData)
                            connection_ikon_cms.release();
                            res.send({packageByName:searchData});
                        }, 500);
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
exports.getPackageStartsWith  = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {

                var data = {
                    storeId: req.session.package_StoreId,
                    term:req.body.term,
                    distributionChannelId: req.body.distributionChannelId
                }

                PackageManager.getAllPackageForListStartsWith( connection_ikon_cms, data, function(err,Package){

                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        var searchData = [];
                        Package.forEach(function(pkg) {
                            var sp_pkg_id = pkg.sp_pkg_id;
                            async.parallel({
                                    packName: function (callback) {
                                        PackageManager.packUsedInPackage( connection_ikon_cms,sp_pkg_id, function(err,packname){
                                            callback(err,packname)
                                        });
                                    },
                                    alacartPackPlanCount: function (callback) {
                                        PackageManager.countOfferPlans(connection_ikon_cms, sp_pkg_id, function (err, offerCount) {
                                            async.waterfall([
                                                    function (callback) {
                                                        PackageManager.existAlacartPackByPkgId(connection_ikon_cms, sp_pkg_id, function (err, result) {
                                                            callback(err, result);
                                                        })
                                                    },
                                                    function (exist, callback) {
                                                        if (exist.length > 0) {
                                                            PackageManager.countAlacartPackPlans(connection_ikon_cms, sp_pkg_id, function (err, count) {
                                                                callback(err, count);
                                                            })
                                                        } else {
                                                            callback(err, 0);
                                                        }
                                                    }
                                                ],
                                                function (err, results) {
                                                    callback(err, results+offerCount);
                                                });
                                        })
                                    },
                                    valuePackPlanCount: function (callback) {
                                        async.waterfall([
                                                function (callback) {
                                                    PackageManager.existValuePackByPkgId(connection_ikon_cms, sp_pkg_id, function (err, result) {
                                                        callback(err, result);
                                                    })
                                                },
                                                function (exist, callback) {
                                                    if (exist.length > 0) {
                                                        PackageManager.countValuePackPlans(connection_ikon_cms, sp_pkg_id, function (err, count) {
                                                            callback(err, count);
                                                        })
                                                    } else {
                                                        callback(err, 0);
                                                    }
                                                }
                                            ],
                                            function (err, results) {
                                                callback(err, results);
                                            });
                                    },
                                    subscriptionPlanCount: function (callback) {
                                        /*count for subscription*/
                                        async.waterfall([
                                                function (callback) {
                                                    PackageManager.existSubscriptionByPkgId(connection_ikon_cms, sp_pkg_id, function (err, result) {
                                                        callback(err, result);
                                                    })
                                                },
                                                function (exist, callback) {
                                                    if (exist.length > 0) {
                                                        PackageManager.countSubscriptionPlans(connection_ikon_cms, sp_pkg_id, function (err, count) {
                                                            callback(err, count);
                                                        })
                                                    } else {
                                                        callback(err, 0);
                                                    }
                                                }
                                            ],
                                            function (err, results) {
                                                callback(err, results);
                                            });
                                    }
                                },
                                function (err, results) {
                                    //console.log(results)
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        pkg['packName'] = (results.packName.length > 0) ? results.packName[0].pk_name : '';
                                        pkg['alacartPackPlanCount'] = results.alacartPackPlanCount;
                                        pkg['subscriptionPlanCount'] = results.subscriptionPlanCount;
                                        pkg['valuePackPlanCount'] = results.valuePackPlanCount;
                                        searchData.push(pkg);
                                    }
                                })
                        })
                        setTimeout(function(){
                            // console.log(searchData)
                            connection_ikon_cms.release();
                            res.send({Package:searchData});
                        }, 500);


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


exports.blockUnBlockContentType = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName) {

            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    updateContentTypeStatus : function(callback){
                        PackageManager.updateContentTypeStatus( connection_ikon_cms,req.body.active, req.body.packageId, function(err,response){
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
                        res.send({ success: true, message: ' Package '  +  req.body.Status + ' successfully.' });
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
exports.delete = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName) {

            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    delete: function (callback) {
                        PackageManager.delete(connection_ikon_cms, req.body.packageId, function (err, response) {
                            callback(err, response);
                        });
                    }

                }, function (err, results) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message);
                    } else {
                        connection_ikon_cms.release();
                        res.send({success: true, message: ' Package ' + req.body.Status + ' successfully.'});
                    }
                });
            });
        } else {
            res.redirect('/accountlogin');
        }
    } catch (err) {
        res.status(500).json(err.message);
    }
};
