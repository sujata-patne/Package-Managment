
exports.getSubscriptionDetailsByStoreId = function(dbConnection, storeId, dcId, callback) {
    if(dcId != '' && dcId != undefined){
        var str = ' AND cd1.cd_id = '+ dcId;
    }else{
        var str = '';
    }
    var query = dbConnection.query('select sp_id, sp_plan_name ' +
        'FROM icn_sub_plan as plan '+
        'join multiselect_metadata_detail as mmd ON plan.sp_channel_front = mmd.cmd_group_id ' +
        'join catalogue_detail as cd1 ON mmd.cmd_entity_detail = cd1.cd_id ' +
        'WHERE sp_st_id = ? ' + str, [storeId],
        function ( err, subscriptionPackPlans ) {
            callback(err, subscriptionPackPlans );
        }
    )
}

exports.createMainSiteSubscriptionPackPlan = function (dbConnection, data, callback) {
    dbConnection.query('INSERT INTO icn_package_subscription_site SET ?', data, function (err, result) {
        callback( err, result );
    });
}

exports.getLastInsertedValueSubscriptionPlanId = function( dbConnection, callback ) {
    var query = dbConnection.query('SELECT MAX( pss_id ) as sub_pack_id FROM icn_package_subscription_site', function( err, response ) {
        callback( err, response[0].sub_pack_id );
    });
}

exports.getSelectedSubscriptionPacks = function( dbConnection, packageId , callback ){

    var query = dbConnection.query('SELECT pss_sp_id FROM  icn_package_subscription_site, icn_sub_plan '+
        ' WHERE icn_package_subscription_site.pss_sp_pkg_id = ? AND ISNULL( icn_package_subscription_site.pss_crud_isactive ) AND icn_package_subscription_site.pss_sp_id = icn_sub_plan.sp_id ',[packageId],
        function( err, response ) {
            callback( err, response );
        });
}

exports.subscriptionPackExists = function( dbConnection, subPackId, sp_pkg_id,  callback ) {
    var query = dbConnection.query('SELECT  pss_id FROM icn_package_subscription_site WHERE pss_sp_id = ? ' +
        'AND pss_sp_pkg_id = ? AND ( pss_crud_isactive ) IS NOT NULL ',
            [subPackId, sp_pkg_id ], function( err, response ) {
            /*if ( response.length > 0 ){
                callback(err, response[0].sub_pack_id);
            } else {
                callback(err, response );
            }*/
            callback(err, response)
    });
}

exports.getSubscriptionPacksByIds = function( dbConnection, subscriptionPackIds, pss_sp_pkg_id,   callback ){

    var query = dbConnection.query("SELECT group_concat( pss_id ) as sub_pack_ids " +
        "FROM  icn_package_subscription_site " +
        "WHERE pss_sp_id IN (" + subscriptionPackIds + ") AND ISNULL( pss_crud_isactive ) AND pss_sp_pkg_id = ? " ,[pss_sp_pkg_id],
        function( err, response ) {
            callback( err, response );
        }
    );
}

exports.deleteSubscriptionPack = function (dbConnection, pssId, sp_pkg_id, callback ) {
    console.log("pssId");
    console.log(pssId);
    var query = dbConnection.query('UPDATE icn_package_subscription_site SET pss_crud_isactive = ? WHERE pss_id = ? AND pss_sp_pkg_id = ?',
        [ pssId, pssId, sp_pkg_id ],function( err, result ) {
            if( err ){
                callback( err, null );
            }else {
                callback( null, true );
            }
        }
    );
}

exports.updateSubscriptionPack = function( dbConnection, pssId,  callback ) {
    var query = dbConnection.query('UPDATE icn_package_subscription_site SET pss_crud_isactive = NULL WHERE pss_id = ? ',
        [pssId], function (err, result) {
            callback(err, result)
        }
    );
}