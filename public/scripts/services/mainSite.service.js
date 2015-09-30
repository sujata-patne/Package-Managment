/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('MainSite', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = "";

    service.getContentTypes = function(success){
        $http.get(service.baseRestUrl + '/getContentTypes').success(function (items) {
            //console.log(items)
            success(items);
        });
    }

    service.getValuePackPlans = function ( success, error ) {
        $http.get(service.baseRestUrl + '/getValuePackPlans' ).success(function ( valuePackPlans ) {
            console.log("value pack plans" );
            console.log(valuePackPlans);
            success(valuePackPlans);
        }).error(function (err) {
            error(err);
        });
    }

    service.getDistributionChannels = function ( success, error ) {
        $http.get(service.baseRestUrl + '/getDistributionChannels' ).success(function ( distributionChannels ) {
            console.log("distributionChannels" );
            console.log(distributionChannels);
            success(distributionChannels);
        }).error(function (err) {
            error(err);
        });
    }

    return service;
}]);