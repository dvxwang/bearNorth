app.factory('ProductFactory', function($http) {

  var productUrl = '/api/products/';

  return {

    fetchAll: function() {
      return $http.get( productUrl )
      .then(res => res.data);
    },

    fetchById: function(id) {
      return $http.get( productUrl + id)
      .then(res => res.data);
    },

    fetchByCategory: function(category) {
      return $http.get( productUrl + 'categories/' + category)
      .then(res => res.data);
    },

  }
});
