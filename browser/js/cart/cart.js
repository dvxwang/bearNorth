app.config(function ($stateProvider) {

    $stateProvider.state('cart', {
        url: '/cart',
        templateUrl: 'js/cart/cart.html',
        controller: 'CartCtrl'
    });

});

app.controller('CartCtrl', function ($scope, AuthService, $state, CartFactory, $rootScope, AUTH_EVENTS, $kookies, Session) {

  $scope.cart = CartFactory.getCart();
  console.log($scope.cart);

  $scope.removeFromCart = function(productId) {
    CartFactory.removeFromCart(productId);
  }

});
