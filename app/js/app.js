'use strict';
// Declare app level module which depends on filters, and services
/*jslint sloppy: true */
/*global angular, Firebase*/
var creditsTracking = angular.module('creditsTracking', ['firebase']);

creditsTracking.value('fbWorkshops', 'https://credits-tracking.firebaseio.com/workshops');
creditsTracking.value('fbMyWorkshops', 'https://credits-tracking.firebaseio.com/users');
creditsTracking.value('fbAddWorkshops', 'hhttps://credits-tracking.firebaseio.com/categories');

creditsTracking.value('user', 'user001');

creditsTracking.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/page/workshops', {templateUrl: 'partials/workshops.html'})
        .when('/page/myworkshops', {templateUrl: 'partials/myworkshops.html'})
        .when('/page/addworkshops', {templateUrl: 'partials/addworkshops.html'})
        .when('/page/pendingworkshops', {templateUrl: 'partials/pendingworkshops.html'})
        .otherwise({templateUrl: 'partials/home.html'});
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('CreditsTrackingCtrl', ['$scope', 'fbWorkshops', 'fbMyWorkshops', 'fbAddWorkshops', 'angularFireCollection', function ($scope, fbWorkshops, fbMyWorkshops, fbAddWorkshops, angularFireCollection) {
	$scope.workshops = new Firebase(fbWorkshops);
	$scope.myworkshops = new Firebase(fbMyWorkshops);
	$scope.addworkshops = new Firebase(fbAddWorkshops);
	$scope.saveWorkshop = angularFireCollection(new Firebase('https://credits-tracking.firebaseio.com/workshops'));

}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('HomeCtrl', ['$scope', 'user', function ($scope, user) {
	var workshops = $scope.workshops, users = $scope.myworkshops, latestWorkshops = [], tempUsers = [], currentUser = users.child(user);
	
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
	var workshops = $scope.workshops, myworkshops = $scope.myworkshops, tempWorkshops = [], currentUser = myworkshops.child( user + '/workshops');
	
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
	var myworkshops = $scope.myworkshops, workshops = $scope.workshops, currentUser = myworkshops.child( user + '/workshops'), tempMyWorkshops = [];
	currentUser.on('child_added', function(snapshot) {
		var myWsData = snapshot.val();
		//console.log(myWsData);
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
creditsTracking.controller('PendingWorkshopsCtrl', ['$scope', function ($scope) {
	var pendingworkshops = $scope.myworkshops, workshops = $scope.workshops, tempPendingWorkshops = [];

	pendingworkshops.on('child_added', function(snapshot) {
		var wsData = snapshot.val();
	  	var allUsers = pendingworkshops.child( snapshot.name() + '/workshops');
	  	allUsers.on('child_added', function(snapshot) {
				var myWsData = snapshot.val();
				workshops.on('child_added', function(snapshot) {
					var wsDataWorkshop = snapshot.val();
					if ((myWsData.id == wsDataWorkshop.id) && (myWsData.status == "pending") && (!_.isUndefined(myWsData.id))) {
						tempPendingWorkshops.push({
							id: wsDataWorkshop.id,
							status: myWsData.status,
							name: wsData.username, 
							category: wsDataWorkshop.category
						});
					}
				});
		});
	});
	$scope.tempPendingWorkshops = tempPendingWorkshops;

	$scope.changeState = function() {		
		alert("si");
    }

}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('AddWorkshopsCtrl', ['$scope', function ($scope) {
	var loadUsers = $scope.myworkshops, loadWorkshops = $scope.addworkshops, tempUsers = [], tempWorkshops = [];
	loadUsers.on('child_added', function(snapshot) {
		var wsData = snapshot.val();
			tempUsers.push({
				name: wsData.name + " " + wsData.firstname + " " + wsData.lastname
			});
	});
	$scope.tempUsers = tempUsers;

	loadWorkshops.on('child_added', function(snapshot) {
		var myWsData = snapshot.val();
		tempWorkshops.push({
			credits: myWsData.credits,
			category: myWsData.name
		});
	});
	$scope.tempWorkshops = tempWorkshops;

	$scope.selectedCategory = function() {
    	loadWorkshops.on('child_added', function(snapshot) {
		var myWsDataAll = snapshot.val();
	    	if (($scope.myOption == myWsDataAll.name)  ) {
				$scope.credits = myWsDataAll.credits;
			}
		});
	};

	$scope.addMessage = function() {
		var currentDate = new Date();
		$scope.saveWorkshop.add({author: $scope.myAuthorOption, category: $scope.myOption, creationdate: '12/02/2013', credits: $scope.credits, description: 'test', id: 'w0003', name: 'Test'});
    }

}]);
/*---------------------------------------------------------------------------------------------------------------------*/
