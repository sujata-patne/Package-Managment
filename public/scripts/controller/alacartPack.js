/**
 * Created by sujata.patne on 05-10-2015.
 */

myApp.controller('alacartCtrl', function ($scope, $http, ngProgress, $stateParams, MainSite) {
    $scope.PackageType = 0;

    $scope.submitForm = function (isValid) {
        var alacartData = {
            ContentTypes: $scope.ContentTypes,
            alacartPlansList: $scope.alacartPlanIds,
            offerId: $scope.offerId,
            packageId: $scope.PackageId,
            packageType: $scope.PackageType,
            distributionChannelId: $scope.distributionChannelId
        }
        //console.log(alacartData)
        ngProgress.start();
        MainSite.addAlacartNOffer(alacartData, function (data) {
            if (data.success) {
                toastr.success(data.message)
                $scope.successvisible = true;
            }
            else {
                toastr.success(data.message)
                $scope.errorvisible = true;
            }
            ngProgress.complete();
        });
    }
});