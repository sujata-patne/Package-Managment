myApp.service('Packs', ['$http', function ($http) {

	var service = {};
    service.baseRestUrl = '';

    //PrePopulate Add Pack form  : 
    service.getData = function (success, error) {
        $http.post(service.baseRestUrl + '/getData').success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    } 

    service.addEditPack = function (data,success, error) {
        $http.post(service.baseRestUrl + '/addEditPack',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    return service;

}]);