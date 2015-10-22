myApp.controller('notificationAddCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams,$timeout, Notification) {
    $rootScope.n_addNotification = true;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    $scope.startingTime = new Date(1970, 0, 1, 00, 00, 0);
    $scope.endingTime = new Date(1970, 0, 1, 00, 00, 0);
    $scope.selectedPush = 0;
    $scope.edit_state = false;
    $scope.addMore_flag = false;
$scope.counts =[
    {id:0,option_name:'LessThan'},
    {id:1,option_name:'MoreThan'},
    {id:2,option_name:'EqualTo'},
    {id:3,option_name: 'N.A'}
];
    $scope.percent =[
        {id:10,option_name:'10%'},
        {id:20,option_name:'20%'},
        {id:30,option_name:'30%'},
        {id:40,option_name:'40%'},
        {id:50,option_name:'50%'},
        {id:60,option_name:'60%'},
        {id:70,option_name:'70%'},
        {id:80,option_name:'80%'},
        {id:90,option_name:'90%'},
        {id:100,option_name:'100%'}
    ];
    $scope.push =[
        {id:0,option_name:'Once a day'},
        {id:1,option_name:'Twice a day'}
    ];
    if($stateParams.pn_id){
        $scope.edit_state = true;
        var data ={
            pnId:$stateParams.pn_id,
            state:'edit'
        }
        Notification.getNotificationData(data,function(data){
            debugger;
            var start_time = data.NotificationData[0].pn_pf;
            var start_hr = start_time.split(':')[0];
            var start_min = start_time.split(':')[1];
            var end_time = data.NotificationData[0].pn_pt;
            var end_hr = end_time.split(':')[0];
            var end_min = end_time.split(':')[1];
            $scope.days =  data.NotificationData[0].pn_after_day,
            $scope.hours =  data.NotificationData[0].pn_after_hour,
            $scope.selectedCount =  data.NotificationData[0].pn_cnt_logical_operator,
            $scope.selectedPercent =  data.NotificationData[0].pn_cnt_conditional_usage,
            $scope.messagetext =  data.NotificationData[0].pn_message,
            $scope.startingTime=  new Date(1970, 0, 1, start_hr, start_min, 0),
            $scope.endingTime =  new Date(1970, 0, 1, end_hr, end_min, 0),
            $scope.selectedPush=  data.NotificationData[0].pn_push_type
        })
    }
    $scope.submitNotificationForm = function (valid) {
            if ($scope.startingTime >= $scope.endingTime) {
                 toastr.error('Start time  should be smaller than End time.');
            }else if($scope.messagetext == undefined){
            }
        else if ($stateParams.pn_id) {
            var notificationData = {
                pnId: $stateParams.pn_id,
                Days: $scope.days == undefined ? 0 : $scope.days,
                Hours: $scope.hours == undefined ? 1 : $scope.hours,
                Operator: $scope.selectedCount,
                Percent: $scope.selectedPercent,
                Message: $scope.messagetext,
                PushFrom: $scope.startingTime,
                PushTo: $scope.endingTime,
                Push: $scope.selectedPush
            }
            Notification.updateNotificationData(notificationData, function (data) {
                toastr.success("update successfully");
            });

        }
        else if ($rootScope.n_selectedPlans.length == 0) {
            toastr.error('Please Select Plan');
        }
        else {

            if ($rootScope.n_selectedPackage && $rootScope.n_selectedPackage != null && $rootScope.n_selectedPackage != undefined && $rootScope.n_selectedPackage != '') {

                var notificationData = {
                    PackageId: $rootScope.n_selectedPackage,
                    PlanId: $rootScope.n_selectedPlans,
                    Days: $scope.days == undefined ? 0 : $scope.days,
                    Hours: $scope.hours == undefined ? 1 : $scope.hours,
                    Operator: $scope.selectedCount,
                    Percent: $scope.selectedPercent,
                    Message: $scope.messagetext,
                    PushFrom: $scope.startingTime,
                    PushTo: $scope.endingTime,
                    Push: $scope.selectedPush
                }


                Notification.addNotificationData(notificationData, function (data) {

                    toastr.success("save successfully");

                    if($scope.addMore_flag){
                        //$timeout(function() {
                        //    angular.element('#reset_btn').triggerHandler('click');
                        //});
                        $timeout(function() {
                            $('#reset_btn').trigger('click');
                            $scope.resetForm();
                            $scope.startingTime = new Date(1970, 0, 1, 00, 00, 0);
                            $scope.endingTime = new Date(1970, 0, 1, 00, 00, 0);
                        });
                    }
                });

            }
            else {
                toastr.error('Please Select Package');
            }
        }

    }
$scope.addMore= function(){
    $scope.addMore_flag = true;
}
$scope.resetForm = function(){
    $scope.messagetext = undefined;
}

});
