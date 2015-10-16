/**
 * Created by sujata.patne on 05-10-2015.
 */

myApp.controller('alacartCtrl', function ($scope, $rootScope, $state, ngProgress, $stateParams, alacartPack) {

    if($rootScope.PackageId && $rootScope.PackageId != null && $rootScope.PackageId != undefined && $rootScope.PackageId != '') {

        var data = {
            packageId: $rootScope.PackageId,
            packageType: $rootScope.PackageType
        }

        alacartPack.getAlacartNofferDetails(data, function (alacartPackData) {

            $scope.alacartNofferDetails = angular.copy(alacartPackData.alacartNOfferDetails);
            if ($scope.alacartNofferDetails != null && $scope.alacartNofferDetails.length > 0) {
                $scope.offerId = $scope.alacartNofferDetails[0].paos_op_id;
                $scope.paosId = $scope.alacartNofferDetails[0].paos_id;
            } else {
                $scope.offerId = '';
                $scope.paosId = '';
            }
            $scope.contentTypePlanData = angular.copy(alacartPackData.contentTypePlanData);
            if ($scope.contentTypePlanData != null && $scope.contentTypePlanData.length > 0) {
                angular.forEach($scope.contentTypePlanData, function (data) {
                    $scope.alacartPlanIds[data.pct_content_type_id] = {
                        download: data.pct_download_id,
                        streaming: data.pct_stream_id
                    };
                })
            } else {
                $scope.alacartPlanIds = {};
            }
        });
    }

    $scope.submitForm = function (isValid) {
        if (!$rootScope.distributionChannelId) {
            toastr.error('Distribution Channel is required');
            $scope.errorvisible = true;
        } else {
            var alacartData = {
                ContentTypes: $scope.ContentTypes,
                alacartPlansList: $scope.alacartPlanIds,
                paosId: $scope.paosId,
                offerId: $scope.offerId,
                packageId: $rootScope.PackageId,
                packageType: $rootScope.PackageType,
                packId : $rootScope.selectedPack,
                packageName : $rootScope.packageName,
                distributionChannelId: $rootScope.distributionChannelId
            }
            ngProgress.start();
            console.log( "submit " + $rootScope.PackageId)
            if ($rootScope.PackageId != undefined && $rootScope.PackageId != null && $rootScope.PackageId != '') {
                console.log('edit')
                    alacartPack.editAlacartNOffer(alacartData, function (data) {
                    $scope.showResponse(data);
                });
            } else {
                console.log('add')
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
            $rootScope.PackageId = data.pkgId;
            $state.go($state.current, {}, {reload: $state.current});

           /* $scope.contentTypePlanData = angular.copy(data.contentTypePlanData);
            $scope.offerId =  data.offerId;
            $scope.paosId =  data.paosId;
            console.log($rootScope.PackageId)
            if ($scope.contentTypePlanData != null && $scope.contentTypePlanData.length > 0) {
                angular.forEach($scope.contentTypePlanData, function (data) {
                    $scope.alacartPlanIds[data.pct_content_type_id] = {
                        download: data.pct_download_id,
                        streaming: data.pct_stream_id
                    };
                })
            }
            console.log($scope.alacartPlanIds)
            */

        }
        else {
            toastr.success(data.message)
            $scope.errorvisible = true;
        }

        ngProgress.complete();
    }
});
