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

exports.valuePackExisits = function( dbConnection, valuePackId, callback ) {
    var query = dbConnection.query('SELECT  * as value_pack_id FROM icn_package_value_pack_site WHERE pvs_id = ?',[valuePackId], function( err, response ) {
        callback( err, response[0].pvs_id );
    });
}

