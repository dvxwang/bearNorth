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

	$scope.reviews=[
	{title:"Review Title 1"},
	{title:"Review Title 2"},
	];
});