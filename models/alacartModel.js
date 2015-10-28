exports.getAlacartPackPlans = function(dbConnection, storeId,dcId, callback) {

    if(dcId != '' && dcId != undefined){
        var str = ' AND cd1.cd_id = '+ dcId;
    }else{
        var str = '';
    }
    var query = dbConnection.query(' SELECT cd.cd_name, plan.*, (SELECT cd_name FROM catalogue_detail WHERE cd_id = plan.ap_delivery_type) AS delivery_type_name ' +
        'FROM icn_alacart_plan AS plan ' +
        'join catalogue_detail as cd ON plan.ap_content_type = cd.cd_id ' +
        'join multiselect_metadata_detail as mmd ON plan.ap_channel_front = mmd.cmd_group_id ' +
        'join catalogue_detail as cd1 ON mmd.cmd_entity_detail = cd1.cd_id ' +
        'WHERE plan.ap_st_id = ?' + str, [storeId], function (err, ContentTypes) {
        callback(err, ContentTypes)

    });
}
exports.addAlacartOfferDetails = function(dbConnection,data,callback){
    var query = dbConnection.query("INSERT INTO `icn_package_alacart_offer_site` SET ? ", data, function (err, response) {
        callback(err,response);
    });
}

exports.editAlacartOfferDetails = function(dbConnection,data,callback){
    var query = dbConnection.query("UPDATE `icn_package_alacart_offer_site` SET ? WHERE paos_sp_pkg_id = ? ", [data, data.paos_sp_pkg_id], function (err, response) {
        callback(err,response);
    });
}
exports.editAlacartPack = function(dbConnection,data,callback){
    var query = dbConnection.query("UPDATE `icn_package_content_type` SET ? WHERE pct_paos_id = ? AND pct_content_type_id = ? ", [data,data.pct_paos_id, data.pct_content_type_id], function (err, response) {
        callback(err,response);
    });
}
exports.getMaxAlacartOfferId = function(dbConnection, callback) {
    var query = dbConnection.query('SELECT MAX(paos_id) AS paos_id FROM icn_package_alacart_offer_site', function (err, paosId) {
        callback(err,paosId);
    });
}
exports.addAlacartPack = function(dbConnection,data,callback){
   // console.log(data)
    var query = dbConnection.query("INSERT INTO `icn_package_content_type` SET ? ", data, function (err, response) {
        callback(err,response);
    });
}

exports.getAlacartNOfferDetails = function(dbConnection,pkgId, callback){
    var query = dbConnection.query("SELECT paos.* FROM icn_package_alacart_offer_site as paos " +
        "WHERE paos_sp_pkg_id = ? AND paos_is_active = 1 AND ISNULL(paos_crud_isactive) ", [pkgId], function (err, response) {
        callback(err,response);
    });
}

exports.getContentTypeAlacartPlan = function(dbConnection,paosId, callback){
    var query = dbConnection.query("SELECT * FROM icn_package_content_type WHERE pct_paos_id = ? AND pct_is_active = 1 AND ISNULL(pct_crud_isactive) ", [paosId], function (err, response) {
        callback(err,response);
    });
}


//To be used in advance setting ..if offer plan gets changed..
exports.selectOfferIdByPAOSID = function(dbConnection,paosId,callback){
    var query = dbConnection.query("SELECT paos_op_id FROM  `icn_package_alacart_offer_site` WHERE paos_id = ?",paosId, function (err, response) {
        callback(err,response);
    });
}
