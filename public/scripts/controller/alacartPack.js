/**
 * Created by sujata.patne on 05-10-2015.
 */

myApp.controller('alacartCtrl', function ($scope, $http, ngProgress, $stateParams, MainSite) {
    $scope.PackageType = 0;
    console.log($scope.PackageId)
    MainSite.getAlacartNOfferPackDetails({pkgId:$scope.PackageId}, function (MainSiteData) {
        $scope.mainSitePackageData = angular.copy(MainSiteData.mainSitePackageData);

        $scope.alacartNofferDetails = angular.copy(MainSiteData.ContentTypeData);

        if($scope.mainSitePackageData){
            $scope.distributionChannelId = $scope.mainSitePackageData.sp_dc_id;
            $scope.PackageId = $scope.mainSitePackageData.sp_pkg_id;
        }
        if($scope.alacartNofferDetails.length > 0){
            angular.forEach($scope.alacartNofferDetails, function(data){
                $scope.alacartPlanIds[data.pct_content_type_id] = {download:data.pct_download_id,streaming:data.pct_stream_id};
            })
        }
    });
    $scope.submitForm = function (isValid) {
        var alacartData = {
            ContentTypes: $scope.ContentTypes,
            alacartPlansList: $scope.alacartPlanIds,
            offerId: $scope.offerId,
            packageId: $scope.PackageId,
            packageType: $scope.PackageType,
            distributionChannelId: $scope.distributionChannelId
        }
        //console.log(alacartData)
        ngProgress.start();
        MainSite.addAlacartNOffer(alacartData, function (data) {
            if (data.success) {
                toastr.success(data.message)
                $scope.successvisible = true;
            }
            else {
                toastr.success(data.message)
                $scope.errorvisible = true;
            }
            ngProgress.complete();
        });
    }
});