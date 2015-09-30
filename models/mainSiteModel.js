/**
 * Created by sujata.patne on 29-09-2015.
 */
exports.getContentTypes = function(dbConnection, storeId, callback) {
    //var query = dbConnection.query('SELECT cd.*, ct.mct_parent_cnt_type_id, cd3.cd_name AS parent_name, cd2.cd_name AS delivery_type_name ' +
    //'from icn_store As st ' +
    //'inner join multiselect_metadata_detail as mlm on (mlm.cmd_group_id = st.st_content_type) ' +
    //'inner join catalogue_detail As cd on mlm.cmd_entity_detail = cd.cd_id ' +
    //'JOIN icn_manage_content_type as ct ON ct.mct_cnt_type_id = cd.cd_id ' +
    //'JOIN icn_alacart_plan AS plan ON ct.mct_cnt_type_id = plan.ap_delivery_type ' +
    //'join catalogue_detail as cd2 ON cd2.cd_id = plan.ap_delivery_type ' +
    //'join catalogue_detail as cd3 ON cd3.cd_id = ct.mct_parent_cnt_type_id ' +
    //'join catalogue_master as cm1 ON  cm1.cm_id = cd3.cd_cm_id ' +
    //'WHERE st.st_id = ? ', [storeId], function (err, ContentTypes) {

    var query = dbConnection.query('select cd.*, ct.mct_parent_cnt_type_id, ' +
        '(SELECT cd_name FROM catalogue_detail as cd1 join catalogue_master as cm1 ON  cm1.cm_id = cd1.cd_cm_id WHERE ct.mct_parent_cnt_type_id = cd1.cd_id) AS parent_name ' +
        'from icn_store As st ' +
        'inner join multiselect_metadata_detail as mlm on (mlm.cmd_group_id = st.st_content_type) ' +
        'inner join catalogue_detail As cd on mlm.cmd_entity_detail = cd.cd_id ' +
        'JOIN icn_manage_content_type as ct ON ct.mct_cnt_type_id = cd.cd_id ' +
        'WHERE st.st_id = ? ', [storeId], function (err, ContentTypes) {
    //var query = dbConnection.query('SELECT cd.cd_name, plan.*, cd1.cd_name AS delivery_type_name ' +
    //    'FROM icn_alacart_plan AS plan ' +
    //    'join catalogue_detail as cd ON plan.ap_content_type = cd.cd_id ' +
    //    'join catalogue_detail as cd1 ON cd1.cd_id = plan.ap_delivery_type ' +
    //    'WHERE plan.ap_st_id = ? ', [storeId], function (err, ContentTypes) {
        callback(err, ContentTypes)
    })
}