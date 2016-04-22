var arrangePlans = require('../controller/arrange-plans.controller.js');
module.exports = function (app) {
    app.route('/*')
        .all(arrangePlans.allAction);
    app.route('/getArrangePlansData')
        .post(arrangePlans.getArrangePlansData);
    app.route('/AddArrangedContents')
        .post(arrangePlans.AddArrangedContents);
}