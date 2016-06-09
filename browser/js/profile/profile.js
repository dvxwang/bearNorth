'use strict';

app.config(function ($stateProvider) {

    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'js/profile/profile.html',
        controller: 'ProfileCtrl'
    });

});

app.controller('ProfileCtrl', function ($scope, AuthService) {
	AuthService.getLoggedInUser().then(function (user) {
    	$scope.user = user;
    });


	$scope.orders=[
	{title:"Order Title 1"},
	{title:"Order Title 2"},
	];

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