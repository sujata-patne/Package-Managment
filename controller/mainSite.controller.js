/**
 * Created by sujata.patne on 29-09-2015.
 */
var mysql = require('../config/db').pool;
var mainSiteManager = require('../models/mainSiteModel');

exports.getContentTypes = function (req, res, next) {
    try {
        if (req.session && req.session.package_UserName && req.session.package_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                mainSiteManager.getContentTypes( connection_ikon_cms, req.session.package_StoreId, function(err,ContentTypes){
                    if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        connection_ikon_cms.release();
                        res.send({'ContentTypes':ContentTypes});
                    }
                });
            })
        }else{
            res.redirect('/accountlogin');
        }
    }catch(err){
        res.status(500).json(err.message);
    }
};