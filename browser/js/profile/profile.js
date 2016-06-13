'use strict';

app.config(function ($stateProvider) {

    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'js/profile/profile.html',
        controller: 'ProfileCtrl'
    });

});

app.controller('ProfileCtrl', function ($scope, AuthService, $http, ReviewFactory) {
	AuthService.getLoggedInUser().then(function (user) {
  	$scope.user = user;
		ReviewFactory.getUserReviews(user.id)
		.then(reviews => {
			$scope.reviews = reviews.data;
		});
  });

	$scope.orders=[
	{title:"Order Title 1"},
	{title:"Order Title 2"},
	];

	$scope.getRating = function(numStars) {
		var ratings = [];
		for (var i = 0; i < numStars; i++) {
			ratings.push(i);
		}
		return ratings;
	};
});