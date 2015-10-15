/**
 * Created by sujata.patne on 08-10-2015.
 */
myApp.controller('arrangePlanCtrl', function ($scope,$rootScope, $state, ngProgress, $stateParams, Arrangeplans) {

    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    $scope.finalarray = [];
    $scope.alacartarray=[];
    $scope.array=[];
    var preData;
    $scope.arrangedContentList ={};

    preData = {
        packageId : $rootScope.PackageId
    }
    Arrangeplans.getArrangePlansData(preData,function(data) {
        $scope.AlacartPlans = data.PackageAlacartPacks;
        $scope.selectedPlans = data.selectedPlans;

        console.log($scope.selectedPlans)
        var index = $scope.finalarray.length;
        if( $scope.AlacartPlans.length>0) {
            //angular.forEach($scope.AlacartPlans, function (value, key) {
            var obj = {}
            obj['plan_id'] = $scope.AlacartPlans[0].paos_id;
            obj['plan_name'] = 'All Plans';
            obj['plan_type'] = 'A-La-Cart';
          //  obj['pas_id'] = '';
            obj['seq_id'] = index++;
            $scope.finalarray.push(obj);
            $scope.sequenceData.push({'pas_id':''});
        }
        $scope.offerPlan = data.PackageOffer;
        angular.forEach($scope.offerPlan, function (value, key) {
            var obj ={}
            obj['plan_id'] = value.op_id;
            obj['plan_name'] = value.op_plan_name;
            obj['plan_type'] = 'Offer';
            obj['seq_id'] = index++;
            $scope.finalarray.push(obj);
            $scope.sequenceData.push({'pas_id':''});

        });
        $scope.valuePlans = data.PackageValuePacks;
        angular.forEach($scope.valuePlans, function (value, key) {
            var obj ={}

            obj['plan_id'] = value.vp_id;
            obj['plan_name'] = value.vp_plan_name;
            obj['plan_type'] = 'ValuePack';
            obj['seq_id'] = index++;
            $scope.finalarray.push(obj);
            $scope.sequenceData.push({'pas_id':''});


        });
        $scope.subscriptionPlans = data.PackageSubscriptionPacks;
        angular.forEach($scope.subscriptionPlans, function (value, key) {
            var obj ={}
            obj['plan_id'] = value.sp_id;
            obj['plan_name'] = value.sp_plan_name;
            obj['plan_type'] = 'Subscription Plan';
            obj['seq_id'] = index++;
            $scope.finalarray.push(obj);
            $scope.sequenceData.push({'pas_id':''});

        });
        // $scope.AlacartPlans = data.PackageAlacartPacks;
        // if( $scope.AlacartPlans.length>0) {
        //     //angular.forEach($scope.AlacartPlans, function (value, key) {
        //     var obj = {}
        //     // obj['plan_id'] = value.ap_id;
        //     obj['plan_name'] = 'All Plans';
        //     obj['plan_type'] = 'Alacart';
        //     $scope.finalarray.push(obj);
        // }
    });
    $scope.arrangeContent = function () {
        /*angular.forEach($scope.sequence,function(value,key) {
            var data = {};
            data[key] = value;
            $scope.arrangedContentList[key] = value;
        })*/


    }
    $scope.submitForm = function(){

        if($scope.arrangedContentList==0)
        {
            $scope.disable="true";
            toastr.error("enter the arrange sequence");
        }
        var data ={
            packageId : $rootScope.PackageId,
            finalarray:$scope.finalarray,
            sequenceData: $scope.sequenceData
           }

        Arrangeplans.AddArrangedContents( data , function (data) {
            if( data.save === true ) {
                toastr.save(data.message);
            }else {
                toastr.success(data.message);
            }
        },function(error){
            console.log(error)
            toastr.error(error)
        })
    }
    $scope.checkForDuplicates = function(id) {
        console.log('duplicate')
        var unique = [];
        var duplicate = [];
        var previous_value = 0;
        angular.forEach($scope.sequenceData,function(value,key) {
            if( unique.length == 0 ) {
                unique.push( parseInt( value.pas_arrange_seq ) );
            } else if( unique.indexOf(parseInt( value.pas_arrange_seq ) ) == -1 ) {
                unique.push( parseInt( value.pas_arrange_seq ) );
            } else {
                duplicate.push( parseInt( value.pas_arrange_seq ) );
            }
            $scope.unique = unique;
            $scope.duplicate = duplicate;
        });
        if( $scope.duplicate.length > 0 ) {
            toastr.error("Duplicate values not allowed!");
            $scope.sequence[id] = "";
        }
    }



});