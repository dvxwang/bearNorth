'use strict';

app.factory('CartFactory', function ($http) {

  var order = [],
      orderId = 1;

  return {

    addToCart: function(product) {
      $http.post('/api/orders/' + orderId + '/addItem', product)
      .then( function(order) {
        console.log(order)
      })
    },
    getCart: function() {
      return order;
    }

  }
});
