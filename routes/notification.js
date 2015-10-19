var notification = require('../controller/notification.controller');
module.exports = function (app) {
    app.route('/getDistributionChannel')
        .get( notification.getDistributionChannel);
    app.route('/getNotificationData')
        .post( notification.getNotificationData);

}