myApp.controller('valuePackCtrl', function ($scope, $state, ngProgress, $stateParams, valuePack ) {

    var data = {
       packageId : $scope.PackageId,
       packageType: $scope.PackageType
    }

    $scope.existingValuePackIds = [];

    valuePack.getSelectedValuePacks(data, function (selectedValuePackData) {
        $scope.selectedValuePackPlans = selectedValuePackData.selectedValuePackPlans;
        if( $scope.selectedValuePackPlans.length > 0 ) {
            for( i = 0; i < $scope.selectedValuePackPlans.length ; i++ ){
                //$scope.selectedValuePacks.push($scope.selectedValuePackPlans[i].pvs_vp_id );
                $scope.existingValuePackIds.push($scope.selectedValuePackPlans[i].pvs_vp_id );
            }
        }
    });

    $scope.submitValuePackForm = function( isValid ) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        var valuePackData = {
            selectedValuePacks: $scope.selectedValuePacks,
            selectedDistributionChannel: $scope.distributionChannelId,
            packageId : $scope.PackageId,
            existingValuePackIds: $scope.existingValuePackIds
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
            toastr.success( $scope.success );
        }else{
            $scope.error = data.message;
            toastr.error( $scope.error );
        }
    }

});