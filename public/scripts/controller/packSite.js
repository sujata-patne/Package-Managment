myApp.controller('packSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {
    console.log('packsite')
    $rootScope.ParentPackageId = 0;
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";

    $scope.selectedStore = [];

    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    $rootScope.PackageName = '';
    $rootScope.SelectedPack = '';
    $rootScope.PackageType = 1;

    $('.removeActiveClass').removeClass('active');

    $('#pack-site').addClass('active');
    $scope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
        //save the previous state in a rootScope variable so that it's accessible from everywhere
        $scope.previousState = from;
        if($scope.previousState && new RegExp("main-site").test($scope.previousState.name) || $scope.previousState && new RegExp("main-site-map").test($scope.previousState.name) ){
            console.log($scope.previousState.name +" : "+ $rootScope.action)

            $rootScope.PackageId = 0;
            $rootScope.distributionChannelId = undefined;
            $rootScope.PackageType = 1;
            $rootScope.action = 'add';
            $rootScope.ParentPackageId = 0;
            $scope.offerId = '';
            $scope.paosId = '';
            $rootScope.PackageName = '';
            $rootScope.SelectedPack = undefined;
        }
    });

    if($rootScope.PackageType === 1 && $rootScope.PackageId != 0 && $rootScope.action != 'edit'){
        console.log('$rootScope.PackageType')

        $rootScope.PackageId = undefined;
        $rootScope.distributionChannelId = undefined;
        $rootScope.PackageType = undefined;
        $rootScope.ParentPackageId = 0;
        $rootScope.action = 'add';
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

    $scope.proceed = function() {

        if($scope.tabIndex !== ( $scope.tabs.length - 1 ) ){
            $scope.tabs[$scope.tabIndex].active = false;
            $scope.tabIndex++;
            $scope.tabs[$scope.tabIndex].active = true;
            $state.transitionTo($scope.tabs[$scope.tabIndex].state);
        }
    };

    $scope.dis = function() {
        if($scope.tabIndex === $scope.tabs.length -1){
            return true;
        }
    };

    $scope.setIndex = function($index){
        $scope.tabIndex = $index;
        $state.transitionTo($scope.tabs[$scope.tabIndex].state);
        //default form display for a-la-cart and offer plan
        $state.transitionTo($scope.tabs[$scope.tabIndex]['state']);
    }

    $scope.showDeliveryTypes = function(contents){
        return contents.parent_name === 'Audio' || contents.parent_name === 'Video';
    };

    MainSite.getPackSiteData(function (PackSiteData) {
        console.log('packsite ' + $rootScope.action)
        if($rootScope.action !== 'edit' || $rootScope.action !== undefined){
            delete $rootScope.packDistributionChannelId;
            delete $rootScope.PackageId;
            delete $rootScope.SelectedPack;
            delete $rootScope.PackageName;
            $rootScope.PackageType = 1;

            $scope.offerId = undefined;
            $scope.paosId = undefined;
        }

        $scope.OfferData = angular.copy(PackSiteData.OfferData);
        $scope.ContentTypes = angular.copy(PackSiteData.ContentTypes);
        $scope.distributionChannels = angular.copy(PackSiteData.distributionChannels);
        $scope.StorePacks = angular.copy(PackSiteData.packs);

    });

    $scope.showPackageData = function(){
        console.log($rootScope.action !== 'edit' &&  $rootScope.action !== undefined)
        if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
            delete $rootScope.PackageId;
            delete $rootScope.SelectedPack;
            delete $rootScope.PackageName;
            $rootScope.PackageType = 1;
            $scope.offerId = undefined;
            $scope.paosId = undefined;

        }
        $scope.alacartPlanIds = {};
        $scope.contentTypePlanData = {};

        var params = {distributionChannelId:$rootScope.distributionChannelId,packageType:$rootScope.PackageType}

        MainSite.showPackSitePackageData(params,function (PackSiteData) {
            console.log(PackSiteData)
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
            }
            $scope.alacartNofferDetails = angular.copy(PackSiteData.mainSitePackageData.alacartNOfferDetails);
            if ($scope.alacartNofferDetails != null && $scope.alacartNofferDetails.length > 0) {
                $scope.offerId = $scope.alacartNofferDetails[0].paos_op_id;
                $scope.paosId = $scope.alacartNofferDetails[0].paos_id;
            }else{
                $scope.alacartNofferDetails = undefined;
                $scope.offerId = undefined;
                $scope.paosId = undefined;
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
        })
        $state.go($state.current, {}, {reload: $state.current}); //'dcId':$rootScope.distributionChannelId

    }

    if($rootScope.action === 'edit'){
        $scope.showPackageData();
    }
    $scope.resetForm = function () {
        $scope.selectedValuePacks = [];
        $scope.selectedSubscriptionPlans = [];
    }

});
