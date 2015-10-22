myApp.controller('notificationCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams , Notification) {
    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');

    $('#notifications').addClass('active');
    $scope.tabs = [
        {title: "Add New Notifications", state: "notifications.add", active: true},
        {title: "List Of Notifications", state: "notifications.list", active: false}
    ];
    $rootScope.n_selectedPlans = [];
    $scope.setIndex = function($index){
        $scope.tabIndex = $index;
        $state.transitionTo($scope.tabs[$scope.tabIndex].state);
        //default form display for a-la-cart and offer plan
        $state.transitionTo($scope.tabs[$scope.tabIndex]['state']);
    }


    Notification.getDistributionChannel(function (data) {
        $rootScope.distributionChannels = angular.copy(data.distributionChannels);
    });
    $scope.OnDistributionChange = function(){
        var data= {
            distributionChannelId: $rootScope.n_distributionChannelId
        }

        Notification.getNotificationData(data,function (data) {
            //console.log(data)
            $scope.packageName = angular.copy(data.PackageName);
        });
    }

    $scope.OnPackageChange = function(){
        var data= {
            PackageId: $rootScope.n_selectedPackage
        }

        Notification.getNotificationData(data,function (data) {
            $scope.plans = data.SubscriptionPacks.concat(data.ValuePacks)
            //$scope.packs = angular.copy(data.Packs);
        });
    }


});