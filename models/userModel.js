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
