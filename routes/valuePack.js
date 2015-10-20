var valuePack = require('../controller/valuePack.controller');

module.exports = function (app) {
    app.route('/getSelectedValuePacks')
        .post( valuePack.getSelectedValuePacks );
    app.route('/saveValuePackToMainSite')
        .post(valuePack.saveValuePackToMainSite);
    app.route('/saveValuePackToIndividual')
        .post(valuePack.saveValuePackToIndividual);
}