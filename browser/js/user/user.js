'use strict';

app.config(function ($stateProvider) {
  $stateProvider.state('users', {
    url: '/users',
    template: 'HELLO WORLD',
    // templateUrl: 'js/user/user.list.html',
    controller: 'UserListCtrl',
    resolve: {
      currentUser: function (AuthService) {
        return AuthService.refreshMe()
        .then(function (me) {
          if (!me.id) throw Error('Not logged in');
          else return me;
        });
      },
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

