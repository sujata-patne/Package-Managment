/**
 * Created by sujata.patne on 29-09-2015.
 */
myApp.service('MainSite', ['$http', function ($http) {
<<<<<<< HEAD
    //var service = {};
    this.baseRestUrl = 'http://localhost:3080';
=======

    this.baseRestUrl = '';
>>>>>>> 3e956c50c4fc8f7eade3085b2ac148b12a12243d
    this.getContentTypes = function(success){
        $http.get(this.baseRestUrl + '/getContentTypes').success(function (items) {
            console.log(items)
            success(items);
        });
    }
<<<<<<< HEAD
    
=======
>>>>>>> 3e956c50c4fc8f7eade3085b2ac148b12a12243d
}]);