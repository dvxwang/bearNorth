app.config(function ($stateProvider) {

    $stateProvider.state('userReview', {
        url: '/users/:userId/reviews/products/:productId',
        templateUrl: 'js/reviews/reviews.html',
        controller: 'ReviewCtrl',
    });

    $stateProvider.state('productReview', {
        url: '/products/:productId/reviews/users/:userId',
        templateUrl: 'js/reviews/reviews.html',
        controller: 'ReviewCtrl',
    });
});

app.controller('ReviewCtrl', function ($scope, AuthService, $state, $stateParams, ReviewFactory) {
  AuthService.getLoggedInUser()
  .then(function (user) {
    $scope.user = user;
    if (!$scope.user.isAdmin) throw new Error("Not an admin");
    return ReviewFactory.getUserReviews($stateParams.userId);
  })
  .then(reviews => {
    $scope.review = reviews.data.find(review => {
      return review.productId === +$stateParams.productId;
    });
  });
});
