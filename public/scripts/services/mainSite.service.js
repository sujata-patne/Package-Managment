/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('MainSite', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = 'http://localhost:3080';
    service.getContentTypes = function(success){
        $http.get(service.baseRestUrl + '/getContentTypes').success(function (items) {
            console.log(items)
            success(items);
        });
    }
    return service;
}]);