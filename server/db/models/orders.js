'use strict';
var Sequelize = require('sequelize');

module.exports = function (db) {

    db.define('order', {
        title: {
            type: Sequelize.STRING
        },
        product: {
            type: Sequelize.ARRAY(Sequelize.INTEGER)
        },
        quantity: {
            type: Sequelize.ARRAY(Sequelize.INTEGER)
        },
        price: {
            type: Sequelize.ARRAY(Sequelize.DECIMAL)
        },
        status: {
            type: Sequelize.ENUM('In Progress', 'Complete')
        },
        orderDate: {
            type: Sequelize.DATE
        }
    }, 
    {
        getterMethods: {
            total: function() {
                var total=0;
                for (var i=0; i<this.getDataValue('quantity').length; i++) {
                    total+=(this.getDataValue('quantity')[i]*this.getDataValue('price')[i]);
                }
                return total;        
            }
        }
    });
}

