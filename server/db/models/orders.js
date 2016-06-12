'use strict';
var Sequelize = require('sequelize');

module.exports = function (db) { //two files, one for order, one for orderDetail CdV/OB

    db.define('order', {
        address: {
            type: Sequelize.TEXT, //no empty strings? CdV/OB
            // unable to add to order as unregistered user if address is required
            // at creation; should replace allowNull with a validation at order placement
            // allowNull: false,
            // validate: {notEmpty: true}
        },
        status: {
            type: Sequelize.ENUM('pending', 'active', 'fulfilled', 'returned'),
            defaultValue: 'pending'
        },
        shipDate: {
            type: Sequelize.DATE,
            validate: {isDate: true}
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

    var Order = db.model('order');
    var OrderDetail = db.model('orderDetail');

    Order.addScope('defaultScope', {include: [{model: OrderDetail}]}, {override: true})

    Order.beforeDestroy(function(order) {
      return OrderDetail.destroy({where: {orderId: order.id}}); //discuss transactions CdV/OB
    })


}
