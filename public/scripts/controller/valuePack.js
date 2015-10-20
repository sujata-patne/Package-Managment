myApp.controller('valuePackCtrl', function ($scope, $rootScope, $state, ngProgress, $stateParams, valuePack ) {

    var data = {
        packageId : $rootScope.PackageId,
        packageType: $rootScope.PackageType,
        parentPackageId: $rootScope.ParentPackageId,
    }

    $scope.existingValuePackIds = [];
    $scope.selectedValuePacks = [];

    valuePack.getSelectedValuePacks(data, function (selectedValuePackData) {
        $scope.selectedValuePackPlans = selectedValuePackData.selectedValuePackPlans;
        if( $scope.selectedValuePackPlans.length > 0 ) {
            for( i = 0; i < $scope.selectedValuePackPlans.length ; i++ ){
                $scope.selectedValuePacks.push($scope.selectedValuePackPlans[i].pvs_vp_id );
                $scope.existingValuePackIds.push($scope.selectedValuePackPlans[i].pvs_vp_id );
            }
        }
    });


    $scope.submitValuePackForm = function( isValid ) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        var valuePackData = {
            selectedValuePacks: $scope.selectedValuePacks,
            selectedDistributionChannel: $rootScope.distributionChannelId,
            packageId : $rootScope.PackageId,
            packageType: $rootScope.PackageType,
            packId : $rootScope.SelectedPack,
            parentPackageId: $rootScope.ParentPackageId,
            packageName : $rootScope.PackageName,
            existingValuePackIds: $scope.existingValuePackIds
        };
        if (!$rootScope.distributionChannelId){
            toastr.error('Distribution Channel Required');
            $scope.errorvisible = true;
        }else if ($rootScope.PackageType == 1 && !$rootScope.SelectedPack){
            toastr.error('Please Select Pack.');
            $scope.errorvisible = true;
        }else if ($rootScope.PackageType == 1 && !$rootScope.PackageName){
            toastr.error('Package Name Required.');
            $scope.errorvisible = true;
        }else if (isValid) {

                valuePack.addValuePackToMainSite(valuePackData,function(data){
                    $scope.result(data);
                    ngProgress.complete();
                },function(error){
                    console.log(error);
                });
        }

    }

    $scope.result = function( data ){

        if(data.success){
           /* if( data.selectedValuePackPlans.length > 0 ) {
                $scope.existingValuePackIds = [];
                $scope.selectedValuePacks = [];
                for( i = 0; i < data.selectedValuePackPlans.length ; i++ ){
                    $scope.selectedValuePacks.push(data.selectedValuePackPlans[i].pvs_vp_id );
                    $scope.existingValuePackIds.push(data.selectedValuePackPlans[i].pvs_vp_id );
                }
            }*/
            $scope.success = data.message;
            toastr.success( $scope.success );
            $rootScope.PackageId = data.pkgId;
            $state.go($state.current, {}, {reload: $state.current});
        }else{
            $scope.error = data.message;
            toastr.error( $scope.error );
        }
    }

});