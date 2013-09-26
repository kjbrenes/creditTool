'use strict';
// Declare app level module which depends on filters, and services
/*jslint sloppy: true */
/*global angular, Firebase*/
var creditsTracking = angular.module('creditsTracking', ['firebase']);

creditsTracking.value('fbReference', 'https://credits-tracking.firebaseio.com/');

creditsTracking.value('user', 'user002');

creditsTracking.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/page/workshops', {templateUrl: 'partials/workshops.html'})
        .when('/page/myworkshops', {templateUrl: 'partials/myworkshops.html'})
        .when('/page/addworkshops', {templateUrl: 'partials/addworkshops.html', controller: 'AddWorkshopsCtrl'})
        .otherwise({templateUrl: 'partials/home.html'});
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('CreditsTrackingCtrl', ['$scope', 'fbReference', function ($scope, fbReference) {
	$scope.fbData = new Firebase(fbReference);
	window.fbData = $scope.fbData;
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('HomeCtrl', ['$scope', 'user', function ($scope, user) {
	var workshops = $scope.fbData.child('workshops'), users = $scope.fbData.child('users'), latestWorkshops = [], tempUsers = [], currentUser = users.child(user);
	
	currentUser.on('value', function(snapshot) {
		$scope.myCredits = snapshot.val().credits;
	});
	
	workshops.on('child_added', function(snapshot) {
		var wsData = snapshot.val();
		latestWorkshops.push({
			name: wsData.name, 
			category: wsData.category, 
			credits: wsData.credits, 
			creationdate: wsData.creationdate
		});
	});
	$scope.latestWorkshops = latestWorkshops;
	
	users.on('child_added', function(snapshot) {
		var userData = snapshot.val();
		tempUsers.push({
			name: userData.name + ' ' + userData.firstname + ' ' + userData.lastname,  
			credits: userData.credits
		});
	});
	$scope.tempUsers = tempUsers;
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('WorkshopsCtrl', ['$scope', 'user', function ($scope, user) {
	var workshops = $scope.fbData.child('workshops'), myworkshops = $scope.fbData.child('users'), currentUser = myworkshops.child( user + '/workshops'), tempWorkshops = [];
	
	workshops.on('child_added', function(snapshot) {
		var wsData = snapshot.val();
		currentUser.on('child_added', function(snapshot) {
			var myWsData = snapshot.val();
			if ((wsData.id != myWsData.id) && (!_.isUndefined(myWsData.id))  ) {
				tempWorkshops.push({
					name: wsData.name, 
					category: wsData.category, 
					credits: wsData.credits, 
					author: wsData.author
				});
			}
		});
	});
	$scope.tempWorkshops = tempWorkshops;
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('MyWorkshopsCtrl', ['$scope', 'user', function ($scope, user) {
	var workshops = $scope.fbData.child('workshops'), myworkshops = $scope.fbData.child('users'), currentUser = myworkshops.child( user + '/workshops'), tempMyWorkshops = [];
	
	currentUser.on('child_added', function(snapshot) {
		var myWsData = snapshot.val();
		workshops.on('child_added', function(snapshot) {
			var wsData = snapshot.val();
			if ((myWsData.id == wsData.id) && (!_.isUndefined(wsData.id))  ) {
				tempMyWorkshops.push({
					id: myWsData.id,
					status: myWsData.status,
					name: wsData.name, 
					category: wsData.category, 
					credits: wsData.credits, 
					author: wsData.author
				});
			}
		});
	});
	$scope.tempMyWorkshops = tempMyWorkshops;
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('AddWorkshopsCtrl', ['$scope', function ($scope) {
	
}]);