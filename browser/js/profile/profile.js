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

app.controller('ProfileCtrl', function ($scope, user, User, ReviewFactory) {

	$scope.user = new User(user);
	ReviewFactory.getUserReviews($scope.user.id)
	.then(reviews => {
		$scope.reviews = reviews.data;
	});

	$scope.user.getOrders()
	.then(function(orders) {
		$scope.orders = orders;
	})

	$scope.getRating = function(numStars) {
		var ratings = [];
		for (var i = 0; i < numStars; i++) {
			ratings.push(i);
		}
		return ratings;
	};
});

