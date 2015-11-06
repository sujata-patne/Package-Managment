exports.getValuePacks = function( dbConnection,packageId, callback ){

    var query = dbConnection.query('SELECT concat("ValuePack_",pvs_vp_id) as plan_id, vp_plan_name as plan_name FROM  icn_package_value_pack_site , icn_valuepack_plan '+
        ' WHERE icn_package_value_pack_site.pvs_sp_pkg_id = ? AND ISNULL( icn_package_value_pack_site.pvs_crud_isactive )  AND icn_package_value_pack_site.pvs_vp_id = icn_valuepack_plan.vp_id ',[packageId],
        function( err, response ) {
            callback( err, response );
        });
}

exports.getPackageByNameForNotification = function(dbConnection,dc_id, storeId, callback) {

    var query = dbConnection.query('select sp_pkg_id, sp_package_name,sp_pkg_type from icn_store_package as st '+
        ' where st.sp_dc_id = ? AND st.sp_st_id = ? AND st.sp_is_active = 1 AND ISNULL(st.sp_crud_isactive ) ORDER BY st.sp_pkg_id desc' , [dc_id , storeId],  function (err, packageByName) {
        callback(err, packageByName);
    });
} 

exports.getSubscriptionPacks = function( dbConnection, packageId , callback ){

    var query = dbConnection.query('SELECT concat("SubscriptionPack_",pss_sp_id) as plan_id,sp_plan_name as plan_name FROM  icn_package_subscription_site, icn_sub_plan '+
        ' WHERE icn_package_subscription_site.pss_sp_pkg_id = ? AND ISNULL( icn_package_subscription_site.pss_crud_isactive ) AND icn_package_subscription_site.pss_sp_id = icn_sub_plan.sp_id ',[packageId],
        function( err, response ) {
            callback( err, response );
        });
}
exports.getLastInsertedNotificationId = function( dbConnection, callback) {
    var query = dbConnection.query("SELECT coalesce(MAX(pn_id) + 1,1) as maxId FROM `icn_package_notification` ", function ( err, response ) {
        callback( err, response );
    });
}
exports.saveNotificationData= function( dbConnection,data, callback) {
    var query = dbConnection.query("INSERT INTO  icn_package_notification SET ?",data, function ( err, response ) {
        callback( err, response );
    });
}
exports.listNotifications= function( dbConnection,pkgId,planIds,planType, callback) {

    var query = dbConnection.query("SELECT *,DATE_FORMAT(pn_push_from, '%l %p') as pn_pf,DATE_FORMAT(pn_push_to, '%l %p') as pn_pt  FROM  icn_package_notification WHERE pn_sp_pkg_id = ? AND pn_plan_id = ? AND pn_plan_type = ? AND ISNULl(pn_crud_isactive)",[pkgId,planIds,planType], function ( err, response ) {
        callback( err, response );
    });
}
exports.delete = function(dbConnection,pnId,callback){

    var query = dbConnection.query("UPDATE  icn_package_notification  SET pn_crud_isactive = 1 WHERE pn_id = ?  ",[pnId], function (err, response) {
        callback(err,response);
    });
}
exports.updateContentTypeStatus = function(dbConnection,active,pnId,callback){
    var query = dbConnection.query("UPDATE icn_package_notification  SET pn_is_active = ? WHERE pn_id = ?  ",[active,pnId], function (err, response) {
        callback(err,response);

    });
}

exports.getNotificationData = function(dbConnection,pnId,callback){
    var query = dbConnection.query("SELECT *,DATE_FORMAT(pn_push_from, '%H:%i') as pn_pf,DATE_FORMAT(pn_push_to, '%H:%i') as pn_pt  FROM `icn_package_notification` where pn_id = ? ", pnId, function (err, response) {
        callback(err,response);

    });
}
exports.updateNotificationData= function( dbConnection,data,pnId, callback) {
    var query = dbConnection.query("UPDATE icn_package_notification SET  ? WHERE pn_id= ? ",[data,pnId], function ( err, response ) {
        callback( err, response );
    });
}

exports.isChildPackage= function( dbConnection,packageId, callback) {
    var query = dbConnection.query("SELECT sp_parent_pkg_id FROM  icn_store_package  WHERE sp_pkg_id= ? ",[packageId], function ( err, response ) {
        callback( err, response );
    });
}
