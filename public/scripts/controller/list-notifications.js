myApp.controller('notificationListCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams,  Notification) {
    $rootScope.n_addNotification = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;

    $rootScope.listnotification_onPlanChange = function(){
        if ($rootScope.n_selectedPackage && $rootScope.n_selectedPackage != null && $rootScope.n_selectedPackage != undefined && $rootScope.n_selectedPackage != ''){

            var Data = {
                PackageId: $rootScope.n_selectedPackage,
                PlanId: $rootScope.n_selectedPlans
            }
            Notification.listNotificationData(Data, function (data) {
                $scope.NotificationResult = angular.copy(data.ListNotification);
            });
        }else{
            toastr.error('Please Select Package');
        }
    }
    $scope.Delete = function( pnId )
    {
        if (confirm("Are you want to sure " + 'delete' + ' this plan ?')) {
            var data = {
                pnId:pnId,
                Status: 'delete'
            }
            ngProgress.start();

            Notification.n_delete(data, function (data) {

                if (data.success) {
                    $rootScope.listnotification_onPlanChange();
                    toastr.success(data.message);
                    $scope.successvisible = true;
                }
                else {
                    toastr.error(data.message);
                    $scope.errorvisible = true;
                }
                ngProgress.complete();
            },function(err){
                console.log(err);
            });
        }
    }
    $scope.BlockUnBlockContentType = function( pnId, isActive ){
        var active = 1;
        if (isActive == 1) {
            active = 0;
        }
        if (confirm("Are you want to sure " + (active == 0 ? 'block' : 'unblock') + ' this plan ?')) {
            var data = {
                active: active,
                pnId: pnId,
                Status: active == 0 ? 'blocked' : 'unblocked'
            }
            ngProgress.start();
            Notification.n_blockUnBlockContentType(data, function (data) {
                if (data.success) {
                    $rootScope.listnotification_onPlanChange();
                    toastr.success(data.message);
                    $scope.successvisible = true;
                }
                else {
                    $scope.error = data.message;
                    $scope.errorvisible = true;
                }
                ngProgress.complete();
            },function(err){
                console.log(err);
            });
        }


    }

   $scope.EditNotification = function(pn_id,pn_sp_pkg_id,pn_plan_id,pn_plan_type){
           $state.go('edit-notifications', {pn_id:pn_id,pn_sp_pkg_id:pn_sp_pkg_id,pn_plan_id:pn_plan_id,pn_plan_type:pn_plan_type});
   }

});