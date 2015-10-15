exports.getAlacartPlansByContentType = function( dbConnection,storeId,contentTypeId, callback) {
	var query = dbConnection.query("SELECT * FROM `icn_alacart_plan` WHERE ap_content_type = ? AND ap_st_id = ? ",[contentTypeId,storeId], function ( err, response ) {
		callback( err, response );
	});
}

exports.getLastInsertedIndividualContentId = function( dbConnection, callback) {
	var query = dbConnection.query("SELECT coalesce(MAX(pic_id) + 1,0) as maxId FROM `icn_package_individual_content`", function ( err, response ) {
		callback( err, response );
	});
}


exports.getContentData = function( dbConnection,contentTypeId,packId, callback) {
	var query = dbConnection.query("SELECT * FROM icn_pack_content,content_metadata WHERE pc_pct_id = (SELECT pct_id from icn_pack_content_type where pct_cnt_type = ? AND pct_pk_id = ?) AND ISNULL(pc_crud_isactive) AND content_metadata.cm_id = icn_pack_content.pc_cm_id",[contentTypeId,packId], function ( err, response ) {
		callback( err, response );
	});
}

exports.saveIndividualContent = function( dbConnection,data, callback) {
	var query = dbConnection.query("INSERT INTO icn_package_individual_content SET ? ",[data], function ( err, response ) {
		callback( err, response );
	});
}