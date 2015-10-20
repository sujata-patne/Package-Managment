/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {

    console.log('mainsite' + $rootScope.action)

    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $rootScope.PackageType = 0;
    $scope.selectedStore = [];
    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    console.log($rootScope.action)
    if($rootScope.action !== 'edit' && $rootScope.action === undefined) {
        $rootScope.action = 'add';
        $rootScope.ParentPackageId = 0;
    }
    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');

    $('#main-site').addClass('active');

    if($rootScope.PackageType === 1 && $rootScope.PackageId != undefined && $rootScope.action != 'edit'){
        $rootScope.PackageId = undefined;
        $rootScope.distributionChannelId = undefined;
        $rootScope.PackageType = undefined;
        $rootScope.action = 'add';
        $rootScope.ParentPackageId = 0;
    }
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
        $scope.StorePacks = angular.copy(MainSiteData.packs);
        console.log('mainsite : '+$scope.action)
        if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
            $rootScope.distributionChannelId = undefined;
            $rootScope.PackageId = undefined;
            $rootScope.PackageType = 0;
            $rootScope.packPackageName = '';

            $scope.offerId = undefined;
            $scope.paosId = undefined;
        }
    });

    $scope.$watch( "isChild" , function(n,o){

        $scope.setPackageData()
    }, true );

    $scope.getPackageData = function(){

        $scope.showPackageData();

        $state.go($state.current, {}, {reload: $state.current}); //'dcId':$rootScope.distributionChannelId
    }
    $scope.showPackageData = function(){
        /*if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
         $rootScope.PackageId = undefined;
         $scope.offerId = undefined;
         $scope.paosId = undefined;
         $rootScope.PackageType = 0;
         }*/
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
                $rootScope.packPackageName = $scope.mainSitePackageData[0].sp_package_name;
                $rootScope.packSelectedPack = $scope.mainSitePackageData[0].sp_pk_id;
                if($rootScope.action === 'edit') {
                    $rootScope.ParentPackageId = $scope.mainSitePackageData[0].sp_parent_pkg_id;
                }

            }else{
                console.log('else')
                $rootScope.PackageId = '';
                $rootScope.PackageType = 0;
                $rootScope.ParentPackageId = 0;
                $rootScope.packPackageName = '';
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

            $scope.setPackageData()
        })
    }

    if($rootScope.action === 'edit'){
        console.log('edit : ' + $rootScope.PackageId )
        $scope.showPackageData();
    }

    $scope.resetForm = function () {
        $scope.selectedValuePacks = [];
        $scope.selectedSubscriptionPlans = [];
    }

    $scope.setPackageData = function(){
        if($scope.isChild === true && $rootScope.action !== 'edit'){

            $rootScope.ParentPackageId = $rootScope.PackageId;
            if($rootScope.ParentPackageId != '' || $rootScope.ParentPackageId != 0 || $rootScope.ParentPackageId != undefined){
                $rootScope.PackageId = '';
                $rootScope.packPackageName = '';

            }
        }
        if($scope.isChild === false  && $rootScope.action !== 'edit'){

            $rootScope.PackageId = $rootScope.ParentPackageId;

            if($rootScope.PackageId != '' || $rootScope.PackageId != undefined) {

                $rootScope.ParentPackageId = 0;
            }
        }
    }

    $scope.submitMainsiteForm = function (isValid) {
        if (!$rootScope.distributionChannelId) {
            toastr.error('Distribution Channel is required');
            $scope.errorvisible = true;
        } else {

            var alacartData = {
                isChild: $scope.isChild,
                packageId: $rootScope.PackageId,
                parentPackageId: $rootScope.ParentPackageId,
                packageType: $rootScope.PackageType,
                packId: $rootScope.packSelectedPack,
                packageName: $rootScope.packPackageName,
                distributionChannelId: $rootScope.distributionChannelId
            }
            console.log('$scope.alacartData')
            console.log(alacartData)
            ngProgress.start();
            if ($rootScope.PackageId != undefined && $rootScope.PackageId != null && $rootScope.PackageId != '' && $rootScope.PackageId != 0) {
                console.log('mainsite edit')
                MainSite.editAlacartNOffer(alacartData, function (data) {
                    $scope.showMainsiteResponse(data);
                });
            } else {
                console.log('mainsite add')
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
            $state.go($state.current, {}, {reload: $state.current});
        }
        else {
            toastr.error(data.message)
            $scope.errorvisible = true;
        }

        ngProgress.complete();
    }
});