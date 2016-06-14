'use strict';
var Sequelize = require('sequelize');

module.exports = function (db) { //two files, one for order, one for orderDetail CdV/OB

    db.define('orderDetail', {
        quantity: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
            allowNull: false,
            validate: {min: 1}
        },
        unitPrice: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {min: 0}
        },
        rentalDays: {
            type: Sequelize.INTEGER, //set minimum value
            allowNull: false,
            defaultValue: 1
        },
        isRental: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        getterMethods: {
            subtotal: function() {
                var multiplier = (this.isRental) ? this.rentalDays : 1;
                return this.quantity*this.unitPrice*multiplier;
            }
        }
    })
}
