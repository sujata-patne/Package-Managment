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
    return service;

}]);