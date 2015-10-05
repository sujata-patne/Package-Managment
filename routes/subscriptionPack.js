var subscriptionPack = require('../controller/subscriptionPack.controller');

module.exports = function (app) {
    app.route('/getSubscriptionDetails')
        .get( subscriptionPack.getSubscriptionDetails );
    app.route('/addSubscriptionPackToMainSite')
        .post( subscriptionPack.addSubscriptionPackToMainSite );
}
