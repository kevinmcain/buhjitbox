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
		
			$scope.budgetId = $rootScope.budgetId;
		
			$scope.getEnvelopes = function() {

				var url = '/envelopes/' + $scope.budgetId;
			
				$http.get(url).success(function(data, status, headers, config) {
					$scope.envelopes = data;
				});
			};
		}
	]);
  
	var addEnvelope = function(http, envelope, refresh) {
				
		var url = '/envelopes/';
		
		http.post(url, envelope).
			success(function(response, status, headers, config){
			refresh();
		}).error(function(response, status, headers, config){
			$scope.error_message = response.error_message;
		});
	};
  
    var updateEnvelope = function(http, envelope) {
				
		var url = '/envelopes/' + envelope._id;
		
		http.put(url, envelope).success
			(function(response, status, headers, config){
				
			}).error(function(response, status, headers, config){
				$scope.error_message = response.error_message;
				
		});
	};

	app.controller('ModalDemoCtrl', function ($scope, $modal, $log, $http) {

		$scope.open = function (_envelope) {
		
			var modalInstance = $modal.open({

				templateUrl: '/modules/modals/envelopeModal.html',
				controller: 'ModalInstanceCtrl',
				windowClass: 'center-modal',
				resolve: {
					envelope: function() {
						return _envelope;
					}
				}
			});
			
			modalInstance.result.then(function (result) {
				
				if (!result._id)
				{
					result.bid = $scope.budgetId;
					addEnvelope($http, result, $scope.getEnvelopes);
				}
				else
				{
					updateEnvelope($http, result)
				}
					
				$scope.envelope = result;
				
				}, function () {
					$log.info('Modal dismissed at: ' + new Date());
				});
			
			};
	});
	
	// Please note that $modalInstance represents a modal window (instance) dependency.
	// It is not the same as the $modal service used above.

	app.controller('ModalInstanceCtrl', 
		function ($scope, $modalInstance, envelope) {
		
		// deep copy clone
		$scope.envelope = jQuery.extend(true, {}, envelope);
		
		// another interesting way to clone...
		//$scope.envelope = JSON.parse(JSON.stringify(envelope));
			
		$scope.ok = function () {
			$modalInstance.close($scope.envelope);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
							
		};
	});
	
})();