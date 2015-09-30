/**
 * Created by sujata.patne on 29-09-2015.
 */

var mainSite = require('../controller/mainSite.controller');

module.exports = function (app) {
    app.route('/getContentTypes')
        .get(mainSite.getContentTypes);
    app.route('/getValuePackPlans')
        .get(mainSite.getValuePackPlans);
    app.route('/getDistributionChannels')
        .get(mainSite.getDistributionChannels );
}