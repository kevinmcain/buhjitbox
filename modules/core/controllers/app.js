'use strict'; // <-- what does this mean?

/**
 * @ngdoc overview
 * @name budgy
 * @description
 * # envelope system
 *
 * Main module of the application.
 */
 
// wrapping your javascript in closure is a good habit
(function(){

	var app = angular.module('budgyApp', 
		['ngAnimate',
		'ngAria',
		'ngCookies',
		'ngMessages',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ngTouch'])

	app.config(function ($routeProvider) {
		$routeProvider
		// maybe login page can be integrated into this html file.
		.when('/', {
			templateUrl: 'modules/core/views/login.html',
			controller: 'LoginCtrl'
		})
		.when('/lists/new', {
			templateUrl: 'modules/lists/views/newList.html',
			controller: 'ListsCtrl'
		})
		.when('/lists/:listId', {
			templateUrl: 'modules/items/views/itemsView.html',
			controller: 'ItemsCtrl'
		})
		// clicking on home will cause main controller to use this route
		// and will provide the EnvelopesCtrl
		.when('/envelopes', {
			templateUrl: 'modules/envelopes/views/budget.html',
			controller: 'EnvelopesCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});
	})
	
	// specify a controller for setting the budgetId:
	// we could have a login controller set the budgetId & userId 
	// in the rootScope. Something like the controller below
	app.controller('LoginCtrl', ['$rootScope', function($rootScope) {
		$rootScope.budgetId = 1;
	}]);
	
})();