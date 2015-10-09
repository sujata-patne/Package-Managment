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
        $http.post(this.baseRestUrl + '/addAlacartNOffer', data).success(function (items) {
            console.log(items)
            success(items);
        });
    }

    this.editAlacartNOffer = function(data, success){
        $http.post(this.baseRestUrl + '/editAlacartNOffer', data).success(function (items) {
            console.log(items)
            success(items);
        });
    }
}]);