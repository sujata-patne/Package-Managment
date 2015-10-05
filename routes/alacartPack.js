/**
 * Created by sujata.patne on 05-10-2015.
 */
var alacartPack = require('../controller/alacartNoffer.controller');

app.route('/addAlacartNOffer')
    .post(alacartPack.addAlacartPlanDetails);
app.route('/getAlacartNOfferPackDetails')
    .post(alacartPack.getAlacartNOfferPackDetails);