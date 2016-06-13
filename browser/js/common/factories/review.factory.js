app.factory('ReviewFactory', function($http) {

  return {
    getUserUrl: function(userId) {
      return '/api/users/' + userId + '/reviews';
    },
    getProductUrl: function(productId) {
      return '/api/products/' + productId + '/reviews';
    },
    getUserReviews: function(userId) {
      return $http.get(this.getUserUrl(userId))
      .then(reviews => {
        return reviews;
      })
    },
  }
});
