'use strict';

/**
 * @ngdoc overview
 * @name navigation
 * @description
 * # controller for the navigation bar
 *
 */
 
// wrapping your javascript in closure is a good habit
(function(){

	var app = angular.module('budgyApp');
	
	// controls the behaviour of our navigation bar
	app.controller('NavbarCtrl', function() {
		this.tab = 1;
		
		this.selectedTab = function(setTab) {
			this.tab = setTab;
		};
		
		this.isSelected = function(checkTab) {
			return this.tab === checkTab;
		};
	});
	
})();
