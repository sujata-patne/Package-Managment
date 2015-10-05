/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('MainSite', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = "";

    service.getMainSiteData = function(success){
        $http.get(service.baseRestUrl + '/getMainSiteData').success(function (items) {
            success(items);
        });
    }

    service.getAlacartNOfferData = function(success){
        $http.get(service.baseRestUrl + '/getAlacartNOfferData').success(function (items) {
            console.log(items)
            success(items);
        });
    }

    service.addAlacartNOffer = function(data, success){
        $http.post(service.baseRestUrl + '/addAlacartNOffer', data).success(function (items) {
            console.log(items)
            success(items);
        });
    }

    return service;
}]);