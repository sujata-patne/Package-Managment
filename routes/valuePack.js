var valuePack = require('../controller/valuePack.controller');

module.exports = function (app) {
    app.route('/getSelectedValuePacks')
        .post( valuePack.getSelectedValuePacks );
    app.route('/addValuePackToMainSite')
        .post(valuePack.addValuePackToMainSite);
}