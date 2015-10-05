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

    this.getAlacartNOfferData = function(success){
        $http.get(this.baseRestUrl + '/getContentTypes').success(function (items) {
            console.log(items)
            success(items);
        });
    }
    this.addAlacartNOffer = function(data, success){
        $http.post(this.baseRestUrl + '/addAlacartNOffer', data).success(function (items) {
            console.log(items)
            success(items);
        });
    }
}]);