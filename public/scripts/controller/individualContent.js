myApp.controller('individualContentCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams, Upload, IndividualContent) {
	ngProgress.color('yellowgreen');
	ngProgress.height('3px');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;

    $scope.selectedContent = [];
    $scope.final_selectedContent = [];

    IndividualContent.getIndividualContentData(function(data){
    	$scope.contentTypes = data.ContentTypes;

    });

    $scope.changeContentType = function(){
    	var ctdata = {
    		contentTypeId : $scope.selectedContentType,
    		packId : $rootScope.selectedPack
    	}


    	IndividualContent.getAlacartPlansByContentType(ctdata,function(data){
    		console.log(data);
    		$scope.alacartplans = data.AlaCartPlans;
    		$scope.contentData = data.ContentData;
   		 });
    }

   $scope.changeContent = function(){
        var sel_length = $scope.selectedContent.filter(function(el){ return el == true });
        sel_length = sel_length.length;
        if(sel_length > 0){
            $scope.final_selectedContent = [];
            for ( i in $scope.selectedContent){
                if($scope.selectedContent[i]){
                    $scope.final_selectedContent.push(parseInt(i));
                }
            }
        }else{
            $scope.final_selectedContent = [];
            $scope.selectedContent = [];
        }
    }


    $scope.submitIndividualContentForm = function(){
    		var data = {
    			packId : $rootScope.selectedPack,
    			alacartPlanId : $scope.selectedPlanId,
    			packageId : $rootScope.packageId,
    			selectedContents : $scope.final_selectedContent
    		}
    		IndividualContent.addIndividualContent(data,function(data){
    				alert('Yo!');
    		});
    }
});