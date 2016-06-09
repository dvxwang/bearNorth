app.config(function ($stateProvider) {

    $stateProvider.state('cart', {
        url: '/cart',
        templateUrl: 'js/cart/cart.html',
        controller: 'CartCtrl'
    });

});

app.controller('CartCtrl', function ($scope, AuthService, $state, CartFactory) {

  $scope.cart = CartFactory.getCart();

  $scope.removeFromCart = function(productId) {
    CartFactory.removeFromCart(productId);
  }

});
