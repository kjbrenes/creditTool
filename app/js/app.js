'use strict';
// Declare app level module which depends on filters, and services
/*jslint sloppy: true */
/*global angular, Firebase*/
var creditsTracking = angular.module('creditsTracking', ['firebase', 'ngStorage']);

creditsTracking.value('fbReference', 'https://credits-tracking.firebaseio.com/');
/*---------------------------------------------------------------------------------------------------------------------*/

creditsTracking.value('creditsEquivalent', 3);

creditsTracking.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/page/workshops', {templateUrl: 'partials/workshops.html'})
        .when('/page/myworkshops', {templateUrl: 'partials/myworkshops.html'})
        .when('/page/addworkshops', {templateUrl: 'partials/addworkshops.html'})
        .when('/page/addworkshops', {templateUrl: 'partials/addworkshops.html'})
        .when('/page/pendingworkshops', {templateUrl: 'partials/pendingworkshops.html'})
        .when('/page/changecredits', {templateUrl: 'partials/changecredits.html'})
        .when('/page/home', {templateUrl: 'partials/home.html'})
        .when('/page/login', {templateUrl: 'partials/login.html'})
        .otherwise({templateUrl: 'partials/login.html'});
}]);
creditsTracking.controller('CreditsTrackingCtrl', ['$scope', 'fbReference', 'angularFireCollection', '$rootScope', function ($scope, fbReference, angularFireCollection, $rootScope) {
	$scope.fbData = new Firebase(fbReference);
	window.fbData = $scope.fbData;

	$scope.saveWorkshop = angularFireCollection(new Firebase('https://credits-tracking.firebaseio.com/workshops'));
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('LoginCtrl', function ($scope, $localStorage, $rootScope) {
	$scope.typeUser = 1;
	$scope.loginUser = function(status) {
		if(status == 0){
			$scope.$storage = $localStorage.$default({
		          x: '',
		          y: ''
			});
			delete $scope.$storage.x;
			delete $scope.$storage.y;
	    	window.location = "#/partials/login";
		} else {
			var myUser = $scope.user.name;
			var myPwd = $scope.user.password;
			var users = $scope.fbData.child('users'), tempUsers = [];
			users.on('child_added', function(snapshot) {
				var userData = snapshot.val();
				var userType = userData.type;
				if(userData.username == myUser && userData.password == myPwd){
					tempUsers.push({
						type: userData.type
					});

					var userLogged = snapshot.name();
					$scope.$storage = $localStorage.$default({
				          x: userLogged,
				          y: userType
					});

					$rootScope.name = $scope.$storage.x;
					$rootScope.type = $scope.$storage.y;
					$scope.typeUser = $rootScope.type;
					window.location = "#/page/home";
				}
			});
		}
	}
	$scope.typeUser = $rootScope.type;

});
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('HomeCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
		if((_.isUndefined($rootScope.type))){
			window.location = "#/page/login";
		} else {
			var workshops = $scope.fbData.child('workshops'), users = $scope.fbData.child('users'), latestWorkshops = [], tempUsers = [], currentUser = users.child($rootScope.name);
			
			currentUser.on('value', function(snapshot) {
				$scope.myCredits = snapshot.val().credits;
			});
			
			workshops.on('child_added', function(snapshot) {
				var wsData = snapshot.val();
				var workshopType = true;
				if(wsData.credits == 0){
					workshopType = false;
				}
					latestWorkshops.push({
						id: wsData.id,
						type: workshopType,
						name: wsData.name, 
						category: wsData.category, 
						credits: wsData.credits,
						url: wsData.url,
						creationdate: wsData.creationdate
					});
			});
			if((!_.isUndefined($scope.name))){
				$scope.latestWorkshops = latestWorkshops;
			}
			
			users.on('child_added', function(snapshot) {
				var userData = snapshot.val();
				tempUsers.push({
					name: userData.name + ' ' + userData.firstname + ' ' + userData.lastname,  
					credits: userData.credits
				});
			});
			$scope.tempUsers = tempUsers;
	}
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('WorkshopsCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
	if((_.isUndefined($rootScope.type))){
			window.location = "#/page/login";
		} else {
		var workshops = $scope.fbData.child('workshops'), myworkshops = $scope.fbData.child('users'), currentUser = myworkshops.child( $rootScope.name + '/workshops/'), tempWorkshops = [];
		var mainUser = $rootScope.name;
		var itemID = 0;
		currentUser.on('child_added', function(snapshot) {
			var myWsData = snapshot.val();
			var eachWorkshop = currentUser.child(snapshot.name());
			itemID++;
			workshops.on('child_added', function(snapshot) {
				var wsData = snapshot.val();
				//console.log(wsData.url);
		  		var mainWorkshopId = snapshot.name();
		  		var workshopType = true;
				if(wsData.credits == 0){
					workshopType = false;
				}
				if ((myWsData.id != wsData.id)  ) {
					if((itemID == 1)){
						tempWorkshops.push({
							name: wsData.name, 
							type: workshopType,
							category: wsData.category,
							credits: wsData.credits,
							url: wsData.url,
							author: wsData.author,
							globalUser: mainUser,
							workshopId: wsData.id,
							mainWorkshopId: mainWorkshopId,
							itemID: itemID
						});
					}
				}
			});
		});

		$scope.tempWorkshops = tempWorkshops;
	}

}]);
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('WorkshopsSendtoCheckCtrl', ['$scope', 'angularFireCollection', function ($scope, angularFireCollection) {
	$scope.sendtocheck = function(userId, workshopId, itemID, mainWorkshopId) {
		if ((!_.isUndefined(userId)) && (!_.isUndefined(workshopId)) ) {
			$scope.saveWorkshop = angularFireCollection(new Firebase('https://credits-tracking.firebaseio.com/users/' + userId + '/workshops/'));
			$scope.saveWorkshop.add({id: workshopId, status: 'pending'});
			alert("The workshop has been sent");
			$("#wsend"+itemID).addClass("hidde");
		}
	}
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('MyWorkshopsCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
	if((_.isUndefined($rootScope.type))){
			window.location = "#/page/login";
		} else {
		var workshops = $scope.fbData.child('workshops'), myworkshops = $scope.fbData.child('users'), currentUser = myworkshops.child( $rootScope.name + '/workshops'), tempMyWorkshops = [];
		
		currentUser.on('child_added', function(snapshot) {
			var myWsData = snapshot.val();
			workshops.on('child_added', function(snapshot) {
				var wsData = snapshot.val();
				var workshopType = true;
				if(wsData.credits == 0){
					workshopType = false;
				}

				if ((myWsData.id == wsData.id) && (!_.isUndefined(wsData.id))  ) {
					tempMyWorkshops.push({
						id: myWsData.id,
						type: workshopType,
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
	}
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('PendingWorkshopsCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
	if(!(_.isUndefined($rootScope.type)) && $rootScope.type == 1){
		var pendingworkshops = $scope.fbData.child('users'), workshops = $scope.fbData.child('workshops'), tempPendingWorkshops = [];
		var itemID = 0;
		pendingworkshops.on('child_added', function(snapshot) {
			var wsData = snapshot.val();
		  	var allUsers = pendingworkshops.child( snapshot.name() + '/workshops');
		  	var mainUser = snapshot.name();
		  	allUsers.on('child_added', function(snapshot) {
		  		itemID++;	
				var myWsData = snapshot.val();
				workshops.on('child_added', function(snapshot) {
					var wsDataWorkshop = snapshot.val();
					var workshopname = snapshot.name();
					if ((myWsData.id == wsDataWorkshop.id) && (myWsData.status == "pending") && (!_.isUndefined(myWsData.id))) {
						tempPendingWorkshops.push({
							id: wsDataWorkshop.id,
							status: myWsData.status,
							name: wsData.username,
							userCredits: wsData.credits,
							wName: wsDataWorkshop.name,
							category: wsDataWorkshop.category,
							workshopCredits: wsDataWorkshop.credits,
							user: mainUser,
							workshopnode: workshopname,
							itemID: itemID
						});
					}
				});
			});
			
		});

		$scope.changeState = function(user, workshopId, workshopName, userCredits, workshopCredits, itemID) {
			var users = pendingworkshops.child(user);
			var workShoptoApprobe = pendingworkshops.child( user + '/workshops');
			workShoptoApprobe.on('child_added', function(snapshot) {
				var readWsData = snapshot.val();
				var totalCredits = parseInt(userCredits) + parseInt(workshopCredits);
				if ((readWsData.id == workshopId)) {
					var workshopname = snapshot.name();
					var selectedWorkshop = pendingworkshops.child( user + '/workshops/' + workshopname);
					selectedWorkshop.update({status: 'approbed'});
					users.update({credits: totalCredits});
					alert("The workshop has been approved");
					$("#wsu"+itemID).addClass("hidde");
				}

			});
		}
		
		$scope.tempPendingWorkshops = tempPendingWorkshops;

	} else {
		window.location = "#/page/login";
	}

}]);
/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('AddWorkshopsCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
	if(!(_.isUndefined($rootScope.type)) && $rootScope.type == 1){
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

		$scope.workshopType = "mandatory";

		$scope.selectedCategory = function() {
			if($scope.workshopType == 'mandatory'){
				$scope.credits = $scope.myOption.credits;
			} else {
				$scope.credits = 0;
			}
		};

		$scope.addMessage = function() {
			//console.log($scope.isPresential);
			$scope.saveWorkshop.add({author: $scope.myAuthorOption.name, category: $scope.myOption.category, creationdate: moment().format('L'), credits: $scope.credits, url: $scope.work.url, description: $scope.work.description, presential: $scope.isPresential, id: Math.floor(Math.random()*101), name: $scope.user.name});
			alert("The workshop has been added");
	    }
	} else {
		window.location = "#/page/login";
	}
}]);

/*---------------------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('ChangeCreditsCtrl', ['$scope', 'creditsEquivalent', '$rootScope', function ($scope, creditsEquivalent, $rootScope) {
	if(!(_.isUndefined($rootScope.type)) && $rootScope.type == 1){
		var creditsbyuser = $scope.fbData.child('users'), tempChangeCredits = [];

		creditsbyuser.on('child_added', function(snapshot) {
			var wsData = snapshot.val();
			var mainUser = snapshot.name();
			var creditstopoints = Math.round((parseInt(wsData.credits)) / creditsEquivalent);
			tempChangeCredits.push({
				name: wsData.username,
				userCredits: wsData.credits,
				user: mainUser,
				points: creditstopoints
			});
			
		});

		$scope.changeCredits = function(user) {
			var selectedUser = user;
			var users = creditsbyuser.child(selectedUser);
			creditsbyuser.on('child_added', function(snapshot) {
				var readWsData = snapshot.val();
				var firebaseUser = snapshot.name();
				if ((selectedUser == firebaseUser)) {
					users.update({credits: 0});
					alert("The points has been changes");
					$("#"+selectedUser).addClass("hidde");
				}

			});
		}
		
		$scope.tempChangeCredits = tempChangeCredits;
	} else {
		window.location = "#/page/login";
	}
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
