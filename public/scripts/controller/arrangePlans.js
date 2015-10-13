/**
 * Created by sujata.patne on 08-10-2015.
 */
myApp.controller('arrangePlanCtrl', function ($scope, $state, ngProgress, $stateParams, Arrangeplans) {

    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    var preData;

    preData = {
        packageId : $scope.PackageId
    }
    Arrangeplans.getArrangeData(preData,function(data) {
        console.log('tdus')
        $scope.offerPlan = data.PackageOffer;
        $scope.valuePlans = data.PackageValuePacks;
        $scope.subscriptionPlans = data. PackageSubscriptionPacks;
    })
});