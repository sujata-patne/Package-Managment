exports.getUserDetails = function(dbConnection, userName, passWord, callback){
	var query = dbConnection.query('SELECT * FROM icn_login_detail AS user '+
			                        'JOIN icn_store_user AS store_user ON user.ld_id = store_user.su_ld_id '+
			                        'where BINARY ld_user_id= ? and BINARY ld_user_pwd = ? ', 
			    [ userName, passWord ], function( err, userDetails ) {
        callback( err, userDetails );
    });
}

exports.getUserByUserIdByEmail = function(dbConnection, userId, userEmail, callback){

	var query = dbConnection.query('SELECT * FROM icn_login_detail '+
									'where BINARY ld_user_id= ? and BINARY ld_email_id = ? ', 
									[userId, userEmail], function (err, userDetails ) {
        callback( err, userDetails );
    });
}

exports.updateUser = function( dbConnection, newPassword, updatedOn, userId, callback ) {
	var query = dbConnection.query('UPDATE icn_login_detail '+
							'				SET ld_user_pwd=?, ld_modified_on=? WHERE ld_id=?', 
					[newPassword, updatedOn, userId ], function ( err, response ) {
		callback( err, response );                    
    });
}

exports.updateLastLoggedIn = function( dbConnection,  userId, callback ) {
	var query = dbConnection.query('UPDATE icn_login_detail '+
							'				SET ld_last_login=NOW() WHERE ld_id=?', 
					[userId], function ( err, response ) {
		callback( err, response );                    
    });
}

exports.getSelectedPaymentTypesByStoreId = function( dbConnection, storeId,  callback ) {
	//current - 1 -> one time , 2 -> subscription
    dbConnection.query('select mlm.cmd_entity_detail from icn_store as st '+
                            'inner join multiselect_metadata_detail as mlm on (mlm.cmd_group_id = st.st_payment_type) '+
                             'WHERE st.st_id =? and mlm.cmd_entity_detail in (1,2) ', [storeId], 
        function (err, selectedPaymentType) {
            callback(err,selectedPaymentType);
       }                
    );
}
