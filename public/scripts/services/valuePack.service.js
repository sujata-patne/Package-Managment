/**
 * Created by root on 1/10/15.
 */
/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('valuePack', ['$http', function ($http) {
    var valuePackService = {};
    valuePackService.baseRestUrl = "";

    valuePackService.getSelectedValuePacks = function( data, success, error ) {
        $http.post(valuePackService.baseRestUrl + '/getSelectedValuePacks', data ).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    valuePackService.addValuePackToMainSite = function (data, success, error) {
        console.log( valuePackService.baseRestUrl );
        $http.post(valuePackService.baseRestUrl + '/addValuePackToMainSite',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    return valuePackService;

}]);