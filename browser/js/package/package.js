app.config(function ($stateProvider) {
    $stateProvider.state('package', {
        url: '/package/:selection',
        templateUrl: 'js/package/package.html',
        controller: 'PackageCtrl'
    });
});

app.controller('PackageCtrl',function($state,$scope,$stateParams,$http, CartFactory){
	var selectObj=$stateParams.selection.split(',');
	var queryObj = {
		activity: selectObj[0],
		difficulty: selectObj[1],
		climate: selectObj[2],
		trip_length: selectObj[3],
	};

	var headerObj={};

	for (var i in queryObj) {
		if (queryObj[i]!=='blank'){
			var j = i.replace("_"," ").charAt(0).toUpperCase() + i.slice(1)
			headerObj[j]=queryObj[i];
		}
	}

  function searchInPackage(item) {
    for (i=0; i<$scope.mainPackage.length; i++){
      if ($scope.mainPackage[i].id===item.id) {
        return i;
      }
    }
    return	true;
  }

  function setTotals() {
    $scope.totalPrice= $scope.mainPackage.reduce(function(a,b){
      console.log("reached total");
      if(!b.priceIgnore) {
        console.log("not ignored", b);
        a+=Number(b.purchase_price);
      }
      return a;
    },0);
    $scope.rentalPrice= $scope.mainPackage.reduce(function(a,b){
      if(!b.priceIgnore) {
        a+=Number(b.rental_price);
      }
      return a;
    },0);
  }

	$scope.criteria= headerObj;

	$http.get('/api/products/allCategories')
	.then(function(result){
		$scope.categories = result.data;
	})

	$http.get('/api/boxes/match',{params: queryObj})
	.then(function(result){
		$scope.mainPackage=result.data;
		setTotals();
	})

	$scope.addCart = function(buyorrent){
		var toAddCart = $scope.mainPackage.filter(function(a){
			return (!a.toIgnore);
		})
		for (i=0; i<toAddCart.length; i++){
			CartFactory.addToCart(toAddCart[i],1,buyorrent,0);
		}
	}
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
			if(searchInPackage(item)){
				$scope.mainPackage.push(item);
				setTotals();
			}
		}
	}

	$scope.toggleItem=function(item){
		console.log("reached toggle");
		if ($scope.mainPackage[searchInPackage(item)].priceIgnore){
			console.log("reached second clause");
			$scope.mainPackage[searchInPackage(item)].priceIgnore=!$scope.mainPackage[searchInPackage(item)].priceIgnore;
		}
		else {
			console.log("reached first clause");
			$scope.mainPackage[searchInPackage(item)].priceIgnore=true;
		}
		setTotals();
	}
})
