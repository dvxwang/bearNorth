app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl'
    });
});

app.controller('HomeCtrl', function($state,$scope, $rootScope){
	
	$scope.goToSurvey = function(activity){
		$rootScope.hideNavbar=false;
		var choice = activity.target.firstChild.data;
		$state.go('survey',{choice: choice});
	}

	$rootScope.hideNavbar=true;
	
	$scope.leave = function() {
		$rootScope.hideNavbar=false;
	}
});
