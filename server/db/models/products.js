'use strict';

var Sequelize = require('sequelize');

module.exports = function (db) {

    db.define('product', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        brand: {
        	type: Sequelize.STRING
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false
        },
        purchase_price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        rental_price: {
            type: Sequelize.DECIMAL(10, 2)
        },
        pictureUrl: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.TEXT
        }
    }
    );

};

