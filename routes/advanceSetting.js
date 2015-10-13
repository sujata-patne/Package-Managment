var advanceSetting = require('../controller/advanceSetting.controller');

module.exports = function (app) {
    app.route('/getData')
        .post(advanceSetting.getData);
    app.route('/addSetting')
        .post(advanceSetting.addSetting);
    app.route('/editSetting')
        .post(advanceSetting.editSetting);
    app.route('/UploadFile')
        .post(advanceSetting.UploadFile);
}