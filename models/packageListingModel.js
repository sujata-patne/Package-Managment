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

    var query = dbConnection.query('select sp_package_name,sp_pkg_type from icn_store_package as st '+
        ' where st.sp_dc_id = ? AND st.sp_st_id = ?  ' , [dc_id , storeId],  function (err, packageByName) {
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

    var query = dbConnection.query("Select * from icn_store_package as pk " +
           "WHERE pk.sp_st_id = ? " +whereCond+ "  group by pk.sp_pkg_id ORDER BY pk.sp_pkg_id desc",[data.storeId], function ( err, response ) {
           callback( err,response );
       });
}
exports.getAllPackageForList = function( dbConnection,data, callback ) {
    var moment = require("moment");
      //  console.log(data)

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



    var query = dbConnection.query("SELECT * from icn_store_package as pk " +
        "WHERE pk.sp_st_id = ? " + whereCond + 
        " group by pk.sp_pkg_id ORDER BY pk.sp_pkg_id desc",[data.storeId], function ( err, response ) {
        callback( err,response );
    });
}
exports.countValuePackPlans = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query('select count(pvs_id) as cnt from icn_package_value_pack_site '+
        ' where pvs_sp_pkg_id = ?  ' , [pkgId],  function (err, count) {
        callback(err, count[0].cnt);
    });
}

exports.existValuePackByPkgId = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query('select pvs_id FROM icn_package_value_pack_site '+
        'WHERE pvs_sp_pkg_id = ? ', [pkgId],
        function ( err, valuePackPlans ) {
            callback(err, valuePackPlans );
        }
    )
}
exports.countSubscriptionPlans = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query('select count(pss_id) as cnt from icn_package_subscription_site '+
        ' where pss_sp_pkg_id = ?  ' , [pkgId],  function (err, count) {
        callback(err, count[0].cnt);
    });
}

exports.existSubscriptionByPkgId = function( dbConnection,pkgId, callback) {
    var query = dbConnection.query('select pss_id FROM icn_package_subscription_site '+
        'WHERE pss_sp_pkg_id = ? ', [pkgId],
        function ( err, SubscriptionPlans ) {
            callback(err, SubscriptionPlans );
        }
    )
}