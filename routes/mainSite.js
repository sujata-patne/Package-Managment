var mainSite = require('../controller/mainSite.controller');

module.exports = function (app) {
    app.route('/*')
        .all(mainSite.allAction);
    app.route('/getStoreDetails')
        .get(mainSite.getStoreDetails);
    app.route('/getMainSiteData')
        .get(mainSite.getMainSiteData);
    app.route('/showPackageData')
        .post(mainSite.showPackageData);
    app.route('/getPackSiteData')
        .get(mainSite.getMainSiteData);
    app.route('/showPackSitePackageData')
        .post(mainSite.showPackageData);

}