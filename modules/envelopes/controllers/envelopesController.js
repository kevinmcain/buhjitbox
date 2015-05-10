'use strict';

/**
 * @ngdoc overview
 * @name Budgy App
 * @description
 * # Envelope System
 *
 * Main module of the application.
 */
angular
.module('budgyApp')
.controller('EnvelopesCtrl', ['$scope', '$rootScope', '$http',
	function($scope,  $rootScope, $http) {
		$scope.getEnvelopes = function() {

			var url = '/envelopes/' + $rootScope.budgetId;
			$http.get(url).success(function(data, status, headers, config) {
			   $scope.results = data;
			   var envelopes = [];
			   for (var i = 0; i < data.length; i++) {
				   envelopes[i] = 
					{ "category": data[i].category, "balance": data[i].balance };
			   }
			   $rootScope.envelopes = envelopes;
			});
		};
		// I dont think we'll need a write function here. we'll probably need 
		// this in the manage envelopes controller
		$scope.writeEnvelopes = function() {
			console.log($scope.list);
			$http.post('/envelopes', $scope.envelopes).success(function(data, status, headers, config) {
				$scope.list.listId = data;
			});
		};
	}
]);