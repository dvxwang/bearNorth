app.factory('ReviewFactory', function($http, Session) {

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
    getProductReviews: function(productId) {
      return $http.get(this.getProductUrl(productId))
      .then(reviews => {
        return reviews;
      })
    },
    addReview: function(review, productId) {
      console.log(review);
      review.rating = +review.rating;
      review.productId = productId;
      review.userId = Session.user.id;
      console.log(review);
      return $http.post(this.getProductUrl(productId) + '/users/' + Session.user.id, review)
    }
  }
});
