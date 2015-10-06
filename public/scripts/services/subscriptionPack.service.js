/**
 * Created by root on 1/10/15.
 */
/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('subscriptionPack', ['$http', function ($http) {
    var subscriptionPackService = {};
    subscriptionPackService.baseRestUrl = "";

    subscriptionPackService.getSubscriptionDetails = function ( success, error) {

        $http.get(subscriptionPackService.baseRestUrl + '/getSubscriptionDetails' ).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    };

    subscriptionPackService.addSubscriptionPackToMainSite = function (data, success, error) {
        console.log( subscriptionPackService.baseRestUrl );
        $http.post(subscriptionPackService.baseRestUrl + '/addSubscriptionPackToMainSite',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    };

    subscriptionPackService.getSelectedSubscriptionPacks = function( data, success, error ) {
        $http.post(subscriptionPackService.baseRestUrl + '/getSelectedSubscriptionPacks', data ).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    return subscriptionPackService;

}]);
