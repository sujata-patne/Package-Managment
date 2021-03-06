/**
 * Created by sujata.patne on 05-10-2015.
 */

myApp.controller('alacartCtrl', function ($scope, $rootScope, $state, ngProgress, $stateParams, alacartPack) {
    
    $rootScope.isChild = false;
    $scope.nextButtonPressed = 0;
    // console.log($rootScope.tabIndex);
    $scope.tabIndex = 0;
    $scope.tabs[$scope.tabIndex].active = true;


    // 
   // if( $rootScope.PackageId && $rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '' && $rootScope.action === 'edit') {

    $scope.init = function(){
        var data = {
            packageId: $rootScope.PackageId,
            packageType: $rootScope.PackageType,
            parentPackageId: $rootScope.ParentPackageId
        }
        alacartPack.getAlacartNofferDetails(data, function (alacartPackData) {

            //$scope.alacartPackPlans = angular.copy(alacartPackData.alacartPackPlans);
            //console.log('alacartPackPlans')
            //console.log($scope.alacartPackPlans)
            $scope.alacartNofferDetails = angular.copy(alacartPackData.alacartNOfferDetails);
            if ($scope.alacartNofferDetails != null && $scope.alacartNofferDetails.length > 0) {
                $scope.offerId = $scope.alacartNofferDetails[0].paos_op_id;
                $scope.paosId = $scope.alacartNofferDetails[0].paos_id;
            } else {
                $scope.offerId = '';
                $scope.paosId = '';
            }
            $scope.contentTypePlanData = angular.copy(alacartPackData.contentTypePlanData);
            if ($scope.contentTypePlanData != null && $scope.contentTypePlanData.length > 0) {
                angular.forEach($scope.contentTypePlanData, function (data) {
                    $scope.alacartPlanIds[data.pct_content_type_id] = {
                        download: data.pct_download_id,
                        streaming: data.pct_stream_id
                    };
                })
            }
        });
    }

    if($rootScope.action === 'edit' && ($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '' )){
        $scope.init();

    }

    $scope.resetForm = function(){
        $rootScope.distributionChannelId = '';
        $rootScope.SelectedPack = '';
        $rootScope.PackageName = '';
        $scope.alacartPlanIds = [];
        $scope.offerId = '';
    }

    $scope.submitAlacartForm = function (isValid) {
        if (!$rootScope.distributionChannelId){
            toastr.error('Please select Deliver channel');
            $scope.errorvisible = true;
        }else if ($rootScope.PackageType == 1 && !$rootScope.SelectedPack){
            toastr.error('Please Select Pack');
            $scope.errorvisible = true;
        }else if ($rootScope.PackageType == 1 && !$rootScope.PackageName){
            toastr.error('Please enter package name');
            $scope.errorvisible = true;
        }else if(isValid) {
            var alacartData = {
                ContentTypes: $scope.ContentTypes,
                alacartPlansList: $scope.alacartPlanIds,
                paosId: $scope.paosId,
                offerId: $scope.offerId,
                packageId: $rootScope.PackageId,
                parentPackageId: $rootScope.ParentPackageId,
                packageType: $rootScope.PackageType,
                packId: $rootScope.SelectedPack,
                packageName: $rootScope.PackageName,
                distributionChannelId: $rootScope.distributionChannelId
            }
            ngProgress.start();
            
            if ( $rootScope.PackageId != undefined && $rootScope.PackageId != null && $rootScope.PackageId != '' && $rootScope.PackageId != 0) {
                alacartPack.editAlacartNOffer(alacartData, function (data) {
                    if($scope.nextButtonPressed){
                        $scope.showResponse(data);
                        $rootScope.proceed();
                        ngProgress.complete();
                    }else{
                        setTimeout(function(){
                            $scope.showResponse(data);
                            ngProgress.complete();
                        },1000);
                    }
                });
            } else {
                alacartPack.addAlacartNOffer(alacartData, function (data) {
                    if($scope.nextButtonPressed){
                        // 
                        $scope.showResponse(data);
                        $rootScope.proceed();
                        ngProgress.complete();

                    }else{
                        setTimeout(function(){
                            $scope.showResponse(data);
                            ngProgress.complete();
                        },1000);
                    }
                });
            }
        }
    }

    

    $scope.showResponse = function(data){
        if (data.success) {
            toastr.success(data.message)
            $scope.successvisible = true;
            $rootScope.PackageId = data.pkgId;
            $rootScope.action = 'edit';
            $rootScope.disableDeliveryChannel = true;
            $stateParams.packageId = $rootScope.PackageId;
            
            if(!$scope.nextButtonPressed){
                $state.go($state.current, {packageId:$rootScope.PackageId,  location: true, inherit:false});
            }
        }else {
            toastr.error(data.message)
            $scope.errorvisible = true;
        }
        ngProgress.complete();
    }
});
