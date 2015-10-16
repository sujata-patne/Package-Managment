var mysql = require('../config/db').pool;
var Arrangeplans = require('../models/ArrangePlansModel');
var mainSiteManager = require('../models/mainSiteModel');
var async = require("async");
exports.getArrangePlansData = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                        /*PackageOffer: function (callback) {
                            mainSiteManager.getPackageOfferPlan(connection_ikon_cms, req.body.packageId, function (err, OfferData) {
                                callback(err, OfferData)
                            });
                        },
                        PackageValuePacks: function (callback) {
                            mainSiteManager.getPackageValuePack(connection_ikon_cms, req.body.packageId, function (err, valuePackPlans) {
                                callback(err, valuePackPlans);
                            });
                        },
                        PackageSubscriptionPacks: function (callback) {
                            Arrangeplans.getPackageSubscriptionPack(connection_ikon_cms, req.body.packageId, function (err, SubscriptionPlans) {
                                callback(err, SubscriptionPlans);
                            });
                        },*/

                        arrangeSequenceData: function (callback) {
                            Arrangeplans.getArrangeSequenceData(connection_ikon_cms, req.body.packageId, function (err, arrangeSequenceData) {
                                callback(err, arrangeSequenceData);
                            })
                        },
                        PackageAlacartPacks: function (callback) {
                            Arrangeplans.getPackageAlacartPack(connection_ikon_cms, req.body.packageId, function (err, alacartPlans) {
                                callback(err, alacartPlans);
                            });
                        },
                        selectedPlans : function (callback) {
                            Arrangeplans.getSelectedPlans(connection_ikon_cms, req.body.packageId, function (err, selectedPlans) {
                                callback(err, selectedPlans);
                            })
                        }
                    },
                    function (err, results) {
                        console.log("###"+req.body.packageId)
                        console.log(req.body)
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
        } else {
            res.redirect('/accountlogin');
        }
    } catch (err) {
        res.status(500).json(err.message);
    }
};
exports.AddArrangedContents = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                var len = req.body.finalarray.length;
                async.waterfall([
                    function(callback){
                        Arrangeplans.deleteArrangeData( connection_ikon_cms, req.body.packageId, function(err,data) {
                            if (err) {
                                connection_ikon_cms.release();
                                console.log(err.message);
                            } else {
                                callback(err,req.body.packageId)
                            }
                        })
                    },
                    function(callback) {
                        savedata(0);
                    }
                ],
                function (err, results) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        connection_ikon_cms.release();
                        res.send({success: true, message: 'Save Successfully .'});
                    }
                })

                function savedata(cnt) {
                    var j = cnt;
                    async.waterfall([
                        function(callback) {
                            Arrangeplans.getMaxArrangeSequenceId(connection_ikon_cms, function (err, MaxPasId) {
                                var pasId = MaxPasId[0].pas_id != null ? parseInt(MaxPasId[0].pas_id + 1) : 1;
                                callback(err, pasId);
                            })
                        },
                        function(pasId, callback) {
                            var arrangeSequenceData = {
                                pas_id: pasId,
                                pas_sp_pkg_id: req.body.packageId,
                                pas_plan_id: req.body.finalarray[j].plan_id,
                                pas_plan_type: req.body.finalarray[j].plan_type,
                                pas_arrange_seq: req.body.sequenceData[req.body.finalarray[j].id].pas_arrange_seq,
                                pas_is_active: 1,
                                pas_created_on: new Date(),
                                pas_created_by: req.session.package_UserName,
                                pas_modified_on: new Date(),
                                pas_modified_by: req.session.package_UserName,
                            }
                            Arrangeplans.addArrangeData(connection_ikon_cms, arrangeSequenceData, function (err, response) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    console.log(err.message);
                                } else {
                                    cnt++;
                                    if (cnt < len) {
                                        savedata(cnt);
                                    }
                                    else {
                                        connection_ikon_cms.release();
                                        res.send({success: true, message: 'Save Successfully .'});
                                    }
                                }
                            });
                        }
                    ],
                    function (err, results) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                            console.log(err.message)
                        } else {
                            callback(err,true);
                        }
                    })
                }
            });
        } else {
            res.redirect('/accountlogin');
        }
    } catch (err) {
        res.status(500).json(err.message);
    }
};




