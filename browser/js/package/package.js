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

	$http.get('/api/products/allCategories')
	.then(function(result){
		$scope.categories = result.data;
	})

	$http.get('/api/boxes/match',{params: queryObj})
	.then(function(result){
		$scope.mainPackage=result.data;
		$scope.totalPrice= "$"+result.data.reduce(function(a,b){
			a+=Number(b.purchase_price);
			return a;
		},0).toFixed(2);
		$scope.rentalPrice= "$"+result.data.reduce(function(a,b){
			a+=Number(b.rental_price);
			return a;
		},0).toFixed(2);
	})

	$scope.seeMore=function(item){
		$scope.wantToAdd=false;
		$scope.currentItem=item;
		$http.post('/api/products/categories', {category: item.category})
		.then(function(result){
			$scope.altCategory="Alternative: "+item.category;
			$scope.alternatives = result.data;
		})
	}

	$scope.seeMoreOptions=function(){
    var category = document.getElementById("optionBar").value;
		$http.post('/api/products/categories', {category: category})
		.then(function(result){
			$scope.altCategory="Alternative: "+category;
			$scope.alternatives = result.data;
		})
	}

	$scope.swap=function(item){
		if(!$scope.wantToAdd){
			$scope.mainPackage[$scope.mainPackage.indexOf($scope.currentItem)]=item;
			$scope.currentItem=item;
		}
		else {
			$scope.mainPackage.push(item);
		}
	}
})
