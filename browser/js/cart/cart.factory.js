'use strict';

app.factory('CartFactory', function ($http, ProductFactory, localStorageService) {

  var cart = [],
      orderId = 1; // temporarily fixed

  function syncLocalStorage() {
    return localStorageService.set('cart', cart);
  }

  function findProductIdx(productId) {
    var indexToReturn;
    for(var i=0; i<cart.length; i++) {
      if(cart[i].product.id == productId) {
        return i;
      }
    };
    return -1;
  }

  return {

    addToCart: function(product, qty, buyOrRent, rentalDays) {
      var quantity = qty || 1;
      var cartItem = {
        isRental: false,
        productId: product.id,
        quantity: quantity,
        rentalDays: rentalDays || 0,
        unitPrice: product.purchase_price,
        subtotal: product.purchase_price * quantity,
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
        // cart = res.data[0].orderDetails;
        syncLocalStorage();
        return localStorageService.get('cart');
      })
    },

    removeFromCart: function(productId) {
      var indexToRemove = findProductIdx(productId);
      cart.splice(indexToRemove,1);
      syncLocalStorage();
    },

    updateQuantity: function(productId, newQty) {
      console.log(cart)
      console.log(newQty);
      var indexToUpdate = findProductIdx(productId);
      cart[indexToUpdate].quantity = newQty || cart[indexToUpdate].quantity;
      cart[indexToUpdate].subtotal = cart[indexToUpdate].quantity * +cart[indexToUpdate].unitPrice;
      console.log(cart[indexToUpdate])
      syncLocalStorage();
    }

  }
});
