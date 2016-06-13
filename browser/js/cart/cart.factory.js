'use strict';

app.factory('CartFactory', function ($http, ProductFactory, localStorageService, $rootScope, Session) {

  var cart = [],
      orderId;

  function syncLocalStorage() {
    localStorageService.set('cart', cart);
  }

  function findProductIdx(productId) {
    for(var i=0; i<cart.length; i++) {
      if(cart[i].product.id === productId) {
        return i;
      }
    };
    return -1;
  }

  function createNewOrder() {
    return $http.post('/api/orders')
    .then(function(res) {
      orderId = res.data.id;
      return res.data;
    })
  }

  function isLoggedIn() {
    return !!Session.user;
  }

  // Factory functions

  var cartFactory = {

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
      $rootScope.$broadcast('cart-updated');

      // syncronize with database if logged in
      if(isLoggedIn()) {
        if(!orderId) { // if no pending order was found, create one
          return createNewOrder()
          .then(function() {
            return $http.post('/api/orders/' + orderId + '/item', cartItem)
          })
          .then(res => res.data);
        } else { // append to existing order
          return $http.post('/api/orders/' + orderId + '/item', cartItem)
          .then(res => res.data);
        }
      }
    },

    // takes an array of objects with product/quantity/buyOrRent/rentalDays properties
    addPackageToCart: function(arrOfItems) {
      arrOfItems.forEach(function(item) {
        cartFactory.addToCart(item.product, item.quantity, item.buyOrRent, item.rentalDays);
      });
    },

    getCart: function() {
      return localStorageService.get('cart');
    },

    getPendingOrderDetails: function(userId) {
      if(isLoggedIn()) {
        return $http.get('/api/users/' + userId + '/orders/pending')
        .then(function(res) {
          if(res.data[0] && res.data[0].orderDetails) {
            cart = res.data[0].orderDetails;
            orderId = cart.orderId;
            syncLocalStorage();
            $rootScope.$broadcast('cart-updated');
            return localStorageService.get('cart');
          } else console.log('No pending cart found in database');
        })
      }
    },

    getNumItems: function() {
      if(cart) return cart.length;
      return 0;
    },

    getTotal: function() {
      var orderTotal = 0;
      if(cart) {
        cart.forEach( function(item) {
          orderTotal += item.subtotal;
        });
      }
      return orderTotal;
    },

    removeFromCart: function(productId) {
      var indexToRemove = findProductIdx(productId),
          removedItem = cart[indexToRemove];
      cart.splice(indexToRemove,1);
      syncLocalStorage();
      $rootScope.$broadcast('cart-updated');
      // update order database if user is logged in & has an order ID
      if(orderId && isLoggedIn()) $http.delete('/api/orders/' + orderId + '/item/' + removedItem.id);
    },

    updateQuantity: function(productId, newQty) {
      var indexToUpdate = findProductIdx(productId);
      cart[indexToUpdate].quantity = newQty || cart[indexToUpdate].quantity;
      cart[indexToUpdate].subtotal = cart[indexToUpdate].quantity * +cart[indexToUpdate].unitPrice;
      syncLocalStorage();
      $rootScope.$broadcast('cart-updated');
      // update order database if user is logged in & has an order ID
      if(orderId && isLoggedIn()) $http.put('/api/orders/' + orderId + '/item/' + cart[indexToUpdate].id, { quantity: newQty });
    }

  }

  return cartFactory;
});
