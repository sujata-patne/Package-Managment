var mysql = require('../config/db').pool;
var Arrangeplans = require('../models/ArrangePlansModel');
var mainSiteManager = require('../models/mainSiteModel');
var async = require("async");
var fs = require("fs");
var wlogger = require("../config/logger");
var reload = require('require-reload')(require);
var config = require('../config')();

function Pad(padString, value, length) {
    var str = value.toString();
    while (str.length < length)
        str = padString + str;

    return str;
}

exports.allAction = function (req, res, next) {
    var currDate = Pad("0",parseInt(new Date().getDate()), 2)+'_'+Pad("0",parseInt(new Date().getMonth() + 1), 2)+'_'+new Date().getFullYear();
    if (wlogger.logDate == currDate) {
        var logDir = config.log_path;
        var filePath = logDir + 'logs_'+currDate+'.log';
        fs.stat(filePath, function(err, stat) {
            if(err != null&& err.code == 'ENOENT') {
                wlogger = reload('../config/logger');
            }
        });
        next();
    } else {
        wlogger = reload('../config/logger');
        next();
    }
}
exports.getArrangePlansData = function (req, res, next) {
    //getting the data for arrange plans tab
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    arrangeSequenceData: function (callback) {
                        // getting the already existence sequence for plans
                        Arrangeplans.getArrangeSequenceData(connection_ikon_cms, req.body.pkgId, function (err, arrangeSequenceData) {
                            callback(err, arrangeSequenceData);
                        })
                    },
                    PackageAlacartPacks: function (callback) {
                        // to get all the alacart packs
                        Arrangeplans.getPackageAlacartPack(connection_ikon_cms, req.body.pkgId, function (err, alacartPlans) {
                            callback(err, alacartPlans);
                        });
                    },
                    selectedPlans : function (callback) {
                        // to get all the offer plans , value pack plans and subscription plans
                        Arrangeplans.getSelectedPlans(connection_ikon_cms, req.body.pkgId, function (err, selectedPlans) {
                            callback(err, selectedPlans);
                        })
                    },
                    isAlacartPlansExist : function (callback) {
                        //to check if alacart plan is there or not
                        Arrangeplans.existAlacartPlans(connection_ikon_cms, req.body.pkgId, function (err, isAlacartPlansExist) {
                            callback(err, isAlacartPlansExist);
                        })
                    }
                },
                function (err, results) {
                    if (err) {
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'getArrangePlansData',
                            responseCode: 500,
                            message: JSON.stringify(err.message)
                        }
                        wlogger.error(error); // for error
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message);
                    } else {
                        var info = {
                            userName: req.session.package_UserName,
                            action : 'getArrangePlansData',
                            responseCode: 200,
                            message: 'Retrieved Arrange Plans data for Package Id '+req.body.pkgId+' successfully.'
                        }
                        wlogger.info(info); // for information
                        connection_ikon_cms.release();
                        res.send(results);
                    }
                });
            });
        } else {
            var error = {
                userName: "Unknown User",
                action : 'getArrangePlansData',
                responseCode: 500,
                message: 'Invalid User Session'
            }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }catch(err){
        var error = {
            userName: "Unknown User",
            action : 'getArrangePlansData',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};
exports.AddArrangedContents = function (req, res, next) {
    // to add the data to a database on  clicking submit button
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                var len = req.body.finalarray.length;
                async.waterfall([
                    function(callback){
                        Arrangeplans.deleteArrangeData( connection_ikon_cms, req.body.packageId, function(err,data) {
                            //if the data already exist for certain plan then first delete it
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
                        var error = {
                            userName: req.session.package_UserName,
                            action : 'AddArrangedContents',
                            responseCode: 500,
                            message: JSON.stringify(err.message)
                        }
                        wlogger.error(error); // for error
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message);
                    } else {
                        var info = {
                            userName: req.session.package_UserName,
                            action : 'AddArrangedContents',
                            responseCode: 200,
                            message: 'Arrange Plans data saved successfully.'
                        }
                        wlogger.info(info); // for information
                        connection_ikon_cms.release();
                        res.send({success: true, message: 'Arrange Plans data added Successfully'});
                    }
                })
                function savedata(cnt) {
                    // function for saving data
                    var j = cnt;
                    async.waterfall([
                        function(callback) {
                            Arrangeplans.getMaxArrangeSequenceId(connection_ikon_cms, function (err, MaxPasId) {
                                // to get the serial no.
                                var pasId = MaxPasId[0].pas_id != null ? parseInt(MaxPasId[0].pas_id + 1) : 1;
                                callback(err, pasId);
                            })
                        },
                        function(pasId, callback) {
                            //to save data of single plans from multiple plans
                            // in finl array we have used var j
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
                                // to add the data to database on submit button
                                if (err) {
                                    var error = {
                                        userName: req.session.package_UserName,
                                        action : 'AddArrangedContents',
                                        responseCode: 500,
                                        message: JSON.stringify(err.message)
                                    }
                                    wlogger.error(error); // for error
                                    connection_ikon_cms.release();
                                    callback(err,false);
                                } else {
                                    cnt++;
                                    if (cnt < len) {
                                        //to check the value of cnt is less than final array length
                                        // then call the savedata function for next plan
                                        savedata(cnt);
                                    }
                                    else {
                                        callback(err,true);
                                        //res.send({success: true, message: 'Arrange Plans data Saved Successfully'});
                                    }
                                }
                            });
                        }
                    ],
                    function (err, results) {
                        if (err) {
                            var error = {
                                userName: req.session.package_UserName,
                                action : 'AddArrangedContents',
                                responseCode: 500,
                                message: JSON.stringify(err.message)
                            }
                            wlogger.error(error); // for error
                            connection_ikon_cms.release();

                        } else {
                            res.send({success: true, message: 'Arrange Plans data Saved Successfully'});

                        }
                    })
                }
            });
        } else {
            var error = {
                userName: "Unknown User",
                action : 'AddArrangedContents',
                responseCode: 500,
                message: 'Invalid User Session'
            }
            wlogger.error(error); // for error
            res.redirect('/accountlogin');
        }
    }catch(err){
        var error = {
            userName: "Unknown User",
            action : 'AddArrangedContents',
            responseCode: 500,
            message: JSON.stringify(err.message)
        }
        wlogger.error(error); // for error
        res.status(500).json(err.message);
    }
};




