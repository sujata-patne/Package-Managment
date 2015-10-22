/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {

    console.log('mainsite' + $rootScope.action)

    console.log('Mainsite child' + $rootScope.isChild)

    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $rootScope.PackageType = 0;
    $scope.selectedStore = [];
    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    $scope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
        //save the previous state in a rootScope variable so that it's accessible from everywhere
        $scope.previousState = from;

        if($scope.previousState && new RegExp("pack-site").test($scope.previousState.name) || $scope.previousState && new RegExp("main-site-map").test($scope.previousState.name) ){

            $rootScope.PackageId = 0;
            $rootScope.distributionChannelId = undefined;
            $rootScope.PackageType = 0;
            $rootScope.action = 'add';
            $rootScope.ParentPackageId = 0;
            $scope.offerId = '';
            $scope.paosId = '';
            $rootScope.PackageName = '';
            $rootScope.SelectedPack = undefined;
        }
    });

    if($rootScope.action !== 'edit' && $rootScope.action === undefined) {
        $rootScope.action = 'add';
        $rootScope.ParentPackageId = 0;
    }
    $('.removeActiveClass').removeClass('active');
    $('#main-site').addClass('active');

    if($rootScope.PackageType === 0 && $rootScope.PackageId != 0 && $rootScope.action != 'edit'){
        $rootScope.PackageId = 0;
        $rootScope.distributionChannelId = undefined;
        $rootScope.PackageType = undefined;
        $rootScope.action = 'add';
        $rootScope.ParentPackageId = 0;
        $scope.offerId = '';
        $scope.paosId = '';
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
            $state.go($scope.tabs[$scope.tabIndex].state,{}, {reload: $state.current});
            console.log('next Pressed')
            console.log($scope.tabIndex)
        }
    };

    $scope.dis = function() {
        if($scope.tabIndex === $scope.tabs.length -1){
            return true;
        }
    };

    $scope.setIndex = function($index){
        $scope.tabIndex = $index;
        $state.go($scope.tabs[$scope.tabIndex].state);
        //default form display for a-la-cart and offer plan
        $state.go($scope.tabs[$scope.tabIndex]['state']);
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
            $rootScope.distributionChannelId = undefined;
            $rootScope.PackageId = 0;
            $rootScope.PackageType = 0;
            $rootScope.PackageName = '';
            $rootScope.SelectedPack = undefined;

            $scope.offerId = '';
            $scope.paosId = '';
        }
    });

    $scope.showPackageData = function(){

        if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
            $rootScope.PackageId = 0;
            $scope.offerId = '';
            $scope.paosId = '';
            $rootScope.PackageType = 0;
        }
        $scope.alacartPlanIds = {};
        $scope.contentTypePlanData = {};
        var params = {distributionChannelId:$rootScope.distributionChannelId,packageType:$rootScope.PackageType}; //pkgId:$rootScope.PackageId,

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
                console.log('else')
                $rootScope.PackageId = 0;
                $rootScope.PackageType = 0;
                $rootScope.ParentPackageId = 0;
                $rootScope.PackageName = '';
                $rootScope.SelectedPack = undefined;

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

            $state.go($state.current, {}, {reload: $state.current}); //'dcId':$rootScope.distributionChannelId

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