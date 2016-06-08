'use strict';
var Sequelize = require('sequelize');

module.exports = function (db) {

    db.define('order', {
        address: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('pending', 'active', 'fulfilled', 'returned'),
            defaultValue: 'pending'
        },
        shipDate: {
            type: Sequelize.DATE
        }
    }, {
        instanceMethods: {
            getTotal: function() {
                return this.getOrderDetails()
                    .then(function(orderDetailObjects) {
                        return orderDetailObjects.reduce(function(a, b) {
                            return a.subtotal + b.subtotal;
                        }, { subtotal: 0 });
                    })
            }
        }
    });

    db.define('orderDetail', {
        quantity: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        unitPrice: {
            type: Sequelize.DECIMAL
        },
        rentalDays: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        isRental: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        getterMethods: {
            subtotal: function() {
                return this.quantity*this.unitPrice*multiplier;
            }
        }
    })

    var Order = db.model('order');
    var OrderDetail = db.model('orderDetail');

    Order.beforeDestroy(function(order) {
      return OrderDetail.destroy({where: {orderId: order.id}});
    })


}

