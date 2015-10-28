/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('MainSite', ['$http', function ($http) {

    this.baseRestUrl = "";

    this.getMainSiteData = function(success){
        $http.get(this.baseRestUrl + '/getMainSiteData').success(function (items) {
            success(items);
        });
    }
    this.showPackageData = function(data, success){
        $http.post(this.baseRestUrl + '/showPackageData', data).success(function (items) {
            success(items);
        });
    }

    this.getPackSiteData = function(success){
        $http.get(this.baseRestUrl + '/getPackSiteData').success(function (items) {
            success(items);
        });
    }
    this.showPackSitePackageData = function(data, success){
        $http.post(this.baseRestUrl + '/showPackageData', data).success(function (items) {
            success(items);
        });
    }
    this.addAlacartNOffer = function(data, success){
        console.log(data)
        $http.post(this.baseRestUrl + '/addMainsiteAlacartPlanDetails', data).success(function (items) {
            console.log(items)
            success(items);
        });
    }

    this.editAlacartNOffer = function(data, success){
        $http.post(this.baseRestUrl + '/editMainsiteAlacartPlanDetails', data).success(function (items) {
            console.log(items)
            success(items);
        });
    }

}]);