'use strict';
// Declare app level module which depends on filters, and services
/*jslint sloppy: true */
/*global angular, Firebase*/
var creditsTracking = angular.module('creditsTracking', ['firebase']);

creditsTracking.value('fbWorkshops', 'https://credits-tracking.firebaseio.com/workshops');
creditsTracking.value('fbMyWorkshops', 'https://credits-tracking.firebaseio.com/users');

creditsTracking.value('fbAddWorkshops', 'https://mytracking.firebaseio.com/categories');

creditsTracking.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/page/workshops', {templateUrl: 'partials/workshops.html', controller: 'WorkshopsCtrl'})
        .when('/page/myworkshops', {templateUrl: 'partials/myworkshops.html', controller: 'MyWorkshopsCtrl'})
        .when('/page/addworkshops', {templateUrl: 'partials/addworkshops.html', controller: 'AddWorkshopsCtrl'})
        .otherwise({templateUrl: 'partials/home.html'});
}]);

creditsTracking.controller('CreditsTrackingCtrl', ['$scope', 'angularFireCollection', 'fbWorkshops', 'fbMyWorkshops', 'fbAddWorkshops', function ($scope, angularFireCollection, fbWorkshops, fbMyWorkshops, fbAddWorkshops) {
	$scope.workshops = angularFireCollection(fbWorkshops);
	$scope.myworkshops = angularFireCollection(fbMyWorkshops);
	$scope.addworkshops = angularFireCollection(fbAddWorkshops);
}]);

creditsTracking.controller('WorkshopsCtrl', ['$scope', function ($scope) {
	
}]);

creditsTracking.controller('MyWorkshopsCtrl', ['$scope', function ($scope) {
	
}]);


creditsTracking.controller('AddWorkshopsCtrl', ['$scope', function ($scope) {
	
}]);
