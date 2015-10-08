/**
 * Created by sujata.patne on 29-09-2015.
 */
exports.getContentTypes = function(dbConnection, storeId, callback) {
    var query = dbConnection.query('select cd.*, ct.mct_parent_cnt_type_id, ' +
        '(SELECT cd_name FROM catalogue_detail as cd1 join catalogue_master as cm1 ON  cm1.cm_id = cd1.cd_cm_id WHERE ct.mct_parent_cnt_type_id = cd1.cd_id) AS parent_name ' +
        'FROM icn_store As st ' +
        'INNER JOIN multiselect_metadata_detail as mlm on (mlm.cmd_group_id = st.st_content_type) ' +
        'INNER JOIN catalogue_detail As cd on mlm.cmd_entity_detail = cd.cd_id ' +
        'JOIN icn_manage_content_type as ct ON ct.mct_cnt_type_id = cd.cd_id ' +
        'WHERE st.st_id = ? ', [storeId],  function (err, ContentTypes) {
        callback(err, ContentTypes);
    })
}
exports.getContentTypeData = function(dbConnection, storeId, callback) {
    var query = dbConnection.query(' SELECT cd.cd_name, plan.*, (SELECT cd_name FROM catalogue_detail WHERE cd_id = plan.ap_delivery_type) AS delivery_type_name ' +
    'FROM icn_alacart_plan AS plan ' +
    'join catalogue_detail as cd ON plan.ap_content_type = cd.cd_id ' +
    'WHERE plan.ap_st_id = ? ', [storeId], function (err, ContentTypes) {
        callback(err, ContentTypes)
    });
}
exports.getOfferData = function(dbConnection, storeId, callback) {
    var query = dbConnection.query(' SELECT plan.*' +
        'FROM icn_offer_plan AS plan ' +
        'WHERE plan.op_st_id = ? ', [storeId], function (err, ContentTypes) {
        callback(err, ContentTypes)
    });
}
exports.getMaxAlacartOfferId = function(dbConnection, callback) {
    var query = dbConnection.query('SELECT MAX(paos_id) AS paos_id FROM icn_package_alacart_offer_site', function (err, paosId) {
        callback(err,paosId);
    });
}
exports.getMaxStorePackageId = function(dbConnection, callback) {
    var query = dbConnection.query('SELECT MAX(sp_pkg_id) AS pkg_id FROM icn_store_package WHERE ISNULL(sp_crud_isactive) ', function (err, pkgId) {
        callback(err,pkgId);
    });
}
exports.addStorePackage = function(dbConnection,data,callback){
    var query = dbConnection.query("INSERT INTO `icn_store_package` SET ? ", data, function (err, response) {
        callback(err,response);
    });
}
exports.addAlacartOfferDetails = function(dbConnection,data,callback){
    var query = dbConnection.query("INSERT INTO `icn_package_alacart_offer_site` SET ? ", data, function (err, response) {
        callback(err,response);
    });
}

exports.editAlacartOfferDetails = function(dbConnection,data,callback){
    var query = dbConnection.query("UPDATE `icn_package_alacart_offer_site` SET ? WHERE paos_id = ? ", [data, data.paos_id], function (err, response) {
        callback(err,response);
    });
}
exports.editAlacartPack = function(dbConnection,data,callback){
    var query = dbConnection.query("UPDATE `icn_package_content_type` SET ? WHERE pct_paos_id = ? AND pct_content_type_id = ? ", [data,data.pct_paos_id, data.pct_content_type_id], function (err, response) {
        callback(err,response);
    });
}

exports.addAlacartPack = function(dbConnection,data,callback){
    console.log(data)
    var query = dbConnection.query("INSERT INTO `icn_package_content_type` SET ? ", data, function (err, response) {
        callback(err,response);
    });
}
exports.getContentTypeAlacartPlan = function(dbConnection,paosId, callback){
    var query = dbConnection.query("SELECT * FROM icn_package_content_type WHERE pct_paos_id = ? AND pct_is_active = 1 AND ISNULL(pct_crud_isactive) ", [paosId], function (err, response) {
        callback(err,response);
    });
}
exports.existingContentTypesInPack = function(dbConnection,paosId, callback){
    var query = dbConnection.query("SELECT group_concat(distinct(pct_content_type_id)) as contentTypes FROM icn_package_content_type WHERE pct_paos_id = ? AND pct_is_active = 1 AND ISNULL(pct_crud_isactive) ", [paosId], function (err, response) {
        callback(err,response);
    });
}
exports.getMainSitePackageData = function(dbConnection,storeId, dcId, callback){
    var query = dbConnection.query("SELECT * FROM icn_store_package WHERE sp_st_id = ? AND sp_dc_id = ? AND sp_pkg_type = 0 AND sp_is_active = 1 AND ISNULL(sp_package_name) AND ISNULL(sp_crud_isactive) ", [storeId,dcId], function (err, response) {
        callback(err,response);
    });
}
exports.getAlacartNOfferDetails = function(dbConnection,pkgId, callback){
    var query = dbConnection.query("SELECT paos.* FROM icn_package_alacart_offer_site as paos " +
       // "JOIN icn_package_content_type AS pct ON pct.pct_paos_id =  paos.paos_id AND pct_is_active = 1 AND ISNULL(pct.pct_crud_isactive) " +
        "WHERE paos_sp_pkg_id = ? AND paos_is_active = 1 AND ISNULL(paos_crud_isactive) ", [pkgId], function (err, response) {
        callback(err,response);
    });
}

exports.getValuePackPlansByStoreId = function(dbConnection, storeId, callback) {

    var query = dbConnection.query('select vp_id, vp_plan_name ' +
                         'FROM icn_valuepack_plan '+
                         'WHERE vp_st_id = ? ', [storeId],
            function ( err, valuePackPlans ) {
                callback(err, valuePackPlans );
            }
    )
}
exports.getAllDistributionChannelsByStoreId = function(dbConnection, storeId, callback) {
    var query = dbConnection.query('select cd.cd_id, cd.cd_name FROM catalogue_detail as cd ' +
            'LEFT JOIN catalogue_master as cm ON cm.cm_id = cd.cd_cm_id ' +
            'LEFT JOIN multiselect_metadata_detail as m ON cd.cd_id = m.cmd_entity_detail ' +
            'LEFT JOIN icn_store as s ON m.cmd_group_id = s.st_front_type ' +
            'WHERE cm.cm_name in ("Channel Distribution") AND s.st_id = ? ',[storeId],
        function (err, distributionChannels) {
            callback(err,distributionChannels);
        }
    );
}
exports.getLastInsertedPackageId = function( dbConnection, callback ) {
    var query = dbConnection.query('SELECT MAX( sp_pkg_id ) as pack_id FROM icn_store_package', function( err, response ) {
        callback( err, response[0].pack_id );
    });
}


exports.existStorePackage = function(dbConnection,storeId, dcId, callback) {
    var query = dbConnection.query('SELECT sp_pkg_id AS pkg_id FROM icn_store_package WHERE ISNULL(sp_crud_isactive) AND sp_is_active = 1 AND sp_st_id = ? AND sp_dc_id = ?', [storeId, dcId], function (err, pkgId) {
        callback(err,pkgId);
    });
}

exports.getPackageOfferPlan = function( dbConnection, packageId, callback ) {
    var query = dbConnection.query('SELECT * FROM `icn_package_alacart_offer_site`,`icn_offer_plan` WHERE '+
        ' icn_package_alacart_offer_site.paos_sp_pkg_id = ? AND '+
        ' icn_package_alacart_offer_site.paos_op_id = icn_offer_plan.op_id',packageId, function( err, response ) {
        callback( err, response );
    });
}

exports.getPackageValuePack = function( dbConnection, packageId, callback ) {
    var query = dbConnection.query('SELECT * FROM `icn_package_value_pack_site`,`icn_valuepack_plan` WHERE '+
        'icn_package_value_pack_site.pvs_sp_pkg_id = ? AND '+
        'icn_package_value_pack_site.pvs_vp_id = icn_valuepack_plan.vp_id',packageId, function( err, response ) {
        callback( err, response );
    });
}



