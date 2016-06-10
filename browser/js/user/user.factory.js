'use strict';

app.factory('User', function ($http) {
  function User (props) {
    angular.extend(this, props);
  }


  User.url = '/api/users/';

  User.prototype.getUrl = function () {
    return User.url + this.id;
  };

  User.prototype.getOrders = function() {
    return $http.get(this.getUrl()+'/orders')
    .then(function (res) {
      return res.data;
    });
  }

  User.prototype.fetch = function () {
    return $http.get(this.getUrl())
    .then(function (res) {
      var user = new User(res.data);
      return user;
    });
  };

  User.fetchAll = function () {
    return $http.get(User.url)
    .then(function (res) {
      return res.data.map(function (obj) {
        return new User(obj);
      });
    });
  };

  User.prototype.save = function () {
    var verb;
    var url;
    if (this.isNew()) {
      verb = 'post';
      url = User.url;
    } else {
      verb = 'put';
      url = this.getUrl();
    }
    return $http[verb](url, this)
    .then(function (res) {
      return new User(res.data);
    });
  };

  User.prototype.destroy = function () {
    return $http.delete(this.getUrl());
  };

  return User;
});
