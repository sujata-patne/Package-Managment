/**
 * Created by sujata.patne on 19-10-2015.
 */
myApp.controller('mapMainsiteCtrl', function ($scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {
    console.log('mapMainsiteCtrl')
    $rootScope.isChild = true;
    $('.removeActiveClass').removeClass('active');
    $('#map-mainsite').addClass('active');
    $scope.setEmptyPackage = function(){
        console.log('setEmptyPackage')
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
        $rootScope.PackageId = $stateParams.packageId;
        $rootScope.action = 'edit';
    }
    if($rootScope.action !== 'edit' && $rootScope.action === undefined) {
        console.log('!edit or undefined')
        $scope.setEmptyPackage();
    }

    if($rootScope.previousState && !new RegExp("map-mainsite").test($scope.previousState.name) && !new RegExp("packageListing").test($scope.previousState.name)){
            //if($rootScope.previousState && (!new RegExp("main-site").test($scope.previousState.name) && $rootScope.action !== 'edit' )){
        $rootScope.distributionChannelId = undefined;
        $scope.setDistributionChannelId = 0;
        console.log('previousState')
        $scope.setEmptyPackage();
        $state.go($state.current, {packageId:undefined}, {reload:$state.current});
    }
    if($rootScope.PackageType === 0 && ($rootScope.PackageId != 0 && $rootScope.PackageId != '' && $rootScope.PackageId != undefined) && $rootScope.action != 'edit'){
        console.log("$rootScope.PackageType - " + $rootScope.PackageType)
        console.log("$rootScope.PackageId = "+$rootScope.PackageId)
        console.log("$rootScope.action - "+$rootScope.action)

        $scope.setEmptyPackage();
    }

    MainSite.getMainSiteData(function (MainSiteData) {
        $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);
        $scope.StorePacks = angular.copy(MainSiteData.packs);

        if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
            $scope.setEmptyPackage();
        }
    });
    $scope.getPackageData = function(){
        console.log('getPackageData');
        $scope.setDistributionChannelId = 1;
        $rootScope.PackageId = '';
        console.log('$scope.setDistributionChannelId' + $scope.setDistributionChannelId)
        $scope.showPackageData();
        console.log('getPackageData 1');

        //$state.go('main-site', {packageId:$rootScope.PackageId});

    }
    $scope.showPackageData = function(){
        if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
            $scope.setEmptyPackage();
        }
        $scope.alacartPlanIds = {};
        $scope.contentTypePlanData = {};
        var params = {pkgId:$rootScope.PackageId, distributionChannelId:$rootScope.distributionChannelId,packageType:$rootScope.PackageType}
        console.log('params')
        console.log(params)
        MainSite.showPackageData(params,function (MainSiteData) {

            $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);

            $scope.mainSitePackageData = angular.copy(MainSiteData.mainSitePackageData.packageDetails);

            if ($scope.mainSitePackageData != null && $scope.mainSitePackageData.length > 0) {
                console.log('if')
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
                $rootScope.PackageId = undefined;
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
            $rootScope.PackageId = data.pkgId;
            $rootScope.action = 'add';

            //$scope.showPackageData();
            $state.go($state.current, {packageId:undefined},{reload:true});

        }
        else {
            toastr.error(data.message)
            $scope.errorvisible = true;
        }

        ngProgress.complete();
    }
});
