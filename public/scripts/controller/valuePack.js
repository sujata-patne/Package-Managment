myApp.controller('valuePackCtrl', function ($scope, $state, ngProgress, $stateParams, valuePack ) {
    $scope.submitValuePackForm = function( isValid ) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        var valuePackData = {
            selectedValuePacks: $scope.selectedValuePacks,
            selectedDistributionChannel: $scope.selectedDistributionChannel
        };
        if (isValid) {
            if($stateParams.id){
                packData.valuePackId = $stateParams.id;
                ngProgress.start();
                valuePack.editValuePackPlan(valuePackData,function(data){
                    $scope.result(data);

                },function(error){
                    console.log(error);
                });
                ngProgress.complete();
            }else{
                ngProgress.start();
                valuePack.addValuePackToMainSite(valuePackData,function(data){
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