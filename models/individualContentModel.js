exports.getAlacartPlansByContentType = function( dbConnection,storeId,contentTypeId, callback) {
	var query = dbConnection.query("SELECT * FROM `icn_alacart_plan` WHERE ap_content_type = ? AND ap_st_id = ? AND ap_is_active = 1",[contentTypeId,storeId], function ( err, response ) {
		callback( err, response );
	});
}

exports.getLastInsertedIndividualContentId = function( dbConnection, callback) {
	var query = dbConnection.query("SELECT coalesce(MAX(pic_id) + 1,1) as maxId FROM `icn_package_individual_content`  ", function ( err, response ) {
		callback( err, response );
	});
}


exports.getContentData = function( dbConnection,contentTypeId,packId, callback) {
	var query = dbConnection.query("SELECT *," +
        "(SELECT `catalogue_detail`.cd_name   FROM `icn_manage_content_type`,`catalogue_detail` where mct_cnt_type_id = content_metadata.cm_content_type and mct_parent_cnt_type_id = catalogue_detail.cd_id) as parent_type_name," +
        "(SELECT cf.cf_url FROM content_files as cf WHERE content_metadata.cm_id = cf.cf_cm_id Limit 1) AS contentUrl ," +
       // "(select group_concat( cft_thumbnail_img_browse) as cft_thumbnail_img_browse,cft_cm_id from content_files_thumbnail group by cft_cm_id )cth on(cft_cm_id = icn_pack_content.pc_cm_id)"+

        "(SELECT cft_thumbnail_img_browse FROM content_files_thumbnail WHERE cft_cm_id = icn_pack_content.pc_cm_id LIMIT 1) as new_thumb_url " +
        "FROM icn_pack_content,content_metadata WHERE pc_pct_id = " +
        "(SELECT pct_id from icn_pack_content_type where pct_cnt_type = ? AND pct_pk_id = ?) AND " +
        "ISNULL(pc_crud_isactive) AND content_metadata.cm_id = icn_pack_content.pc_cm_id",[contentTypeId,packId], function ( err, response ) {
		callback( err, response );
	});
}

exports.checkRecordExists = function( dbConnection,storeId,packId,alacartPlanId,packageId, callback) {
	var query = dbConnection.query("SELECT * FROM icn_package_individual_content WHERE pic_st_id = ? AND pic_pk_id = ?  AND pic_pkg_id = ? AND ISNULL(pic_crud_isactive) ",[storeId,packId,packageId], function ( err, response ) {
		callback( err, response );
	});
}

exports.updateIndividualContentRecord = function( dbConnection,storeId,packId,alacartPlanId,packageId, callback) {
	var query = dbConnection.query("UPDATE icn_package_individual_content SET pic_crud_isactive = 1 WHERE pic_st_id = ? AND pic_pk_id = ?  AND pic_pkg_id = ? ",[storeId,packId,packageId], function ( err, response ) {
		callback( err, response );
	});
}

exports.getIndividualContentData = function( dbConnection,storeId,packageId,packId,planId, callback) {
	console.log("SELECT * FROM icn_package_individual_content WHERE pic_st_id = "+storeId+" AND pic_pkg_id = "+packageId+" AND pic_pk_id = "+packId+"  AND pic_ap_id = "+planId+" AND ISNULL(pic_crud_isactive)");
	var query = dbConnection.query("SELECT * FROM icn_package_individual_content WHERE pic_st_id = ? AND pic_pkg_id = ? AND pic_pk_id = ?  AND pic_ap_id = ? AND ISNULL(pic_crud_isactive) ",[storeId,packageId,packId,planId], function ( err, response ) {
		callback( err, response );
	});
}

exports.saveIndividualContent = function( dbConnection,data, callback) {
	var query = dbConnection.query("INSERT INTO icn_package_individual_content SET ? ",[data], function ( err, response ) {
		callback( err, response );
	});
}

exports.updateIndividualContentDate = function( dbConnection,data, callback) {

	var query = dbConnection.query("UPDATE icn_package_individual_content SET pic_valid_till = ? WHERE pic_st_id = ? AND pic_pk_id = ? AND pic_ap_id = ? AND pic_pkg_id = ?",[data.pic_valid_till,data.pic_st_id,data.pic_pk_id,data.pic_ap_id,data.pic_pkg_id], function ( err, response ) {
		callback( err, response );
	});
}