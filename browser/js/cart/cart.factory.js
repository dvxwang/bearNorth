'use strict';

app.factory('CartFactory', function ($http, $kookies) {

  var cart = [];

  function syncCookie() {
    $kookies.set('cart', cart);
  }

  return {
    addToCart: function(product) {
      var cartItem = {
        isRental: false,
        productId: product.id,
        quantity: 1,
        rentalDays: 1,
        subtotal: product.purchase_price,
        product: product
      }
      cart.push(cartItem);
      syncCookie();
    },
    getCart: function() {
      return cart;
    },
    getPendingOrders: function(userId) {
      return $http.get('/api/users/' + userId + '/orders/pending')
      .then(function(res) {
        cart = res.data[0].orderDetails;
        syncCookie();
        return cart;
      });
    },
    removeFromCart: function(productId) {
      var indexToRemove;
      cart.forEach( function(item, index) {
        if(item.product.id === productId) {
          indexToRemove = index;
        }
      });
      cart.splice(indexToRemove,1);
      syncCookie();
    }

  }
});
