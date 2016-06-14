

app.directive('passwordReset', function (AuthService, User) {
	return {
		scope: {
			user: '=user'
		},
		restrict: 'E',
		templateUrl: '/js/common/directives/password/password.html',
		link: function(scope, elem, attr) {
			scope.error = null;

			scope.credentials = {
				email: scope.user.email,
				password: null
			}

			scope.reset = function() {
				AuthService.login(credentials)
				.then(function() {
					var user = new User(scope.user);
					console.log(user)
				})
				.catch(function() {
					scope.error = 'Invalid login credentials';
				})
			}
		}
	}
});
