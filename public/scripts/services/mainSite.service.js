/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('MainSite', ['$http', function ($http) {
    //var service = {};
    this.baseRestUrl = 'http://localhost:3080';
    this.getContentTypes = function(success){
        $http.get(this.baseRestUrl + '/getContentTypes').success(function (items) {
            console.log(items)
            success(items);
        });
    }
    
}]);