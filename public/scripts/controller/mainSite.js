/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ($scope, $state, ngProgress, $stateParams, MainSite) {
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";

    $scope.tabs = [
        { title:"A-La-Cart & Offer Plans", state:"main-site.alacart",  active: true },
        { title:"Value Pack Plans",  state:"main-site.valuepack" },
        { title:"Subscription Plans",  state:"main-site.subscription"},
        { title:"Advance Settings", state:"main-site.advancesetting" },
        { title:"Arrange Plans",  state:"main-site.arrangeplan" }
    ];
    //default form display for a-la-cart and offer plan
 $state.transitionTo($scope.tabs[$scope.tabIndex]['state']);
    $scope.proceed = function() {
        if($scope.tabIndex !== ( $scope.tabs.length - 1 ) ){
            $scope.tabs[$scope.tabIndex].active = false;
            $scope.tabIndex++;
            $scope.tabs[$scope.tabIndex].active = true;
            $state.transitionTo($scope.tabs[$scope.tabIndex]['state']);
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

    MainSite.getContentTypes(function (ContentTypeData) {
        $scope.ContentTypes = ContentTypeData.ContentTypes;
    });
});