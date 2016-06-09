app.factory('ProductFactory', function($http) {

  var productUrl = '/api/products/';

  // converts an array of product objects to a nested object where
  //  key = category type
  //  value = array of objects matching that category
  var categorize = function(products) {
    var categorizedProducts = {};
    products.forEach( function(product) {
      if(!categorizedProducts[product.category]) categorizedProducts[product.category] = [];
      categorizedProducts[product.category].push(product);
    });
    return categorizedProducts;
  }

  return {

    // all products in an unsorted array
    fetchAll: function() {
      return $http.get( productUrl )
      .then(res => res.data);
    },

    // all products, split by category in a nested object
    fetchAllByCategory: function() {
      return $http.get( productUrl )
      .then(function(res) {
        return categorize(res.data);
      })
    },

    // single product by ID
    fetchById: function(id) {
      return $http.get( productUrl + id)
      .then(res => res.data);
    },

    // all products under a specified category, in an unsorted array
    fetchByCategory: function(category) {
      return $http.get( productUrl + 'categories/' + category)
      .then(res => res.data);
    },



  }
});
