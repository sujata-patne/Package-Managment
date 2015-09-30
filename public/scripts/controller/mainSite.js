/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ($scope, $state, ngProgress, $stateParams, MainSite) {
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $scope.alacartPlanIds = {};
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