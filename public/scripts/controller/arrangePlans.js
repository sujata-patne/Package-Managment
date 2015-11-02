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
    $scope.alacartarray = [];
    //$scope.array=[];
    $scope.arrangedContentList = {};
    $scope.nextButtonPressed = 0;
    $scope.sequenceData = [];


    //Watching changes in Package Id
    $rootScope.$watch('PackageId', function (value, old) {
        $scope.init();
    }, true);


    $scope.init = function () {
        var packageId = $rootScope.PackageId;
        if ($rootScope.PackageId != undefined && $rootScope.PackageId != '' && $rootScope.PackageId != null) {
            Arrangeplans.getArrangePlansData({pkgId: packageId}, function (data) {

                $scope.AlacartPlans = data.arrangeSequenceData;
                var sequence = angular.copy(data.arrangeSequenceData);

                sequence.forEach(function (plans) {
                    if (!_.has($scope.sequenceData, plans.id)) {
                        $scope.sequenceData[plans.id] = {};
                    }
                    $scope.sequenceData[plans.id] = {pas_arrange_seq: plans.pas_arrange_seq};
                })
                var isAlacartPlansExist = data.isAlacartPlansExist;

                $scope.AlacartPlans = data.PackageAlacartPacks;
                $scope.finalarray = data.selectedPlans;
                if (isAlacartPlansExist > 0) {
                    var obj = {};
                    obj['id'] = "4" + $scope.AlacartPlans[0].paos_id;
                    obj['plan_id'] = $scope.AlacartPlans[0].paos_id;
                    obj['plan_name'] = 'All Plans';
                    obj['plan_type'] = 'A-La-Cart';
                    $scope.finalarray.push(obj)
                }
            });
        }
    }


    $scope.submitArrangePlansForm = function (valid) {


        //Get the length of filled values.
        var arrlength = $scope.sequenceData.filter(function (e) {
            return e;
        });
        arrlength = arrlength.filter(function (e) {
            return e.pas_arrange_seq != null;
        });
        angular.forEach(arrlength, function (v, i) {
            if (v.pas_arrange_seq > 9999 ) {
                valid = false;
            }
        })

        if (!valid) {
            toastr.error("Maxlength is 4")
        } else if(arrlength.length == 0 || arrlength.length < $scope.finalarray.length ) {
            toastr.error('Please fill the  values in range');
        }else {
            var data = {
                packageId: $rootScope.PackageId,
                finalarray: $scope.finalarray,
                sequenceData: $scope.sequenceData
            }

            Arrangeplans.AddArrangedContents(data, function (data) {

                toastr.success(data.message);
                if ($scope.nextButtonPressed) {
                    $rootScope.proceed();
                } else {
                    $state.go($state.current, {packageId: $rootScope.PackageId}); //{reload: $state.current}
                }

            }, function (error) {
                toastr.error(error)
            })
        }
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
                duplicate.push( parseInt( id ) );
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
    $scope.resetForm = function(id) {
        $scope.sequenceData = [];
    }
// validate space in arrange sequence
   $scope.AvoidSpace = function(event) {
        var k = event ? event.which : window.event.keyCode;
        if (k == 32) return false;
    }


});