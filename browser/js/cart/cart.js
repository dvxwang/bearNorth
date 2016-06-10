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

app.controller('CartCtrl', function ($scope, AuthService, $state, CartFactory, cart) {

  $scope.cart = cart

  $scope.removeFromCart = function(productId) {
    CartFactory.removeFromCart(productId);
  }

});
