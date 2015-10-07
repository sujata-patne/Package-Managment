/**
 * Created by sujata.patne on 05-10-2015.
 */

myApp.controller('alacartCtrl', function ($scope, $state, ngProgress, $stateParams, MainSite) {
console.log('alacart')
    $scope.submitForm = function (isValid) {
        if (!$scope.distributionChannelId) {
            toastr.error('Distribution Channel is required');
            $scope.errorvisible = true;
        } else {
            var alacartData = {
                ContentTypes: $scope.ContentTypes,
                alacartPlansList: $scope.alacartPlanIds,
                paosId: $scope.paosId,
                offerId: $scope.offerId,
                packageId: $scope.PackageId,
                packageType: $scope.PackageType,
                distributionChannelId: $scope.distributionChannelId
            }
            ngProgress.start();
            if ($scope.paosId != undefined && $scope.paosId != null && $scope.paosId != '') {
                MainSite.editAlacartNOffer(alacartData, function (data) {
                    $scope.showResponse(data);
                });
            } else {
                MainSite.addAlacartNOffer(alacartData, function (data) {
                    $scope.showResponse(data);
                });
            }
        }
    }

    $scope.showResponse = function(data){
        if (data.success) {
            toastr.success(data.message)
            $scope.successvisible = true;
        }
        else {
            toastr.success(data.message)
            $scope.errorvisible = true;
        }

        ngProgress.complete();
    }
});
