/**
 * Created by sujata.patne on 19-10-2015.
 */
myApp.controller('mapMainsiteCtrl', function ($scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {
    $rootScope.isChild = true;
    console.log('mapMainsite' + $rootScope.isChild)

    //$scope.setPackageData()
console.log($state.current)
    $scope.submitMainsiteForm = function (isValid) {
        console.log('$scope.mainsite submit')
        if (!$rootScope.distributionChannelId) {
            toastr.error('Distribution Channel is required');
            $scope.errorvisible = true;
        } else {
            var alacartData = {
                isChild: $rootScope.isChild,
                packageId: $rootScope.PackageId,
                parentPackageId: $rootScope.ParentPackageId,
                packageType: $rootScope.PackageType,
                packId: $rootScope.SelectedPack,
                packageName: $rootScope.PackageName,
                distributionChannelId: $rootScope.distributionChannelId
            }

            ngProgress.start();
            if ($rootScope.PackageId != undefined && $rootScope.PackageId != null && $rootScope.PackageId != '' && $rootScope.PackageId != 0) {
                console.log('mainsite edit')
                MainSite.editAlacartNOffer(alacartData, function (data) {
                    $scope.showMainsiteResponse(data);
                });
            } else {
                console.log('mainsite add')
                MainSite.addAlacartNOffer(alacartData, function (data) {
                    $scope.showMainsiteResponse(data);
                });
            }
        }
    }

    $scope.showMainsiteResponse = function(data){
        if (data.success) {
            toastr.success(data.message)
            $scope.successvisible = true;
            $rootScope.PackageId = data.pkgId;
            $state.go($state.current, {}, {reload: $state.current});
        }
        else {
            toastr.error(data.message)
            $scope.errorvisible = true;
        }

        ngProgress.complete();
    }
});
