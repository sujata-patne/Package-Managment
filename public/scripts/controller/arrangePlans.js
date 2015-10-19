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
    $scope.arrangedContentList ={};

    $scope.sequenceData = [];
var packageId = $rootScope.PackageId;
    Arrangeplans.getArrangePlansData({packageId:packageId},function(data) {
        console.log('called default')
        console.log({packageId:$rootScope.PackageId})
        $scope.AlacartPlans = data.arrangeSequenceData;
        var sequence = angular.copy(data.arrangeSequenceData);

        sequence.forEach(function(plans){
            if(!_.has($scope.sequenceData,plans.id)){
                $scope.sequenceData[plans.id] = {};
            }
            $scope.sequenceData[plans.id] = {pas_arrange_seq:plans.pas_arrange_seq};
        })

        $scope.AlacartPlans = data.PackageAlacartPacks;
        $scope.finalarray = data.selectedPlans;
        if($scope.AlacartPlans.length > 0){
            var obj = {};
            obj['id'] = "4"+$scope.AlacartPlans[0].paos_id;
            obj['plan_id'] = $scope.AlacartPlans[0].paos_id;
            obj['plan_name'] = 'All Plans';
            obj['plan_type'] = 'A-La-Cart';
            $scope.finalarray.push(obj)
        }
        console.log($scope.finalarray)
        console.log($scope.sequenceData)
    });

    $scope.submitForm = function(){

        if($scope.arrangedContentList==0)
        {
            $scope.disable="true";
            toastr.error("enter the arrange sequence");
        }
        console.log($scope.finalarray)
        console.log($scope.sequenceData)
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
        var unique = [];
        var duplicate = [];
        var previous_value = 0;
        angular.forEach($scope.sequenceData,function(value,key) {
            if( unique.length == 0 ) {
                unique.push( parseInt( value.pas_arrange_seq ) );
            } else if( unique.indexOf(parseInt( value.pas_arrange_seq ) ) == -1 ) {
                unique.push( parseInt( value.pas_arrange_seq ) );
            } else {
                duplicate.push( parseInt( key) );
            }
            $scope.unique = unique;
            $scope.duplicate = duplicate;

        });
        if( $scope.duplicate.length > 0 ) {
            toastr.error("Duplicate values not allowed!");
            angular.forEach($scope.duplicate,function(value,key) {
                console.log($scope.sequenceData[value])

                    $scope.sequenceData[value].pas_arrange_seq = '';

            })
        }
    }



});