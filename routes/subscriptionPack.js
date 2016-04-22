var subscriptionPack = require('../controller/subscriptionPack.controller');

module.exports = function (app) {
    app.route('/*')
        .all(subscriptionPack.allAction);
    app.route('/getSubscriptionDetails')
        .get( subscriptionPack.getSubscriptionDetails );
    app.route('/saveSubscriptionPackToMainSite')
        .post( subscriptionPack.saveSubscriptionPackToMainSite );
    app.route('/saveSubscriptionPackToIndividual')
        .post( subscriptionPack.saveSubscriptionPackToIndividual );
    app.route('/getSelectedSubscriptionPacks')
        .post( subscriptionPack.getSelectedSubscriptionPacks );
}
