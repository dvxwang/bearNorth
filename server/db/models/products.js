'use strict';

var Sequelize = require('sequelize');

module.exports = function (db) {

    db.define('product', {
        name: {
            type: Sequelize.STRING, 
            allowNull: false, //should be unique and a non-empty string CdV/OB
            unique: true,
            validate: {
              notEmpty: true,
            }
        },
        category: {
        	type: Sequelize.STRING, 
        	allowNull: false,  //should be non-empty string as well CdV/OB
          validate: {notEmpty: true}
        },
        quantity: {
        	type: Sequelize.INTEGER, //should be non-negative CdV/OB
        	allowNull: false,
          validate: {min: 0}
        },
        brand: {
        	type: Sequelize.STRING, //should not allow an empty string? CdV/OB
            validate: {notEmpty: true}
        },
        purchase_price: {
            type: Sequelize.INTEGER, //discuss using INTEGER vs DECIMAL CdV/OB
            allowNull: false,  //should be non-negative (non-zero?) CdV/OB
            validate: {min: 0}
        },
        rental_price: { 
            type: Sequelize.INTEGER,  //discuss using INTEGER vs DECIMAL, should be non-negative (non-zero?) CdV/OB
            allowNull: false,
            validate: {min: 0}
        },
        pictureUrl: {
            type: Sequelize.STRING, //validate that url is a url CdV/OB
            validate: {isUrl: true}
        },
        description: {
            type: Sequelize.TEXT,  //should not allow an empty string? CdV/OB
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
