'use strict';

var Sequelize = require('sequelize');

module.exports = function (db) {

    db.define('product', {
        name: {
            type: Sequelize.STRING, 
            allowNull: false,
            unique: true,
            validate: {
              notEmpty: true,
            }
        },
        category: {
        	type: Sequelize.STRING, 
        	allowNull: false,
            validate: {notEmpty: true}
        },
        quantity: {
        	type: Sequelize.INTEGER,
        	allowNull: false,
            validate: {min: 0}
        },
        brand: {
        	type: Sequelize.STRING,
            validate: {notEmpty: true}
        },
        purchase_price: {
            type: Sequelize.INTEGER, 
            allowNull: false,
            validate: {min: 0}
        },
        rental_price: { 
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {min: 0}
        },
        pictureUrl: {
            type: Sequelize.STRING, 
            validate: {isUrl: true}
        },
        description: {
            type: Sequelize.TEXT,
            validate: {notEmpty: true}
        },
        tags: {
        	type: Sequelize.ARRAY(Sequelize.STRING)
        }
    },
    {
      getterMethods: {
        dollar_purchase_price: function() { 
          return this.purchase_price/100;        
        },
        dollar_rental_price: function() { 
          return this.rental_price/100;        
        }
      }
    });

};
