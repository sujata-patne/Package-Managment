myApp.controller('subscriptionPackCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams, subscriptionPack ) {

   /* subscriptionPack.getSubscriptionDetails({distributionChannelId:$scope.distributionChannelId},function (subscriptionPlanData) {
        $scope.subscriptionPackPlans = angular.copy( subscriptionPlanData.subscriptionPlans );

    });*/


 //Watching changes in Package Id
 
    $rootScope.$watch('PackageId',function(value,old) {
        $scope.init();
    }, true);

    $scope.init = function(){

        $scope.existingSubscriptionPackIds = [];
        $scope.selectedSubscriptionPlans = [];
        $scope.nextButtonPressed = 0;

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

    }
    

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
            toastr.error('Please select Deliver channel');
            $scope.errorvisible = true;
        }else if ($rootScope.PackageType == 1 && !$rootScope.SelectedPack){
            toastr.error('Please Select Pack');
            $scope.errorvisible = true;
        }else if ($rootScope.PackageType == 1 && !$rootScope.PackageName){
            toastr.error('Please enter package name');
            $scope.errorvisible = true;
        }else if (isValid) {

            subscriptionPack.addSubscriptionPackToMainSite( subscriptionPackData , function(data){
                if($scope.nextButtonPressed){
                    $scope.showResponse(data);
                    $rootScope.proceed();

                }else{
                    //console.log('else in submit')
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

            toastr.success(data.message );
            $rootScope.PackageId = data.pkgId;
            $rootScope.action = 'edit';
            //reload is not used then records get inserted when submitted on the same tab without refreshing or changing tabs.
            // $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId},{reload: $state.current}); //{reload: $state.current}
                        $state.go($state.current, {packageId:$rootScope.PackageId}); //,{reload: $state.current}

        }else{
            $scope.error = data.message;
            toastr.error( $scope.error );
            //$scope.errorvisible = true;
        }
    }
*/
 $scope.showResponse = function(data){
        if (data.success) {
            toastr.success(data.message)
            $scope.successvisible = true;
            $rootScope.PackageId = data.pkgId;
            $rootScope.action = 'edit';
            $rootScope.disableDeliveryChannel = true; // used for disabling delivery channel and select pack dropdown.
            // $state.go($state.current, {packageId:$rootScope.PackageId},{reload: $state.current}); //,{reload: $state.current}
            $stateParams.packageId = $rootScope.PackageId;
             if(!$scope.nextButtonPressed){
                $state.go($state.current, {packageId:$rootScope.PackageId,  location: true, inherit:false});
            }
        }
        else {
            toastr.error(data.message)
            $scope.errorvisible = true;
        }
        ngProgress.complete();
    }
     $scope.resetForm = function(){
        $scope.selectedSubscriptionPlans = [];
    }

});