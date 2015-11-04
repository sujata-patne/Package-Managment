/**
 * Created by sujata.patne on 19-10-2015.
 */
myApp.controller('mapMainsiteCtrl', function ($scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {
    //console.log('mapMainsiteCtrl')
    $rootScope.isChild = true;
    $scope.actionName = ($stateParams.packageId != 0 && $stateParams.packageId != '' && $stateParams.packageId != undefined)? 'Edit':'Add';

    $('.removeActiveClass').removeClass('active');
    $('#map-mainsite').addClass('active');
    $scope.setEmptyPackage = function(){
        //console.log('setEmptyPackage')
        $rootScope.PackageId = 0;
        $rootScope.PackageType = 0;
        $rootScope.action = 'add';
        $rootScope.ParentPackageId = 0;
        $scope.offerId = '';
        $scope.paosId = '';
        $rootScope.PackageName = '';
        $rootScope.SelectedPack = undefined;
        //$scope.setDistributionChannelId = 0;
    }
    if($stateParams.packageId){
            $scope.isEdit = true;
    }

    /*if($stateParams.packageId){

    if($stateParams.packageId){
        $scope.isEdit = true;

        $rootScope.PackageId = $stateParams.packageId;
        $rootScope.action = 'edit';
    }
    if($rootScope.action !== 'edit' && $rootScope.action === undefined) {
        console.log('!edit or undefined')
        $scope.setEmptyPackage();
    }*/

  $scope.checkState = function () {
        if ($scope.previousState.name && !new RegExp("map-mainsite").test($scope.previousState.name)
            && !new RegExp("packageListing").test($scope.previousState.name)) {
           // console.log(' $rootScope.previousState 1')

            $rootScope.distributionChannelId = undefined;
            $scope.setDistributionChannelId = 0;
            $scope.setEmptyPackage();
            $state.go($state.current, {packageId: undefined}); //, {reload:$state.current}

        } else if (new RegExp("packageListing").test($scope.previousState.name)
            && ($stateParams.packageId != 0 && $stateParams.packageId != undefined && $stateParams.packageId != '')) {
            //console.log(' $rootScope.previousState 2')
            $rootScope.PackageId = $stateParams.packageId;
            $rootScope.action = 'edit';

        }else if (new RegExp("packageListing").test($scope.previousState.name)
            && (!($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            || (!$rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''))) {

            //console.log(' $rootScope.previousState 3')
            $rootScope.distributionChannelId = undefined;
            $scope.setEmptyPackage();

        } else if ( (new RegExp("map-mainsite").test($scope.previousState.name) || new RegExp("map-mainsite").test($state.current.name))
            && (($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            || ($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''))) {

            //console.log(' $rootScope.previousState 4')
            $rootScope.PackageId = $stateParams.packageId;
            $rootScope.action = 'edit';
            $scope.showPackageData();

        }else if ( (new RegExp("map-mainsite").test($scope.previousState.name) || new RegExp("map-mainsite").test($state.current.name))
            && (!($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            || (!$rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''))) {
           // console.log(' $rootScope.previousState 5')
                        // $state.go($scope.tabs[$scope.tabIndex].state, {packageId: undefined}); //, {reload:$state.current}

            
            $scope.setEmptyPackage();

        }else if(($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
         && ($rootScope.action  !== '' && $rootScope.action !== 'edit' )){
         //console.log(' $rootScope.previousState 6')

         $rootScope.PackageId = $stateParams.packageId;
         $rootScope.action = 'edit';
         $scope.showPackageData();
         }else if (($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '')
            && ($rootScope.action !== '' && $rootScope.action !== 'edit' )) {
           // console.log(' $rootScope.previousState 7'  )
            $scope.setEmptyPackage();
        } /*else{
            console.log(' $rootScope.previousState 8')

            $scope.setEmptyPackage();
        }*/
    }

    //Changing content types  based on packId : 
    $rootScope.SelectedPack = undefined;
    MainSite.getStoreDetails($rootScope.SelectedPack,function (MainSiteData) {
            $scope.checkState();
        $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);
        $scope.StorePacks = angular.copy(MainSiteData.packs);

        if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
            $scope.setEmptyPackage();
        }
    },
    function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    $scope.getPackageData = function(){
        //console.log('getPackageData');
        $scope.setDistributionChannelId = 1;
        $rootScope.PackageId = '';
        //console.log('$scope.setDistributionChannelId' + $scope.setDistributionChannelId)
        $scope.showPackageData();
       // console.log('getPackageData 1');
        //$state.go('main-site', {packageId:$rootScope.PackageId});
    }

    $scope.showPackageData = function(){
        if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
            $scope.setEmptyPackage();
        }
        $scope.alacartPlanIds = {};
        $scope.contentTypePlanData = {};
        var params = {pkgId:$rootScope.PackageId, distributionChannelId:$rootScope.distributionChannelId,packageType:$rootScope.PackageType}
        //console.log('params')
        //console.log(params)
        MainSite.showPackageData(params,function (MainSiteData) {

            //$scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);

            $scope.mainSitePackageData = angular.copy(MainSiteData.mainSitePackageData.packageDetails);

            if ($scope.mainSitePackageData != null && $scope.mainSitePackageData.length > 0) {
               // console.log('if')
                $rootScope.distributionChannelId = $scope.mainSitePackageData[0].sp_dc_id;
                $rootScope.PackageId = $scope.mainSitePackageData[0].sp_pkg_id;
                $rootScope.PackageType = $scope.mainSitePackageData[0].sp_pkg_type;
                $rootScope.PackageName = $scope.mainSitePackageData[0].sp_package_name;

                $rootScope.SelectedPack = $scope.mainSitePackageData[0].sp_pk_id;
                if($rootScope.action === 'edit') {
                    $rootScope.ParentPackageId = $scope.mainSitePackageData[0].sp_parent_pkg_id;
                }

            }else {
                $scope.setEmptyPackage();
            }
            //console.log("ROOT::"+$rootScope.PackageId);
            $scope.setPackageData()
        })
    }

    if($rootScope.action === 'edit'){
        $scope.showPackageData();
    }
    $scope.setPackageData = function(){
        if($rootScope.isChild === true && $rootScope.action !== 'edit'){
            $rootScope.ParentPackageId = $rootScope.PackageId;
            if($rootScope.ParentPackageId != '' || $rootScope.ParentPackageId != 0 || $rootScope.ParentPackageId != undefined){
                
                $rootScope.PackageId = 0;
                $rootScope.PackageName = '';
                $rootScope.SelectedPack = undefined;
            }
        }
        if($rootScope.isChild === false  && $rootScope.action !== 'edit'){
            if($rootScope.ParentPackageId != '' && $rootScope.ParentPackageId != 0 && $rootScope.ParentPackageId != undefined) {
                $rootScope.PackageId = $rootScope.ParentPackageId;
            }
            if($rootScope.PackageId != '' || $rootScope.PackageId != 0 || $rootScope.PackageId != undefined) {
                
                $rootScope.ParentPackageId = 0;
            }
        }

    }
    $scope.resetForm = function(){
        $rootScope.distributionChannelId = '';
        $rootScope.SelectedPack = '';
        $rootScope.PackageName = '';
    }
    $scope.$watch('distributionChannelId',function(){
        if(($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            && ($rootScope.action  !== '' && $rootScope.action !== 'edit' )){
            //console.log(' $rootScope.previousState 3')

            $rootScope.PackageId = $stateParams.packageId;
            $rootScope.action = 'edit';
            $scope.showPackageData();
        }
    }, {},true);
    $scope.submitMainsiteForm = function (isValid) {

        if (!$rootScope.distributionChannelId) {
            toastr.error('Distribution Channel is required');
            $scope.errorvisible = true;
        }else if (!$rootScope.SelectedPack) {
            toastr.error('Please select Pack');
            $scope.errorvisible = true;
        }else if (!$rootScope.PackageName) {
            toastr.error('Package Title is required');
            $scope.errorvisible = true;
        }else if (!$rootScope.ParentPackageId) {
            toastr.error('Please Create Mainsite Package before mapping.');
            $scope.errorvisible = true;
        }  else {
            var alacartData = {
                isChild: $rootScope.isChild,
                packageId: $rootScope.PackageId,
                parentPackageId: $rootScope.ParentPackageId,
                packageType: $rootScope.PackageType,
                packId: $rootScope.SelectedPack,
                packageName: $rootScope.PackageName,
                distributionChannelId: $rootScope.distributionChannelId
            }

            ngProgress.start();
            if ($rootScope.PackageId != undefined && $rootScope.PackageId != null && $rootScope.PackageId != '' && $rootScope.PackageId != 0) {
                 MainSite.editAlacartNOffer(alacartData, function (data) {
                    $scope.showMainsiteResponse(data);
                });
            } else {
                 MainSite.addAlacartNOffer(alacartData, function (data) {
                    $scope.showMainsiteResponse(data);
                });
            }
        }
    }

    $scope.showMainsiteResponse = function(data){
        if (data.success) {
            toastr.success(data.message)
            $scope.successvisible = true;
            //On submit form should get cleared.
             $rootScope.distributionChannelId = undefined;
            $scope.setEmptyPackage();
            
             $state.go($state.current, {packageId:undefined},{reload:true});

        }
        else {
            toastr.error(data.message)
            $scope.errorvisible = true;
        }

        ngProgress.complete();
    }

    if($stateParams.packageId > 0 && ($rootScope.action = 'edit')){
        $scope.disableDeliveryChannel= true
    }else{
        $scope.disableDeliveryChannel= false
    }
});
