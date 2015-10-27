/**
 * Created by sujata.patne on 05-10-2015.
 */

myApp.controller('alacartCtrl', function ($scope, $rootScope, $state, ngProgress, $stateParams, alacartPack) {
console.log('alacartCtrl')
    $rootScope.isChild = false;
    $scope.nextButtonPressed = 0;

   // if( $rootScope.PackageId && $rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '' && $rootScope.action === 'edit') {
    /*if($rootScope.action === 'edit' && ($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '' )){
        console.log('in alacart details controller' + $rootScope.PackageId)

        var data = {
            packageId: $rootScope.PackageId,
            packageType: $rootScope.PackageType,
            parentPackageId: $rootScope.ParentPackageId
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
            }
        });
    }
*/
    $scope.submitAlacartForm = function (isValid) {
        if (!$rootScope.distributionChannelId){
            toastr.error('Distribution Channel Required');
            $scope.errorvisible = true;
        }else if ($rootScope.PackageType == 1 && !$rootScope.SelectedPack){
            toastr.error('Please Select Pack.');
            $scope.errorvisible = true;
        }else if ($rootScope.PackageType == 1 && !$rootScope.PackageName){
            toastr.error('Package Name Required.');
            $scope.errorvisible = true;
        }else if(isValid) {
            var alacartData = {
                ContentTypes: $scope.ContentTypes,
                alacartPlansList: $scope.alacartPlanIds,
                paosId: $scope.paosId,
                offerId: $scope.offerId,
                packageId: $rootScope.PackageId,
                parentPackageId: $rootScope.ParentPackageId,
                packageType: $rootScope.PackageType,
                packId: $rootScope.SelectedPack,
                packageName: $rootScope.PackageName,
                distributionChannelId: $rootScope.distributionChannelId
            }
            ngProgress.start();
            if ( $rootScope.PackageId != undefined && $rootScope.PackageId != null && $rootScope.PackageId != '' && $rootScope.PackageId != 0) {
                console.log('mainsite edit')
                alacartPack.editAlacartNOffer(alacartData, function (data) {
                    if($scope.nextButtonPressed){
                        $rootScope.proceed();

                    }else{
                        $scope.showResponse(data);
                    }
                });
            } else {
                console.log('mainsite add')
                alacartPack.addAlacartNOffer(alacartData, function (data) {
                    if($scope.nextButtonPressed){
                        toastr.success(data.message)
                        $rootScope.PackageId = data.pkgId;
                        $rootScope.action = 'edit';

                        $rootScope.proceed();
                    }else{
                        $scope.showResponse(data);
                    }
                });
            }
        }
    }

    $scope.showResponse = function(data){
        if (data.success) {
            toastr.success(data.message)
            $scope.successvisible = true;
            $rootScope.PackageId = data.pkgId;
            $rootScope.action = 'edit';

            $state.go($state.current, {packageId:$rootScope.PackageId}, {reload: $state.current});

        }
        else {
            toastr.error(data.message)
            $scope.errorvisible = true;
        }

        ngProgress.complete();
    }
});
