var individualContent = require('../controller/individualContent.controller');

module.exports = function (app) {
    app.route('/getIndividualContentData')
        .post(individualContent.getIndividualContentData);
    app.route('/getAlacartPlansByContentType')
        .post(individualContent.getAlacartPlansByContentType); 
    app.route('/addIndividualContent')
        .post(individualContent.addIndividualContent);
    app.route('/editIndividualContent')
        .post(individualContent.editIndividualContent);
}