/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite,$location) {
console.log('mainSiteCtrl')
    $('.removeActiveClass').removeClass('active');
    $('#main-site').addClass('active');

    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $scope.selectedStore = [];
    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    $scope.setDistributionChannelId = 0;
    if($stateParams.packageId){
        console.log('$stateParams')

        $rootScope.PackageId = $stateParams.packageId;
        $rootScope.action = 'edit';
    }
    if($rootScope.action !== 'edit' && $rootScope.action === undefined) {
        console.log('!edit or undefined')

        $rootScope.action = 'add';
        $rootScope.ParentPackageId = 0;
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
        //$scope.setDistributionChannelId = 0;
    }

    console.log('$rootScope.previousState '+$rootScope.previousState.name +" : "+ $rootScope.PackageType )
    if($rootScope.previousState && ($rootScope.PackageType != 0 || new RegExp("pack-site").test($scope.previousState.name) || new RegExp("map-mainsite").test($scope.previousState.name) )){

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
        $state.go($scope.tabs[$scope.tabIndex].state,  {}, {reload:false});
        /*if($rootScope.PackageId != 0 && $rootScope.PackageId != '' && $rootScope.PackageId != undefined){
            console.log('setIndex if')

            $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId});
        }else{
            console.log('setIndex else')

            $state.go($scope.tabs[$scope.tabIndex].state);
        }*/

        //default form display for a-la-cart and offer plan
        /*if($scope.tabIndex == 0){
            $state.go($scope.tabs[$scope.tabIndex]['state']);
        }*/

    }

    $scope.showDeliveryTypes = function(contents){
        return contents.parent_name === 'Audio' || contents.parent_name === 'Video';
    };

    MainSite.getMainSiteData(function (MainSiteData) {
        console.log('getMainSiteData $rootScope.action '+$rootScope.action)

        $scope.OfferData = angular.copy(MainSiteData.OfferData);
        $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
        $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);
        $scope.StorePacks = angular.copy(MainSiteData.packs);
        if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
            console.log('getMainSiteData if')

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
            console.log('showPackageData if')
            $scope.setEmptyPackage();
        }
        $scope.alacartPlanIds = {};
        $scope.contentTypePlanData = {};
        var params = {pkgId:$rootScope.PackageId, distributionChannelId:$rootScope.distributionChannelId,packageType:$rootScope.PackageType}
console.log('params')
console.log(params)
        MainSite.showPackageData(params,function (MainSiteData) {
            console.log('showPackageData MainSiteData');

            $scope.OfferData = angular.copy(MainSiteData.OfferData);
            $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
            $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);

            $scope.alacartPackPlans = angular.copy(MainSiteData.alacartPackPlans);

            $scope.valuePackPlans = angular.copy(MainSiteData.valuePackPlans);

            $scope.subscriptionPackPlans = angular.copy(MainSiteData.subscriptionPackPlans);

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
            }else{
                console.log('showPackageData else')

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
            console.log('$scope.setDistributionChannelId  '+ $scope.setDistributionChannelId + ' : ' )
            console.log($scope.setDistributionChannelId !== 1)
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

    if($rootScope.action === 'edit'){
        console.log('edit  showPackageData')

        $scope.showPackageData();
    }

    $scope.resetForm = function () {
        $scope.selectedValuePacks = [];
        $scope.selectedSubscriptionPlans = [];
    }


});