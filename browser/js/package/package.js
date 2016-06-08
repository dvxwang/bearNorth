app.config(function ($stateProvider) {
    $stateProvider.state('package', {
        url: '/package/:selection',
        templateUrl: 'js/package/package.html',
        controller: 'PackageCtrl'
    });
});

app.controller('PackageCtrl',function($state,$scope,$stateParams,$http){
	var selectObj=$stateParams.selection.split(',');
	
	$scope.criteria=selectObj;

	var queryObj = {
		activity: selectObj[0],
		difficulty: selectObj[1],
		climate: selectObj[2],
		trip_length: selectObj[3],
	};

	$http.get('/match',queryObj)
	.then(function(result){
		$scope.mainPackage=result;
		$scope.totalPrice= result.reduce(function(a,b){
			return a+=b.price;
		},0);
		$scope.rentalPrice= $scope.totalPrice;
	})

	$scope.seeMore=function(item){
		$http.get('/', {type: item.type})
		.then(function(result){
			$scope.alternatives = result;
		})
	}
})