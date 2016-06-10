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

	$http.post('/api/boxes/match',queryObj)
	.then(function(result){
		$scope.mainPackage=result.data;
		$scope.totalPrice= "$"+result.data.reduce(function(a,b){
			return a+=Number(b.purchase_price);
		},0).toFixed(2);
		$scope.rentalPrice= "$"+result.data.reduce(function(a,b){
			return a+=Number(b.rental_price);
		},0).toFixed(2);
	})

	$scope.seeMore=function(item){
		$scope.altCategory="Alternative: "+item.category;
		$scope.currentItem=item;
		$http.post('/api/products/categories', {category: item.category})
		.then(function(result){
			$scope.alternatives = result.data;
		})
	}

	$scope.swap=function(item){
		$scope.mainPackage[$scope.mainPackage.indexOf($scope.currentItem)]=item;
		$scope.currentItem=item;
	}
})