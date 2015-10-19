
exports.getValuePackPlansByStoreId = function(dbConnection, storeId, callback) {

    var query = dbConnection.query('select vp_id, vp_plan_name ' +
        'FROM icn_valuepack_plan '+
        'WHERE vp_st_id = ? ', [storeId],
        function ( err, valuePackPlans ) {
            callback(err, valuePackPlans );
        }
    )
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

exports.getSelectedValuePacks = function( dbConnection,packageId, callback ){
    var query = dbConnection.query('SELECT pvs_vp_id, vp_plan_name FROM  icn_package_value_pack_site , icn_valuepack_plan '+
        ' WHERE icn_package_value_pack_site.pvs_sp_pkg_id = ? AND ISNULL( icn_package_value_pack_site.pvs_crud_isactive )  AND icn_package_value_pack_site.pvs_vp_id = icn_valuepack_plan.vp_id ',[packageId],
        function( err, response ) {
            callback( err, response );
        });
}

exports.getValuePacksByIds = function( dbConnection,valuePackIds, vp_pkg_id, callback ){
    var query = dbConnection.query("SELECT group_concat( pvs_id ) as value_pack_ids " +
                    "FROM  icn_package_value_pack_site " +
                    "WHERE pvs_vp_id IN (" + valuePackIds + ") AND pvs_sp_pkg_id = ? AND ISNULL( pvs_crud_isactive ) " ,[vp_pkg_id],
        function( err, response ) {
            callback( err, response );
        }
    );
}

exports.deleteValuePack = function (dbConnection, pvsId, sp_pkg_id, callback ) {
    var query = dbConnection.query('UPDATE icn_package_value_pack_site SET pvs_crud_isactive = ? WHERE pvs_id = ? AND pvs_sp_pkg_id = ? ',
        [ pvsId, pvsId,sp_pkg_id ],function( err, result ) {
            if( err ){
                callback( err, false );
            }else {
                callback( null, true );
            }
        }
    );
}

exports.valuePackExists = function( dbConnection, pvsId, sp_pkg_id, callback ) {
   // console.log( "SELECT pvs_id FROM icn_package_value_pack_site WHERE pvs_vp_id = " + pvsId +" AND IS NOT NULL( pvs_crud_isactive ) AND pvs_sp_pkg_id = " + sp_pkg_id  );
    var query = dbConnection.query('SELECT pvs_id FROM icn_package_value_pack_site WHERE pvs_vp_id = ? AND ( pvs_crud_isactive ) IS NOT NULL AND pvs_sp_pkg_id = ? ',
        [ pvsId, sp_pkg_id ], function (err, result) {
            callback(err, result)
        }
    );
}

exports.updateValuePack = function( dbConnection, pvsId, callback ) {
    //console.log( "inside update");
    var query = dbConnection.query('UPDATE icn_package_value_pack_site SET pvs_crud_isactive = NULL WHERE pvs_id = ?',
        [pvsId], function (err, result) {
            callback(err, result)
        }
    );
}