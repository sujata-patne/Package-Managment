var myApp = angular.module('myApp', ['ui.bootstrap','angularUtils.directives.dirPagination', 'ui.router', 'ngProgress','ngFileUpload']);

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}
myApp.config(function ($stateProvider) {
    $stateProvider
        .state("main-site", {
            templateUrl: 'partials/mainSite.html',
            controller: 'mainSiteCtrl',
            url: 'main-site'
        })
        .state('main-site.alacart', {
            templateUrl: 'partials/a-la-cart-n-offer-plan.html',
            controller: 'alacartCtrl',
        })
        .state('main-site.valuepack', {
            templateUrl: 'partials/value-pack-plan.html',
            controller: 'valuePackCtrl'
        })
        .state('main-site.subscription', {
            templateUrl: 'partials/subscription-pack-plan.html',
            controller: 'subscriptionPackCtrl'
        })
        .state('main-site.advancesetting', {
            templateUrl: 'partials/advancesetting.html',
            controller: 'advanceSettingCtrl'
        })
        .state('main-site.arrangeplan', {
            templateUrl: 'partials/arrange-plans.html',
            controller: 'arrangePlanCtrl'
        })

        .state('accountforgot', {
            templateUrl: 'partials/account-changepassword.html',
            controller: '',
            url: '/accountforgot'
        })
        .state("changepassword", {
            templateUrl: 'partials/account-changepassword.html',
            controller: 'usersCtrl',
            url: '/changepassword'
        })
         .state('packageListing', {
            templateUrl: 'partials/package_list.html',
            controller: 'PackageListCtrl',
            url: '/packageListing'
        })
}).run(function ($state) {
    $state.go("main-site");
})