/**
 * Created by sujata.patne on 14-07-2015.
 */
myApp.service('Users', ['$http', function ($http) {
    //var service = {};
    this.baseRestUrl = '';
    this.getUsers = function(success){
        $http.get(this.baseRestUrl + '/users').success(function (items) {
            success(items);
        });
    }

    this.updateUser = function(data,success){
        $http.post(this.baseRestUrl + '/updateUsers', data).success(function (items) {
            success(items);
        });
    }
    this.saveUser = function(data,success){
        $http.post(this.baseRestUrl + '/saveUsers', data).success(function (items) {
            success(items);
        });
    }

    this.addEditUsers = function(data,success){
        $http.post(this.baseRestUrl + '/addEditUsers',data).success(function (items) {
            success(items);
        });
    }

    this.changePassword = function(data,success){
        $http.post(this.baseRestUrl + '/changepassword',data).success(function (items) {
            success(items);
        });
    }

    //return service;
}]);