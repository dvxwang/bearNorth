'use strict';

app.factory('CartFactory', function ($http) {

  var cart = {},
      orderId = 1;
  cart.products = [];

  return {
    addToCart: function(product) {
      $http.post('/api/orders/' + orderId + '/addItem', product)
      .then( function(order) {
        console.log(order)
        cart.products.push(product);
      })
    },
    getCart: function() {
      return cart;
    }

  }
});
