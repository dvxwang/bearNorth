'use strict';

app.factory('CartFactory', function ($http, $kookies) {

  var cart = {};
  cart.products = [];

  return {
    addToCart: function(product) {
      cart.products.push(product);
      $kookies.set('cart', cart);
      // $http.post('/api/orders/' + orderId + '/addItem', product)
      // .then( function(order) {
      // })
    },
    getCart: function() {
      return cart;
    }

  }
});
