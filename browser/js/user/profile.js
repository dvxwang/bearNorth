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

app.controller('ProfileCtrl', function ($scope, user, User, orders) {

	$scope.user = new User(user);
	$scope.orders = orders;

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
