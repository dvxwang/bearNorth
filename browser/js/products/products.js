'use strict';

// States
// -- all products
app.config(function ($stateProvider) {
    $stateProvider.state('products', {
        url: '/products',
        templateUrl: 'js/products/products.html',
        controller: 'ProductsCtrl',
        params: {searchText: null},
        resolve: {
          products: function(ProductFactory) {
            return ProductFactory.fetchAllByCategory();
          }
        },
    });
});

// -- specific product
app.config(function ($stateProvider) {
    $stateProvider.state('product', {
        url: '/products/:productId',
        templateUrl: 'js/products/product.html',
        controller: 'ProductCtrl',
        resolve: {
          product: function(ProductFactory, $stateParams) {
            return ProductFactory.fetchById($stateParams.productId);
          }
        }
    });
});

// Controllers
// -- all products
app.controller('ProductsCtrl', function ($scope, products, $stateParams) {
  $scope.products = products;
  $scope.searchText = $stateParams.searchText;
});

// -- specific product
app.controller('ProductCtrl', function ($scope, product, ReviewFactory, CartFactory) {
  $scope.product = product;
  $scope.addToCart = function() {
    CartFactory.addToCart(product);
  };
  ReviewFactory.getProductReviews($scope.product.id)
  .then(reviews => {
    $scope.reviews = reviews.data;
  });
});
