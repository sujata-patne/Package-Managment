myApp.controller('mainSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {
    
    $('.removeActiveClass').removeClass('active');
    $('#main-site').addClass('active');
    
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $scope.selectedStore = [];
    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    $scope.actionName = ($rootScope.PackageId != 0 && $rootScope.PackageId != '' && $rootScope.PackageId != undefined)? 'Edit':'Add';

    $scope.tabs = [
        { title:"A-La-Cart & Offer Plans", state:"main-site.alacart", active: true },
        { title:"Value Pack Plans",  state:"main-site.valuepack", active: false },
        { title:"Subscription Plans",  state:"main-site.subscription" , active: false },
        { title:"Advance Settings", state:"main-site.advancesetting" , active: false },
        { title:"Arrange Plans",  state:"main-site.arrangeplan" , active: false }
    ];

    $rootScope.proceed = function() {
        if($scope.tabIndex !== ( $scope.tabs.length - 1 ) ){
            $scope.tabs[$scope.tabIndex].active = false;
            $scope.tabIndex++;
            $scope.tabs[$scope.tabIndex].active = true;
            $state.go($scope.tabs[$scope.tabIndex].state);//,{}, {reload: $scope.tabs[$scope.tabIndex].state}
        }
    };

    $rootScope.mainNext=true;

    $rootScope.dis = function() {
        if($scope.tabIndex === $scope.tabs.length -1){
            return true;
        }
    };

    $scope.setIndex = function($index){
        console.log('index')
        console.log($index)
        $scope.tabIndex = $index;
        $state.go($scope.tabs[$scope.tabIndex].state);
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

    $scope.setPackageDetails = function(){
       console.log('setPackageDetais')
        if($scope.alacartStorePlans != 'NoAlaCart'){
            $scope.alacartPackPlans = _.filter($scope.alacartStorePlans,function (plans){
                return plans.cd_id == $rootScope.distributionChannelId;
            })
        }else{
            $scope.alacartPackPlans = $scope.alacartStorePlans ;
        }

        $scope.OfferData = _.filter($scope.OfferStoreData,function (plans){
            return plans.cd_id == $rootScope.distributionChannelId;
        });
        if($scope.subscriptionStorePlans != 'NoSub'){
            $scope.subscriptionPackPlans =  _.filter($scope.subscriptionStorePlans,function (plans){
                return plans.cd_id == $rootScope.distributionChannelId;
            })
        }else{
            $scope.subscriptionPackPlans = $scope.subscriptionStorePlans ;
        }
    }

    $scope.getPackageData = function(){
        $rootScope.PackageId = '';
        $scope.showPackageData();
    }

    MainSite.getStoreDetails(function (MainSiteData) {
        $scope.checkState();

        $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
        $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);
        $scope.OfferStoreData = angular.copy(MainSiteData.OfferData);
        $scope.alacartStorePlans = angular.copy(MainSiteData.alacartPackPlans);
        $scope.valuePackPlans = angular.copy(MainSiteData.valuePackPlans);

        $scope.subscriptionStorePlans = angular.copy(MainSiteData.subscriptionPackPlans);

        $scope.setPackageDetails();
    },
    function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    $scope.$watch('distributionChannelId',function(){
console.log("$scope.$watch('distributionChannelId',function(){")
        console.log('$rootScope.distributionChannelId')
        console.log($rootScope.distributionChannelId)
        if($rootScope.distributionChannelId != undefined && $rootScope.distributionChannelId != ''){
            console.log('$rootScope.distributionChannelId')
            $scope.setPackageDetails();
        }

    }, {},true);

    $scope.showPackageData = function() {
        if($stateParams.packageId){
            var params = {pkgId:$rootScope.PackageId}
        }else {
            var params = {distributionChannelId: $rootScope.distributionChannelId, packageType: $rootScope.PackageType}
        }

        MainSite.showPackageData(params, function (MainSiteData) {
                $scope.mainSitePackageData = angular.copy(MainSiteData.mainSitePackageData.packageDetails);

                if( MainSiteData.subscriptionPackPlans == 'NoSub' ) {
                    $scope.subscriptionPackPlans = MainSiteData.subscriptionPackPlans ;
                }

                if( MainSiteData.alacartPackPlans == 'NoAlaCart') {
                    $scope.alacartPackPlans = MainSiteData.alacartPackPlans;
                }

                if ($scope.mainSitePackageData != null && $scope.mainSitePackageData.length > 0) {
                    $rootScope.distributionChannelId = $scope.mainSitePackageData[0].sp_dc_id;
                    $rootScope.PackageId = $scope.mainSitePackageData[0].sp_pkg_id;
                    $rootScope.PackageType = $scope.mainSitePackageData[0].sp_pkg_type;
                    $rootScope.PackageName = $scope.mainSitePackageData[0].sp_package_name;

                    if($rootScope.action === 'edit') {
                        $rootScope.ParentPackageId = $scope.mainSitePackageData[0].sp_parent_pkg_id;
                    }

                    $rootScope.action = 'edit';

                   // if( new RegExp("main-site").test($scope.previousState.name)) {
                    if( $scope.tabIndex == 0 ) {
                        console.log('$scope.mainSitePackageData if ' + $scope.tabs[$scope.tabIndex].state)
                        $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId});
                    }
                }else{
                    console.log('$scope.mainSitePackageData else ')

                    $scope.setEmptyPackage();
                    $state.go($state.current, {packageId:undefined})
                }
            },
            function (error) {
                $scope.error = error;
                $scope.errorvisible = true;
            });
    }



    $scope.checkState = function () {
        if ($scope.previousState.name && !new RegExp("main-site").test($scope.previousState.name)
            && !new RegExp("packageListing").test($scope.previousState.name)) {
            console.log(' $rootScope.previousState 1')

            $rootScope.distributionChannelId = undefined;
            $scope.setDistributionChannelId = 0;
            $scope.setEmptyPackage();
            $state.go($state.current, {packageId: undefined}); //, {reload:$state.current}

        } else if (new RegExp("packageListing").test($scope.previousState.name)
            && ($stateParams.packageId != 0 && $stateParams.packageId != undefined && $stateParams.packageId != '')) {
            console.log(' $rootScope.previousState 2')
            $rootScope.PackageId = $stateParams.packageId;
            $rootScope.action = 'edit';

        }else if (new RegExp("packageListing").test($scope.previousState.name)
            && (!($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            || (!$rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''))) {

            console.log(' $rootScope.previousState 3')
            $rootScope.distributionChannelId = undefined;
            $scope.setEmptyPackage();

        } else if ( (new RegExp("main-site").test($scope.previousState.name) || new RegExp("main-site").test($state.current.name))
            && (($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            || ($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''))) {

            console.log(' $rootScope.previousState 4')
            $rootScope.PackageId = $stateParams.packageId;
            $rootScope.action = 'edit';
            $scope.showPackageData();

        }else if ((new RegExp("main-site").test($scope.previousState.name) || new RegExp("main-site").test($state.current.name))
            && (!($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            || (!$rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''))) {
            console.log(' $rootScope.previousState 5')
            $scope.setEmptyPackage();

        }else if(($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
         && ($rootScope.action  !== '' && $rootScope.action !== 'edit' )){
         console.log(' $rootScope.previousState 6')

         $rootScope.PackageId = $stateParams.packageId;
         $rootScope.action = 'edit';
         $scope.showPackageData();
         }else if (($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '')
            && ($rootScope.action !== '' && $rootScope.action !== 'edit' )) {
            console.log(' $rootScope.previousState 7'  )
            $scope.setEmptyPackage();
        } /*else{
            console.log(' $rootScope.previousState 8')

            $scope.setEmptyPackage();
        }*/
    }
})