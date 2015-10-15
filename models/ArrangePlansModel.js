exports.getPackageSubscriptionPack = function( dbConnection, packageId, callback ) {
    if(packageId == undefined){
        packageId = -1;
    }
    var query = dbConnection.query('SELECT * FROM `icn_package_subscription_site`,`icn_sub_plan` WHERE '+
        'icn_package_subscription_site.pss_sp_pkg_id = ? AND '+
        'icn_package_subscription_site.pss_sp_id = icn_sub_plan.sp_id AND icn_package_subscription_site.pss_crud_isactive IS NULL',packageId, function( err, response ) {
        callback( err, response );
    });
}
exports.getPackageAlacartPack = function( dbConnection, packageId, callback ) {
    if(packageId == undefined){
        packageId = -1;
    }
    var query = dbConnection.query('SELECT paos.*, ap.* FROM `icn_package_alacart_offer_site` AS paos,`icn_alacart_plan` AS ap WHERE '+
        'paos.paos_sp_pkg_id = ? AND '+
        'paos.paos_op_id =ap.ap_id AND paos.paos_crud_isactive IS NULL',packageId, function( err, response ) {
        callback( err, response );
    });
}
exports.addArrangeData = function( dbConnection, data, callback ) {
    var query = dbConnection.query("INSERT INTO icn_package_arrange_sequence SET ? ", [data] , function( err, response ) {
        callback( err, response );
    });
}
exports.editArrangeData = function( dbConnection, data, callback ) {
    var query = dbConnection.query("UPDATE icn_package_arrange_sequence SET ?  WHERE pas_sp_pkg_id = ? AND pas_plan_id = ? AND pas_plan_type IN (?) ", [data.pas_sp_pkg_id,data.pas_plan_id,data.pas_plan_type]  , function( err, response ) {
        callback( err, response );
    });
}
exports.getMaxArrangeSequenceId = function(dbConnection, callback) {
    var query = dbConnection.query('SELECT MAX(pas_id) AS pas_id FROM  icn_package_arrange_sequence WHERE ISNULL(pas_crud_isactive) ', function (err, pasId) {
        callback(err,pasId);
    });
}
exports.existArrangeData = function(dbConnection, data, callback) {
    var query = dbConnection.query('SELECT pas_id FROM  icn_package_arrange_sequence WHERE ISNULL(pas_crud_isactive) and pas_sp_pkg_id = ? AND pas_plan_id = ? AND pas_plan_type IN (?) ', [data.pas_sp_pkg_id,data.pas_plan_id,data.pas_plan_type],function (err, pasId) {
        callback(err,pasId);
    });
}
exports.getArrangeSequenceData = function(dbConnection,packageId,callback){
    var query = dbConnection.query('SElECT pas_id,pas_arrange_seq	FROM icn_package_arrange_sequence WHERE pas_sp_pkg_id = ? ' ,[packageId] , function( err, response ) {
        callback( err, response );
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
