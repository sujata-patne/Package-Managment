myApp.service('Arrangeplans', ['$http', function ($http){

    this.baseRestUrl = '';

    //PrePopulate Add Pack form  :
    this.getArrangeData = function (success, error ) {

        $http.post(this.baseRestUrl + '/getArrangeData',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
}]);