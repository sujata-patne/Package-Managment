myApp.controller('advanceSettingCtrl', function ($scope, $state, ngProgress, $stateParams, MainSite, advanceSetting) {
	ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    $scope.offerBuySetting = {};
    $scope.offerGetSetting = {};
    $scope.valuePlanSetting = {};
    $scope.updateFlag = false;
    // $scope.valuePlanTotals = {};
    var preData;

    preData = {
    	packageId : $scope.PackageId
    }

    if($scope.PackageId != ""){
       // console.log('PackageId '+$scope.PackageId);

    }
    advanceSetting.getData(preData,function(data){
    	$scope.contentTypes = data.ContentTypes;
        console.log($scope.contentTypes);
    	$scope.offerPlan = data.PackageOffer;
    	$scope.valuePlans = data.PackageValuePacks;
        $scope.valueDataForUpdate = data.ValueDataForUpdate;
        $scope.offerDataForUpdate = data.OfferDataForUpdate;
        if($scope.offerDataForUpdate.length > 0){
            $scope.updateFlag = true;
            // $scope.offerBuySetting = [];
            // $scope.offerGetSetting = [];
            _.each($scope.offerDataForUpdate, function(el,index){
                  // $scope.offerBuySetting.push([]);
                  // $scope.offerGetSetting.push([]);
                   index = _.findIndex($scope.contentTypes, {cd_id : el.pass_content_type});
                   if(!_.has($scope.offerBuySetting,index)){
                         $scope.offerBuySetting[index] = {};
                  }
                   if(!_.has($scope.offerGetSetting,index)){
                         $scope.offerGetSetting[index] = {};
                  }
                  $scope.offerBuySetting[index][el.pass_content_type] = el.pass_buy == -1 ? 'BAL' : el.pass_buy;
                  $scope.offerGetSetting[index][el.pass_content_type] = el.pass_get == -1 ? 'BAL' : el.pass_get;
            })
        }

        if($scope.valueDataForUpdate.length > 0){
             $scope.updateFlag = true;
            _.each($scope.valueDataForUpdate, function(el,index){
                  var pvs_vp_id = el.pvs_vp_id;
                  var pass_content_type = el.pass_content_type;
                  var pass_value = el.pass_value;

                  if(!_.has($scope.valuePlanSetting,pvs_vp_id)){
                         $scope.valuePlanSetting[pvs_vp_id] = {};
                  }

                  $scope.valuePlanSetting[pvs_vp_id][pass_content_type]  = pass_value == -1 ? 'BAL' : pass_value;
            }); 
        }
    });


   

    $scope.offerBuy = function(contentTypeId){
        $scope.totalBuy = 0;
        //compute total buy
        angular.forEach($scope.offerBuySetting,function(value,key){
            var num = parseInt(_.values(value));
            if( num > 0){
                $scope.totalBuy += parseInt(num);
            }
        });
    }

    $scope.offerGet = function(contentTypeId){
        $scope.totalGet = 0;
        //compute total buy
        angular.forEach($scope.offerGetSetting,function(value,key){
            var num = parseInt(_.values(value));
            if(num > 0){
                $scope.totalGet += parseInt(num);
            }
        });
    }

    $scope.valueTotal = function(contentTypeId){
   		$scope.totalGet = 0;
    	//compute total buy
    	angular.forEach($scope.offerGetSetting,function(value,key){
    		if(value > 0){
    			$scope.totalGet += parseInt(value);
    		}
    	});
    }


    $scope.submitAdvanceSettingForm = function(isValid){
      if($scope.offerPlan.length == 0){
        isValid = true;
      }
      if($scope.offerPlan.length > 0){

          if($scope.totalGet > $scope.offerPlan[0].op_free_item){
              toastr.error(' In offer plan get :  computed sum greater than their total.');
              isValid = false;
          }
          if($scope.totalBuy > $scope.offerPlan[0].op_buy_item){
              toastr.error('In offer plan buy :  computed sum greater than their total.');
              isValid = false;
          }
      }
    

        angular.forEach($scope.valuePlanSetting,function(value,key){
            //Key here is the plan id 
            // console.log('Plan id::'+key);
            //change to check :: vp_id ==> pvs_id 
            var result_arr = _.findWhere($scope.valuePlans, {pvs_id: parseInt(key)});
            var total_download_limit = result_arr.vp_download_limit;
            var  vp_name = result_arr.vp_plan_name;
            var computed_sum = 0;
            angular.forEach(value,function(v,k){
                computed_sum += parseInt(v);
            });

            if(computed_sum > total_download_limit){
                isValid = false;
                toastr.error('In Plan '+vp_name+': Computed sum more than the total');
                return false;
            }
        });//forEach

        if(isValid){
            var final_offerBuySetting = angular.copy($scope.offerBuySetting);
            var final_offerGetSetting = angular.copy($scope.offerGetSetting);
            var final_valuePlanSetting = angular.copy($scope.valuePlanSetting);

            //Changing BAL TO -1 :
            angular.forEach(final_offerBuySetting,function(value,key){
                  angular.forEach(value,function(v,k){
                    if(v == 'BAL'){
                      value[k] = -1;
                    }
                  });
            });

            angular.forEach(final_offerGetSetting,function(value,key){
                  angular.forEach(value,function(v,k){
                    if(v == 'BAL'){
                      value[k] = -1;
                    }
                  });
            });

            angular.forEach(final_valuePlanSetting,function(value,key){
                  angular.forEach(value,function(v,k){
                    if(v == 'BAL'){
                      value[k] = -1;
                    }
                  });
            });

            var newSetting = {
                    totalLength : $scope.contentTypes.length,
                    valueLength : $scope.valuePlans.length,
                    offerPackageSiteId : $scope.offerPlan.length == 0 ? '' : $scope.offerPlan[0].paos_id,
                    offerBuySetting : final_offerBuySetting,
                    offerGetSetting : final_offerGetSetting,
                    valuePlanSetting : final_valuePlanSetting,
                    updateFlag : $scope.updateFlag
            }

          if($scope.updateFlag){
               advanceSetting.editSetting(newSetting,function(data){
                    toastr.success('Successfully Updated!');
               });
          }else{
               $scope.updateFlag = true;
               advanceSetting.addSetting(newSetting,function(data){
                    toastr.success('Successfully Added!');
               });
            
          }
        }

    }

});