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
  // load cart if it exists
  // $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
  //   console.log('logged in....looking for pending cart')
  //   CartFactory.getPendingOrders(Session.user.id)
  //   .then( function(orders) {
  //     console.log(orders);
  //   })
  // });

  $scope.removeFromCart = function(productId) {
    CartFactory.removeFromCart(productId);
  }

});
