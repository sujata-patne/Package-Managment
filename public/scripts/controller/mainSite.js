/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ( $scope, $state, ngProgress, $stateParams, MainSite) {
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $scope.selectedValuePacks = [];
    $scope.selectedStore = [];

    $scope.alacartPlanIds = {};
    $scope.distributionChannelId = "";

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
       // $scope.ContentTypes = ContentTypeData.ContentTypes;
        $scope.OfferData = angular.copy(MainSiteData.OfferData);
        $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
        $scope.alacartData = angular.copy(MainSiteData.ContentTypeData);
        $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);
        $scope.valuePackPlans = angular.copy(MainSiteData.valuePackPlans);

        $scope.mainSitePackageData = angular.copy(MainSiteData.mainSiteData.mainSitePackageData);

        $scope.alacartNofferDetails = angular.copy(MainSiteData.mainSiteData.alacartNOfferDetails);

        if($scope.mainSitePackageData != null){
            $scope.distributionChannelId = $scope.mainSitePackageData.sp_dc_id;
            $scope.PackageId = $scope.mainSitePackageData.sp_pkg_id;
        }
        if($scope.alacartNofferDetails.length > 0){
            angular.forEach($scope.alacartNofferDetails, function(data){
                $scope.alacartPlanIds[data.pct_content_type_id] = {download:data.pct_download_id,streaming:data.pct_stream_id};
            })
        }

    });

    $scope.resetForm = function () {

    }
});


myApp.controller('advancesettingCtrl', function ($scope, $state, ngProgress, $stateParams, MainSite) {
});
myApp.controller('arrangeplanCtrl', function ($scope, $state, ngProgress, $stateParams, MainSite) {

});