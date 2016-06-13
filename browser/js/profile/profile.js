'use strict';

app.config(function ($stateProvider) {

    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'js/profile/profile.html',
        controller: 'ProfileCtrl',
        resolve: {
        	user: function(AuthService) {
        		return AuthService.getLoggedInUser()
        	}
        }
    });

});

app.controller('ProfileCtrl', function ($scope, user, User) {

	$scope.user = new User(user);

	$scope.user.getOrders()
	.then(function(orders) {
		$scope.orders = orders;
	})

	$scope.reviews=[{ //to be pulled by client
		product: 'North Face Titanium Tent', 
		review: 'This was excellent',
		rating: 5
	}, {
		product: 'Black Backpack',
		review: 'Did not like material',
		rating: new Array(4)
	}];
});
