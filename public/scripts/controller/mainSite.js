/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ( $scope, $state, ngProgress, $stateParams, MainSite) {
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";

    $scope.selectedStore = [];

    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
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

        console.log($scope.PackageId);
        if( $scope.alacartNofferDetails != undefined && $scope.alacartNofferDetails.length > 0){
            angular.forEach($scope.alacartNofferDetails, function(data){
                $scope.alacartPlanIds[data.pct_content_type_id] = {download:data.pct_download_id,streaming:data.pct_stream_id};
            })
        }
    });

    $scope.showPackageData = function(){
        $scope.PackageId = '';
        $scope.PackageType = 0;
        $scope.alacartPlanIds = {};
        $scope.contentTypePlanData = {};
        $scope.selectedValuePacks = [];
        $scope.selectedSubscriptionPlans = [];

        MainSite.showPackageData({distributionChannelId:$scope.distributionChannelId},function (MainSiteData) {
            $scope.mainSitePackageData = angular.copy(MainSiteData.mainSitePackageData);
            if ($scope.mainSitePackageData != null && $scope.mainSitePackageData.length > 0) {
                $scope.distributionChannelId = $scope.mainSitePackageData[0].sp_dc_id;
                $scope.PackageId = $scope.mainSitePackageData[0].sp_pkg_id;
            }else{
                //$scope.distributionChannelId = '';
                $scope.PackageId = '';
            }
            $scope.alacartNofferDetails = angular.copy(MainSiteData.alacartNOfferDetails);
            if ($scope.alacartNofferDetails != null && $scope.alacartNofferDetails.length > 0) {
                $scope.offerId = $scope.alacartNofferDetails[0].paos_op_id;
                $scope.paosId = $scope.alacartNofferDetails[0].paos_id;

                $scope.contentTypePlanData = angular.copy($scope.alacartNofferDetails[1].contentTypePlanData);
                if ($scope.contentTypePlanData != null && $scope.contentTypePlanData.length > 0) {
                    angular.forEach($scope.contentTypePlanData, function (data) {
                        $scope.alacartPlanIds[data.pct_content_type_id] = {
                            download: data.pct_download_id,
                            streaming: data.pct_stream_id
                        };
                    })
                }
            }else{
                $scope.offerId = '';
                $scope.paosId = '';
            }

            var valuePackDetails = angular.copy(MainSiteData.valuePackDetails);
            if( valuePackDetails.length > 0 ) {
                for( i = 0; i < valuePackDetails.length ; i++ ){
                    $scope.selectedValuePacks.push(valuePackDetails[i].pvs_vp_id );
                }
            }

            var subscriptionDetails = angular.copy(MainSiteData.subscriptionDetails);
            if( subscriptionDetails.length > 0 ) {
                for( i = 0; i < subscriptionDetails.length ; i++ ){
                    $scope.selectedSubscriptionPlans.push(subscriptionDetails[i].pss_sp_id );
                }
            }
        })
    }

    $scope.resetForm = function () {
        $scope.alacartPlanIds = [];
        $scope.selectedValuePacks = [];
        $scope.selectedSubscriptionPlans = [];
    }
});



myApp.controller('arrangeplanCtrl', function ($scope, $state, ngProgress, $stateParams, MainSite) {

});