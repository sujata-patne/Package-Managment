var myApp = angular.module('myApp', ['ui.bootstrap','angularUtils.directives.dirPagination', 'ui.router', 'ngProgress','ngFileUpload']);

myApp.constant('thumb_path', 'http://192.168.1.159:4040');

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
            url: '/main-site/:packageId'
        })
        .state("pack-site", {
            templateUrl: 'partials/packSite.html',
            controller: 'packSiteCtrl',
            url: '/pack-site/:packageId'
        })
        .state('map-mainsite', {
            templateUrl: 'partials/map-mainsite.html',
            controller: 'mapMainsiteCtrl',
            url: '/maping/:packageId'
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
        .state('pack-site.alacart', {
            templateUrl: 'partials/a-la-cart-n-offer-plan.html',
            controller: 'alacartCtrl'
        })
        .state('pack-site.valuepack', {
            templateUrl: 'partials/value-pack-plan.html',
            controller: 'valuePackCtrl'
        })
        .state('pack-site.subscription', {
            templateUrl: 'partials/subscription-pack-plan.html',
            controller: 'subscriptionPackCtrl'
        })
        .state('pack-site.advancesetting', {
            templateUrl: 'partials/advancesetting.html',
            controller: 'advanceSettingCtrl'
        })
        .state('pack-site.arrangeplan', {
            templateUrl: 'partials/arrange-plans.html',
            controller: 'arrangePlanCtrl'
        })
        .state('pack-site.individualcontent', {
            templateUrl: 'partials/individualcontent.html',
            controller: 'individualContentCtrl'
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
        .state('notifications', {
            templateUrl: 'partials/notifications.html',
            controller: 'notificationCtrl',
            url: '/notifications'
        })
        .state('notifications.add', {
            templateUrl: 'partials/add-notifications.html',
            controller: 'notificationAddCtrl',
            url: '/notificationsAdd'
        })
        .state('notifications.list', {
            templateUrl: 'partials/list-notifications.html',
            controller: 'notificationListCtrl',
            url: '/notificationsListing'
        })
        .state("edit-notifications", {
            templateUrl: "partials/add-notifications.html",
            controller: "notificationAddCtrl",
            url: "/notificationsAdd/:pn_id/:pn_sp_pkg_id/:pn_plan_id/:pn_plan_type"
        })

    }).run(function ($state,$rootScope) {
        $state.go("main-site");
        $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
            $rootScope.previousState = from;
        })

})

myApp.filter('filterWithOr', function ($filter) {
    var comparator = function (actual, expected) {
        if (angular.isUndefined(actual)) {
            // No substring matching against `undefined`
            return false;
        }
        if ((actual === null) || (expected === null)) {
            // No substring matching against `null`; only match against `null`
            return actual === expected;
        }
        if ((angular.isObject(expected) && !angular.isArray(expected)) || (angular.isObject(actual) && !hasCustomToString(actual))) {
            // Should not compare primitives against objects, unless they have custom `toString` method
            return false;
        }

        actual = angular.lowercase('' + actual);
        if (angular.isArray(expected)) {
            var match = false;
            expected.forEach(function (e) {
                e = angular.lowercase('' + e);
                if (actual.indexOf(e) !== -1) {
                    match = true;
                }
            });
            return match;
        } else {
            expected = angular.lowercase('' + expected);
            return actual.indexOf(expected) !== -1;
        }
    };
    return function (campaigns, filters) {
        return $filter('filter')(campaigns, filters, comparator);
    };
});
