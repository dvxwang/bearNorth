'use strict';

app.directive('orderItem', function() {
	return {
		restrict: 'E',
		templateUrl: '/js/orders/order-item.html',
		scope: {
			order: '=order',
			ngClick: '&'
		},
		link: function(scope, elem, attrs) {
			if (attrs.hasOwnProperty('edit')) scope.edit = true;
			if (attrs.hasOwnProperty('disable')) scope.disable = true;

			scope.total = function(order) {
				var sum = 0;
				order.orderDetails.forEach(function(item) {
					sum += item.subtotal;
				})
				return sum;
			}

		}
	}
})
