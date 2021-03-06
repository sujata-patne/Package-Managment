myApp.controller('packSiteCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams, MainSite) {
    
    $('.removeActiveClass').removeClass('active');
    $('#pack-site').addClass('active');



    $rootScope.mainNext=false;
    
    if($rootScope.PackageId == undefined){
        $scope.tabIndex = 0;
    }
    // 
    // if($rootScope.nextOrigin == 0){
    //     $scope.tabIndex = 1;
    // }

    $scope.buttonLabel = "Next";
    $scope.selectedStore = [];
    $scope.alacartPlanIds = {};
    $scope.selectedValuePacks = [];
    $scope.selectedSubscriptionPlans = [];
    // $scope.setDistributionChannelId = 0; // not in mainsite
    $rootScope.PackageType = 1;

    $scope.actionName = ($stateParams.packageId != 0 && $stateParams.packageId != '' && $stateParams.packageId != undefined)? 'Edit':'Add';

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
            $scope.current = $scope.tabs[$scope.tabIndex].state;
            $stateParams.packageId = $rootScope.PackageId;
            //
            $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId, location: true, inherit : false});
            //$state.go($scope.tabs[$scope.tabIndex].state);//, {reload: $scope.tabs[$scope.tabIndex].state}
        }
    };

    $scope.dis = function() {
        if($scope.tabIndex === $scope.tabs.length -1){
            return true;
        }
    };

    $scope.setIndex = function($index){

        $scope.tabIndex = $index;

        $stateParams.packageId = $rootScope.PackageId;
        //$state.go($scope.tabs[$scope.tabIndex].state);
        //console.log("insaaijisajoilasl");
        //console.log($scope.tabIndex);
        //console.log('$stateParams.packageId');
        //console.log($stateParams.packageId);
        if($scope.tabIndex == 0 || $stateParams.packageId == undefined ){
            if( $scope.previousState.name ==  $scope.tabs[$scope.tabIndex].state ) {
                $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId, location: true, inherit : false});
            }else {
                $state.go($scope.tabs[$scope.tabIndex].state, {packageId:undefined, location: true, inherit : false});
            }
        }
    }

    $scope.setEmptyPackage = function(){
       // console.log('setEmptyPackage')
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
        $scope.streamingContentTypes = _.filter($scope.ContentTypes, function(el){ return el.parent_name == 'Audio' || el.parent_name == 'Video'; });
        $scope.distributionChannels = angular.copy(MainSiteData.distributionChannels);
        $scope.OfferStoreData = angular.copy(MainSiteData.OfferData);
        $scope.alacartStorePlans = angular.copy(MainSiteData.alacartPackPlans);
        $scope.valuePackPlans = angular.copy(MainSiteData.valuePackPlans);

        $scope.StorePacks = angular.copy(MainSiteData.packs);

        $scope.subscriptionStorePlans = angular.copy(MainSiteData.subscriptionPackPlans);
        $scope.setPackageDetails();
    },
    function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    $scope.$watch('distributionChannelId',function(){
         if($rootScope.distributionChannelId != undefined && $rootScope.distributionChannelId != '') {
            $scope.setPackageDetails();
        }
    }, {},true);


     //Watching  pack id change to change content types based on Selected Pack
     $rootScope.$watch('SelectedPack',function(){
             if($rootScope.SelectedPack != undefined && $rootScope.SelectedPack != ''){
                MainSite.getStoreDetails($rootScope.SelectedPack,function (MainSiteData) {
                $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
            },
            function (error) {
                $scope.error = error;
                $scope.errorvisible = true;
            });
        }
    }, {},true);

    $scope.showPackageData = function(){
        if($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''){
            var params = {pkgId:$rootScope.PackageId}
        }else {
            var params = {distributionChannelId: $rootScope.distributionChannelId, packageType: $rootScope.PackageType}
        }
        // var params = {pkgId:$rootScope.PackageId, distributionChannelId:$rootScope.distributionChannelId,packageType:$rootScope.PackageType}

        MainSite.showPackageData(params, function (PackSiteData) {

            $scope.packSitePackageData = angular.copy(PackSiteData.mainSitePackageData.packageDetails);
              //onsole.log( 'vhh'+ $scope.packSitePackageData)
                if( PackSiteData.subscriptionPackPlans == 'NoSub' ) {
                    $scope.subscriptionPackPlans = PackSiteData.subscriptionPackPlans ;
                }

                if( PackSiteData.alacartPackPlans == 'NoAlaCart') {
                    $scope.alacartPackPlans = PackSiteData.alacartPackPlans;
                }

            if ($scope.packSitePackageData != null && $scope.packSitePackageData.length > 0) {
                $rootScope.distributionChannelId = $scope.packSitePackageData[0].sp_dc_id;
                $rootScope.PackageId = $scope.packSitePackageData[0].sp_pkg_id;
                $rootScope.PackageType = $scope.packSitePackageData[0].sp_pkg_type;
                $rootScope.PackageName = $scope.packSitePackageData[0].sp_package_name;
                $rootScope.SelectedPack = $scope.packSitePackageData[0].sp_pk_id;

                if($rootScope.action === 'edit') {
                    $rootScope.ParentPackageId = $scope.packSitePackageData[0].sp_parent_pkg_id;
                }
              //  console.log('$scope.packSitePackageData if ')

                $rootScope.action = 'edit';
                     if( $scope.tabIndex == 0 ) {
                         
                        //console.log("in showpackage data tab index 0");
                        $stateParams.packageId = $rootScope.PackageId;
                        $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId, location: true, inherit : false});
                     }
            }
            else{
                //console.log("in undefined package..");
                // alert('msg');
                $scope.setEmptyPackage();

                $state.go($scope.tabs[$scope.tabIndex].state, {packageId:$rootScope.PackageId, location: true, inherit : false});
                //$state.go($state.current, {packageId:undefined})

            }
        },
        function (error) {
            $scope.error = error;
            $scope.errorvisible = true;
        });
    }

    $scope.checkState = function () {

        if ($scope.previousState.name && !new RegExp("pack-site").test($scope.previousState.name)
            && !new RegExp("packageListing").test($scope.previousState.name)) {
            console.log(' $rootScope.previousState 1')
        
            $rootScope.distributionChannelId = undefined;
            $scope.setDistributionChannelId = 0;
            $scope.setEmptyPackage();
            $state.go($state.current, {packageId: undefined},{reload:true}); //, {reload:$state.current}

        } else if (new RegExp("packageListing").test($scope.previousState.name)
            && ($stateParams.packageId != 0 && $stateParams.packageId != undefined && $stateParams.packageId != '')) {
            console.log(' $rootScope.previousState 2')
            $rootScope.PackageId = $stateParams.packageId;
            $rootScope.action = 'edit';
            $scope.showPackageData();

        }else if (new RegExp("pack-site").test($scope.previousState.name)
            && ($stateParams.packageId != 0 && $stateParams.packageId != undefined && $stateParams.packageId != '')) {
            console.log(' $rootScope.previousState 2new')
            $rootScope.PackageId = $stateParams.packageId;
            $rootScope.action = 'edit';
            $scope.showPackageData();

        }else if (new RegExp("packageListing").test($scope.previousState.name)
            && (!($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            || (!$rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''))) {

            console.log(' $rootScope.previousState 3')
            $rootScope.distributionChannelId = undefined;
            $scope.setEmptyPackage();

        } else if ( (new RegExp("pack-site").test($scope.previousState.name) || new RegExp("pack-site").test($state.current.name))
            && (($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            || ($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''))) {
            
            console.log(' $rootScope.previousState 4')
            if($stateParams.packageId != ''){
                $rootScope.PackageId = $stateParams.packageId;
            }
            $rootScope.action = 'edit';
            $scope.showPackageData();

        }else if ( (new RegExp("pack-site").test($scope.previousState.name) || new RegExp("pack-site").test($state.current.name))
            && (!($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
            || (!$rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != ''))) {
            console.log(' $rootScope.previousState 5')
                        // $state.go($scope.tabs[$scope.tabIndex].state, {packageId: undefined}); //, {reload:$state.current}
            $scope.setEmptyPackage();

        }else if(($stateParams.packageId != undefined && $stateParams.packageId != '' && $stateParams.packageId != 0)
             && ($rootScope.action  !== '' && $rootScope.action !== 'edit' )){
             console.log(' $rootScope.previousState 6')

             $rootScope.PackageId = $stateParams.packageId;
             $rootScope.action = 'edit';
             $scope.showPackageData();
         }else if (($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '')
            && ($rootScope.action !== '' && $rootScope.action !== 'edit' )) {
           // console.log(' $rootScope.previousState 7'  )
            $scope.setEmptyPackage();
        } 
    }

    if($stateParams.packageId > 0 && ($rootScope.action = 'edit')){
        $rootScope.disableDeliveryChannel= true
    }else{
        $rootScope.disableDeliveryChannel= false
    }
});