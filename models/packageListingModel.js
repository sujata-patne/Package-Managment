exports.getStore = function(dbConnection, storeId, callback) {
    var query = dbConnection.query('select cd.* FROM catalogue_detail as cd ' +
                                'LEFT JOIN catalogue_master as cm ON cm.cm_id = cd.cd_cm_id ' +
                                'LEFT JOIN multiselect_metadata_detail as m ON cd.cd_id = m.cmd_entity_detail ' +
                                'LEFT JOIN icn_store as s ON m.cmd_group_id = s.st_front_type ' +
                                'WHERE cm.cm_name in ("Channel Distribution") AND s.st_id = ? ', [storeId], function (err, DistributionChannel) {
                                callback(err, DistributionChannel)
                        
    });
}
exports.getPackageByName = function(dbConnection,dc_id, storeId, callback) {

    var query = dbConnection.query('select sp_pkg_id, sp_package_name,sp_pkg_type from icn_store_package as st '+
        ' where st.sp_dc_id = ? AND st.sp_st_id = ? AND ISNULL(st.sp_crud_isactive ) ORDER BY st.sp_pkg_id desc' , [dc_id , storeId],  function (err, packageByName) {
        callback(err, packageByName);
    });
} 
exports.getAllPackageForListStartsWith = function( dbConnection,data, callback ) {
    var whereCond = '';
    if(data.term && data.term == 1){
        whereCond += " AND pk.sp_package_name REGEXP '^[0-9]'";
    }else if(data.term && data.term != ''){
        whereCond += " AND pk.sp_package_name LIKE '"+data.term+"%'";
    }
    if(data.distributionChannelId && data.distributionChannelId != undefined){
        whereCond += " AND pk.sp_dc_id = " + data.distributionChannelId;
    }
    console.log("Select * from icn_store_package as pk " +
           "WHERE pk.sp_st_id = "+data.storeId+" AND ISNULL(pk.sp_crud_isactive)  " +whereCond+ "  ORDER BY pk.sp_pkg_id desc");
    var query = dbConnection.query("Select * from icn_store_package as pk " +
           "WHERE pk.sp_st_id = ? AND ISNULL(pk.sp_crud_isactive)  " +whereCond+ "  ORDER BY pk.sp_pkg_id desc",[data.storeId], function ( err, response ) {
           callback( err,response );
       });
}
exports.getAllPackageForList = function( dbConnection,data, callback ) {
    var moment = require("moment");
    // console.log(obj);
    if(data.start_date !== undefined && data.start_date != ""){
        data.start_date = moment(data.start_date);
        data.start_date = data.start_date.format('YYYY-MM-DD');
    }
    if(data.end_date !== undefined && data.end_date != ""){
        data.end_date = moment(data.end_date);
    
    data.end_date = data.end_date.format('YYYY-MM-DD');
    }
    if(data.term === undefined){
        data.term = "";
    }

    var whereCond = '';
    if(data.term && data.term != ''){
        whereCond += " AND pk.sp_package_name LIKE '%"+data.term+"%'";
    }
    if(data.start_date && data.end_date){
        whereCond += " AND Date(pk.sp_modified_on) BETWEEN '"+data.start_date+"' AND '"+data.end_date+"'";
    }
    if(data.distributionChannelId && data.distributionChannelId != undefined){
        whereCond += " AND pk.sp_dc_id = " + data.distributionChannelId; 
    }


    console.log("SELECT * from icn_store_package as pk " +
        "WHERE pk.sp_st_id = "+data.storeId+" AND ISNULL(pk.sp_crud_isactive)    " + whereCond +
        "  ORDER BY pk.sp_pkg_id desc");

    var query = dbConnection.query("SELECT * from icn_store_package as pk " +
        "WHERE pk.sp_st_id = ? AND ISNULL(pk.sp_crud_isactive)    " + whereCond +
        "  ORDER BY pk.sp_pkg_id desc",[data.storeId], function ( err, response ) {
        callback( err,response );
    });
}
exports.countValuePackPlans = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query('select COUNT(pvs_id) as cnt from icn_package_value_pack_site '+
        ' where pvs_sp_pkg_id = ? AND ISNULL(pvs_crud_isactive) ' , [pkgId],  function (err, count) {
        callback(err, count[0].cnt);
    });
}
exports.countAlacartPackPlans = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query(' SELECT '+
    '(SELECT COUNT(pct.pct_paos_id)  from icn_package_alacart_offer_site AS alacart '+
    'JOIN icn_package_content_type AS pct ON pct.pct_paos_id = alacart.paos_id '+
    'WHERE paos_sp_pkg_id = ? AND ISNULL(alacart.paos_crud_isactive) AND ISNULL(pct.pct_crud_isactive) '+
    'AND  (pct_stream_id IS NOT NULL AND pct_stream_id != 0 ) ) as stream, '+
    '(SELECT COUNT(pct.pct_paos_id)  from icn_package_alacart_offer_site AS alacart '+
    'JOIN icn_package_content_type AS pct ON pct.pct_paos_id = alacart.paos_id '+
    'WHERE paos_sp_pkg_id = ? AND ISNULL(alacart.paos_crud_isactive) AND ISNULL(pct.pct_crud_isactive) '+ 
    'AND  (pct_download_id IS NOT NULL AND pct_download_id != 0 ) ) as download' , [pkgId,pkgId],  function (err, result) {
        callback(err, result[0].stream + result[0].download);
    });
}

// exports.countAlacartPackPlans = function( dbConnection,pkgId, callback) {
//     var query = dbConnection.query('SELECT pct_download_id, pct_stream_id FROM icn_package_content_typeicn_package_alacart_offer_site AS alacart '+
//     'JOIN icn_package_content_type AS pct ON pct.pct_paos_id = alacart.paos_id ' +
//     ' WHERE paos_sp_pkg_id = ? AND ISNULL(alacart.paos_crud_isactive) AND ISNULL(pct.pct_crud_isactive) ' , [pkgId],  function (err, count) {
//         callback(err, count[0].cnt);
//     });
// }

exports.countOfferPlans = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query('SELECT alacart.paos_op_id as cnt from icn_package_alacart_offer_site AS alacart ' +
        ' WHERE paos_sp_pkg_id = ?  AND ISNULL(alacart.paos_crud_isactive) AND alacart.paos_op_id != 0 ', [pkgId], function (err, offerCount) {
        if(offerCount.length > 0){
            callback(err, 1);
        }else{
            callback(err, 0);
        }
    });
}

exports.existAlacartPackByPkgId = function(dbConnection, pkgId, callback){
    var query = dbConnection.query('SELECT pct.pct_paos_id FROM icn_package_alacart_offer_site AS alacart '+
        'JOIN icn_package_content_type AS pct ON pct.pct_paos_id = alacart.paos_id ' +
        'WHERE paos_sp_pkg_id = ? AND ISNULL(alacart.paos_crud_isactive) AND ISNULL(pct.pct_crud_isactive) ', [pkgId],
        function ( err, alacrtPackPlans ) {
            callback(err, alacrtPackPlans );
        }
    )
}
exports.existValuePackByPkgId = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query('select pvs_id FROM icn_package_value_pack_site '+
        'WHERE pvs_sp_pkg_id = ? AND ISNULL(pvs_crud_isactive) ', [pkgId],
        function ( err, valuePackPlans ) {
            callback(err, valuePackPlans );
        }
    )
}
exports.countSubscriptionPlans = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query('select count(pss_id) as cnt from icn_package_subscription_site '+
        ' where pss_sp_pkg_id = ? AND ISNULL(pss_crud_isactive) ' , [pkgId],  function (err, count) {
        callback(err, count[0].cnt);
    });
}

exports.existSubscriptionByPkgId = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query('select pss_id FROM icn_package_subscription_site '+
        'WHERE pss_sp_pkg_id = ? AND ISNULL(pss_crud_isactive) ', [pkgId],
        function ( err, SubscriptionPlans ) {
            callback(err, SubscriptionPlans );
        }
    )
}
exports.updateContentTypeStatus = function(dbConnection,active,packageId,callback){
    var query = dbConnection.query("UPDATE  icn_store_package  SET sp_is_active = ? WHERE sp_pkg_id = ?  ",[active,packageId], function (err, response) {
        callback(err,response);

    });
}
exports.delete = function(dbConnection,packageId,callback){
    var query = dbConnection.query("UPDATE  icn_store_package  SET sp_crud_isactive = 1 WHERE sp_pkg_id = ?  ",[packageId], function (err, response) {
        callback(err,response);
    });
}
exports.packUsedInPackage = function(dbConnection,packageId,callback){
    var query = dbConnection.query("SELECT pack.pk_name FROM icn_packs AS pack " +
                             " JOIN icn_store_package as pk ON pack.pk_id = pk.sp_pk_id " +
                               "WHERE pk.sp_pkg_id = ?  ",[packageId], function (err, response) {
        callback(err,response);
    });
}
exports.countOfferPlans = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query('SELECT alacart.paos_op_id as cnt from icn_package_alacart_offer_site AS alacart ' +
        ' WHERE paos_sp_pkg_id = ? AND alacart.paos_op_id != 0 AND ISNULL(alacart.paos_crud_isactive)', [pkgId], function (err, offerCount) {
        if(offerCount.length > 0){
            callback(err, 1);
        }else{
            callback(err, 0);
        }
    });
}