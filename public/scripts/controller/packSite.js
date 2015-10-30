myApp.controller('packSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {

    $('.removeActiveClass').removeClass('active');
    $('#pack-site').addClass('active');

    console.log('packSiteCtrl')
    $rootScope.mainNext=false;
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $scope.selectedStore = [];
    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    $scope.setDistributionChannelId = 0;
    $scope.actionName = ($rootScope.PackageId != 0 && $rootScope.PackageId != '' && $rootScope.PackageId != undefined)? 'Edit':'Add';

    $scope.tabs = [
        { title:"A-La-Cart & Offer Plans", state:"pack-site.alacart", active: true },
        { title:"Value Pack Plans",  state:"pack-site.valuepack", active: false },
        { title:"Subscription Plans",  state:"pack-site.subscription" , active: false },
        { title:"Advance Settings", state:"pack-site.advancesetting" , active: false },
        { title:"Arrange Plans",  state:"pack-site.arrangeplan" , active: false },
        { title:"Individual Content",  state:"pack-site.individualcontent" , active: false }
    ];
    $rootScope.proceed = function() {
        if($scope.tabIndex !== ( $scope.tabs.length - 1 ) ){
            $scope.tabs[$scope.tabIndex].active = false;
            $scope.tabIndex++;
            $scope.tabs[$scope.tabIndex].active = true;
            $state.go($scope.tabs[$scope.tabIndex].state,{});//, {reload: $scope.tabs[$scope.tabIndex].state}
        }
    };
    $scope.dis1 = function() {
        if($scope.tabIndex === $scope.tabs.length -1){
            return true;
        }
    };
    $scope.setIndex = function($index){
        $scope.tabIndex = $index;
        $state.go($scope.tabs[$scope.tabIndex].state);
        /*if($scope.tabIndex == 0){
            $state.go($scope.tabs[$scope.tabIndex]['state']);
        }*/
    }
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
    $scope.getPackageData = function(){
        $rootScope.PackageId = '';
        $scope.showPackageData();
        //$state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId});
    }


    $scope.showPackageData = function(){
        /*if($rootScope.action !== 'edit' &&  $rootScope.action !== undefined){
         $scope.setEmptyPackage();
         }*/
        //$scope.alacartPlanIds = {};
        //$scope.contentTypePlanData = {};

        var params = {pkgId:$rootScope.PackageId, distributionChannelId:$rootScope.distributionChannelId,packageType:$rootScope.PackageType}
        console.log('params')
        console.log(params)
        MainSite.showPackageData(params, function (PackSiteData) {

            $scope.packSitePackageData = angular.copy(PackSiteData.mainSitePackageData.packageDetails);
            if ($scope.packSitePackageData != null && $scope.packSitePackageData.length > 0) {
                $rootScope.distributionChannelId = $scope.packSitePackageData[0].sp_dc_id;
                $rootScope.PackageId = $scope.packSitePackageData[0].sp_pkg_id;
                $rootScope.PackageType = $scope.packSitePackageData[0].sp_pkg_type;
                $rootScope.PackageName = $scope.packSitePackageData[0].sp_package_name;
                $rootScope.SelectedPack = $scope.packSitePackageData[0].sp_pk_id;

                if($rootScope.action === 'edit') {
                    $rootScope.ParentPackageId = $scope.packSitePackageData[0].sp_parent_pkg_id;
                }
                console.log('$scope.packSitePackageData if ')

                $rootScope.action = 'edit';

              //  $state.go($state.current, {packageId:$rootScope.PackageId})
                $state.go($state.current, {packageId:$rootScope.PackageId}, {reload:$state.current}); //

            }
            else{
                $scope.setEmptyPackage();
                $state.go($state.current, {packageId:undefined})

            }
        },
        function (error) {
            $scope.error = error;
            $scope.errorvisible = true;
        });
    }

    $scope.showDeliveryTypes = function(contents){
        return contents.parent_name === 'Audio' || contents.parent_name === 'Video';
    };

    MainSite.getStoreDetails(function (MainSiteData) {

            $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
            $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);
            $scope.OfferStoreData = angular.copy(MainSiteData.OfferData);
            $scope.alacartStorePlans = angular.copy(MainSiteData.alacartPackPlans);
            $scope.valuePackPlans = angular.copy(MainSiteData.valuePackPlans);

            $scope.StorePacks = angular.copy(MainSiteData.packs);

            $scope.subscriptionStorePlans = angular.copy(MainSiteData.subscriptionPackPlans);

        },
        function (error) {
            $scope.error = error;
            $scope.errorvisible = true;
        });


    if($scope.previousState.name && !new RegExp("pack-site").test($scope.previousState.name) && !new RegExp("packageListing").test($scope.previousState.name)){
        console.log(' $rootScope.previousState 1')

        $rootScope.distributionChannelId = undefined;
        $scope.setDistributionChannelId = 0;
        $scope.setEmptyPackage();
        $state.go($state.current, {packageId:undefined}); //, {reload:$state.current}
    }else if(new RegExp("packageListing").test($scope.previousState.name)
        && ($stateParams.packageId != 0 && $stateParams.packageId != undefined && $stateParams.packageId != '')){
        console.log(' $rootScope.previousState 2')
        $rootScope.PackageId = $stateParams.packageId;
        $rootScope.action = 'edit';
        $scope.showPackageData();

    }else if(($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '')
        && ($rootScope.action  !== '' && $rootScope.action !== 'edit' )){
        console.log(' $rootScope.previousState 4')

        $scope.setEmptyPackage();
    }else if(new RegExp("packageListing").test($scope.previousState.name) && (!($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
        || !($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''))){

        console.log(' $rootScope.previousState 5')
        $rootScope.distributionChannelId = undefined;
        $scope.setEmptyPackage();
    }else if(new RegExp("main-site").test($scope.previousState.name)
        || ($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
        || ($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '')){

        console.log(' $rootScope.previousState 7')
        $state.go($state.current, {packageId:$stateParams.packageId})
        $scope.showPackageData();
    }else if($scope.previousState.name && !($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
        || !($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '')) {
        console.log(' $rootScope.previousState 6')

        $rootScope.distributionChannelId = undefined;
        $scope.setEmptyPackage();
    }/*else if(($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
        && ($rootScope.action  !== '' && $rootScope.action !== 'edit' )){
        console.log(' $rootScope.previousState 3')

        $rootScope.PackageId = $stateParams.packageId;
        $rootScope.action = 'edit';
        $scope.showPackageData();

    }*/


    /*if($rootScope.action === 'edit' ){
        console.log('$rootScope.action')

        $scope.showPackageData();
    }
    $scope.resetForm = function () {
        $scope.selectedValuePacks = [];
        $scope.selectedSubscriptionPlans = [];
    }*/
    $scope.setPackageDetails = function(){
        if($scope.alacartStorePlans != 'NoAlaCart'){
            $scope.alacartPackPlans = _.filter($scope.alacartStorePlans,function (plans){
                return plans.cd_id == $rootScope.distributionChannelId;
            })
        }else{
            $scope.alacartPackPlans = $scope.alacartStorePlans ;
        }

        $scope.OfferData = _.filter($scope.OfferStoreData,function (plans){
            return plans.cd_id == $rootScope.distributionChannelId;
        })
        if($scope.subscriptionStorePlans != 'NoSub'){
            $scope.subscriptionPackPlans =  _.filter($scope.subscriptionStorePlans,function (plans){
                return plans.cd_id == $rootScope.distributionChannelId;
            })
        }else{
            $scope.subscriptionPackPlans = $scope.subscriptionStorePlans ;
        }
        console.log('$scope.alacartPackPlans')
        console.log($scope.alacartPackPlans)
        /*$scope.alacartPackPlans = _.filter($scope.alacartStorePlans,function (plans){
            return plans.cd_id == $rootScope.distributionChannelId;
        })
        $scope.OfferData = _.filter($scope.OfferStoreData,function (plans){
            return plans.cd_id == $rootScope.distributionChannelId;
        })
        $scope.subscriptionPackPlans =  _.filter($scope.subscriptionStorePlans,function (plans){
            return plans.cd_id == $rootScope.distributionChannelId;
        })*/

        console.log('$scope.alacartPackPlans')
        console.log($scope.alacartPackPlans)
    }

    /*$scope.$watch('distributionChannelId',function(){

        $scope.setPackageDetails();

        if(($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            && ($rootScope.action  !== '' && $rootScope.action !== 'edit' )){
            console.log(' $rootScope.previousState 3')

            $rootScope.PackageId = $stateParams.packageId;
            $rootScope.action = 'edit';
            $scope.showPackageData();

        }
    }, {},true);*/

});