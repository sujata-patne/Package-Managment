/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
var config = require('../config')();
var async = require("async");
var alacartaManager = require("../models/alacartaModel");
var planListManager = require("../models/planListModel");
var subscriptionManager = require("../models/subscriptionModel");
/**
 * @function getsubscriptions
 * @param req
 * @param res
 * @param next
 * @description get all records in subscription plan
 */
exports.getsubscriptions = function (req, res, next) {
    try {
        if (req.session && req.session.Plan_UserName && req.session.Plan_StoreId ) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                // mysql.getConnection('BG', function (err, connection_ikon_bg) {
                async.parallel({
                        StoreId: function (callback) {
                            callback(err, req.session.Plan_StoreId);
                        },
                        PlanData: function (callback) {
                            //Get subscription plan data
                            subscriptionManager.getPlanData( connection_ikon_cms, req.body.planid, function ( err, subplan ) {
                                callback(err, subplan);
                            });
                        },
                        AlacartaData: function (callback) {
                            subscriptionManager.getAlacartPlanByPlanId(connection_ikon_cms, req.body.planid, function( err, AlacartaData ) {
                                callback(err, AlacartaData)
                            });
                        },
                        ContentTypes: function (callback) {
                            planListManager.getContentTypesByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, ContentTypes) {
                                callback(err, ContentTypes);
                            });
                        },
                        DistributionChannel: function (callback) {
                            //Get distribution channels
                            alacartaManager.getDistributionChannelsByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, DistributionChannel ) {
                                callback( err, DistributionChannel );
                            });
                        },
                        GeoLocations: function (callback) {
                            alacartaManager.getGeoLocationsByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, GeoLocations ) {
                                callback( err, GeoLocations );
                            });
                        },
                        DurationOptions: function (callback) {
                            /** get stream duration list  */
                            alacartaManager.getDurationOptions(connection_ikon_cms,  function (err, DurationOptions ) {
                                callback(err, DurationOptions);
                            });
                        },
                        /*JetEvents: function (callback) {
                         alacartaManager.getJetEventsByStoreId(connection_ikon_bg, req.session.Plan_StoreId, function (err, JetEvents ) {
                         callback( err, JetEvents );
                         });
                         },*/
                        OperatorDetail: function (callback) {
                            alacartaManager.getOperatorDetail( connection_ikon_cms, function (err, OperatorDetails) {
                                callback( err, OperatorDetails );
                            });
                        },
                        ContentTypeData: function (callback) {
                            subscriptionManager.getContentTypeDataByPlanStoreId( connection_ikon_cms, req.session.Plan_StoreId, function (err, alacart) {
                                callback(err, alacart);
                            });
                        },
                        selectedDistributionChannel: function (callback) {
                            subscriptionManager.getSelectedDistributionChannelByPlanId( connection_ikon_cms, req.body.planid, function ( err, selectedDistributionChannel ) {
                                callback( err, selectedDistributionChannel );
                            });
                        },
                        RoleUser: function (callback) {
                            //Get User Role
                            callback(null, req.session.Plan_UserRole);
                        }
                    },
                    function (err, results) {
                        if (err) {
                            connection_ikon_cms.release();
                            //connection_ikon_bg.release();
                            res.status(500).json(err.message);
                            console.log(err.message)
                        } else {
                            connection_ikon_cms.release();
                            // connection_ikon_bg.release();
                            res.send(results);
                        }
                    });
                //});
            });
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        res.status(500).json(err.message);
    }
}



/**
 * @function addeditsubscriptions
 * @param req
 * @param res
 * @param next
 * @description add new subscription plan and update selected subscription plan
 */
exports.addeditsubscriptions = function (req, res, next) {
    try {
        if (req.session && req.session.Plan_UserName) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                        function (callback) {

                            subscriptionManager.getSubscriptionPlanByName( connection_ikon_cms, req.body.PlanName.toLowerCase(), function( err, result  ) {
                                if(result.length > 0){
                                    callback(err, {'exist':true,'plans':result});
                                }else{
                                    callback(err, {'exist':false,'plans':result});
                                }
                            });
                        },
                        function(data, callback){
                            if(data.exist == true && data.plans[0].plan_id != req.body.subplanId){
                                callback(null, {'exist':data.exist,'message': 'Plan Name Must be Unique'});
                            }else{
                                callback(null, {'exist':data.exist});
                            }
                        }
                    ],
                    function(err, results) {
                        if (results.message) {
                            connection_ikon_cms.release();
                            res.send({"success": false, "message": results.message});
                        } else {
                            if (req.body.planid) {
                                EditSubscriptions();
                            }
                            else {
                                AddSubscriptions();
                            }
                            /*function addEditOperators(cnt) {
                             var j = cnt;
                             var query = connection_ikon_cms.query('SELECT * FROM icn_disclaimer WHERE dcl_ref_jed_id = ? AND dcl_partner_id = ?', [req.body.JetId, req.body.OperatorDetails[j].partner_id], function (err, disclaimer) {
                             if (err) {
                             connection_ikon_cms.release();
                             res.status(500).json(err.message);
                             console.log(err.message)
                             }
                             else {
                             if (disclaimer.length > 0) {
                             var disclaimerData = {
                             dcl_disclaimer: req.body.OperatorDetails[j].dcl_disclaimer,
                             dcl_partner_id: req.body.OperatorDetails[j].partner_id,
                             dcl_st_id: req.session.Plan_StoreId,
                             dcl_modified_on: new Date(),
                             dcl_modified_by:  req.session.Plan_UserName
                             }

                             var query = connection_ikon_cms.query('UPDATE icn_disclaimer SET ? where dcl_id = ?', [disclaimerData,disclaimer[0].dcl_id], function (err, result) {
                             if (err) {
                             connection_ikon_cms.release();
                             res.status(500).json(err.message);
                             console.log(err.message)
                             }
                             else {
                             cnt++;
                             if (cnt < count) {
                             addEditOperators(cnt);
                             }
                             }
                             });
                             } else {
                             var dclID = 1;
                             var query = connection_ikon_cms.query('SELECT MAX(dcl_id) AS id FROM icn_disclaimer', function (err, result) {
                             if (err) {
                             connection_ikon_cms.release();
                             res.status(500).json(err.message);
                             console.log(err.message)
                             }
                             else {
                             if (result[0].id != null) {
                             dclID = parseInt(result[0].id) + 1;
                             }
                             var disclaimerData = {
                             dcl_id: dclID,
                             dcl_ref_jed_id: req.body.JetId,
                             dcl_disclaimer: req.body.OperatorDetails[j].dcl_disclaimer,
                             dcl_partner_id: req.body.OperatorDetails[j].partner_id,
                             dcl_st_id: req.session.Plan_StoreId,
                             dcl_created_by: req.session.Plan_UserName,
                             dcl_created_on: new Date()
                             }
                             var query = connection_ikon_cms.query('INSERT INTO icn_disclaimer SET ?', disclaimerData, function (err, result) {
                             if (err) {
                             connection_ikon_cms.release();
                             res.status(500).json(err.message);
                             }
                             else {
                             cnt++;
                             if (cnt < count) {
                             addEditOperators(cnt);
                             }
                             }
                             });
                             }
                             })
                             }
                             }
                             });
                             }*/

                            var contentTypesList  = Object.keys(req.body.alacartPlansList)
                                .map(function (element) {
                                    return parseInt(element)
                                });
                            var plans = contentTypesList.length;
                            var distributionChannellength = req.body.DistributionChannels.length;

                            function EditSubscriptions() {
                                async.waterfall([
                                        function(callback){
                                            //Get subscription plan
                                            subscriptionManager.getSubscriptionPlanByPlanId( connection_ikon_cms, req.body.subplanId, function (err, subscription ) {
                                                callback( err,subscription );
                                            });
                                        },
                                        function (subscription,callback){
                                            if (req.body.OperatorDetails.length > 0) {
                                                var operator = 0;
                                                // addEditOperators(operator);
                                                addEditOperators(connection_ikon_cms, operator,req.body,req.session);
                                            }
                                            callback(null,subscription);
                                        },
                                        function (subscription,callback){
                                            var distributionChannellength = req.body.DistributionChannels.length;

                                            if (distributionChannellength > 0) {
                                                var distributionChannel = 0;
                                                subscriptionManager.deleteDistributionChannel( connection_ikon_cms, subscription[0].sp_channel_front, function (err, result) {
                                                    addDistributionChannel(connection_ikon_cms,distributionChannel, subscription[0].sp_channel_front,req.body);
                                                });
                                            }
                                            callback(err,subscription);
                                        },
                                        function (subscription,callback){

                                            if (plans > 0 && req.body.atCostFreePaid === 1) {
                                                var contentType = 0;
                                                subscriptionManager.deleteSubscriptionPlanFromSubscriptionContentType( connection_ikon_cms, req.body.subplanId, function (err, result) {
                                                    addEditPlans(connection_ikon_cms,contentType,req.body.subplanId,contentTypesList,req.body);
                                                });
                                            }
                                            callback(err,subscription);
                                        }
                                    ],
                                    function(err, results){
                                        if(err){
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        }else{
                                            var data = {
                                                sp_plan_name: req.body.PlanName,
                                                sp_caption: req.body.Caption,
                                                sp_description: req.body.Description,
                                                sp_jed_id: req.body.JetId,
                                                sp_tnb_days: req.body.offerForDays,

                                                sp_tnb_free_cnt_limit: req.body.numContentOffer,
                                                sp_single_day_cnt_limit: req.body.limitSingleDay,
                                                sp_full_sub_cnt_limit: req.body.fullSubDuration,
                                                sp_tnb_stream_cnt_limit: req.body.slc_tnb_free_cnt_limit,
                                                sp_single_day_steam_limit: req.body.slc_single_day_cnt_limit,
                                                sp_single_day_stream_dur: req.body.sld_single_day_cnt_limit,
                                                sp_single_day_stream_dur_type: req.body.sld_single_day_cnt_duration,

                                                sp_tnb_stream_duration: req.body.sld_tnb_free_cnt_limit,
                                                sp_tnb_stream_dur_type: req.body.sld_tnb_free_cnt_duration,

                                                sp_full_sub_stream_limit: req.body.slc_full_sub_cnt_limit,
                                                sp_full_sub_stream_duration: req.body.sld_full_sub_cnt_limit,
                                                sp_full_sub_stream_dur_type: req.body.sld_full_sub_cnt_duration,
                                                sp_stream_setting: req.body.streamingLimitType,
                                                sp_is_cnt_free: req.body.atCostFreePaid,
                                                sp_cty_id: req.body.geoLocationId,
                                                sp_is_active: 1,
                                                sp_plan_duration: req.body.planDuration,
                                                sp_plan_dur_type: req.body.planDurationOption,

                                                sp_modified_on: new Date(),
                                                sp_modified_by: req.session.Plan_UserName
                                            }
                                            subscriptionManager.updateIcnSubscriptionPlan( connection_ikon_cms, data, req.body.subplanId , function (err, result) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    connection_ikon_cms.release();
                                                    res.send({ success: true, message: 'Subscription Plan Updated successfully.' });
                                                }
                                            });
                                        }
                                    });
                            }

                            function AddSubscriptions() {
                                async.waterfall([
                                        function(callback){
                                            //Get subscription plan
                                            subscriptionManager.getLastInsertedSubscriPlanIdFromMultiSelectMetaDataDetail(connection_ikon_cms, function (err, group) {
                                                callback(err,group);
                                            });
                                        },
                                        function (group,callback){
                                            if (req.body.OperatorDetails.length > 0) {
                                                var operator = 0;
                                                // addEditOperators(operator);subMaxId
                                                addEditOperators(connection_ikon_cms, operator,req.body,req.session);

                                            }
                                            callback(null,group);
                                        },
                                        function (group,callback){
                                            if (distributionChannellength > 0) {
                                                var groupID = 1;
                                                if (group[0].group_id != null) {
                                                    groupID = parseInt(group[0].group_id) + 1;
                                                }
                                                var distributionChannel = 0;

                                                addDistributionChannel(connection_ikon_cms,distributionChannel,groupID,req.body);
                                            }
                                            callback(null,groupID);
                                        },

                                        function(group,callback){
                                            //Get subscription plan
                                            subscriptionManager.getLastInsertedSubscriPlanId(connection_ikon_cms, function (err, subMaxId ) {
                                                callback(err, group, subMaxId );
                                            });
                                        },
                                        function (group,subMaxId,callback){
                                            if (plans > 0 && req.body.atCostFreePaid === 1) {
                                                var contentType = 0;
                                                var sp_id = subMaxId[0].sp_id != null ?  parseInt(subMaxId[0].sp_id + 1) : 1;
                                                // addEditPlans(contentType, sp_id);
                                                addEditPlans(connection_ikon_cms,contentType,sp_id,contentTypesList,req.body);

                                            }
                                            callback(null,{'group_id':group,'sp_id':subMaxId[0].sp_id});
                                        }
                                    ],
                                    function(err, results) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            var data = {
                                                sp_id: results.sp_id != null ? parseInt(results.sp_id + 1) : 1,
                                                sp_ld_id: req.session.Plan_UserId,
                                                sp_st_id: req.session.Plan_StoreId,
                                                sp_plan_name: req.body.PlanName,
                                                sp_caption: req.body.Caption,
                                                sp_description: req.body.Description,
                                                sp_jed_id: req.body.JetId,
                                                sp_tnb_days: req.body.offerForDays,

                                                sp_tnb_free_cnt_limit: req.body.numContentOffer,
                                                sp_single_day_cnt_limit: req.body.limitSingleDay,
                                                sp_full_sub_cnt_limit: req.body.fullSubDuration,

                                                sp_channel_front : results.group_id,
                                                sp_tnb_stream_cnt_limit: req.body.slc_tnb_free_cnt_limit,
                                                sp_single_day_steam_limit: req.body.slc_single_day_cnt_limit,
                                                sp_single_day_stream_dur: req.body.sld_single_day_cnt_limit,
                                                sp_single_day_stream_dur_type: req.body.sld_single_day_cnt_duration,

                                                sp_tnb_stream_duration: req.body.sld_tnb_free_cnt_limit,
                                                sp_tnb_stream_dur_type: req.body.sld_tnb_free_cnt_duration,
                                                sp_is_cnt_free: req.body.atCostFreePaid,

                                                sp_cty_id: req.body.geoLocationId,
                                                sp_is_active: 1,
                                                sp_plan_duration: req.body.planDuration,
                                                sp_plan_dur_type: req.body.planDurationOption,

                                                sp_created_on: new Date(),
                                                sp_created_by: req.session.Plan_UserName,
                                                sp_modified_on: new Date(),
                                                sp_modified_by: req.session.Plan_UserName
                                            }
                                            subscriptionManager.createIcnSubscriptionPlan( connection_ikon_cms, data, function(err, result ) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    connection_ikon_cms.release();
                                                    res.send({ success: true, message: 'Sunscription Plan added successfully.' });
                                                }
                                            });
                                        }
                                    });
                            }
                        }
                    })
            })
        }else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        res.status(500).json(err.message);
    }
}

function addDistributionChannel(connection_ikon_cms,cnt,groupID,data) {
    // function addDistributionChannel(cnt,groupID) {
    var distributionChannellength = data.DistributionChannels.length;

    var cmdID = 1;
    var i = cnt;
    alacartaManager.getLastInsertedDistributionChannelId( connection_ikon_cms, function( err, result ) {
        if (err) {
            connection_ikon_cms.release();
            res.status(500).json(err.message);
            console.log(err.message)
        }
        else {
            if (result[0].id != null) {
                cmdID = parseInt(result[0].id) + 1;
            }
            var cmd_data = {
                cmd_id: cmdID,
                cmd_group_id: groupID,
                cmd_entity_type: data.DistributionChannelList[0].cd_cm_id,
                cmd_entity_detail: data.DistributionChannels[i]
            };
            alacartaManager.createDistributionChannel( connection_ikon_cms, cmd_data, function( err, result ) {
                if (err) {
                    connection_ikon_cms.release();
                    res.status(500).json(err.message);
                    console.log(err.message)
                }
                else {
                    cnt++;
                    if (cnt < distributionChannellength) {
                        addDistributionChannel(connection_ikon_cms,cnt,groupID,data)
                        //addDistributionChannel(cnt, groupID);
                    }
                }
            })
        }
    })
    //}
}

function addEditPlans(connection_ikon_cms,cnt,subPlanId,contentTypes,data) {
    var j = cnt;
    var ContentTypeId = contentTypes[j];
    var downloadId = (data.alacartPlansList[ContentTypeId].download) ? data.alacartPlansList[ContentTypeId].download : '';
    var streamingId = (data.alacartPlansList[ContentTypeId].streaming) ? data.alacartPlansList[ContentTypeId].streaming : '';
    var plans = contentTypes.length;

    var ContentTypePlanData = {
        sctp_sp_id: subPlanId,
        sctp_content_type_id: ContentTypeId,
        sctp_download_id: downloadId,
        sctp_stream_id: streamingId == '' ? null : streamingId
    }
    console.log(ContentTypePlanData);
    subscriptionManager.createSubscriptionContentType( connection_ikon_cms, ContentTypePlanData, function( err, result ) {
        if (err) {
            connection_ikon_cms.release();
            res.status(500).json(err.message);
            console.log(err.message)
        }
        else {
            cnt++;
            if (cnt < plans) {
                addEditPlans(connection_ikon_cms,cnt,subPlanId,contentTypes,data);
                //addEditPlans(cnt,subPlanId);
            }
        }
    });
}
function addEditOperators(connection_ikon_cms, cnt,data,session) {
    var j = cnt;
    var count = data.OperatorDetails.length;
    subscriptionManager.getOperatorDetails( connection_ikon_cms, data.JetId, data.OperatorDetails[j].partner_id, function( err, disclaimer ) {
        if (err) {
            connection_ikon_cms.release();
            res.status(500).json(err.message);
            console.log(err.message)
        }
        else {
            if (disclaimer.length > 0) {
                var disclaimerData = {
                    dcl_disclaimer: data.OperatorDetails[j].dcl_disclaimer,
                    dcl_partner_id: data.OperatorDetails[j].partner_id,
                    dcl_st_id: session.Plan_StoreId,
                    dcl_modified_on: new Date(),
                    dcl_modified_by:  session.Plan_UserName
                }
                subscriptionManager.updateOperatorDetails( connection_ikon_cms, disclaimerData, disclaimer[0].dcl_id, function( err, result ) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    }
                    else {
                        cnt++;
                        if (cnt < count) {
                            addEditOperators(connection_ikon_cms, cnt,data,session);
                        }
                    }
                });
            } else {
                var dclID = 1;
                subscriptionManager.getLastInsertedOperatorId( connection_ikon_cms, function( err, result ) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    }
                    else {
                        if (result[0].id != null) {
                            dclID = parseInt(result[0].id) + 1;
                        }
                        var disclaimerData = {
                            dcl_id: dclID,
                            dcl_ref_jed_id: data.JetId,
                            dcl_disclaimer: data.OperatorDetails[j].dcl_disclaimer,
                            dcl_partner_id: data.OperatorDetails[j].partner_id,
                            dcl_st_id: session.Plan_StoreId,
                            dcl_created_by: session.Plan_UserName,
                            dcl_created_on: new Date()
                        }
                        subscriptionManager.createOperatorDetails( connection_ikon_cms, disclaimerData, function( err, result ) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                cnt++;
                                if (cnt < count) {
                                    addEditOperators(connection_ikon_cms, cnt,data,session);
                                    //addEditOperators(cnt);
                                }
                            }
                        });
                    }
                })
            }
        }
    });
}
