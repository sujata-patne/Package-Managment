var subscriptionPack = require('../controller/subscriptionPack.controller');

module.exports = function (app) {
    app.route('/getSubscriptionDetails')
        .get( subscriptionPack.getSubscriptionDetails );
    app.route('/saveSubscriptionPackToMainSite')
        .post( subscriptionPack.saveSubscriptionPackToMainSite );
    app.route('/saveSubscriptionToIndividual')
        .post( subscriptionPack.saveSubscriptionToIndividual );
    app.route('/getSelectedSubscriptionPacks')
        .post( subscriptionPack.getSelectedSubscriptionPacks );
}
