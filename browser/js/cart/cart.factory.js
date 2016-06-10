'use strict';

app.factory('CartFactory', function ($http, $kookies, ProductFactory) {

  var cart = [],
      orderId = 1; // temporarily fixed

  function syncCookie() {
    $kookies.remove('cart');
    $kookies.set('cart', cart );
  }

  return {
    addToCart: function(product) {
      var cartItem = {
        isRental: false,
        productId: product.id,
        quantity: 1,
        rentalDays: 1,
        unitPrice: product.purchase_price,
        subtotal: product.purchase_price * 1, // should multiply by quantity
      }
      cart.push(cartItem);
      syncCookie();
      // should only post to database if a user is logged in
      return $http.post('/api/orders/' + orderId + '/addItem', cartItem)
      .then( function(order) {
        return order;
      })
    },
    getCart: function() {
      return $kookies.get('cart');
    },
    getPendingOrderDetails: function(userId) {
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
