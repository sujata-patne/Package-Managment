myApp.controller('tabsController',function ($scope) {
  $scope.tabIndex = 0;
  $scope.buttonLabel = "Next";

  $scope.tabs = [
      { title:"A-La-Cart & Offer Plans", state:"alacart", content:" content 1", active: true },
      { title:"Value Pack Plans",  state:"valuepack",content:" content 2" },
      { title:"Subscription Plans",  state:"subscriptionplan",content:" content 3" },
      { title:"Advance Settings", state:"advancesetting", content:" content 4" },
      { title:"Arrange Plans",  state:"arrangeplan", content:" content 5" }
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
});