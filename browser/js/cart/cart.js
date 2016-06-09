app.config(function ($stateProvider) {

    $stateProvider.state('cart', {
        url: '/cart',
        templateUrl: 'js/cart/cart.html',
        controller: 'CartCtrl'
    });

});

app.controller('CartCtrl', function ($scope, AuthService, $state, CartFactory) {

  $scope.order = CartFactory.getCart();

  console.log($scope.order);

});
