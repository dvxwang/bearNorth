app.config(function ($stateProvider) {

    $stateProvider.state('cart', {
        url: '/cart',
        templateUrl: 'js/cart/cart.html',
        controller: 'CartCtrl',
        resolve: {
          cart: function(CartFactory) {
            return CartFactory.getCart();
          }
        }
    });

});

app.controller('CartCtrl', function ($scope, AuthService, $state, CartFactory, cart, $rootScope) {

  $scope.cart = cart

  $scope.orderTotal = CartFactory.getTotal();
  $rootScope.$on('cart-updated', function() {
    $scope.orderTotal = CartFactory.getTotal();
  });

  $scope.removeFromCart = function(productId) {
    CartFactory.removeFromCart(productId);
    $scope.cart = CartFactory.getCart();
  }

  $scope.updateQuantity = function(productId, qty) {
    CartFactory.updateQuantity(productId, qty)
    .then( function() {
      $scope.cart = CartFactory.getCart();
    });
  }

});
