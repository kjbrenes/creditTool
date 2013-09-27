'use strict';
// Declare app level module which depends on filters, and services
/*jslint sloppy: true */
/*global angular, Firebase*/
var creditsTracking = angular.module('creditsTracking', ['firebase']);

creditsTracking.value('fbWorkshops', 'https://credits-tracking.firebaseio.com/workshops');
creditsTracking.value('fbMyWorkshops', 'https://credits-tracking.firebaseio.com/users');
creditsTracking.value('fbAddWorkshops', 'https://credits-tracking.firebaseio.com/categories');
creditsTracking.value('fbReference', 'https://credits-tracking.firebaseio.com/');

creditsTracking.value('user', 'user001');

creditsTracking.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/page/workshops', {templateUrl: 'partials/workshops.html'})
        .when('/page/myworkshops', {templateUrl: 'partials/myworkshops.html'})
        .when('/page/addworkshops', {templateUrl: 'partials/addworkshops.html', controller: 'AddWorkshopsCtrl'})
        .when('/page/addworkshops', {templateUrl: 'partials/addworkshops.html'})
        .when('/page/pendingworkshops', {templateUrl: 'partials/pendingworkshops.html'})
        .otherwise({templateUrl: 'partials/home.html'});
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('CreditsTrackingCtrl', ['$scope', 'fbReference','fbWorkshops', 'fbMyWorkshops', 'fbAddWorkshops', 'angularFireCollection', function ($scope, fbReference, fbWorkshops, fbMyWorkshops, fbAddWorkshops, angularFireCollection) {
	$scope.fbData = new Firebase(fbReference);
	window.fbData = $scope.fbData;

	$scope.workshops = new Firebase(fbWorkshops);
	$scope.myworkshops = new Firebase(fbMyWorkshops);
	$scope.addworkshops = new Firebase(fbAddWorkshops);
	$scope.saveWorkshop = angularFireCollection(new Firebase('https://credits-tracking.firebaseio.com/workshops'));
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
	var workshops = $scope.workshops, myworkshops = $scope.myworkshops, tempWorkshops = [], currentUser = myworkshops.child( user + '/workshops');
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
	var myworkshops = $scope.myworkshops, workshops = $scope.workshops, currentUser = myworkshops.child( user + '/workshops'), tempMyWorkshops = [];
	var workshops = $scope.fbData.child('workshops'), myworkshops = $scope.fbData.child('users'), currentUser = myworkshops.child( user + '/workshops'), tempMyWorkshops = [];
	
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
	var pendingworkshops = $scope.fbData.child('users'), workshops = $scope.fbData.child('workshops'), tempPendingWorkshops = [];

	pendingworkshops.on('child_added', function(snapshot) {
		var wsData = snapshot.val();
	  	var allUsers = pendingworkshops.child( snapshot.name() + '/workshops');
		//console.log(snapshot.name());
	  	var mainUser = snapshot.name();
	  	allUsers.on('child_added', function(snapshot) {
				var myWsData = snapshot.val();
				workshops.on('child_added', function(snapshot) {
					var wsDataWorkshop = snapshot.val();
					//console.log(wsDataWorkshop);
					var workshopname = snapshot.name();
					//console.log(workshopname);
					if ((myWsData.id == wsDataWorkshop.id) && (myWsData.status == "pending") && (!_.isUndefined(myWsData.id))) {
						tempPendingWorkshops.push({
							id: wsDataWorkshop.id,
							status: myWsData.status,
							name: wsData.username,
							userCredits: wsData.credits,
							category: wsDataWorkshop.category,
							workshopCredits: wsDataWorkshop.credits,
							user: mainUser,
							workshopnode: workshopname
						});
					}
				});
		});
		
	});

	$scope.changeState = function(user, workshopId, workshopName, userCredits, workshopCredits) {
		console.log(user + '-' + workshopId + '-' + workshopName + '-' + userCredits + '-' + workshopCredits);
		var users = pendingworkshops.child(user);
		var workShoptoApprobe = pendingworkshops.child( user + '/workshops');
		var selectedWorkshop = pendingworkshops.child( user + '/workshops/' + workshopName);
		workShoptoApprobe.on('child_added', function(snapshot) {
			var readWsData = snapshot.val();
			var totalCredits = parseInt(userCredits) + parseInt(workshopCredits);
			//console.log(readWsData);
			if ((readWsData.id == workshopId)) {
				selectedWorkshop.update({status: 'approbed'});
				users.update({credits: totalCredits});
			}

		});
	}
	
	$scope.tempPendingWorkshops = tempPendingWorkshops;

}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('AddWorkshopsCtrl', ['$scope', function ($scope) {
	var loadUsers = $scope.fbData.child('users'), loadWorkshops = $scope.fbData.child('categories'), tempUsers = [], tempWorkshops = [];
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
		$scope.credits = $scope.myOption.credits;
	};

	$scope.addMessage = function() {
		//var currentDate = new Date();
		//console.log($scope.user.name);
		$scope.saveWorkshop.add({author: $scope.myAuthorOption.name, category: $scope.myOption.category, creationdate: '12/02/2013', credits: $scope.credits, description: $scope.work.description, id: Math.floor(Math.random()*101), name: $scope.user.name});
    }

}]);

/*---------------------------------------------------------------------------------------------------------------------*/