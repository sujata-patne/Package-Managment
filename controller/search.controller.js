var mysql = require('../config/db').pool;
var async = require("async");
var SearchModel = require('../models/searchModel');

//var data = require('../config/config');

//console.log(data.ContentTypeDetails[0].Manual[0].Wallpaper);

exports.resetSearchCriteriaContents = function (req, res, next) {
    try {
        if (req.session && req.session.pack_UserName && req.session.pack_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                SearchModel.searchCriteriaExist(connection_ikon_cms, req.body.pctId, function (err, response) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                    }else{
                        if(response){
                            /*delete existing search criteria and contents*/
                            SearchModel.deleteSearchCriteria(connection_ikon_cms, req.body.pctId, function (err, response) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }else{
                                    SearchModel.deleteSearchedContent(connection_ikon_cms, req.body.pctId, function (err, response) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        }else{
                                            connection_ikon_cms.release();
                                            res.send({
                                                "success": true,
                                                "status": 200,
                                                "message": "Search Criteria & it's saved content removed successfully.",
                                            });
                                        }
                                    })

                                }
                            })
                        }
                    }
                });
            })
        }else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        res.status(500).json(err.message);
    }
}

exports.getSavedContents = function (req, res, next) {
    try {
        if (req.session && req.session.pack_UserName && req.session.pack_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                        packDetails: function (callback) {
                            SearchModel.getPackDetails( connection_ikon_cms,req.body.pctId, function(err,packDetails){
                                callback(err, packDetails);
                            });
                        },
                        packSearchDetails: function (callback) {
                            SearchModel.getPackSearchDetails( connection_ikon_cms,req.body.pctId, function(err,packSearchDetails){
                                callback(err, packSearchDetails);
                            });
                        },
                        packContentsSequence: function (callback) {
                        SearchModel.getPackContents(connection_ikon_cms, req.body.pctId, function (err, packContents) {
                            var data = {};
                            packContents.forEach(function(value,key){
                                data[value.pc_cm_id] = value.pc_arrange_seq;
                            })
                            //console.log(data)
                            callback(err, data);
                        })
                    },
                    packContentsPublished: function (callback) {
                        SearchModel.getPackContents(connection_ikon_cms, req.body.pctId, function (err, packContents) {
                            var data = {};
                            packContents.forEach(function(value,key){
                                data[value.pc_cm_id] = value.pc_ispublished;
                            })
                            //console.log(data)
                            callback(err, data);
                        })
                    },
                    contents: function (callback) {
                        SearchModel.getSavedContents(connection_ikon_cms, req.body.pctId, function (err, savedContents) {
                            callback(err, savedContents);
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
                        res.send(results);
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

exports.saveArrangedContents = function (req, res, next) {
    try {
        if (req.session && req.session.pack_UserName && req.session.pack_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                for (var contentId in req.body.arrangedContentList) {
                    var data = {
                        pc_pct_id: parseInt(req.body.pctId),
                        pc_cm_id: parseInt(contentId),
                        pc_arrange_seq: req.body.arrangedContentList[contentId]
                    }
                    SearchModel.updateSearchContents(connection_ikon_cms, data, function (err, response) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                    })
                }
                connection_ikon_cms.release();
                res.send({
                    "success": true,
                    "status": 200,
                    "message": "Search Contents arranged successfully!."
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


exports.publishContents = function (req, res, next) {
    try {
        if (req.session && req.session.pack_UserName && req.session.pack_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                for (var contentId in req.body.publishedContentList) {
                    //console.log(req.body.publishedContentList[contentId])
                    if(req.body.publishedContentList[contentId] == null || req.body.publishedContentList[contentId] == undefined || req.body.publishedContentList[contentId] == ''){
                        sequence = 0;
                    }else{
                        sequence = req.body.publishedContentList[contentId];
                    }
                    var data = {
                        pc_pct_id: parseInt(req.body.pctId),
                        pc_cm_id: parseInt(contentId),
                        pc_arrange_seq: sequence,
                        pc_ispublished: 1
                    }
                    SearchModel.searchContentsExist(connection_ikon_cms, data, function (err, response) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }else {
                           // console.log(response)
                            if (response) {
                                console.log('edit');
                                SearchModel.updateSearchContents(connection_ikon_cms, data, function (err, response) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                })
                            } else {
                                console.log('add');

                                SearchModel.saveSearchContents(connection_ikon_cms, data, function (err, response) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                })
                            }
                        }
                    })
                }
                connection_ikon_cms.release();
                res.send({
                    "success": true,
                    "status": 200,
                    "message": "Search Contents published successfully!."
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

exports.saveSearchContents = function (req, res, next) {
    try {
        if (req.session && req.session.pack_UserName && req.session.pack_StoreId) {
            //console.log(req.body.selectedContentList)
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                var count = req.body.selectedContentList.length;

                SearchModel.deleteSearchedContent(connection_ikon_cms, req.body.pctId, function (err, response) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                    }else{
//console.log(req.body.selectedContentList)
                        for (var i in req.body.selectedContentList) {
                            addEditSearchContents(req.body.selectedContentList[i]);
                            var cnt = 0;
                            function addEditSearchContents(contentId) {
                                var data = {
                                    pc_pct_id: req.body.pctId,
                                    pc_cm_id: contentId,
                                    pc_ispublished: 0,
                                    pc_arrange_seq: 0
                                }
                                //console.log(data)
                                SearchModel.saveSearchContents(connection_ikon_cms, data, function (err, response) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        cnt = cnt + 1;
                                        if (cnt == count) {
                                            connection_ikon_cms.release();
                                            res.send({
                                                "success": true,
                                                "status": 200,
                                                "message": "Search Contents added successfully!."
                                            });
                                        }
                                    }
                                })
                            }
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

exports.getContentTypeDetails = function (req, res, next) {
    try {
        if (req.session && req.session.pack_UserName) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    keywords: function (callback) {
                        SearchModel.getKeywords( connection_ikon_cms, function(err,keywords){
                            callback(err, keywords);
                        });

                    },
                    languages: function (callback) {
                        SearchModel.getLanguages( connection_ikon_cms, function(err,languages){
                            callback(err, languages);
                        });
                    },
                    genres: function (callback) {
                        SearchModel.getGenres( connection_ikon_cms, function(err,genres){
                            callback(err, genres);
                        });
                    },
                    subgenres: function (callback) {
                        SearchModel.getSubGenres( connection_ikon_cms, function(err,subgenres){
                            callback(err, subgenres);
                        });
                    },
                    mood: function (callback) {
                        SearchModel.getMood( connection_ikon_cms, function(err,mood){
                            callback(err, mood);
                        });
                    },
                    photographer: function (callback) {
                        SearchModel.getPhotographer( connection_ikon_cms, function(err,photographer){
                            callback(err, photographer);
                        });
                    },
                    vendor: function (callback) {
                        SearchModel.getVendor( connection_ikon_cms, function(err,vendor){
                            callback(err, vendor);
                        });
                    },
                    actor_actress: function (callback) {
                        SearchModel.getActorActress( connection_ikon_cms, function(err,actor_actress){
                            callback(err, actor_actress);
                        });
                    },
                    property: function (callback) {
                        SearchModel.getProperty( connection_ikon_cms, function(err,property){
                            callback(err, property);
                        });
                    },
                    content_title: function (callback) {
                        SearchModel.getContentTitle( connection_ikon_cms, function(err,title){
                            callback(err, title);
                        });
                    },
                    content_id: function (callback) {
                        SearchModel.getContentId( connection_ikon_cms, function(err,id){
                            callback(err, id);
                        });
                    },
                    property_release_year: function (callback) {
                        SearchModel.getReleaseYear( connection_ikon_cms, function(err,id){
                            callback(err, id);
                        });
                    },
                    packDetails: function (callback) {
                        SearchModel.getPackDetails( connection_ikon_cms,req.params.pctId, function(err,packDetails){
                            callback(err, packDetails);
                        });
                    },
                    packSearchDetails: function (callback) {
                        SearchModel.getPackSearchDetails( connection_ikon_cms,req.params.pctId, function(err,packSearchDetails){
                            callback(err, packSearchDetails);
                        });
                    }
                },
                function (err, results) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                       // console.log(results)
                        connection_ikon_cms.release();
                        res.send(results);
                    }
                })
            })
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};

exports.saveSearchCriteria = function (req, res, next) {
    try {
        if (req.session && req.session.pack_UserName && req.session.pack_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                var packData = {
                    pk_id : req.body.packId,
                    pk_rule_type : req.body.ruleType,
                    pk_nxt_rule_duration : req.body.nextRuleDuration,
                    pk_modified_on: new Date(),
                    pk_modified_by: req.session.pack_UserName
                }
                /*update pack details*/
                packUpdateResponse = updatePackData( connection_ikon_cms,packData );
                /* Add/update pack search criteria fields with values */
                var count = req.body.contentTypeDataDetails.length;

                SearchModel.searchCriteriaExist(connection_ikon_cms, req.body.pctId, function (err, response) {
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                    }else{
                        if(response){
                            /*delete existing search criteria and then add*/
                            SearchModel.deleteSearchCriteria(connection_ikon_cms, req.body.pctId, function (err, response) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }else{
                                    addEditSearch(0);
                                }
                            })
                        }else{
                            /*Add search criteria first time*/
                            addEditSearch(0);
                        }
                    }
                });
                function addEditSearch(cnt) {
                    var j = cnt;
                    var data = {
                        pcr_rec_type: 1,
                        pcr_pct_id: req.body.pctId,
                        pcr_start_year: req.body.releaseYearStart,
                        pcr_end_year: req.body.releaseYearEnd
                    }
                    for (var searchFieldId in req.body.contentTypeDataDetails[j]) {
                        data['pcr_metadata_type']= searchFieldId;
                        data['pcr_metadata_search_criteria'] = req.body.contentTypeDataDetails[j][searchFieldId];
                        getLastSearchCriteriaId(connection_ikon_cms, function (lastInsertedSearchCriteriaId) {
                            if (lastInsertedSearchCriteriaId) {
                                data['pcr_id'] = lastInsertedSearchCriteriaId;
                                SearchModel.addSearchCriteriaField(connection_ikon_cms, data, function (err, response) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        cnt = cnt + 1;
                                        if (cnt == count) {
                                            connection_ikon_cms.release();
                                            res.send({
                                                "success": true,
                                                "status": 200,
                                                //"message": "Search Criteria added successfully added.",
                                            });
                                        } else {
                                            addEditSearch(cnt);
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        res.status(500).json(err.message);
    }
}

exports.getPackSearchResult = function (req, res, next) {
    try {
        if (req.session && req.session.pack_UserName) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    async.waterfall([
                        function (callback) {
                            SearchModel.getPackSearchDetails( connection_ikon_cms, req.body.pctId, function(err,packSearchDetails){
                                var contentTypeData = {};

                                contentTypeData["limitCount"] = req.body.limitCount;
                                contentTypeData["searchWhereTitle"] = req.body.title;
                                contentTypeData["searchWherePropertyTitle"] = req.body.property;
                                packSearchDetails.forEach(function (metadataFields) {

                                    contentTypeData["contentTypeId"] = metadataFields.contentTypeId;

                                    if(metadataFields.pcr_start_year != '0000' || metadataFields.pcr_end_year != '0000'){
                                        contentTypeData["releaseYearStart"] = metadataFields.pcr_start_year;
                                        contentTypeData["releaseYearEnd"] = metadataFields.pcr_end_year;
                                    }

                                    if (metadataFields.cm_name === "Content Title") {
                                        contentTypeData["Content_Title"] = metadataFields.pcr_metadata_search_criteria;
                                    }
                                    if (metadataFields.cm_name === "Property") {
                                        contentTypeData["Property"] = metadataFields.pcr_metadata_search_criteria;
                                    }
                                    if (metadataFields.cm_name === "Search Keywords") {
                                        contentTypeData["Keywords"] = metadataFields.pcr_metadata_search_criteria;
                                    }
                                    if (metadataFields.cm_name === "Content Ids") {
                                        contentTypeData["Content_Ids"] = metadataFields.pcr_metadata_search_criteria;
                                    }
                                    if (metadataFields.cm_name === "Languages") {
                                        contentTypeData["Language"] = parseInt(metadataFields.pcr_metadata_search_criteria);
                                    }
                                    if (metadataFields.cm_name === "Celebrity") {
                                        contentTypeData["Actor_Actress"] = parseInt(metadataFields.pcr_metadata_search_criteria);
                                    }
                                    if (metadataFields.cm_name === "Genres") {
                                        contentTypeData["Genres"] = parseInt(metadataFields.pcr_metadata_search_criteria);
                                    }
                                    if (metadataFields.cm_name === "Sub Genres") {
                                        contentTypeData["Sub_Genres"] = parseInt(metadataFields.pcr_metadata_search_criteria);
                                    }
                                    if (metadataFields.cm_name === "Mood") {
                                        contentTypeData["Mood"] = parseInt(metadataFields.pcr_metadata_search_criteria);
                                    }
                                    if (metadataFields.cm_name === "Photographer") {
                                        contentTypeData["Photographer"] = parseInt(metadataFields.pcr_metadata_search_criteria);
                                    }
                                    if (metadataFields.cm_name === "Vendor") {
                                        contentTypeData["Vendor"] = parseInt(metadataFields.pcr_metadata_search_criteria);
                                    }
                                })
                                callback(err, contentTypeData);
                            });
                        },
                        function (data, callback) {
                            SearchModel.getSearchCriteriaResult(connection_ikon_cms,data,function(err,result){
                                //console.log(result)
                                callback(err, result);
                            });
                        },
                        function (searchContentList, callback) {
                          //  console.log(req.body.pctId)
                            SearchModel.getPackDetails( connection_ikon_cms,req.body.pctId, function(err,packDetails){
                                callback(err, searchContentList, packDetails);
                            });
                        },
                        function (searchContentList, packDetails, callback) {
                            SearchModel.getPackSearchDetails( connection_ikon_cms,req.body.pctId, function(err,packSearchDetails){
                                callback(err, {'searchContentList':searchContentList,'packDetails':packDetails, 'packSearchDetails':packSearchDetails});
                            });
                        }
                    ],
                    function (err, results) {
                        //console.log(" test "+results.packDetails)
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                            console.log(err.message)
                        } else {
                           // console.log(results.searchContentList.length)
                            connection_ikon_cms.release();
                            res.send(results);
                        }
                    })
            })
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};

function getLastSearchCriteriaId( connection_ikon_cms, callback ) {
    SearchModel.getLastSearchCriteriaId(connection_ikon_cms,function(err,maxPCRID){
        if(err){
            connection_ikon_cms.release();
            res.status(500).json(err.message);
        }else{
            return callback( maxPCRID );
        }
    });
}
function updatePackData( connection_ikon_cms, data ){
    SearchModel.updatePackData( connection_ikon_cms, data, function(err,response ){
        if(err){
            connection_ikon_cms.release();
            res.status(500).json(err.message);
            return false;
        }
    });
    return true;
}