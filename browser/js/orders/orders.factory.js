'use strict';

app.factory('Order', function ($http) {
  function Order (props) {
    angular.extend(this, props);
  }

  Order.url = '/api/orders/';

  Order.prototype.getUrl = function () {
    return Order.url + this.id;
  };

  Order.prototype.isNew = function () {
    return !this.id
  };


  Order.prototype.fetch = function () {
    return $http.get(this.getUrl())
    .then(function (res) {
      var order = new Order(res.data);
      return order;
    });
  };

  Order.fetchAll = function () {
    return $http.get(Order.url)
    .then(function (res) {
      return res.data.map(function (obj) {
        return new Order(obj);
      });
    });
  };

  Order.prototype.save = function () {
    var verb;
    var url;
    if (this.isNew()) {
      verb = 'post';
      url = Order.url;
    } else {
      verb = 'put';
      url = this.getUrl();
    }
    return $http[verb](url, this)
    .then(function (res) {
      return new Order(res.data);
    });
  };

  Order.prototype.destroy = function () {
    return $http.delete(this.getUrl());
  };

  return Order;
});
