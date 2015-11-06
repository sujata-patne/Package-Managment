myApp.controller('mainSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {
    
    $('.removeActiveClass').removeClass('active');
    $('#main-site').addClass('active');
    
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $scope.selectedStore = [];
    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    $scope.actionName = ($stateParams.packageId != 0 && $stateParams.packageId != '' &&$stateParams.packageId != undefined)? 'Edit':'Add';
    $rootScope.PackageType = 0;
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
            $state.current = $scope.tabs[$scope.tabIndex].state;
            // alert($scope.tabIndex);
            $stateParams.packageId = $rootScope.PackageId;

            // $state.go($scope.tabs[$scope.tabIndex].state);
            $stateParams.packageId = $rootScope.PackageId;
            //
            $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId, location: true, inherit : false});
            //$state.go($state.current, { packageId: $rootScope.PackageId, location: true, inherit : false});
            //$state.go($scope.tabs[$scope.tabIndex].state);//,{}, {reload: $scope.tabs[$scope.tabIndex].state}
        }
    };

    $rootScope.mainNext=true;

    $rootScope.dis = function() {
        if($scope.tabIndex === $scope.tabs.length -1){
            return true;
        }
    };

    $scope.setIndex = function($index){
        $scope.tabIndex = $index;
        //$state.go($scope.tabs[$scope.tabIndex].state);
        $stateParams.packageId = $rootScope.PackageId;
        if($scope.tabIndex == 0 || $stateParams.packageId == undefined){
            if( $scope.previousState.name ==  $scope.tabs[$scope.tabIndex].state ) {
                $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId, location: true, inherit : false});
            }else {
                $state.go($scope.tabs[$scope.tabIndex].state, {packageId:undefined, location: true, inherit : false});
            }
        }
    }

    $scope.setEmptyPackage = function(){
        //console.log('setEmptyPackage')
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
       //console.log('setPackageDetais')
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
        // $rootScope.PackageId = '';
        $scope.setEmptyPackage();
        $scope.showPackageData();
    }

    //Changing content types  based on packId : 
    $rootScope.SelectedPack = undefined;
    MainSite.getStoreDetails($rootScope.SelectedPack,function (MainSiteData) {
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
        // console.log($rootScope.distributionChannelId);
        // alert("main")
        if($rootScope.distributionChannelId != undefined && $rootScope.distributionChannelId != ''){
            $scope.setPackageDetails();
        }

    }, {},true);

    $scope.showPackageData = function() {
        // alert($rootScope.PackageId);
        if($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''){
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
                    // alert($scope.tabIndex);
                   // if( new RegExp("main-site").test($scope.previousState.name)) {
                     if( $scope.tabIndex == 0 ) {
                        console.log("in showpackage data tab index 0");
                        //console.log('$scope.mainSitePackageData if ' + $scope.tabs[$scope.tabIndex].state)
                        $stateParams.packageId = $rootScope.PackageId;
                        $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId, location: true, inherit : false});
                     }
                }else{
                    //console.log('$scope.mainSitePackageData else ')
                    // alert('hihihi')
                    $scope.setEmptyPackage();
                    $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId, location: true, inherit : false});
                }
            },
            function (error) {
                $scope.error = error;
                $scope.errorvisible = true;
            });
    }



    $scope.checkState = function () {
        // alert($scope.previousState.name);

        if ($scope.previousState.name && !new RegExp("main-site").test($scope.previousState.name)
            && !new RegExp("packageListing").test($scope.previousState.name)) {
            console.log(' $rootScope.previousState 1')

            $rootScope.distributionChannelId = undefined;
            $scope.setDistributionChannelId = 0;
            $scope.setEmptyPackage();
            $state.go($state.current, {packageId: undefined},{reload:true}); //

        } else if (new RegExp("packageListing").test($scope.previousState.name)
            && ($stateParams.packageId != 0 && $stateParams.packageId != undefined && $stateParams.packageId != '')) {
            $rootScope.PackageId = $stateParams.packageId;
            $rootScope.action = 'edit';
            $scope.showPackageData();

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
             //window.location.reload();

        }else if ( (new RegExp("main-site").test($scope.previousState.name) || new RegExp("main-site").test($state.current.name))
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

    //if($stateParams.packageId > 0 && ($rootScope.action = 'edit')){
    //    $scope.disableDeliveryChannel= true
    //}else{
    //    $scope.disableDeliveryChannel= false
    //}
})