var arrangePlans = require('../controller/arrange-plans.controller.js');
module.exports = function (app) {
    app.route('/getArrangeData')
        .post(arrangePlans.getArrangeData);
}