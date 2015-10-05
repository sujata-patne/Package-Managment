myApp.controller('subscriptionPackCtrl', function ($scope, $state, ngProgress, $stateParams, subscriptionPack ) {

    $scope.selectedSubscriptionPlans = [];
    subscriptionPack.getSubscriptionDetails(function (subscriptionPlanData) {
        $scope.subscriptionPackPlans = angular.copy( subscriptionPlanData.subscriptionPlans );
    });

    console.log( $scope.subscriptionPackPlans );
    $scope.submitValuePackForm = function( isValid ) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        var subscriptionPackData = {
            selectedValuePacks: $scope.selectedValuePacks,
            selectedDistributionChannel: $scope.selectedDistributionChannel
        };
        if (isValid) {
            if($stateParams.id){
                packData.valuePackId = $stateParams.id;
                ngProgress.start();
                subscriptionPack.editValuePackPlan( subscriptionPackData ,function(data){
                    $scope.result(data);

                },function(error){
                    console.log(error);
                });
                ngProgress.complete();
            }else{
                ngProgress.start();
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
            $scope.successvisible = true;
        }else{
            $scope.error = data.message;
            $scope.errorvisible = true;
        }
    }

});