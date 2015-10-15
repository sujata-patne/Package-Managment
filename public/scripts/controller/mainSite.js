/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {
    console.log('mainsite')
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $scope.sequence = [];

    $scope.selectedStore = [];
    $rootScope.PackageType = 0;
    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    if($rootScope.action !== 'edit') {
        $rootScope.action = 'add';
    }
    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');

    $('#main-site').addClass('active');

    $scope.tabs = [
        { title:"A-La-Cart & Offer Plans", state:"main-site.alacart", active: true },
        { title:"Value Pack Plans",  state:"main-site.valuepack", active: false },
        { title:"Subscription Plans",  state:"main-site.subscription" , active: false },
        { title:"Advance Settings", state:"main-site.advancesetting" , active: false },
        { title:"Arrange Plans",  state:"main-site.arrangeplan" , active: false }
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

    MainSite.getMainSiteData(function (MainSiteData) {
        $scope.OfferData = angular.copy(MainSiteData.OfferData);
        $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
        $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);
        console.log('mainsite : '+$scope.action)

        if($rootScope.action !== 'edit'){
            $rootScope.distributionChannelId = "";
            $rootScope.PackageId = '';
            $scope.offerId = '';
            $scope.paosId = '';
            $rootScope.PackageType = 0;
        }
    });

    $scope.getPackageData = function(){
        $scope.showPackageData();
        $state.go($state.current, {}, {reload: $state.current}); //'dcId':$rootScope.distributionChannelId
    }
    $scope.showPackageData = function(){
        /*if($rootScope.action !== 'edit'){
            $rootScope.distributionChannelId = "";
            $rootScope.PackageId = '';
            $scope.offerId = '';
            $scope.paosId = '';
            $rootScope.PackageType = 0;
        }*/
        $scope.alacartPlanIds = {};
        $scope.contentTypePlanData = {};

        MainSite.showPackageData({pkgId:$rootScope.PackageId,distributionChannelId:$rootScope.distributionChannelId,packageType:$rootScope.PackageType},function (MainSiteData) {
            $scope.OfferData = angular.copy(MainSiteData.OfferData);
            $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
            $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);

            $scope.alacartPackPlans = angular.copy(MainSiteData.alacartPackPlans);

            $scope.valuePackPlans = angular.copy(MainSiteData.valuePackPlans);

            $scope.subscriptionPackPlans = angular.copy(MainSiteData.subscriptionPackPlans);
            $scope.mainSitePackageData = angular.copy(MainSiteData.mainSitePackageData.packageDetails);
            $scope.sequenceData = angular.copy(MainSiteData.mainSitePackageData.arrangeSequenceData);
            angular.forEach($scope.sequenceData, function (data,key) {
                $scope.sequence.push(data.pas_arrange_seq);
            })
            console.log($scope.sequence)

            if ($scope.mainSitePackageData != null && $scope.mainSitePackageData.length > 0) {
                $rootScope.distributionChannelId = $scope.mainSitePackageData[0].sp_dc_id;
                $rootScope.PackageId = $scope.mainSitePackageData[0].sp_pkg_id;
                $rootScope.PackageType = $scope.mainSitePackageData[0].sp_pkg_type
            }else{
                $rootScope.PackageId = '';
                $rootScope.PackageType = 0;
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
        })
    }

    //if($rootScope.PackageId != '' && $rootScope.PackageId != null && $rootScope.PackageId != undefined){
    if($rootScope.action === 'edit'){
        $scope.showPackageData();
    }
    $scope.resetForm = function () {
        $scope.selectedValuePacks = [];
        $scope.selectedSubscriptionPlans = [];
    }

});
