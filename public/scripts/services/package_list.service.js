myApp.service('Package', ['$http', function ($http) {

	
    this.baseRestUrl = '';

    //PrePopulate Add Pack form  :
    this.getStore = function (success, error ) {
        $http.post(this.baseRestUrl + '/getStore').success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    } 
    this.getPackageDetail = function ( data ,success, error ) {
        $http.post(this.baseRestUrl + '/getPackageDetail',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    this.getPackageStartsWith = function (data,success, error ) {
        $http.post(this.baseRestUrl + '/getPackageStartsWith',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

   /* this.getPackageDetail = function (data,success, error ) {
        $http.post(this.baseRestUrl + '/getPackageByTitle',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }*/
    this.blockUnBlockContentType = function ( data, success, error ) {
        $http.post(this.baseRestUrl + '/blockUnBlockContentType',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
this.getContentTypesByPack = function ( data, success, error ) {
        $http.post(this.baseRestUrl + '/getContentTypesByPack',data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    
}]);