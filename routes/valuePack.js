var valuePack = require('../controller/valuePack.controller');

module.exports = function (app) {
    app.route('/addValuePackToMainSite')
        .post(valuePack.addValuePackToMainSite);
}