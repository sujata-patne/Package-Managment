/**
 * Created by sujata.patne on 05-10-2015.
 */
var alacartPack = require('../controller/alacartNoffer.controller');

module.exports = function (app) {
    app.route('/getAlacartNofferDetails')
        .post(alacartPack.getAlacartNofferDetails);
    app.route('/addAlacartNOffer')
        .post(alacartPack.addAlacartPackDetails);
    app.route('/editAlacartNOffer')
        .post(alacartPack.editAlacartPackDetails);
}