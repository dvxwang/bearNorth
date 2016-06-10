'use strict';

app.factory('CartFactory', function ($http, $kookies) {

  var cart = {};
  cart.products = [];

  // load cart if it exists
  if($kookies.get().cart) cart = $kookies.get().cart;

  function syncCookie() {
    $kookies.set('cart', cart);
  }

  return {
    addToCart: function(product) {
      cart.products.push(product);
      syncCookie();
    },
    getCart: function() {
      return cart;
    },
    removeFromCart: function(productId) {
      var indexToRemove;
      cart.products.forEach( function(product, index) {
        if(product.id === productId) {
          indexToRemove = index;
        }
      });
      cart.products.splice(indexToRemove,1);
      syncCookie();
    }

  }
});
