myApp.controller('notificationAddCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams, Notification) {
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    $scope.startingTime = new Date(1970, 0, 1, 00, 00, 0);
    $scope.endingTime = new Date(1970, 0, 1, 00, 00, 0);
    $scope.selectedPush = 0;
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
    $scope.submitNotificationForm = function (valid){

        if($scope.startingTime >= $scope.endingTime ){
            toastr.error('Start time  should be smaller than End time.');
        }
        else if($rootScope.n_selectedPlans.length == 0){
            toastr.error('Please Select Plan');
        }
        else {

            if ($rootScope.n_selectedPackage && $rootScope.n_selectedPackage != null && $rootScope.n_selectedPackage != undefined && $rootScope.n_selectedPackage != ''){

                var notificationData = {
                    PackageId: $rootScope.n_selectedPackage,
                    PlanId: $rootScope.n_selectedPlans,
                    Days: $scope.days == undefined ? 0 : $scope.days,
                    Hours: $scope.hours == undefined ? 1 : $scope.hours ,
                    Operator: $scope.selectedCount,
                    Percent: $scope.selectedPercent,
                    Message: $scope.messagetext,
                    PushFrom: $scope.startingTime,
                    PushTo: $scope.endingTime,
                    Push: $scope.selectedPush
                }
            Notification.addNotificationData(notificationData, function (data) {
                toastr.success("save successfully");

            });
        }else{
                toastr.error('Please Select Package');
            }
        }
    }


});
