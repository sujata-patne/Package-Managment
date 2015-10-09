/**
 * Created by root on 1/10/15.
 */
/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('valuePack', ['$http', function ($http) {
    this.baseRestUrl = "";

    this.getSelectedValuePacks = function( data, success, error ) {
        $http.post(this.baseRestUrl + '/getSelectedValuePacks', data ).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    this.addValuePackToMainSite = function (data, success, error) {
        $http.post(this.baseRestUrl + '/addValuePackToMainSite',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
}]);