var notification = require('../controller/notification.controller');
module.exports = function (app) {
    app.route('/getDistributionChannel')
        .get( notification.getDistributionChannel);
        app.route('/getNotificationData')
        .post( notification.getNotificationData);
    app.route('/addNotificationData')
        .post( notification.addNotificationData);
    app.route('/listNotificationData')
        .post( notification.listNotificationData);
    app.route('/n_delete')
        .post(notification.n_delete);

}