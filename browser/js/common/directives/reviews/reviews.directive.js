app.directive('reviews', function(ReviewFactory) {
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/reviews/reviews.html',
    scope: {
      product: '='
    },
    link: function(scope, element, attrs) {
      ReviewFactory.getUserReviews(1)
      .then(reviews => {
        scope.reviews = reviews;
      })
    }
  };
});
