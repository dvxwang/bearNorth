'use strict';

app.factory('CartFactory', function ($http, ProductFactory, localStorageService) {

  var cart = [],
      orderId = 1; // temporarily fixed

  function syncLocalStorage() {
    return localStorageService.set('cart', cart);
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
        product: product
      }
      cart.push(cartItem);

      syncLocalStorage();
      return $http.post('/api/orders/' + orderId + '/item', cartItem)
      .then( function(order) {
        return order;
      })
    },

    getCart: function() {
      return localStorageService.get('cart');
    },

    getPendingOrderDetails: function(userId) {
      return $http.get('/api/users/' + userId + '/orders/pending')
      .then(function(res) {
        cart = res.data[0].orderDetails;
        syncLocalStorage();
        return localStorageService.get('cart');
      })
    },

    removeFromCart: function(productId) {
      var indexToRemove;
      cart.forEach( function(item, index) {
        if(item.product.id === productId) {
          indexToRemove = index;
        }
      });
      cart.splice(indexToRemove,1);
      syncLocalStorage();
    }

  }
});
