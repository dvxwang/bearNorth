app.config(function ($stateProvider) {

    $stateProvider.state('addReview', {
        url: '/addreview/:productId',
        templateUrl: 'js/reviews/addreview.html',
        controller: 'AddReviewCtrl'
    });

});

app.controller('AddReviewCtrl', function ($scope, AuthService, $state, $stateParams, ReviewFactory, Session) {

    $scope.review = {};
    $scope.error = null;
    $scope.addReview = function (review) {
        ReviewFactory.addReview(review, $stateParams.productId)
        .then(() => {
            $state.go('profile', {id: Session.user.id});
        })

    };

});