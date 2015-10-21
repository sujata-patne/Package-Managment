/**
 * Created by root on 1/10/15.
 */
/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('subscriptionPack', ['$http', function ($http) {

    this.baseRestUrl = "";

    this.getSubscriptionDetails = function ( data, success, error) {

        $http.post(this.baseRestUrl + '/getSubscriptionDetails', data ).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    };

    this.addSubscriptionPackToMainSite = function (data, success, error) {
        if(data.packageType === 0) {
            $http.post(this.baseRestUrl + '/saveSubscriptionPackToMainSite',data).success(function (items) {
                success(items);
            }).error(function (err) {
                error(err);
            });
        }else{
            $http.post(this.baseRestUrl + '/saveSubscriptionPackToIndividual',data).success(function (items) {
                success(items);
            }).error(function (err) {
                error(err);
            });
        }
    };

    this.getSelectedSubscriptionPacks = function( data, success, error ) {
        $http.post(this.baseRestUrl + '/getSelectedSubscriptionPacks', data ).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
}]);
