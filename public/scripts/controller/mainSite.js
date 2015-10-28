/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {

    $('.removeActiveClass').removeClass('active');
    $('#main-site').addClass('active');

    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $rootScope.PackageType = 0;
    $scope.selectedStore = [];
    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    if($stateParams.packageId){
        $rootScope.PackageId = $stateParams.packageId;
        $rootScope.action = 'edit';
    }
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
    }

    if($rootScope.previousState && new RegExp("pack").test($scope.previousState.name)
        || $rootScope.previousState && new RegExp("main-site-map").test($scope.previousState.name) ){
        $rootScope.distributionChannelId = undefined;
        console.log('previousState')
        $scope.setEmptyPackage();
    }

    if($rootScope.action !== 'edit' && $rootScope.action === undefined) {
        $rootScope.action = 'add';
        $rootScope.ParentPackageId = 0;
    }

    if($rootScope.PackageType === 0 && ($rootScope.PackageId != 0 && $rootScope.PackageId != '' && $rootScope.PackageId != undefined) && $rootScope.action != 'edit'){
        $scope.setEmptyPackage();
    }
    $scope.tabs = [
        { title:"A-La-Cart & Offer Plans", state:"main-site.alacart", active: true },
        { title:"Value Pack Plans",  state:"main-site.valuepack", active: false },
        { title:"Subscription Plans",  state:"main-site.subscription" , active: false },
        { title:"Advance Settings", state:"main-site.advancesetting" , active: false },
        { title:"Arrange Plans",  state:"main-site.arrangeplan" , active: false }
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
        console.log('index')
        console.log($index)
        $scope.tabIndex = $index;
        if($rootScope.PackageId != 0 && $rootScope.PackageId != '' && $rootScope.PackageId != undefined){
            $state.go($scope.tabs[$scope.tabIndex].state, {}, {reload: $scope.tabs[$scope.tabIndex].state});
        }else{
            $state.go($scope.tabs[$scope.tabIndex].state);
        }

        //default form display for a-la-cart and offer plan
        if($scope.tabIndex == 0){
            $state.go($scope.tabs[$scope.tabIndex]['state']);
        }

    }

    $scope.showDeliveryTypes = function(contents){
        return contents.parent_name === 'Audio' || contents.parent_name === 'Video';
    };

    MainSite.getMainSiteData(function (MainSiteData) {

        $scope.OfferData = angular.copy(MainSiteData.OfferData);
        $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
        $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);
        $scope.StorePacks = angular.copy(MainSiteData.packs);
        if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
            $scope.setEmptyPackage();

        }
    });

    $scope.showPackageData = function(){

        if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
            $scope.setEmptyPackage();

        }
        $scope.alacartPlanIds = {};
        $scope.contentTypePlanData = {};
        var params = {pkgId:$rootScope.PackageId, distributionChannelId:$rootScope.distributionChannelId,packageType:$rootScope.PackageType}

        MainSite.showPackageData(params,function (MainSiteData) {
            $scope.OfferData = angular.copy(MainSiteData.OfferData);
            $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
            $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);

            $scope.alacartPackPlans = angular.copy(MainSiteData.alacartPackPlans);

            $scope.valuePackPlans = angular.copy(MainSiteData.valuePackPlans);

            $scope.subscriptionPackPlans = angular.copy(MainSiteData.subscriptionPackPlans);

            $scope.mainSitePackageData = angular.copy(MainSiteData.mainSitePackageData.packageDetails);

            console.log('mainSitePackageData')
            console.log(MainSiteData.mainSitePackageData.packageDetails)
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
            }else{
                $scope.setEmptyPackage();
            }
            $scope.alacartNofferDetails = angular.copy(MainSiteData.mainSitePackageData.alacartNOfferDetails);
            if ($scope.alacartNofferDetails != null && $scope.alacartNofferDetails.length > 0) {
                $scope.offerId = $scope.alacartNofferDetails[0].paos_op_id;
                $scope.paosId = $scope.alacartNofferDetails[0].paos_id;
            }else{
                $scope.offerId = '';
                $scope.paosId = '';
            }
            $scope.contentTypePlanData = angular.copy(MainSiteData.mainSitePackageData.contentTypePlanData);
            if ($scope.contentTypePlanData != null && $scope.contentTypePlanData.length > 0) {
                angular.forEach($scope.contentTypePlanData, function (data) {
                    $scope.alacartPlanIds[data.pct_content_type_id] = {
                        download: data.pct_download_id,
                        streaming: data.pct_stream_id
                    };
                })
            }
            $state.go($state.current, {}, {reload: $state.current});
        })
    }

    if($rootScope.action === 'edit'){
        $scope.showPackageData();
    }

    $scope.resetForm = function () {
        $scope.selectedValuePacks = [];
        $scope.selectedSubscriptionPlans = [];
    }


});