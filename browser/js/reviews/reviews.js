app.config(function ($stateProvider) {

    $stateProvider.state('review', {
        url: '/users/:userId/reviews/:reviewId',
        templateUrl: 'js/reviews/review.html',
        controller: 'ReviewCtrl',
    });

});

app.controller('ReviewCtrl', function ($scope, AuthService, $state, ReviewFactory) {
  AuthService.getLoggedInUser().then(function (user) {
    $scope.user = user;
    ReviewFactory.getUserReviews(user.id)
    .then(reviews => {
      $scope.review = reviews.data.find(review => {
        return review.id === $scope.reviewId;
      });
    });
  });
});
