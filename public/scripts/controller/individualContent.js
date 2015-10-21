myApp.controller('individualContentCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams, Upload, IndividualContent) {
	ngProgress.color('yellowgreen');
	ngProgress.height('3px');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;

    $scope.contentTypeFlag = false;
    $scope.selectedPlanFlag = false;

    $scope.selectedContent = [];
    $scope.final_selectedContent = [];

    var date = new Date();
    $scope.minDate = date.setDate((new Date()).getDate() - 0);

    var predata = {};
    IndividualContent.getIndividualContentData(predata,function(data){
    	$scope.contentTypes = data.ContentTypes;
    });


    $scope.openDatepicker = function (evt) {
        $scope.open2 = false;
        evt.preventDefault();
        evt.stopPropagation();
        $scope.open1 = !$scope.open1;
    }

    $scope.openEndDatepicker = function (evt1) {
        $scope.open1 = false;
        evt1.preventDefault();
        evt1.stopPropagation();
        $scope.open2 = !$scope.open2;
    }



    //To get Alacart plans based on content type : 
    $scope.changeContentType = function(){
        $scope.selectedPlanId = '';
    	$scope.final_selectedContent = [];
    	$scope.selectedContent = [];
        $scope.selectedPlanFlag = false;
    	var ctdata = {
    		contentTypeId : $scope.selectedContentType,
    		packId : $rootScope.SelectedPack
    	}
    	IndividualContent.getAlacartPlansByContentType(ctdata,function(data){
    		console.log(data);
            if(data.AlaCartPlans.length > 0){
                    $scope.contentTypeFlag = true;
                    $scope.alacartplans = data.AlaCartPlans;
                    $scope.contentData = data.ContentData;
            }else{
                $scope.contentTypeFlag = false;
            }
    	
   		 });
    }

    //Change in checkboxes of content : 
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

    //Change in Plan dropdown :
    $scope.planChange = function(){
        $scope.final_selectedContent = [];
        $scope.selectedContent = [];
        // $scope.current_plan_name  = _.where($scope.alacartplans, {ap_id: 2})[0].ap_plan_name;
        try{
             $scope.current_plan_name  = _.where($scope.alacartplans, {ap_id: $scope.selectedPlanId})[0].ap_plan_name;
             $scope.selectedPlanFlag = true;
         }catch(err){
             $scope.selectedPlanFlag = false;
         }
        if($rootScope.PackageId && $rootScope.PackageId != null && $rootScope.PackageId != undefined && $rootScope.PackageId != '' && $rootScope.PackageId != 0) {
	 		$scope.final_selectedContent = [];
            $scope.selectedContent = [];
	 		var data = {
	 			packageId : $rootScope.PackageId,
	 			packId : $rootScope.SelectedPack,
	 			planId : $scope.selectedPlanId,
	 			getDataForUpdate : true
	 		}
	 		IndividualContent.getIndividualContentData(data,function(data){
                    $scope.ValidDate = data.IndividualContentData[0].pic_valid_till;
		 			console.log('For update');
		 			console.log(data);
		 			data.IndividualContentData.forEach(function(el){
		                $scope.selectedContent[el.pic_cm_id] = true;
		            });
	 		});
   		 }
    }

 	

    $scope.submitIndividualContentForm = function(){
    if($rootScope.PackageId && $rootScope.PackageId != null && $rootScope.PackageId != undefined && $rootScope.PackageId != '') {
            if($rootScope.SelectedPack == undefined){
                toastr.error('Please select a valid pack');
            }else{
                var data = {
                    packId : $rootScope.SelectedPack,
                    alacartPlanId : $scope.selectedPlanId,
                    packageId : $rootScope.PackageId,
                    selectedContents : $scope.final_selectedContent,
                    validDate : $scope.ValidDate
                }

                if($rootScope.PackageId && $rootScope.PackageId != null && $rootScope.PackageId != undefined && $rootScope.PackageId != '') {
                    IndividualContent.editIndividualContent(data,function(data){
                        toastr.success('Successful!');
                    });
                }else{
                    IndividualContent.addIndividualContent(data,function(data){
                        toastr.success('Successful!');
                    });
                }    
            }

        }else{
            toastr.error('Please select a package');
        }

    }



$(document).ready(function() {

        // $("a.grouped_elements").fancybox();

        $("a.grouped_elements").fancybox({
            'transitionIn'  :   'elastic',
            'transitionOut' :   'elastic',
            'speedIn'       :   600, 
            'speedOut'      :   200, 
            'maxWidth'      :   400,
            'maxHeight'     :   400,
            // 'overlayShow'   :   false,
            'showCloseButton' : true
        });
            $('.fancybox').fancybox();
        
            $('.fancybox-audio').fancybox({
                'maxWidth'      :   400,
                'maxHeight'     :   400,
            });
        
            $(".fancybox-video").fancybox({
                'maxWidth': '70%',
                'maxHeight': '70%'
            });
    });


});