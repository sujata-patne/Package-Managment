myApp.controller('subscriptionPackCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams, subscriptionPack ) {

    $scope.existingSubscriptionPackIds = [];
    $scope.selectedSubscriptionPlans = [];

   /* subscriptionPack.getSubscriptionDetails({distributionChannelId:$scope.distributionChannelId},function (subscriptionPlanData) {
        $scope.subscriptionPackPlans = angular.copy( subscriptionPlanData.subscriptionPlans );

    });*/

    var data = {
        packageId : $rootScope.PackageId,
        packageType: $scope.PackageType
    }


    subscriptionPack.getSelectedSubscriptionPacks(data, function (selectedSubscriptionPackData) {

        $scope.selectedSubscriptionPackPlans = selectedSubscriptionPackData.selectedSubscriptionPlans;
        if( $scope.selectedSubscriptionPackPlans.length > 0 ) {
            for( i = 0; i < $scope.selectedSubscriptionPackPlans.length ; i++ ){
                $scope.selectedSubscriptionPlans.push($scope.selectedSubscriptionPackPlans[i].pss_sp_id );
                //console.log( $scope.selectedSubscriptionPlans );
                $scope.existingSubscriptionPackIds.push($scope.selectedSubscriptionPackPlans[i].pss_sp_id );
            }
        }
    });


    $scope.submitSubsPackForm = function( isValid ) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        var subscriptionPackData = {
            selectedSubscriptionPlans: $scope.selectedSubscriptionPlans,
            selectedDistributionChannel: $scope.distributionChannelId,
            packageId : $rootScope.PackageId,
            existingSubscriptionPackIds: $scope.existingSubscriptionPackIds
        };
        if (isValid) {
            subscriptionPack.addSubscriptionPackToMainSite( subscriptionPackData , function(data){
                console.log( data );
                $scope.result(data);
                ngProgress.complete();
            },function(error){
                console.log(error);
            });
        }
    }

    $scope.result = function( data ){
        if(data.success){

            /*if( data.selectedSubscriptionPackPlans.length > 0 ) {
                $scope.existingSubscriptionPackIds = [];
                $scope.selectedSubscriptionPlans = [];

                for( i = 0; i < data.selectedSubscriptionPackPlans.length ; i++ ){
                    $scope.selectedSubscriptionPlans.push(data.selectedSubscriptionPackPlans[i].pss_sp_id );
                    //console.log( $scope.selectedSubscriptionPlans );
                    $scope.existingSubscriptionPackIds.push(data.selectedSubscriptionPackPlans[i].pss_sp_id );
                }
                $scope.success = data.message;
            }else{
                $scope.success = 'Package Added successfully.';
            }*/
            toastr.success( $scope.success );
            $rootScope.PackageId = data.pkgId;
            $state.go($state.current, {}, {reload: $state.current});
        }else{
            $scope.error = data.message;
            toastr.error( $scope.error );
            //$scope.errorvisible = true;
        }
    }

});