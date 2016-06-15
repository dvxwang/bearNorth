

app.directive('passwordReset', function (AuthService, User) {
	return {
		scope: {
			user: '=user'
		},
		restrict: 'E',
		templateUrl: '/js/common/directives/password/password.html',
		link: function(scope) {
			scope.error = null;

			scope.credentials = {
				email: scope.user.email,
				password: null
			}

			scope.reset = function() {
				AuthService.login(scope.credentials)
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
