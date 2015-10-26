/**
 * Created by sujata.patne on 08-10-2015.
 */
myApp.service('alacartPack', ['$http', function ($http) {

    this.baseRestUrl = "";

    this.getAlacartNofferDetails = function(data, success){
        $http.post(this.baseRestUrl + '/getAlacartNofferDetails', data).success(function (items) {
            console.log(items)
            success(items);
        });
    }

    this.addAlacartNOffer = function(data, success){
        if(data.packageType === 0){
            $http.post(this.baseRestUrl + '/addMainsiteAlacartPlanDetails', data).success(function (items) {
                console.log(items)
                success(items);
            });
        }else{
            $http.post(this.baseRestUrl + '/addIndividualAlacartPlanDetails', data).success(function (items) {
                console.log(items)
                success(items);
            });
        }

    }

    this.editAlacartNOffer = function(data, success){
        if(data.packageType === 0) {
            $http.post(this.baseRestUrl + '/editMainsiteAlacartPlanDetails', data).success(function (items) {
                console.log(items)
                success(items);
            });
        }else{
            $http.post(this.baseRestUrl + '/editIndividualAlacartPlanDetails', data).success(function (items) {
                console.log(items)
                success(items);
            });
        }
    }
}]);