myApp.service('Arrangeplans', ['$http', function ($http){

    this.baseRestUrl = '';

    //PrePopulate Add Pack form  :
    this.getArrangePlansData = function (data,success, error ) {
console.log('data')
console.log(data)
        $http.post(this.baseRestUrl + '/getArrangePlansData',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    this.AddArrangedContents = function (data,success, error ) {

        $http.post(this.baseRestUrl + '/AddArrangedContents',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
}]);