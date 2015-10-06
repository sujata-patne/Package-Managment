myApp.controller('subscriptionPackCtrl', function ($scope, $state, ngProgress, $stateParams, subscriptionPack ) {

    $scope.selectedSubscriptionPlans = [];
    subscriptionPack.getSubscriptionDetails(function (subscriptionPlanData) {
        console.log( "subscriptionPackPlans" );
        console.log( subscriptionPlanData );
        $scope.subscriptionPackPlans = angular.copy( subscriptionPlanData.subscriptionPlans );
    });

    var data = {
        packageId : $scope.PackageId,
        packageType: $scope.PackageType
    }

    $scope.existingSubscriptionPackIds = [];

    subscriptionPack.getSelectedSubscriptionPacks(data, function (selectedSubscriptionPackData) {
        console.log( "selectedSubscriptionPackData" );
        console.log( selectedSubscriptionPackData );
        $scope.selectedSubscriptionPackPlans = selectedSubscriptionPackData.selectedSubscriptionPlans;
        if( $scope.selectedSubscriptionPackPlans.length > 0 ) {
            for( i = 0; i < $scope.selectedSubscriptionPackPlans.length ; i++ ){
                $scope.selectedSubscriptionPlans.push($scope.selectedSubscriptionPackPlans[i].pss_sp_id );
                console.log( $scope.selectedSubscriptionPlans );
                $scope.existingSubscriptionPackIds.push($scope.selectedSubscriptionPackPlans[i].pss_sp_id );
            }
        }
    });

    console.log( $scope.selectedSubscriptionPlans );

    $scope.submitSubsPackForm = function( isValid ) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        var subscriptionPackData = {
            selectedSubscriptionPlans: $scope.selectedSubscriptionPlans,
            selectedDistributionChannel: $scope.distributionChannelId,
            packageId : $scope.PackageId,
            existingSubscriptionPackIds: $scope.existingSubscriptionPackIds
        };
        if (isValid) {
            if($stateParams.id){
                packData.valuePackId = $stateParams.id;
                ngProgress.start();
                subscriptionPack.editSubscriptionPack( subscriptionPackData ,function(data){
                    $scope.result(data);

                },function(error){
                    console.log(error);
                });
                ngProgress.complete();
            }else{
                ngProgress.start();
                console.log( "subscriptionPackData" );
                console.log( subscriptionPackData );
                subscriptionPack.addSubscriptionPackToMainSite( subscriptionPackData , function(data){
                    console.log( data );
                    $scope.result(data);
                    ngProgress.complete();
                },function(error){
                    console.log(error);
                });
            }
        }

    }

    $scope.result = function( data ){

        if(data.success){
            //$scope.getResultData(data);
            $scope.success = data.message;
            //$scope.successvisible = true;
            toastr.success( $scope.success );
        }else{
            $scope.error = data.message;
            toastr.error( $scope.error );
            //$scope.errorvisible = true;
        }
    }

});