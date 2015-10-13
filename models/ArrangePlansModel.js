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
