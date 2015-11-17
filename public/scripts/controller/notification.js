myApp.controller('notificationCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams , Notification) {
    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');
    $('#notifications').addClass('active');
    $scope.tabs = [
        {title: "Add New Notification", state: "notifications.add", active: true},
        {title: "List Of Notifications", state: "notifications.list", active: false}
    ];
    $rootScope.n_selectedPlans = [];

    $scope.setIndex = function($index){
        $scope.tabIndex = $index;
        // alert('msg');
        //$state.go($scope.tabs[$scope.tabIndex].state);
        //default form display for a-la-cart and offer plan
        if($scope.tabIndex == 0){

            if( $scope.previousState.name != $scope.tabs[$scope.tabIndex].state ) {
                $rootScope.distributionChannels = [];
            }
        }
        $state.go($scope.tabs[$scope.tabIndex]['state']);
    }

    if($stateParams.packageId){
        $rootScope.PackageId = $stateParams.packageId;
        $rootScope.action = 'edit';
    }
    Notification.getDistributionChannel(function (data) {
        $rootScope.distributionChannels = angular.copy(data.distributionChannels);
    });

    if($rootScope.n_distributionChannelId != undefined && $rootScope.n_distributionChannelId != null){
         var data= {
            distributionChannelId: $rootScope.n_distributionChannelId
        }

        Notification.getNotificationData(data,function (data) {
            $scope.packageName = angular.copy(data.PackageName);
        });
    }

    if($rootScope.n_selectedPackage != undefined && $rootScope.n_selectedPackage != null){
         var data= {
            PackageId: $rootScope.n_selectedPackage
        }

        Notification.getNotificationData(data,function (data) {
            $scope.plans = data.SubscriptionPacks.concat(data.ValuePacks)
            //$scope.packs = angular.copy(data.Packs);
        });
    }
    $scope.OnDistributionChange = function(){
        var data= {
            distributionChannelId: $rootScope.n_distributionChannelId
        }

        Notification.getNotificationData(data,function (data) {
            $scope.packageName = angular.copy(data.PackageName);
            $.each($scope.packageName, function(key,value){
                if($scope.packageName[key].sp_package_name.indexOf("MainSite") != -1){
                    $scope.packageName[key].sp_package_name = "Mainsite";
                }
            });
        });
    }

    $scope.OnPackageChange = function(){
        $rootScope.n_selectedPlans = undefined;
        var data= {
            PackageId: $rootScope.n_selectedPackage
        }

        Notification.getNotificationData(data,function (data) {
            $scope.plans = data.SubscriptionPacks.concat(data.ValuePacks)
            //$scope.packs = angular.copy(data.Packs);
        });
    }


});