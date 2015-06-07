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
	
	app.controller('ExpenseCtrl', [
		'$scope', 
	//	'$rootScope',
	//	'$route',
		'$routeParams',
		'$http', 
		function($scope, $routeParams, $http ) {
			$scope.envelopeID = $routeParams.envelopeID;
			var message = 'reaching controller';
	//		alert($scope.envelopeID);
			$scope.getTransactions = function() {
				var url = '/transactions/'+ $scope.envelopeID;		
				$http.get(url).success(function(data, status, headers, config) {
					$scope.transactions = data;
				});
			};
		}
	]);
	
	var addTransaction = function($scope, http, transaction, refresh) {
		//		alert($scope.envelopeID);
//		var url = '/transaction/'+ transaction.eid;
var url = '/transaction/'+ $scope.envelopeID;
//		alert(url);
		http.post(url, transaction).
			success(function(response, status, headers, config){
			refresh();
		}).error(function(response, status, headers, config){
			$scope.error_message = response.error_message;
		});
	};
	
	var updateTransaction = function($scope, http, transaction) {
		var url = '/transaction/'+ $scope.envelopeID;		
	//	var url = '/transactions/' + transaction.eid;
//		alert(url);
	    http.put(url, transaction).success
			(function(response, status, headers, config){
				
			}).error(function(response, status, headers, config){
			$scope.error_message = response.error_message;
				
		});
	};
	
	app.controller('ModalDemoCtrlT', function ($scope, $modal, $log, $http) {
		
	//	alert($scope.envelopeID);
		$scope.open = function (_transaction) {

			var modalInstance = $modal.open({
				templateUrl: '/modules/modals/transactionModal.html',
				controller: 'ModalInstanceCtrlT',
				resolve: {
					transaction: function() {
						return _transaction;
					}
				}
			});
			
			modalInstance.result.then(function (result) {
			//	result.eid = $scope.envelopeID;
			//	$scope.transaction = result;
				$log.info(result.$$hashKey);
				if (!result.$$hashKey)
				{
					result.eid = $scope.envelopeID;
				//	alert(result.eid);
				//	alert($scope.envelopeID);
					addTransaction($scope, $http, result, $scope.getTransactions);
				}
				else
				{
				//	alert(result.eid);
					result.eid = $scope.envelopeID;
					updateTransaction($scope, $http, result);
				//	$log.info('Modal at result.eid: ' +result.eid);
				}
				$scope.transaction = result;
				
			//	alert($scope.transaction.transaction_id);
				}, function () {
					$log.info($scope.transaction);
					$log.info('Modal dismissed at: ' + new Date());
				});
			
		};
		
		$scope.deleteTransaction = function(_transaction) {
				
				var url = '/transaction/' + $scope.envelopeID +'/' + _transaction.transaction_id;
			//	alert(url);
				$log.info(_transaction);
				$http.delete(url, _transaction).success(function(response, status, headers, config){
					$scope.getTransactions();
				}).error(function(response, status, headers, config){
					$scope.error_message = response.error_message;		
				});
		};	
	});
	
	// Please note that $modalInstance represents a modal window (instance) dependency.
	// It is not the same as the $modal service used above.

	app.controller('ModalInstanceCtrlT', 
		function ($scope, $modalInstance, transaction) {
		
		// deep copy clone
		$scope.transaction = jQuery.extend(true, {}, transaction);
	//	alert($scope.transaction.description);
		// another interesting way to clone...
		//$scope.envelope = JSON.parse(JSON.stringify(envelope));
			
		$scope.ok = function () {
			$modalInstance.close($scope.transaction);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	});	
	
})(); 
