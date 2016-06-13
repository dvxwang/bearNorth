'use strict';

app.config(function ($stateProvider) {
  $stateProvider.state('users', {
    url: '/users',
    templateUrl: 'js/user/user.list.html',
    controller: 'UserListCtrl',
    resolve: {
      users: function (User) {
        return User.fetchAll();
      }
    }
  });
});


app.controller('UserListCtrl', function ($scope, users, User) {
  $scope.users = users;

  $scope.addUser = function () {
    $scope.userAdd.save()
    .then(function (user) {
      $scope.userAdd = new User();
      $scope.users.unshift(user);
    });
  };
  
  $scope.userSearch = new User();

  $scope.userAdd = new User();
});

