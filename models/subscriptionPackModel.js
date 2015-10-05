
exports.getSubscriptionDetailsByStoreId = function(dbConnection, storeId, callback) {

    var query = dbConnection.query('select sp_id, sp_plan_name ' +
        'FROM icn_sub_plan '+
        'WHERE sp_st_id = ? ', [storeId],
        function ( err, subscriptionPackPlans ) {
            callback(err, subscriptionPackPlans );
        }
    )
}

exports.createMainSiteStorePackagePlan = function (dbConnection, data, callback) {
    dbConnection.query('INSERT INTO icn_store_package SET ?', data, function (err, result) {
        callback( err, result );
    });
}

exports.createMainSiteValuePackPlan = function (dbConnection, data, callback) {
    dbConnection.query('INSERT INTO icn_package_value_pack_site SET ?', data, function (err, result) {
        callback( err, result );
    });
}

exports.getLastInsertedValuePackId = function( dbConnection, callback ) {
    var query = dbConnection.query('SELECT MAX( pvs_id ) as value_pack_id FROM icn_package_value_pack_site', function( err, response ) {
        callback( err, response[0].value_pack_id );
    });
}