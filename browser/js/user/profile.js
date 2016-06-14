'use strict';

app.config(function ($stateProvider) {

    $stateProvider.state('profile', {
        url: '/profile/:id',
        templateUrl: 'js/user/profile.html',
        controller: 'ProfileCtrl',
        resolve: {
        	user: function(User, $stateParams, AuthService) {
    			var user = new User({id: $stateParams.id});
    			return user.fetch();	
        	},
        	orders: function(user) {
        		return user.getOrders();
        	}
        }
    });

});


app.controller('ProfileCtrl', function ($scope, user, User, orders, ReviewFactory) {

	$scope.user = new User(user);
	$scope.orders = orders;
	ReviewFactory.getUserReviews(user.id)
	.then(reviews => {
		$scope.reviews = reviews.data;
	});

	$scope.getRating = function(numStars) {
		var ratings = [];
		for (var i = 0; i < numStars; i++) {
			ratings.push(i);
		}
		return ratings;
	};
});

