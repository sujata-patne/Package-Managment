exports.getPackageSubscriptionPack = function( dbConnection, packageId, callback ) {
    if(packageId == undefined){
        packageId = -1;
    }
    var query = dbConnection.query('SELECT * FROM `icn_package_subscription_site`,`icn_sub_plan` WHERE '+
        'icn_package_subscription_site.pss_sp_pkg_id = ? AND '+
        'icn_package_subscription_site.pss_sp_id = icn_sub_plan.sp_id AND ISNULL(icn_package_subscription_site.pss_crud_isactive) ',packageId, function( err, response ) {
        callback( err, response );
    });
}
exports.existAlacartPlans = function( dbConnection, packageId, callback){
    var query = dbConnection.query('SELECT paos.* FROM `icn_package_alacart_offer_site` AS paos ' +
        'JOIN icn_package_content_type as pct ON pct.pct_paos_id = paos.paos_id AND ISNULL(pct.pct_crud_isactive) ' +
        'WHERE paos.paos_sp_pkg_id = ? AND ISNULL(paos.paos_crud_isactive)',packageId, function( err, response ) {

        if(response.length > 0){
           callback( err, 1 );
       }else{
           callback( err, 0 );
       }
    });
}
exports.getPackageAlacartPack = function( dbConnection, packageId, callback ) {
    if(packageId == undefined){
        packageId = -1;
    }
    var query = dbConnection.query('SELECT paos.*, ap.* FROM `icn_package_alacart_offer_site` AS paos,`icn_alacart_plan` AS ap WHERE '+
        'paos.paos_sp_pkg_id = ? AND ISNULL(paos.paos_crud_isactive) ',packageId, function( err, response ) {
        callback( err, response );
    });
}
exports.addArrangeData = function( dbConnection, data, callback ) {
    var query = dbConnection.query("INSERT INTO icn_package_arrange_sequence SET ? ", [data] , function( err, response ) {
        callback( err, response );
    });
}
/*exports.editArrangeData = function( dbConnection, data, callback ) {
    var query = dbConnection.query("UPDATE icn_package_arrange_sequence SET ?  WHERE pas_id = "+data.pas_id, [data],function( err, response ) {

        //var query = dbConnection.query("UPDATE icn_package_arrange_sequence SET ?  WHERE pas_sp_pkg_id = "+data.pas_sp_pkg_id+" AND pas_plan_id = "+data.pas_plan_id+" AND pas_plan_type = '"+data.pas_plan_type+"' ",function( err, response ) {
        callback( err, response );
    });
}*/
exports.deleteArrangeData = function( dbConnection, pkgID, callback ) {
    var query = dbConnection.query("DELETE FROM icn_package_arrange_sequence WHERE pas_sp_pkg_id = "+pkgID, function( err, response ) {
        callback( err, response );
    });
}
exports.getMaxArrangeSequenceId = function(dbConnection, callback) {
    var query = dbConnection.query('SELECT MAX(pas_id) AS pas_id FROM  icn_package_arrange_sequence WHERE ISNULL(pas_crud_isactive) ', function (err, pasId) {
        callback(err,pasId);
    });
}
//exports.existArrangeData = function(dbConnection, data, callback) {
//    console.log(data)
//    var query = dbConnection.query("SELECT * FROM  icn_package_arrange_sequence WHERE ISNULL(pas_crud_isactive) AND pas_id = "+data.pas_id, function( err, response ) {
//     //   var query = dbConnection.query("SELECT * FROM  icn_package_arrange_sequence WHERE ISNULL(pas_crud_isactive) AND pas_sp_pkg_id = ? AND pas_plan_id = ? AND pas_plan_type IN ('?') ", [data.pas_sp_pkg_id,data.pas_plan_id,data.pas_plan_type], function( err, response ) {
//        console.log(response)
//        callback( err, response );
//    });
//}
exports.getArrangeSequenceData = function(dbConnection,packageId,callback){
    var query = dbConnection.query('SElECT CASE ' +
        ' WHEN pas_plan_type like "Offer" THEN CONCAT("1", pas_plan_id) ' +
        ' WHEN pas_plan_type like "Value Pack" THEN CONCAT("2", pas_plan_id) ' +
        ' WHEN pas_plan_type like "Subscription" THEN CONCAT("3", pas_plan_id) ' +
        ' WHEN pas_plan_type like "A-La-Cart" THEN CONCAT("4", pas_plan_id) ' +
        ' ELSE "N/A" ' +
        ' END AS id, pas_id, pas_arrange_seq FROM icn_package_arrange_sequence WHERE pas_sp_pkg_id = ? ' ,[packageId] , function( err, response ) {
        callback( err, response );
    });
}

exports.getSelectedPlans = function (dbConnection, packageId, callback){
    if(packageId == undefined){
        packageId = -1;
    }

    var query = dbConnection.query('(select CONCAT("1", offer.op_id) AS id, offer.op_id as plan_id, offer.op_plan_name AS plan_name, "Offer" AS plan_type ' +
        'from icn_offer_plan as offer join icn_package_alacart_offer_site AS paos ON paos.paos_op_id = offer.op_id ' +
        'WHERE paos_sp_pkg_id = ? AND ISNULL(paos.paos_crud_isactive) ) '+
        ' UNION ' +
        '(select CONCAT("2", valuepack.vp_id) AS id, valuepack.vp_id as plan_id, valuepack.vp_plan_name AS plan_name, "Value Pack" AS plan_type ' +
        'from icn_valuepack_plan as valuepack join icn_package_value_pack_site AS pvs ON pvs.pvs_vp_id = valuepack.vp_id ' +
        'WHERE pvs_sp_pkg_id = ? AND ISNULL(pvs.pvs_crud_isactive)) ' +
        ' UNION ' +
        '(select CONCAT("3", sub.sp_id) AS id, sub.sp_id as plan_id, sub.sp_plan_name AS plan_name, "Subscription" AS plan_type ' +
        'from icn_sub_plan as sub join icn_package_subscription_site AS pss ON pss.pss_sp_id = sub.sp_id ' +
        'WHERE pss_sp_pkg_id = ? AND ISNULL(pss.pss_crud_isactive) ) ', [packageId,packageId,packageId], function (err, result) {
        callback( err, result );
    });
}
/*exports.getPackageOfferPlan = function( dbConnection, packageId, callback ) {
    if(packageId == undefined){
        packageId = -1;
    }
    var query = dbConnection.query('SELECT * FROM `icn_package_alacart_offer_site`,`icn_offer_plan` WHERE '+
        ' icn_package_alacart_offer_site.paos_sp_pkg_id = ? AND '+
        ' icn_package_alacart_offer_site.paos_op_id = icn_offer_plan.op_id',packageId, function( err, response ) {
        callback( err, response );
    });
}*/
