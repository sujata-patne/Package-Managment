myApp.service('IndividualContent', ['$http', function ($http) {

    this.baseRestUrl = "";

    this.getIndividualContentData = function(data,success){
        $http.post(this.baseRestUrl + '/getIndividualContentData',data).success(function (items) {
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

    this.editIndividualContent = function(data,success){
        $http.post(this.baseRestUrl + '/editIndividualContent',data).success(function (items) {
            success(items);
        });
    }

}]);