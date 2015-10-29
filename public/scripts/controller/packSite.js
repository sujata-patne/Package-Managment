myApp.controller('packSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {

    $('.removeActiveClass').removeClass('active');
    $('#pack-site').addClass('active');

    console.log('packSiteCtrl')

    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $scope.selectedStore = [];
    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    $scope.setDistributionChannelId = 0;
    $scope.actionName = ($rootScope.PackageId != 0 && $rootScope.PackageId != '' && $rootScope.PackageId != undefined)? 'Edit':'Add';
    $scope.setEmptyPackage = function(){
        console.log('setEmptyPackage')
        $rootScope.PackageId = 0;
        $rootScope.PackageType = 1;
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
    }else{
        $rootScope.distributionChannelId = undefined;
        $scope.setDistributionChannelId = 0;
        $scope.setEmptyPackage();
    }
    if($rootScope.action !== 'edit' && $rootScope.action === undefined) {
        console.log('!edit or undefined')
        $scope.setEmptyPackage();

    }

    //if($rootScope.previousState && ($rootScope.PackageType != 1 || new RegExp("main-site").test($scope.previousState.name) || new RegExp("map-mainsite").test($scope.previousState.name) )){
    if($rootScope.previousState && !new RegExp("pack-site").test($scope.previousState.name) && !new RegExp("packageListing").test($scope.previousState.name)){

        $rootScope.distributionChannelId = undefined;
        $scope.setDistributionChannelId = 0;
        console.log('previousState')
        $scope.setEmptyPackage();
        $state.go($state.current, {packageId:undefined}, {reload:$state.current});
    }
    if($rootScope.PackageType === 1 && ($rootScope.PackageId != 0 && $rootScope.PackageId != '' && $rootScope.PackageId != undefined) && $rootScope.action != 'edit'){
        console.log("$rootScope.PackageType - " + $rootScope.PackageType)
        console.log("$rootScope.PackageId = "+$rootScope.PackageId)
        console.log("$rootScope.action - "+$rootScope.action)

        $scope.setEmptyPackage();
    }

    $scope.tabs = [
        { title:"A-La-Cart & Offer Plans", state:"pack-site.alacart", active: true },
        { title:"Value Pack Plans",  state:"pack-site.valuepack", active: false },
        { title:"Subscription Plans",  state:"pack-site.subscription" , active: false },
        { title:"Advance Settings", state:"pack-site.advancesetting" , active: false },
        { title:"Arrange Plans",  state:"pack-site.arrangeplan" , active: false },
        { title:"Individual Content",  state:"pack-site.individualcontent" , active: false }
    ];
    //default form display for a-la-cart and offer plan

    $rootScope.proceed = function() {
        if($scope.tabIndex !== ( $scope.tabs.length - 1 ) ){
            $scope.tabs[$scope.tabIndex].active = false;
            $scope.tabIndex++;
            $scope.tabs[$scope.tabIndex].active = true;
            $state.go($scope.tabs[$scope.tabIndex].state,{});//, {reload: $scope.tabs[$scope.tabIndex].state}
        }
    };

    $scope.dis = function() {
        if($scope.tabIndex === $scope.tabs.length -1){
            return true;
        }
    };

    $scope.setIndex = function($index){
        $scope.tabIndex = $index;
        $state.go($scope.tabs[$scope.tabIndex].state,  {}, {reload:false});

        //default form display for a-la-cart and offer plan
        /*if($scope.tabIndex == 0){
            $state.go($scope.tabs[$scope.tabIndex]['state']);
        }*/
    }

    $scope.showDeliveryTypes = function(contents){
        return contents.parent_name === 'Audio' || contents.parent_name === 'Video';
    };

    MainSite.getPackSiteData(function (PackSiteData) {
        //$scope.OfferData = angular.copy(PackSiteData.OfferData);
        $scope.ContentTypes = angular.copy(PackSiteData.ContentTypes);
        $scope.distributionChannels = angular.copy(PackSiteData.distributionChannels);
        $scope.StorePacks = angular.copy(PackSiteData.packs);

        if($rootScope.action !== 'edit' || $rootScope.action !== undefined){
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

        MainSite.showPackSitePackageData(params,function (PackSiteData) {
            $scope.OfferData = angular.copy(PackSiteData.OfferData);
            $scope.ContentTypes = angular.copy(PackSiteData.ContentTypes);
            $scope.distributionChannels = angular.copy(PackSiteData.distributionChannels);

            $scope.alacartPackPlans = angular.copy(PackSiteData.alacartPackPlans);

            $scope.valuePackPlans = angular.copy(PackSiteData.valuePackPlans);

            $scope.subscriptionPackPlans = angular.copy(PackSiteData.subscriptionPackPlans);

            $scope.packSitePackageData = angular.copy(PackSiteData.mainSitePackageData.packageDetails);

            if ($scope.packSitePackageData != null && $scope.packSitePackageData.length > 0) {
                $rootScope.distributionChannelId = $scope.packSitePackageData[0].sp_dc_id;
                $rootScope.PackageId = $scope.packSitePackageData[0].sp_pkg_id;
                $rootScope.PackageType = $scope.packSitePackageData[0].sp_pkg_type;
                $rootScope.PackageName = $scope.packSitePackageData[0].sp_package_name;
                $rootScope.SelectedPack = $scope.packSitePackageData[0].sp_pk_id;
            }else{
                $scope.setEmptyPackage();
            }
            $scope.alacartNofferDetails = angular.copy(PackSiteData.mainSitePackageData.alacartNOfferDetails);
            if ($scope.alacartNofferDetails != null && $scope.alacartNofferDetails.length > 0) {
                $scope.offerId = $scope.alacartNofferDetails[0].paos_op_id;
                $scope.paosId = $scope.alacartNofferDetails[0].paos_id;
            }else{
                $scope.offerId = '';
                $scope.paosId = '';
            }

            $scope.contentTypePlanData = angular.copy(PackSiteData.mainSitePackageData.contentTypePlanData);
            if ($scope.contentTypePlanData != null && $scope.contentTypePlanData.length > 0) {
                angular.forEach($scope.contentTypePlanData, function (data) {
                    $scope.alacartPlanIds[data.pct_content_type_id] = {
                        download: data.pct_download_id,
                        streaming: data.pct_stream_id
                    };
                })
            }
            console.log('setDistributionChannel '+ $scope.setDistributionChannelId != 1)
            console.log('$rootScope.PackageId '+$rootScope.PackageId )

            if( $scope.setDistributionChannelId !== 1 ){
                $rootScope.action = 'edit';
                console.log('setDistributionChannel '+$rootScope.PackageId)
                if($rootScope.PackageId != '' && $rootScope.PackageId != 0 && $rootScope.PackageId != undefined){
                    console.log(' $scope.setDistributionChannelId if 1' + $rootScope.PackageId)
                    $state.go($state.current, {packageId:$rootScope.PackageId}, {reload:$state.current});
                }else{
                    console.log(' $scope.setDistributionChannelId else 1')
                    $state.go($state.current, {packageId:undefined});
                }
            }else{
                console.log(' $scope.setDistributionChannelId else')
                $state.go($state.current, {packageId:$rootScope.PackageId});
            }
        })
    }
console.log($rootScope.action)
    if($rootScope.action === 'edit' ){
        console.log('$rootScope.action')

        $scope.showPackageData();
    }
    $scope.resetForm = function () {
        $scope.selectedValuePacks = [];
        $scope.selectedSubscriptionPlans = [];
    }

});