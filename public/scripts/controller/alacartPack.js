/**
 * Created by sujata.patne on 05-10-2015.
 */

myApp.controller('alacartCtrl', function ($scope, $rootScope, $state, ngProgress, $stateParams, alacartPack) {
console.log('alacartCtrl')
    $rootScope.isChild = false;

    if( $rootScope.PackageId && $rootScope.PackageId != null && $rootScope.PackageId != undefined && $rootScope.PackageId != '') {
console.log('alacart controller ')
        var data = {
            packageId: $rootScope.PackageId,
            packageType: $rootScope.PackageType,
            parentPackageId: $rootScope.ParentPackageId,
        }

        alacartPack.getAlacartNofferDetails(data, function (alacartPackData) {
console.log('alacartPackData')
            console.log(alacartPackData)
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
            } /*else{
                $scope.alacartPlanIds = undefined;
            }*/
        });
    }

    $scope.submitForm = function (isValid) {
        console.log('$scope.alacart submit')

        if (!$rootScope.distributionChannelId) {
            toastr.error('Distribution Channel is required');
            $scope.errorvisible = true;
        } else {
            console.log('$scope.alacartPlanIds')
            console.log($scope.alacartPlanIds)
            var alacartData = {
                ContentTypes: $scope.ContentTypes,
                alacartPlansList: $scope.alacartPlanIds,
                paosId: $scope.paosId,
                offerId: $scope.offerId,
                packageId: $rootScope.PackageId,
                parentPackageId: $rootScope.ParentPackageId,
                packageType: $rootScope.PackageType,
                packId: $rootScope.packSelectedPack,
                packageName: $rootScope.packPackageName,
                distributionChannelId: $rootScope.distributionChannelId
            }
            ngProgress.start();
            if ($rootScope.PackageId != undefined && $rootScope.PackageId != null && $rootScope.PackageId != '' && $rootScope.PackageId != 0) {
                console.log('mainsite edit')
                alacartPack.editAlacartNOffer(alacartData, function (data) {
                    $scope.showResponse(data);
                });
            } else {
                console.log('mainsite add')
                alacartPack.addAlacartNOffer(alacartData, function (data) {
                    $scope.showResponse(data);
                });
            }
            /*if($rootScope.PackageType === 1 ){

                console.log( "submit " + $rootScope.PackageType)

                if ($rootScope.PackageId != undefined && $rootScope.PackageId != null && $rootScope.PackageId != '') {
                    console.log('individual edit')
                    alacartPack.editAlacartNOffer(alacartData, function (data) {
                        $scope.showResponse(data);
                    });
                } else {
                    console.log('individual add')
                    alacartPack.addAlacartNOffer(alacartData, function (data) {
                        $scope.showResponse(data);
                    });
                }
            }else{
                ngProgress.start();
                if ($rootScope.PackageId != undefined && $rootScope.PackageId != null && $rootScope.PackageId != '') {
                    console.log('mainsite edit')
                    alacartPack.editAlacartNOffer(alacartData, function (data) {
                        $scope.showResponse(data);
                    });
                } else {
                    console.log('mainsite add')
                    alacartPack.addAlacartNOffer(alacartData, function (data) {
                        $scope.showResponse(data);
                    });
                }
            }*/
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
            toastr.error(data.message)
            $scope.errorvisible = true;
        }

        ngProgress.complete();
    }
});
