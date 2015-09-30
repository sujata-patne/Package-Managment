/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.controller('mainSiteCtrl', function ($scope, $http, ngProgress, $stateParams, MainSite) {
    $scope.tabIndex = 0;
    $scope.buttonLabel = "Next";
    $scope.selectedValuePacks = [];
    $scope.selectedStore = [];
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

    MainSite.getContentTypes(function (ContentTypeData) {
        $scope.ContentTypes = ContentTypeData.ContentTypes;
    });

    MainSite.getValuePackPlans(function ( ValuePackPlanData ) {
        $scope.ValuePackPlans = angular.copy( ValuePackPlanData.valuePackPlans );
    });

    MainSite.getDistributionChannels(function ( distributionChannelData ) {
        $scope.distributionChannels = angular.copy( distributionChannelData.distributionChannels );
    });

    $scope.submitValuePackForm = function( isValid ) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        var valuePackData = {
            selectedValuePacks: $scope.selectedValuePacks,
        };
        if (isValid) {
            if($stateParams.id){
                packData.valuePackId = $stateParams.id;
                ngProgress.start();
                MainSite.editValuePackPlan(valuePackData,function(data){
                    $scope.result(data);

                },function(error){
                    console.log(error);
                });
                ngProgress.complete();
            }else{
                MainSite.addValuePackPlan(valuePackData,function(data){
                    ngProgress.start();
                    $scope.result(data);
                    ngProgress.complete();
                },function(error){
                    console.log(error);
                });
            }
        }

    }
});