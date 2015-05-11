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

	app.controller('EnvelopesCtrl', [
		'$scope', 
		'$rootScope',
		'$http', 
		function($scope,  $rootScope, $http) {
		
			$scope.getEnvelopes = function() {

				var url = '/envelopes/' + $rootScope.budgetId;
			
				$http.get(url).success(function(data, status, headers, config) {
					$scope.envelopes = data;
				});
			};
		}
	]);
})();