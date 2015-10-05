myApp.controller('subscriptionPackCtrl', function ($scope, $state, ngProgress, $stateParams, subscriptionPack ) {

    $scope.selectedSubscriptionPlans = [];
    subscriptionPack.getSubscriptionDetails(function (subscriptionPlanData) {
        console.log( "subscriptionPackPlans" );
        console.log( subscriptionPlanData );
        $scope.subscriptionPackPlans = angular.copy( subscriptionPlanData.subscriptionPlans );
    });

    $scope.submitSubsPackForm = function( isValid ) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        var subscriptionPackData = {
            selectedSubscriptionPlans: $scope.selectedSubscriptionPlans,
            selectedDistributionChannel: $scope.distributionChannelId
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