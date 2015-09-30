/**
 * Created by sujata.patne on 7/7/2015.
 */

var mysql = require('mysql');
var config = require('../config')();

var poolCluster = mysql.createPoolCluster();

// add configurations
poolCluster.add('CMS', {
    host: config.db_host_ikon_cms,
    user: config.db_user_ikon_cms,
    password: config.db_pass_ikon_cms,
    database: config.db_name_ikon_cms
});

exports.pool = poolCluster;