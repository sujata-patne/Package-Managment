myApp.service('advanceSetting', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = "";

    service.getData = function (data, success, error) {
        $http.post(service.baseRestUrl + '/getData',data).success(function (response) {
            success(response);
        }).error(function (err) {
            error(err);
        });
    }

    service.addSetting = function (data,success, error) {
        $http.post(service.baseRestUrl + '/addSetting',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    
    service.editSetting = function (data,success, error) {
        $http.post(service.baseRestUrl + '/editSetting',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    return service;

}]);