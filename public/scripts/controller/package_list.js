myApp.controller('PackageListCtrl', function ($scope, $http, $stateParams,$state, ngProgress, Package) {
    $('.removeActiveClass').removeClass('active');
    $('#Package Listing').addClass('active');
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



   /* var data = {
        distributionChannelId : $scope.distributionChannel
    }

    Package.getPackageDetail( data,function( data ){
            $scope.packageName = data.packageByName;
            console.log( $scope.packageName);
    },function(error){
        console.log(error);
    });*/

    $scope.distributionChannelChange = function(){

        var data = {
            title_text : ($scope.alpha)? $scope.alpha:$scope.search_title,
            st_date : $scope.StartDate,
            end_date :$scope.EndDate,
            distributionChannelId : $scope.distributionChannel
        }
        console.log(data);
        Package.getPackageDetail( data,function( data ){
            $scope.packageList = data.packageByName;
        },function(error){
            console.log(error);
        });
    
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
                console.log($scope.packageList)
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
                     console.log($scope.StartDate);
                     var criteria = {
                        title_text : $scope.search_title,
                        st_date : $scope.StartDate,
                        end_date :$scope.EndDate,
                        distributionChannelId : $scope.distributionChannel

                     }
                     console.log(criteria);
                    Package.getPackageByTitle(criteria,function( data ){
                             $scope.packageList = data.Package;
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

     $scope.EditPack = function ( pctID,type_added_name ) {
        type_added_name = type_added_name.toLowerCase() == "rule based" ? "rule" : type_added_name.toLowerCase();
        // $window.location.href = "/#/search-content-"+displayName+"/" + pctID;
        $state.go('search-content-'+type_added_name, {pctId:pctID}); 
    }

    $scope.BlockUnBlockContentType = function( packId,contentTypeId, isActive ){
                    var active = 1;
                    if (isActive == 1) {
                        active = 0;
                    }
                    if (confirm("Are you want to sure " + (active == 0 ? 'block' : 'unblock') + ' this plan ?')) {
                        var data = {
                            contentTypeId: contentTypeId,
                            active: active,
                            packId: packId,
                            Status: active == 0 ? 'blocked' : 'unblocked'
                        }
                        ngProgress.start();
                        Package.blockUnBlockContentType(data, function (data) {
                            if (data.success) {
                                $scope.getContentTypesByPackage();
                                $scope.success = data.message;
                                $scope.successvisible = true;
                            }
                            else {
                                $scope.error = data.message;
                                $scope.errorvisible = true;
                            }
                            ngProgress.complete();
                        },function(err){
                            console.log(err);
                        });
                    }
            

    }
     $scope.getContentTypesByPackage = function(){
            var grid = {
                            packId : $scope.selectedPack
                       };
             Package.getContentTypesByPack(grid,function(data){
                    $scope.isAdded  = true;
                    $scope.pack_added_date = data.PackContentTypes[0].pk_created_on;
                    $scope.pack_modified_date = data.PackContentTypes[0].pk_modified_on;
                    $scope.pack_added_name = data.PackContentTypes[0].pk_name;
                    $scope.type_added_name = data.PackContentTypes[0].type; 
                    $scope.pack_grid = data.PackContentTypes;
             });
    }

});