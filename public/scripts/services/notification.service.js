myApp.service('Notification', ['$http', function ($http) {

    this.baseRestUrl = "";

    this.getDistributionChannel = function (success) {
        $http.get(this.baseRestUrl + '/getDistributionChannel').success(function (items) {
            success(items);
        });
    }
    this.getNotificationData = function (data,success) {
        $http.post(this.baseRestUrl + '/getNotificationData',data).success(function (items) {
            success(items);
        });
    }
    this.addNotificationData = function (data,success) {
        $http.post(this.baseRestUrl + '/addNotificationData',data).success(function (items) {
            success(items);
        });
    }
    this.listNotificationData = function (data,success) {
        $http.post(this.baseRestUrl + '/listNotificationData',data).success(function (items) {
            success(items);
        });
    }
    this.n_delete = function ( data, success, error ) {
        $http.post(this.baseRestUrl + '/n_delete',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

}]);