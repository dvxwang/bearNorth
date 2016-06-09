'use strict';

var Sequelize = require('sequelize');
var Review = require('./reviews');

module.exports = function (db) {

    db.define('product', {
        name: {
            type: Sequelize.STRING, 
            allowNull: false //should be unique and a non-empty string CdV/OB
        },
        category: {
        	type: Sequelize.STRING, 
        	allowNull: false //should be non-empty string as well CdV/OB
        },
        quantity: {
        	type: Sequelize.INTEGER, //should be non-negative CdV/OB
        	allowNull: false
        },
        brand: {
        	type: Sequelize.STRING //should not allow an empty string? CdV/OB
        },
        purchase_price: {
            type: Sequelize.DECIMAL(10, 2), //discuss using INTEGER vs DECIMAL CdV/OB
            allowNull: false  //should be non-negative (non-zero?) CdV/OB
        },
        rental_price: { 
            type: Sequelize.DECIMAL(10, 2) //discuss using INTEGER vs DECIMAL, should be non-negative (non-zero?) CdV/OB
        },
        pictureUrl: {
            type: Sequelize.STRING //validate that url is a url CdV/OB
        },
        description: {
            type: Sequelize.TEXT  //should not allow an empty string? CdV/OB
        },
        tags: {
        	type: Sequelize.ARRAY(Sequelize.STRING)
        }
    },
    {
      getterMethods: {
        rating: function() {  //try to remove dead code before pushing to master branch
          // return this.getReviews()
          // .then( function(reviews) {
          //   var total_ratings;
          //   reviews.forEach( function(review) {
          //     total_ratings += review.rating;
          //   });
          //
          //   return total_ratings / reviews.length;
          // })
        }
      }
    });

};
