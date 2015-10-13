exports.getLastInsertedSettingId = function( dbConnection, callback) {
	var query = dbConnection.query("SELECT coalesce(MAX(pass_paos_id) + 1,0) as maxId FROM `icn_package_advance_setting_site`", function ( err, response ) {
		callback( err, response );
	});
}

exports.saveAdvanceSetting = function( dbConnection,data, callback) {
	var query = dbConnection.query("INSERT INTO `icn_package_advance_setting_site` SET ?",data, function ( err, response ) {
		callback( err, response );
	});
}

exports.getOfferPlanSettingDataForUpdate = function( dbConnection, packageId, callback ) {
    if(packageId == undefined){
        packageId = -1;
    }
    var query = dbConnection.query('SELECT * FROM `icn_package_advance_setting_site`, '+
        ' `icn_package_alacart_offer_site`,`icn_store_package` '+
        ' where icn_package_advance_setting_site.pass_paos_id = icn_package_alacart_offer_site.paos_id '+
        ' and icn_store_package.sp_pkg_id = icn_package_alacart_offer_site.paos_sp_pkg_id and icn_store_package.sp_pkg_id = ? and ISNULL(icn_package_advance_setting_site.pass_crud_isactive)',packageId, function( err, response ) {
        callback( err, response );
    });
}
exports.getValuePlanSettingDataForUpdate = function( dbConnection, packageId, callback ) {
    if(packageId == undefined){
        packageId = -1;
    }
    var query = dbConnection.query('SELECT * FROM `icn_package_advance_setting_site`,`icn_package_value_pack_site`,`icn_store_package` '+
        ' where icn_package_advance_setting_site.pass_pvs_id = icn_package_value_pack_site.pvs_id and '+
        ' icn_store_package.sp_pkg_id = icn_package_value_pack_site.pvs_sp_pkg_id and icn_store_package.sp_pkg_id = ? and ISNULL(icn_package_advance_setting_site.pass_crud_isactive)',packageId, function( err, response ) {
        callback( err, response );
    });
}

exports.updateOfferSetting = function( dbConnection, offerplanId,contentTypeId, callback ) {
    var query = dbConnection.query('UPDATE icn_package_advance_setting_site SET pass_crud_isactive = '+offerplanId+' WHERE pass_paos_id = ? AND pass_content_type = ?',[offerplanId,contentTypeId], function( err, response ) {
        callback( err, response );
    });
}

exports.updateValueSetting = function( dbConnection, valueplanId,contentTypeId, callback ) {
    var query = dbConnection.query('UPDATE icn_package_advance_setting_site SET pass_crud_isactive = '+valueplanId+' WHERE pass_pvs_id = ? AND pass_content_type = ?',[valueplanId,contentTypeId], function( err, response ) {
        callback( err, response );
    });
}

exports.saveCGImageSetting = function( dbConnection, data, callback ) {
    var query = dbConnection.query('INSERT INTO icn_package_cg_image SET ? ',data, function( err, response ) {
        callback( err, response );
    });
}

exports.CGImageExists = function( dbConnection,packageId, callback ) {
    var query = dbConnection.query('SELECT * FROM icn_package_cg_image WHERE pci_sp_pkg_id =  ? AND pass_crud_isactive IS NULL',packageId, function( err, response ) {
        callback( err, response );
    });
}
exports.DeleteCGImage = function( dbConnection,packageId, callback ) {
    var query = dbConnection.query('UPDATE icn_package_cg_image SET pass_crud_isactive = '+packageId+' WHERE pci_sp_pkg_id =  ? ',packageId, function( err, response ) {
        callback( err, response );
    });
}