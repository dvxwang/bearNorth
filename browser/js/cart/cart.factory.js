'use strict';

app.factory('CartFactory', function ($http, ProductFactory, localStorageService, $rootScope, Session, $q, AuthService) {

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

  function isLoggedIn() {
    return !!Session.user;
  }

  function getUrl() {
    return '/api/users/'+Session.user.id+'/orders/'+orderId;
  }

  // Factory functions

  var cartFactory = {

    clearcart: function() {
      cart = [];
      orderId = null;
      syncLocalStorage();
      $rootScope.$broadcast('cart-updated');
    },

    addToCart: function(product, qty, isRental, rentalDays) {

      var quantity = qty || 1;
      var days = rentalDays || 0;
      var price = (!isRental) ? product.purchase_price : product.rental_price;
      var multiplier = (!isRental) ? 1 : rentalDays;
      var subtotal = price * quantity * multiplier;

      var cartItem = {
        isRental: !!isRental,
        productId: product.id,
        quantity: quantity,
        rentalDays: days,
        unitPrice: price,
        subtotal: subtotal,
        product: product
      }

      cart.push(cartItem);
      syncLocalStorage();
      $rootScope.$broadcast('cart-updated');

      // syncronize with database if logged in
      if(isLoggedIn()) {
          return $http.post(getUrl()+'/item', cartItem)
          .then(res => res.data);
      }
    },

    // takes an array of objects with product/quantity/buyOrRent/rentalDays properties
    addPackageToCart: function(arrOfItems) {
      arrOfItems.forEach(function(item) {
        cartFactory.addToCart(item.product, item.quantity, item.buyOrRent, item.rentalDays);
      });
    },

    fetchCart: function() {
      return AuthService.getLoggedInUser()
      .then(user => {
        if (user) {
          return $http.get('api/users/'+Session.user.id+'/cart')
          .then(function(res) {
            if (res.data.orderDetails) cart = res.data.orderDetails;  //check this object
            orderId = res.data.id;
            syncLocalStorage();
          })
        }
      })
      .then(function() {
        $rootScope.$broadcast('cart-updated');
        return localStorageService.get('cart');
      })
    },

    getCart: function() {
      return localStorageService.get('cart');
    },

    // getPendingOrderDetails: function(userId) {

    //   if(isLoggedIn()) { 
    //     return $http.get('api/users/'+userId+'/cart')
    //     .then(function(res) {
    //         if (res.data.orderDetails) cart = res.data.orderDetails;  //check this object
    //         orderId = res.data.id;
    //         syncLocalStorage();
    //         $rootScope.$broadcast('cart-updated');
    //         return localStorageService.get('cart');
    //     })
    //   }
    // },

    getNumItems: function() {
      cart = cartFactory.getCart();
      return (cart) ? cart.length : 0;
    },

    getTotal: function() {
      var orderTotal = 0;
      cart = cartFactory.getCart();
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
      if(isLoggedIn()) $http.delete(getUrl() + '/item/' + removedItem.id);
    },

    submitOrder: function(shippingDetails, paymentToken) {
      var order = {
        address: shippingDetails.address,
        status: 'active',
        paymentToken: paymentToken,
        shipDate: new Date() + 4*24*60*60*1000
      }

      // Stripe payment processing
      return $http.post('/api/checkout/', {
        stripeToken: paymentToken,
        customerId: 'test@test.com', // TEMPORARY
        amount: cartFactory.getTotal(),
        txnDescription: order.address
      })
      .then( function() {

        // store order in database
        if(isLoggedIn()) { // pending order is already in database => update status to active
          return $http.put(getUrl(), order)
          .then( function() {
            cartFactory.getPendingOrderDetails(Session.user.id);
          })
        } else { // ONLY HAPPENS IF NOT LOGGED IN!*********
          var orderObj = {order: order, orderDetails: cart};    
            return $http.post('/api/checkout/orders', orderObj)
          }
      })
      .then( function() {
        cartFactory.clearcart();
      })
    },

    updateItem: function(productId, newQty, rentalDays) {
      if (newQty <= 0) return cartFactory.removeFromCart(productId);

      var indexToUpdate = findProductIdx(productId);
      var item = cart[indexToUpdate];

      item.quantity = newQty;
      if (rentalDays) item.rentalDays = rentalDays;
      var multiplier = (item.isRental) ? item.rentalDays : 1;
      item.subtotal = newQty * item.unitPrice * multiplier;

      syncLocalStorage();
      $rootScope.$broadcast('cart-updated');
      // update order database if user is logged in & has an order ID
      
      if(isLoggedIn()) $http.put(getUrl() + '/item/' + cart[indexToUpdate].id, { quantity: newQty, rentalDays: item.rentalDays });
    }

  }

  return cartFactory;
});
