myApp.service('IndividualContent', ['$http', function ($http) {

    this.baseRestUrl = "";

    this.getIndividualContentData = function(success){
        $http.post(this.baseRestUrl + '/getIndividualContentData').success(function (items) {
            success(items);
        });
    }

    this.getAlacartPlansByContentType = function(data,success){
        $http.post(this.baseRestUrl + '/getAlacartPlansByContentType',data).success(function (items) {
            success(items);
        });
    }

    this.addIndividualContent = function(data,success){
        $http.post(this.baseRestUrl + '/addIndividualContent',data).success(function (items) {
            success(items);
        });
    }

}]);