myApp.controller('subscriptionPackCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams, subscriptionPack ) {

    $scope.existingSubscriptionPackIds = [];
    $scope.selectedSubscriptionPlans = [];
    $scope.nextButtonPressed = 0;
   /* subscriptionPack.getSubscriptionDetails({distributionChannelId:$scope.distributionChannelId},function (subscriptionPlanData) {
        $scope.subscriptionPackPlans = angular.copy( subscriptionPlanData.subscriptionPlans );

    });*/

    var data = {
        packageId : $rootScope.PackageId,
        packageType: $rootScope.PackageType,
        parentPackageId: $rootScope.ParentPackageId
    }


    subscriptionPack.getSelectedSubscriptionPacks(data, function (selectedSubscriptionPackData) {

        $scope.selectedSubscriptionPackPlans = selectedSubscriptionPackData.selectedSubscriptionPlans;
        if( $scope.selectedSubscriptionPackPlans.length > 0 ) {
            for( i = 0; i < $scope.selectedSubscriptionPackPlans.length ; i++ ){
                $scope.selectedSubscriptionPlans.push($scope.selectedSubscriptionPackPlans[i].pss_sp_id );
                $scope.existingSubscriptionPackIds.push($scope.selectedSubscriptionPackPlans[i].pss_sp_id );
            }
        }
    });


    $scope.submitSubsPackForm = function( isValid ) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        var subscriptionPackData = {
            selectedSubscriptionPlans: $scope.selectedSubscriptionPlans,
            selectedDistributionChannel:  $rootScope.distributionChannelId,
            packageId : $rootScope.PackageId,
            packageType: $rootScope.PackageType,
            packId : $rootScope.SelectedPack,
            parentPackageId: $rootScope.ParentPackageId,
            packageName : $rootScope.PackageName,
            existingSubscriptionPackIds: $scope.existingSubscriptionPackIds
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

            subscriptionPack.addSubscriptionPackToMainSite( subscriptionPackData , function(data){
                if($scope.nextButtonPressed){
                    toastr.success(data.message );
                    $rootScope.PackageId = data.pkgId;
                    $rootScope.action = 'edit';

                    $rootScope.proceed();

                }else{
                    console.log('else in submit')

                    $scope.result(data);
                }

                ngProgress.complete();
            },function(error){
                console.log(error);
            });
        }
    }

    $scope.result = function( data ){
        console.log('submit valuepack')
        console.log($state.current)

        if(data.success){

            toastr.success(data.message );
            $rootScope.PackageId = data.pkgId;
            $rootScope.action = 'edit';
            $state.go($state.current, {packageId:$rootScope.PackageId}); //{reload: $state.current}
        }else{
            $scope.error = data.message;
            toastr.error( $scope.error );
            //$scope.errorvisible = true;
        }
    }

});