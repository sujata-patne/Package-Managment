myApp.controller('notificationAddCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams, Notification) {
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
$scope.counts =[
    {options:'LessThan'},
    {options:'MoreThan'},
    {options:'EqualTo'},
    {options: 'N.A'}
];
    $scope.percent =[
        {options:'10%'},
        {options:'20%'},
        {options:'30%'},
        {options:'40%'},
        {options:'50%'},
        {options:'60%'},
        {options:'70%'},
        {options:'80%'},
        {options:'90%'},
        {options:'100%'}
    ];
    $scope.push =[
        {options:'once a day'},
        {options:'twice a day'}
    ];
    var data= {
        distributionChannelId: $rootScope.distributionChannelId
    }
    console.log(data)
    Notification.getNotificationData(data,function (data) {
        $scope.packageName = angular.copy(data.PackageName);
    });

});
