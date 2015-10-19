exports.getPackageByName = function(dbConnection,dc_id,storeId, callback) {

    var query = dbConnection.query('select sp_package_name,sp_pkg_type from icn_store_package as st '+
        ' where st.sp_dc_id = ? AND st.sp_st_id = ? AND ISNULL(st.sp_crud_isactive ) ' , [dc_id , storeId],  function (err, packageByName) {
        callback(err, packageByName);
    });
}