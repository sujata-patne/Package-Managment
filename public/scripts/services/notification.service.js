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


}]);