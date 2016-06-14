'use strict';

app.directive('userItem', function() {
	return {
		restrict: 'E',
		templateUrl: '/js/user/user-item.html',
		scope: {
			user: '=user',
			ngClick: '&',
			title: '@'
		},
		link: function(scope, elem, attrs) {
			if (attrs.hasOwnProperty('edit')) scope.edit = true;
			if (attrs.hasOwnProperty('disable')) scope.disable = true;

			
		}
	}
})