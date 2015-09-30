/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ($scope, $http, ngProgress, $stateParams, MainSite) {
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $scope.alacartPlanIds = {};
    $scope.tabs = [
        { title:"A-La-Cart & Offer Plans", state:"main-site.alacart", content:" content 1", active: true },
        { title:"Value Pack Plans",  state:"main-site.valuepack",content:" content 2" },
        { title:"Subscription Plans",  state:"main-site.subscription",content:" content 3" },
        { title:"Advance Settings", state:"main-site.advancesetting", content:" content 4" },
        { title:"Arrange Plans",  state:"main-site.arrangeplan", content:" content 5" }
    ];

    $scope.proceed = function() {
        console.log($scope.tabIndex);
        console.log($scope.tabs.length);
        if($scope.tabIndex !== ( $scope.tabs.length - 1 ) ){
            console.log($scope.tabs[$scope.tabIndex]);
            $scope.tabs[$scope.tabIndex].active = false;
            $scope.tabIndex++;
            $scope.tabs[$scope.tabIndex].active = true;
        }
    };
    $scope.dis = function() {
        if($scope.tabIndex === $scope.tabs.length -1){
            return true;
        }

    };

    $scope.setIndex = function($index){
        $scope.tabIndex = $index;

    }
    $scope.showDeliveryTypes = function(contents){
        return contents.parent_name === 'Audio' || contents.parent_name === 'Video';
    };
    MainSite.getContentTypes(function (MainSiteData) {
       // $scope.ContentTypes = ContentTypeData.ContentTypes;
        $scope.OfferData = angular.copy(MainSiteData.OfferData);
        $scope.ContentTypes = angular.copy(MainSiteData.ContentTypes);
        $scope.alacartData = angular.copy(MainSiteData.ContentTypeData);
    });
    $scope.submitForm = function (isValid) {
        console.log($scope.alacartPlanIds)
        console.log('test' + $scope.alacartPlanIds)
    }

});