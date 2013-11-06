'use strict';

var creditsTracking = angular.module('creditsTracking', ['firebase', 'ngStorage', 'ngCookies']);

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
creditsTracking.controller('LoginCtrl', function ($scope, $localStorage, $rootScope, $cookieStore) {
	$scope.loginUser = function(status) {
		if(status == 0){
			$scope.$storage = $localStorage.$default({
		          x: '',
		          y: ''
			});
			delete $scope.$storage.x;
			delete $scope.$storage.y;
			$cookieStore.remove($scope.tempUsers);
			$cookieStore.remove($scope.latestWorkshops);
			//$cookieStore.remove($scope.tempAllWorkshops);
	    	window.location = "#/partials/login";
		} else {
			var myUser = $scope.user.name;
			var myPwd = $scope.user.password;
			var users = $scope.fbData.child('users'), tempUsers = [];
			var error = false;
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
				} else if(userData.password != myPwd){
					error = true;
				}
			});

			if (error == true){
				toastr.error("Invalidad user/password");
			}

		}

	}
	//$scope.typeUser = $rootScope.type;

});
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('HomeCtrl', ['$scope', '$rootScope', '$cookieStore', function ($scope, $rootScope, $cookieStore) {
	//$cookieStore.remove($scope.tempAllWorkshops);
			//if(_.isUndefined($cookieStore.get($scope.tempUsers))){
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
						/*if(wsData.credits == 0){
							workshopType = false;
						}*/
							latestWorkshops.push({
								id: wsData.id,
								//type: workshopType,
								name: wsData.name, 
								category: wsData.category, 
								credits: wsData.credits,
								url: wsData.url,
								creationdate: wsData.creationdate
							});
					});

					if(!_.isUndefined($scope.name)){
						/*$cookieStore.put($scope.latestWorkshops,latestWorkshops);
						$scope.latestCookie = $cookieStore.get($scope.latestWorkshops);*/
						//console.log(latestWorkshops);
						/*if(!_.isUndefined(latestWorkshops)){*/
							$scope.latestWorkshops = latestWorkshops;
						/*} else {*/
							//alert("no");
							//toastr.success("Workshops not availables");
						//}
					}
					
					users.on('child_added', function(snapshot) {
						var userData = snapshot.val();
						tempUsers.push({
							name: userData.name + ' ' + userData.firstname + ' ' + userData.lastname,  
							credits: userData.credits
						});
					});

					/*$cookieStore.put($scope.tempUsers,tempUsers);
					$scope.loggedIn = $cookieStore.get($scope.tempUsers);*/

					$scope.tempUsers = tempUsers;
				}
		/*} else {
				var cookie = $cookieStore.get($scope.tempUsers);
				$scope.tempUsers = cookie;
				var latestCookie = $cookieStore.get($scope.latestCookie);
				$scope.latestWorkshops = latestCookie;
		}*/
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('LoadCategoriesCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
	var loadCategories = $scope.fbData.child('categories'), tempCategories = [];
	loadCategories.on('child_added', function(snapshot) {
		var myWsData = snapshot.val();
		tempCategories.push({
			credits: myWsData.credits,
			category: myWsData.name
		});
	});
	$scope.tempCategories = tempCategories;
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('WorkshopsCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
	if((_.isUndefined($rootScope.type))){
			window.location = "#/page/login";
		} else {
			var workshops = $scope.fbData.child('workshops'), workshopsbyuser = $scope.fbData.child('users'), currentUser = workshopsbyuser.child($rootScope.name), workshopsList = currentUser.child("workshops"),tempAllWorkshops = [];
			var mainUser = $rootScope.name;
			var myWsDataAuthor = "";

			workshopsList.on('child_added', function(snapshot) {
				var myWsData = snapshot.val();
				if(!_.isUndefined(myWsData.id)){
					myWsDataAuthor = myWsData.id;
					console.log(myWsDataAuthor);
				}
			});

			workshops.on('child_added', function(snapshot) {
				var wsData = snapshot.val();
				if ((myWsDataAuthor != wsData.id) && (!_.isUndefined(myWsDataAuthor))) {
						tempAllWorkshops.push({
							name: wsData.name, 
							type: wsData.type,
							category: wsData.category,
							credits: wsData.credits,
							url: wsData.url,
							author: wsData.author,
							form: wsData.form,
							globalUser: mainUser,
							workshopId: wsData.id
						});
				}
			});
			$scope.tempAllWorkshops = tempAllWorkshops;
	}

}]);
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('WorkshopsSendtoCheckCtrl', ['$scope', 'angularFireCollection', function ($scope, angularFireCollection) {
	$scope.sendtocheck = function(userId, workshopId) {
		var saveWorkshop = $scope.saveWorkshop;
		if ((!_.isUndefined(userId)) && (!_.isUndefined(workshopId)) ) {
			saveWorkshop = angularFireCollection(new Firebase('https://credits-tracking.firebaseio.com/users/' + userId + '/workshops/'));
			saveWorkshop.add({id: workshopId, status: 'registered'});
			toastr.success("The workshop has been sent");
		}
	}
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('MyWorkshopsCtrl', ['$scope', '$rootScope', '$cookieStore', function ($scope, $rootScope, $cookieStore) {
	if((_.isUndefined($rootScope.type))){
			window.location = "#/page/login";
		} else {
			var workshops = $scope.fbData.child('workshops'), myworkshops = $scope.fbData.child('users'), currentUser = myworkshops.child( $rootScope.name + '/workshops'), tempMyWorkshops = [];
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
	}
}]);
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
				var myWsData = snapshot.val();
				workshops.on('child_added', function(snapshot) {
					var wsDataWorkshop = snapshot.val();
					var workshopname = snapshot.name();
					if ((myWsData.id == wsDataWorkshop.id) && (myWsData.status == "registered") && (!_.isUndefined(myWsData.id))) {
						tempPendingWorkshops.push({
							id: wsDataWorkshop.id,
							status: myWsData.status,
							name: wsData.username,
							userCredits: wsData.credits,
							wName: wsDataWorkshop.name,
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
					toastr.success("The workshop has been approved");
				}

			});
		}
		
		$scope.tempPendingWorkshops = tempPendingWorkshops;

	} else {
		window.location = "#/page/login";
	}

}]);
/*---------------------------------------------------------------------------------------------------------------------*/
creditsTracking.controller('AddWorkshopsCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
	if(!(_.isUndefined($rootScope.type)) && $rootScope.type == 1){
		var loadUsers = $scope.fbData.child('users'), loadWorkshops = $scope.fbData.child('categories'), tempUsers = [], tempWorkshops = [];
		loadUsers.on('child_added', function(snapshot) {
			var wsData = snapshot.val();
			var mainUser = snapshot.name();
				tempUsers.push({
					name: wsData.name + " " + wsData.firstname + " " + wsData.lastname,
					author: mainUser
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
		$scope.workshopForm = "online";

		$scope.addWorkshop = function() {
			var selectedAuthor = $scope.myAuthorOption;
			var users = loadUsers.child(selectedAuthor);
			loadUsers.on('child_added', function(snapshot) {
				var authorObject = snapshot.val();
				var mainAuthorObject = snapshot.name();
				if(selectedAuthor == mainAuthorObject){
					var authorName = authorObject.name + " " + authorObject.firstname + " " + authorObject.lastname;
					if($scope.saveWorkshop.add({author: authorName, category: $scope.myOption.category, creationdate: moment().format('L'), credits: $scope.work.credits, url: $scope.work.url, description: $scope.work.description, type: $scope.workshopType, form: $scope.workshopForm, id: _.uniqueId(moment().format()), name: $scope.user.name})){
						var addCredits = parseInt(authorObject.credits) + parseInt($scope.work.credits);
						users.update({credits: addCredits});
					}
				}
			});

			toastr.success("The workshop has been added");
			$('#credits').val('');
			$('#name').val('');
			$('#url').val('');
			$('#description').val('');
	    }
	} else {
		window.location = "#/page/login";
	}
}]);

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

		$scope.changeCredits = function(user, credits) {
			var selectedUser = user;
			var users = creditsbyuser.child(selectedUser);
			var error = false;
			creditsbyuser.on('child_added', function(snapshot) {
				var readWsData = snapshot.val();
				var firebaseUser = snapshot.name();
				if ((selectedUser == firebaseUser) && (credits >= 25)) {
					users.update({credits: 0});
					toastr.success("The points has been changed");
					$("#"+selectedUser).addClass("hidde");
				} else if (credits < 25){
					error = true;
				}

			});

			if(error == true){
				toastr.error("The credits can not be changed");
			}
		}
		
		$scope.tempChangeCredits = tempChangeCredits;
	} else {
		window.location = "#/page/login";
	}
}]);
/*---------------------------------------------------------------------------------------------------------------------*/
