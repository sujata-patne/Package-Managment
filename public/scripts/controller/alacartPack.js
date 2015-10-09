/**
 * Created by sujata.patne on 05-10-2015.
 */

myApp.controller('alacartCtrl', function ($scope, $state, ngProgress, $stateParams, alacartPack) {
    var data = {
        packageId : $scope.PackageId,
        packageType: $scope.PackageType
    }

    /*alacartPack.getAlacartNofferDetails(data, function (alacartPackData) {

        $scope.alacartNofferDetails = angular.copy(alacartPackData.alacartNOfferDetails);
        if ($scope.alacartNofferDetails != null && $scope.alacartNofferDetails.length > 0) {
            $scope.alacartPlanIds = {};
            $scope.contentTypePlanData = {};

            $scope.contentTypePlanData = angular.copy($scope.alacartNofferDetails[1].contentTypePlanData);
            if ($scope.contentTypePlanData != null && $scope.contentTypePlanData.length > 0) {
                angular.forEach($scope.contentTypePlanData, function (data) {
                    $scope.alacartPlanIds[data.pct_content_type_id] = {
                        download: data.pct_download_id,
                        streaming: data.pct_stream_id
                    };
                })
            }
        }
    });
*/
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
                alacartPack.editAlacartNOffer(alacartData, function (data) {
                    $scope.showResponse(data);
                });
            } else {
                alacartPack.addAlacartNOffer(alacartData, function (data) {
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
