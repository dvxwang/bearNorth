'use strict';

app.config(function ($stateProvider) {
  $stateProvider.state('orders', {
    url: '/orders',
    templateUrl: 'js/orders/order.list.html',
    controller: 'OrderListCtrl',
    resolve: {
      orders: function (Order) {
        return Order.fetchAll();
      }
    }
  });
});


app.controller('OrderListCtrl', function ($scope, orders, Order) {
  
  $scope.orders = orders;

  $scope.addOrder = function () {
    $scope.orderAdd.save()
    .then(function (order) {
      $scope.orderAdd = new Order();
      $scope.orders.unshift(order);
    });
  };
  
  $scope.orderSearch = new Order();

  $scope.orderAdd = new Order();
});
