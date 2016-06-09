app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html'
    });
});

app.controller('HomeCtrl', function($state,$scope){
	
	$scope.goToSurvey = function(activity){
		var choice = activity.target.firstChild.data;
		$state.go('survey',{choice: choice});
	}

})
