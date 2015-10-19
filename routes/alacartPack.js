/**
 * Created by sujata.patne on 05-10-2015.
 */
var alacartPack = require('../controller/alacartNoffer.controller');

module.exports = function (app) {
    app.route('/getAlacartNofferDetails')
        .post(alacartPack.getAlacartNofferDetails);
    app.route('/addMainsiteAlacartPlanDetails')
        .post(alacartPack.addMainsiteAlacartPlanDetails);
    app.route('/editMainsiteAlacartPlanDetails')
        .post(alacartPack.editMainsiteAlacartPlanDetails);
    app.route('/addIndividualAlacartPlanDetails')
        .post(alacartPack.addIndividualAlacartPlanDetails);
    app.route('/editIndividualAlacartPlanDetails')
        .post(alacartPack.editIndividualAlacartPlanDetails);
}