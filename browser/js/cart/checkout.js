app.config(function ($stateProvider) {

    $stateProvider.state('checkout', {
        url: '/cart/checkout',
        templateUrl: 'js/cart/checkout.html',
        controller: 'CheckoutCtrl',
        resolve: {
          cart: function(CartFactory) {
            return CartFactory.getCart();
          },
          orderTotal: function(CartFactory) {
            return CartFactory.getTotal();
          }
        }
    });

});

app.controller('CheckoutCtrl', function ($scope, cart, orderTotal, CartFactory, $state) {

  $scope.cart = cart;
  $scope.orderTotal = orderTotal;

  // default values for testing purposes - to be removed
  $scope.orderName = 'Some guy';
  $scope.orderAddress = '331 Foothill Rd, Beverly Hills, CA 90210';
  $scope.number = '4242424242424242';
  $scope.expiry = '12/17';
  $scope.cvc = '123';

  $scope.stripeCallback = function (status, response) {
    if (response.error) {
      window.alert('it failed! error: ' + response.error.message);
    } else { // Token was created!

      // Get the token ID:
      var paymentToken = response.id,
          shippingDetails = {
            name: $scope.OrderName,
            address: $scope.orderAddress
          };

      // Submit the form:
      return CartFactory.submitOrder(shippingDetails, paymentToken)
      .then( function() {
        $state.go('home');
      });
    }
  }

});
