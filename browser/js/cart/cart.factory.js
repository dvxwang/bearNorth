'use strict';

app.factory('CartFactory', function ($http, ProductFactory, localStorageService) {

  var cart = [],
      orderId; // temporarily fixed

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

  function createNewOrder() {
    return $http.post('/api/orders')
    .then(function(newOrder) {
      orderId = newOrder.id;
      return newOrder;
    })
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
      // syncronize with database
      return new Promise(function() {
        if(!orderId) { // if no pending order was found, create one
          return createNewOrder();
        } else return;
      })
      .then( function() {
        return $http.post('/api/orders/' + orderId + '/item', cartItem);
      })
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
        orderId = cart.orderId;
        syncLocalStorage();
        return localStorageService.get('cart');
      })
    },

    removeFromCart: function(productId) {
      var indexToRemove = findProductIdx(productId),
          removedItem = cart[indexToRemove];
      cart.splice(indexToRemove,1);
      syncLocalStorage();
      return $http.delete('/api/orders/' + orderId + '/item/' + removedItem.id);
    },

    updateQuantity: function(productId, newQty) {
      var indexToUpdate = findProductIdx(productId);
      cart[indexToUpdate].quantity = newQty || cart[indexToUpdate].quantity;
      cart[indexToUpdate].subtotal = cart[indexToUpdate].quantity * +cart[indexToUpdate].unitPrice;
      syncLocalStorage();
      return $http.put('/api/orders/' + orderId + '/item/' + cart[indexToUpdate].id, { quantity: newQty });
    }

  }
});
