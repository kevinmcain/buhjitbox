'use strict';

/**
 * @ngdoc overview
 * @name Budgy App
 * @description
 * # Envelope System
 *
 * Main module of the application.
 */
(function(){

	var app = angular.module('budgyApp');

	app.controller('LoginCtrl', [
		'$scope', 
		'$rootScope',
		'$http', 
		function($scope,  $rootScope, $http) {
		
			$scope.login = function() {

				var url = '/auth/facebook';
			alert(url);
				$http.get(url).success(function(data, status, headers, config) {
					$rootScope.user = data;
					alert(data);
				});
			};	
		}
	]);
})();