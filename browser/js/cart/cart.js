app.config(function ($stateProvider) {

    $stateProvider.state('cart', {
        url: '/cart',
        templateUrl: 'js/cart/cart.html',
        controller: 'CartCtrl',
        resolve: {
          cart: function(CartFactory) {
            return CartFactory.fetchCart();
          }
        }
    });

});

app.controller('CartCtrl', function ($scope, $state, CartFactory, cart, $rootScope, AUTH_EVENTS) {
  $scope.cart = cart;
  
  $scope.orderTotal = CartFactory.getTotal();

  $rootScope.$on('cart-updated', function() {
    $scope.cart = CartFactory.getCart();
    $scope.orderTotal = CartFactory.getTotal();
  });

  $rootScope.$on(AUTH_EVENTS.logoutSuccess, function() {
    CartFactory.clearcart();
  });


  $scope.removeFromCart = function(productId) {
    CartFactory.removeFromCart(productId);
    $scope.cart = CartFactory.getCart();
  }

  $scope.updateItem = function(productId, qty, rentalDays) {
    CartFactory.updateItem(productId, parseInt(qty), parseInt(rentalDays));
    $scope.cart = CartFactory.getCart();
  }


});
