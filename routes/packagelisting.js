var packageListing = require('../controller/package-listing.controller');

module.exports = function (app) {
    app.route('/getStore')
        .post(packageListing.getStore);
    app.route('/getPackageDetail')
        .post(packageListing.getPackageDetail);
    app.route('/getPackageStartsWith')
        .post(packageListing.getPackageStartsWith);
    app.route('/blockUnBlockContentType')
        .post(packageListing.blockUnBlockContentType);
    app.route('/delete')
        .post(packageListing.delete);

}