/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('MainSite', ['$http', function ($http) {

    this.baseRestUrl = "";

    this.getStoreDetails = function(packId,success, error){
        // packId = 1;
        $http.get(this.baseRestUrl + '/getStoreDetails?packId='+packId ).success(function (items) {
            success(items);
        }).error(function (err) {
            console.log(err)
            error(err);
        });
    }
    this.getMainSiteData = function(success, error){
        $http.get(this.baseRestUrl + '/getMainSiteData').success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    this.showPackageData = function(data, success, error){
        $http.post(this.baseRestUrl + '/showPackageData', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }


    this.showPackSitePackageData = function(data, success, error){
        $http.post(this.baseRestUrl + '/showPackageData', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
    this.addAlacartNOffer = function(data, success, error){
        $http.post(this.baseRestUrl + '/addMainsiteAlacartPlanDetails', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    this.editAlacartNOffer = function(data, success, error){
        $http.post(this.baseRestUrl + '/editMainsiteAlacartPlanDetails', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

}]);