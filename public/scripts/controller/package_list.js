myApp.controller('PackageListCtrl', function ($scope, $rootScope, $stateParams,$state, ngProgress, Package) {
    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');
    $('#package-listing').addClass('active');
    $scope.PageTitle = $state.current.name == "edit-store" ? "Edit " : "Add ";
    // $scope.PageTitle = "Add";
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    $scope.CurrentPage = $state.current.name;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.packageName = [];
    $scope.alphabets = [];
    $scope.isAdded = false;
    $scope.listcurrentPage = 0;
    $scope.listpageSize = 2;
    //Date Picker :::
    $scope.open1 = false;
    $scope.open2 = false;
    $scope.alphabets = "1ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

    $scope.distributionChannelChange = function(){
        $scope.search_title="";
        //$('#src_'+$scope.alpha).css('font-weight','normal');
        //$('#src_'+$scope.alpha).css('font-size','small');
        var data = {
            title_text : ($scope.alpha)? $scope.alpha:$scope.search_title,
            st_date : $scope.StartDate,
            end_date :$scope.EndDate,
            distributionChannelId : $scope.distributionChannel
        }
        Package.getPackageDetail( data,function( data ){
            $scope.packageList = data.packageByName;
        },function(error){
            console.log(error);
        });

    }

    $scope.EditPackage = function(pkgId,dcId,pkgType,parentId){
        $rootScope.PackageId = pkgId;
        $rootScope.distributionChannelId = dcId;
        $rootScope.PackageType = pkgType;
        $rootScope.ParentPackageId = parentId;
        $rootScope.action = 'edit';
        if($rootScope.PackageId != 0 && $rootScope.PackageId != undefined && $rootScope.PackageId != '') {

            if ($rootScope.ParentPackageId != 0 && $rootScope.ParentPackageId != undefined && $rootScope.ParentPackageId != '') {
                $state.go('main-site-map', {packageId: $rootScope.PackageId});
            } else {
                if ($rootScope.PackageType === 1) {
                    $state.go('pack-site', {packageId: $rootScope.PackageId});
                } else {
                    $state.go('main-site', {packageId: $rootScope.PackageId});
                }
            }
        }
    }
    $scope.showAllPackage = function(){
        window.location.reload();
    }
    // var first = "A", last = "Z";
    // $scope.alphabets[0] = "1";
    // for(var i = first.charCodeAt(0); i <= last.charCodeAt(0); i++) {
    //         $scope.alphabets[j] =  eval("String.fromCharCode(" + i + ")") + " ";        
    // }

    $scope.searchStartsWith = function(alphabet){

        $scope.alpha = alphabet;
        $scope.btn_clicked = false;
        $scope.search_title = "";
        $scope.StartDate = "";
        $scope.EndDate = "";
        $("h5 a").css('font-weight','normal');
        $("h5 a").css('font-size','small');
        $('#src_'+alphabet).css('font-weight','bold');
        $('#src_'+alphabet).css('font-size','large');
        var criteria = {
            term : alphabet,
            distributionChannelId : $scope.distributionChannel

        }
        Package.getPackageStartsWith(criteria,function( data ){
            $scope.packageList = data.Package;
        },function(error){
            console.log(error);
        });
    }

    $scope.search_title = "";
    $scope.StartDate = "";
    $scope.EndDate = "";
    $scope.btn_clicked = false;
    $scope.searchByTitle = function(){
        $scope.btn_clicked = true;
        $('#src_'+$scope.alpha).css('font-weight','normal');
        $('#src_'+$scope.alpha).css('font-size','small');
        if($scope.search_title == "" && $scope.StartDate == "" && $scope.EndDate == ""){
            toastr.error('Please fill atleast one field to search.');
        }else{
            if($scope.StartDate > $scope.EndDate){
                toastr.error('Start Date should be smaller than End date.');
            }else{
                $scope.tag_search_title = $scope.search_title;
                $scope.tag_StartDate = $scope.StartDate;
                $scope.tag_EndDate = $scope.EndDate;
                 var criteria = {
                    title_text : $scope.search_title,
                    st_date : $scope.StartDate,
                    end_date :$scope.EndDate,
                    distributionChannelId : $scope.distributionChannel

                }
                Package.getPackageDetail(criteria,function( data ){
                    $scope.packageList = data.packageByName;
                },function(error){
                    console.log(error);
                });
            }

        }
    }
    Package.getStore(function(data){
        $scope.distributionChannelList = angular.copy(data.DistributionChannel);

    },function(error){
        console.log(error);
    });

    $scope.BlockUnBlockContentType = function( packageId, isActive ){
        var active = 1;
        if (isActive == 1) {
            active = 0;
        }
        if (confirm("Are you want to sure " + (active == 0 ? 'block' : 'unblock') + ' this plan ?')) {
            var data = {
                active: active,
                packageId: packageId,
                Status: active == 0 ? 'blocked' : 'unblocked'
            }
            ngProgress.start();
            Package.blockUnBlockContentType(data, function (data) {
                if (data.success) {
                    $scope.distributionChannelChange();
                    toastr.success(data.message);
                    $scope.successvisible = true;
                }
                else {
                    toastr.error(data.message);
                    $scope.errorvisible = true;
                }
                ngProgress.complete();
            },function(err){
                console.log(err);
            });
        }


    }
    $scope.Delete = function( packageId )
    {
        if (confirm("Are you want to sure " + 'delete' + ' this plan ?')) {
            var data = {
                packageId: packageId,
                Status: 'delete'
            }
            ngProgress.start();
            Package.delete(data, function (data) {

                if (data.success) {
                    $scope.distributionChannelChange();
                    toastr.success(data.message);
                    $scope.successvisible = true;
                }
                else {
                    toastr.error(data.message);
                    $scope.errorvisible = true;
                }
                ngProgress.complete();
            },function(err){
                console.log(err);
            });
        }
    }


});