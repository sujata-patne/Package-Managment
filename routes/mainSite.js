/**
 * Created by sujata.patne on 29-09-2015.
 */

var mainSite = require('../controller/mainSite.controller');

module.exports = function (app) {
    app.route('/getMainSiteData')
        .get(mainSite.getMainSiteData);
    app.route('/showPackageData')
        .post(mainSite.showPackageData);

}