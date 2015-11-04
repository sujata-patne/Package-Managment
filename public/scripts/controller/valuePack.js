myApp.controller('valuePackCtrl', function ($scope, $rootScope, $state, ngProgress, $stateParams, valuePack ) {
    
    // console.log($rootScope.tabIndex);
 //Watching changes in Package Id
    $rootScope.$watch('PackageId',function(value,old) {
        $scope.init();
    }, true);
    
    $scope.init = function(){
        $scope.nextButtonPressed = 0;
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
    }
    

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
            valuePack.saveValuePackToMainSite(valuePackData,function(data){
                if($scope.nextButtonPressed){
                    $scope.showResponse(data);
                    $rootScope.proceed();
                    
                }else{
                   // console.log('else in submit')
                    $scope.showResponse(data);
                }
                ngProgress.complete();
            },function(error){
                console.log(error);
            });
        }
    }

    /*$scope.result = function( data ){
         if(data.success){
            $scope.success = data.message;
            toastr.success( $scope.success );
            $rootScope.PackageId = data.pkgId;
            $rootScope.action = 'edit';
            //reload is not used then records get inserted when submitted on the same tab without refreshing or changing tabs.
            // $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId},{reload: $state.current}); //{reload: $state.current}
                        $state.go($state.current, {packageId:$rootScope.PackageId}); //,{reload: $state.current}

        }else{
            $scope.error = data.message;
            toastr.error( $scope.error );
        }
    }*/

 $scope.showResponse = function(data){
        if (data.success) {
            toastr.success(data.message)
            $scope.successvisible = true;
            
            $rootScope.PackageId = data.pkgId;

            $rootScope.action = 'edit';
            // alert($scope.tabIndex);
            $rootScope.disableDeliveryChannel = true; // used for disabling delivery channel and select pack dropdown.
            $stateParams.packageId = $rootScope.PackageId;
            if(!$scope.nextButtonPressed){
                $state.go($state.current, {packageId:$rootScope.PackageId,  location: true, inherit:false});
            }
             //,{reload: $state.current}
        }
        else {
            toastr.error(data.message)
            $scope.errorvisible = true;
        }
        ngProgress.complete();
    }
    $scope.resetForm = function(){
        $scope.selectedValuePacks = [];
    }

});