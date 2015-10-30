myApp.controller('advanceSettingCtrl', function ($scope,$rootScope,$timeout, $state, ngProgress, $stateParams, MainSite,Upload, advanceSetting) {
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
    $scope.nextButtonPressed = 0;
    $scope.resetSetting = {};

    //Watching changes in Package Id
    $rootScope.$watch('PackageId',function(value,old) {
        $scope.init();
    }, true);

    $scope.init = function(){
    var preData;

    preData = {
      packageId : $rootScope.PackageId
    }

    advanceSetting.getData(preData,function(data){
        $scope.contentTypes = data.ContentTypes;
        $scope.offerPlan = data.PackageOffer;
        $scope.valuePlans = data.PackageValuePacks;
        //Getting the base CG image to show in thumbnail :
        $scope.cgimage = _.findWhere(data.CGImageData, {pci_is_default: 1});
        $scope.valueDataForUpdate = data.ValueDataForUpdate;
        $scope.offerDataForUpdate = data.OfferDataForUpdate;
        if($scope.offerPlan.length > 0 && $scope.offerDataForUpdate.length > 0){
            $scope.updateFlag = true;
            _.each($scope.offerDataForUpdate, function(el,index){
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



        if($scope.valuePlans.length > 0 && $scope.valueDataForUpdate.length > 0 ){
             $scope.updateFlag = true;
            _.each($scope.valueDataForUpdate, function(el,index){
                  var pvs_id = el.pvs_id;
                  var pass_content_type = el.pass_content_type;
                  var pass_value = el.pass_value;

                  if(!_.has($scope.valuePlanSetting,pvs_id)){
                         $scope.valuePlanSetting[pvs_id] = {};
                  }

                  $scope.valuePlanSetting[pvs_id][pass_content_type]  = pass_value == -1 ? 'BAL' : pass_value;
            });
        }else if( $scope.valuePlans.length == 0 && $scope.valueDataForUpdate.length > 0 ) {

        }
    });

}

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

    // $scope.valueTotal = function(contentTypeId){
    //  $scope.totalvalue = 0;
    //  //compute total buy
    //  angular.forEach($scope.offerGetSetting,function(value,key){
    //    if(value > 0){
    //      $scope.totalvalue += parseInt(value);
    //    }
    //  });
    // }

    $scope.getCGImage = function(){
         var preData;

          preData = {
            packageId : $rootScope.PackageId
          }

          advanceSetting.getData(preData,function(data){
               //Getting the base CG image to show in thumbnail : 
               $scope.cgimage = _.findWhere(data.CGImageData, {pci_is_default: 1});
          });
    }

    $scope.fileUploads = [];
    $scope.uploadSubmit = function(index){

             $scope.files = $scope.fileUploads;
             var valid = true;
             if($scope.files.length == 0){
                valid = false;
                toastr.error("Please select images to upload.");
             }
             if($scope.files[index].length > 1){
                valid = false;
                toastr.error("Max 1 files allowed per content type");
             }
             if(valid){
                      angular.forEach($scope.files, function(file) {
                         if (file && !file.$error) {
                            file.upload = Upload.upload({
                              url: '/UploadFile',
                              fields: {'packageId': $rootScope.PackageId},
                              file: file
                            });

                            file.upload.then(function (response) {
                              $timeout(function () {
                                file.result = response.data;
                              });
                            }, function (response) {
                              if (response.status > 0)
                                $scope.errorMsg = response.status + ': ' + response.data;
                            });

                            file.upload.progress(function (evt) {
                                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                $("#progress_id").html("Uploaded: "+progressPercentage+"%");
                                $scope.fileUploads[index].progress = Math.min(100, parseInt(100.0 * 
                                                       evt.loaded / evt.total));

                                

                                if( progressPercentage == 100 ){
                                    setTimeout(function(){
                                        // window.location.reload();
                                         $("#progress_id").html('');
                                         
                                    },3000);
                                     setTimeout(function(){
                                        // window.location.reload();
                                         // $("#progress_id").html('');
                                         $scope.getCGImage();
                                    },2000);
                                }
                            });
                        }   
                     }); 
             }
           
    }


 // $scope.filesubmit = function() {
 //      if (advanceSettingForm.form.file.$valid && $scope.file && !$scope.file.$error) {
 //          $scope.upload($scope.file);
 //      }else{
 //        console.log('not valid');
 //      }
 //      console.log('in submit');
 //    };

  // $scope.upload = function (file) {
  //       // Upload.upload({
  //       //     url: 'upload/url',
  //       //     data: {file: file, 'username': $scope.username}
  //       // }).then(function (resp) {
  //       //     console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
  //       // }, function (resp) {
  //       //     console.log('Error status: ' + resp.status);
  //       // }, function (evt) {
  //       //     var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
  //       //     console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
  //       // });
  //     console.log('in upload');
  //   };


  $scope.submitAdvanceSettingForm = function(isValid){
    if(isValid){
          if (!$rootScope.distributionChannelId) {
                toastr.error('Distribution Channel is required');
                $scope.errorvisible = true;
            }else{
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
                      
                        console.log($scope.valuePlanSetting);
                        angular.forEach($scope.valuePlanSetting,function(value,key){
                            //Key here is the plan id 
                            // console.log('Plan id::'+key);
                            //change to check :: vp_id ==> pvs_id 

                            var result_arr = _.findWhere($scope.valuePlans, {pvs_id: parseInt(key)});
                            
                            if(result_arr != undefined && result_arr != null){
                                var total_download_limit = result_arr.vp_download_limit;
                                var  vp_name = result_arr.vp_plan_name;
                                var computed_sum = 0;
                                angular.forEach(value,function(v,k){
                                  if(v != 'BAL'){
                                      computed_sum += parseInt(v);
                                  }
                                });
                                
                                if(computed_sum > total_download_limit){
                                    isValid = false;
                                    toastr.error('In Plan '+vp_name+': Computed sum more than the total');
                                    return false;
                                }
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
                        totalLength: $scope.contentTypes.length,
                        valueLength: $scope.valuePlans.length,
                        offerPackageSiteId: $scope.offerPlan.length == 0 ? '' : $scope.offerPlan[0].paos_id,
                        offerBuySetting: final_offerBuySetting,
                        offerGetSetting: final_offerGetSetting,
                        valuePlanSetting: final_valuePlanSetting,
                        updateFlag: $scope.updateFlag
                    }
                    $scope.resetSetting = newSetting;
                    if ($scope.updateFlag) {
                        advanceSetting.editSetting(newSetting, function (data) {
                            toastr.success('Successfully Updated!');
                        });
                    }
                    else {
                        $scope.updateFlag = true;
                        advanceSetting.addSetting(newSetting, function (data) {
                            toastr.success('Successfully Added!');
                        });
                    }
                    if($scope.nextButtonPressed) {
                        $rootScope.proceed();
                    }
                }
            }
        }
    }

$scope.resetForm = function(){
  $scope.offerBuySetting = {};
  $scope.offerGetSetting = {};
  $scope.valuePlanSetting = {};
  $scope.advanceSettingForm.$setPristine();
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