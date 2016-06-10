'use strict';

app.directive('userItem', function() {
	return {
		restrict: 'E',
		templateUrl: '/js/profile/user-item.html',
		scope: {
			user: '=user'
		}
	}
})