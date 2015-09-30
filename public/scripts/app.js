var myApp = angular.module('myApp', ['ui.bootstrap', 'ui.router', 'ngProgress','ngFileUpload']);

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
            controller: 'mainSiteCtrl'
        })
        //
        //.state('users', {
        //    templateUrl: 'partials/add-edit-users.html',
        //    controller: 'usersCtrl',
        //    url: '/users'
        //})
        //
        .state('main-site.alacart', {
            templateUrl: 'partials/a-la-cart-n-offer-plan.html',
            controller: 'mainSiteCtrl'
        })
        .state('main-site.valuepack', {
            templateUrl: 'partials/a-la-cart-n-offer-plan.html',
            controller: 'mainSiteCtrl'
        })
        .state('main-site.subscription', {
            templateUrl: 'partials/a-la-cart-n-offer-plan.html',
            controller: 'mainSiteCtrl'
        })
        .state('main-site.advancesetting', {
            templateUrl: 'partials/a-la-cart-n-offer-plan.html',
            controller: 'mainSiteCtrl'
        })
        .state('main-site.arrangeplan', {
            templateUrl: 'partials/a-la-cart-n-offer-plan.html',
            controller: 'mainSiteCtrl'
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
}).run(function ($state) {
    $state.go("main-site");
})