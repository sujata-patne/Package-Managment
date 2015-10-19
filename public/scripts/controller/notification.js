myApp.controller('notificationCtrl', function ( $scope, $rootScope, $state, ngProgress, $stateParams , Notification) {
    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');

    $('#notifications').addClass('active');

    $scope.tabs = [
        {title: "Add New Notifications", state: "notifications.add", active: true},
        {title: "List Of Notifications", state: "notifications.list", active: false}
    ];

    $scope.setIndex = function($index){
        $scope.tabIndex = $index;
        $state.transitionTo($scope.tabs[$scope.tabIndex].state);
        //default form display for a-la-cart and offer plan
        $state.transitionTo($scope.tabs[$scope.tabIndex]['state']);
    }
Notification.getDistributionChannel(function (data) {
    $rootScope.distributionChannels = angular.copy(data.distributionChannels);
});

});