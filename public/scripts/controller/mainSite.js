/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ($scope, $state, ngProgress, $stateParams, MainSite) {
   // $scope.distributionChannelId = 1;
    $scope.tabIndex = 0;

    $scope.alacartPlanIds = {};
    $scope.tabs = [
        { title:"A-La-Cart & Offer Plans", state:"main-site.alacart",  active: true },
        { title:"Value Pack Plans",  state:"main-site.valuepack" },
        { title:"Subscription Plans",  state:"main-site.subscription"},
        { title:"Advance Settings", state:"main-site.advancesetting" },
        { title:"Arrange Plans",  state:"main-site.arrangeplan" }
    ];

    $scope.proceed = function() {
        if($scope.tabIndex !== ( $scope.tabs.length - 1 ) ){
            $scope.tabs[$scope.tabIndex].active = false;
            $scope.tabIndex++;
            $scope.tabs[$scope.tabIndex].active = true;
            $state.transitionTo($scope.tabs[$scope.tabIndex]['state']);
        }
    };

    $scope.dis = function() {
        if($scope.tabIndex === $scope.tabs.length -1){
            return true;
        }
    };

    $scope.setIndex = function($index){
        $scope.tabIndex = $index;
        //default form display for a-la-cart and offer plan
        $state.transitionTo($scope.tabs[$scope.tabIndex]['state']);
    }
    $scope.showDeliveryTypes = function(contents){
        return contents.parent_name === 'Audio' || contents.parent_name === 'Video';
    };
    MainSite.getAlacartNOfferData( function (MainSiteData) {
        $scope.mainSitePackageData = angular.copy(MainSiteData.mainSitePackageData);
        $scope.OfferData = angular.copy(MainSiteData.OfferData);
        $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
        $scope.alacartData = angular.copy(MainSiteData.ContentTypeData);
        $scope.distributionChannels = angular.copy(MainSiteData.DistributionChannel);
        if($scope.mainSitePackageData){
            $scope.distributionChannelId = $scope.mainSitePackageData.sp_dc_id;
            $scope.PackageId = $scope.mainSitePackageData.sp_pkg_id;
        }
    });
    $scope.resetForm = function () {
    }

});

myApp.controller('alacartCtrl', function ($scope, $http, ngProgress, $stateParams, MainSite) {
    $scope.PackageType = 0;
    console.log($scope.PackageId)
    MainSite.getAlacartNOfferPackDetails({pkgId:$scope.PackageId}, function (MainSiteData) {
        $scope.alacartNofferDetails = angular.copy(MainSiteData.ContentTypeData);

        if($scope.alacartNofferDetails.length > 0){
            angular.forEach($scope.alacartNofferDetails, function(data){
                $scope.alacartPlanIds[data.pct_content_type_id] = {download:data.pct_download_id,streaming:data.pct_stream_id};
            })
        }
    });
    $scope.submitForm = function (isValid) {
        var alacartData = {
            ContentTypes: $scope.ContentTypes,
            alacartPlansList: $scope.alacartPlanIds,
            offerId: $scope.offerId,
            packageId: $scope.PackageId,
            packageType: $scope.PackageType,
            distributionChannelId: $scope.distributionChannelId
        }
        //console.log(alacartData)
        ngProgress.start();
        MainSite.addAlacartNOffer(alacartData, function (data) {
            if (data.success) {
                toastr.success(data.message)
                $scope.successvisible = true;
            }
            else {
                toastr.success(data.message)
                $scope.errorvisible = true;
            }
            ngProgress.complete();
        });
    }
});