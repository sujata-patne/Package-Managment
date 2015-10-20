myApp.controller('notificationListCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams,  Notification) {
    $rootScope.n_addNotification = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    if ($rootScope.n_selectedPackage && $rootScope.n_selectedPackage != null && $rootScope.n_selectedPackage != undefined && $rootScope.n_selectedPackage != ''){

        var Data = {
            PackageId: $rootScope.n_selectedPackage,
            PlanId: $rootScope.n_selectedPlans
        }
        Notification.listNotificationData(Data, function (data) {
            toastr.success("save successfully");

        });
    }else{
        toastr.error('Please Select Package');
    }


});