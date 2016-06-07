'use strict';

var Sequelize = require('sequelize');
var Review = require('./reviews');

module.exports = function (db) {

    db.define('product', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        brand: {
        	type: Sequelize.STRING
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
    },
    {
      getterMethods: {
        rating: function() {
          return this.getReview()
          .then( function(reviews) {
            var total_ratings;
            reviews.forEach( function(review) {
              total_ratings += review.rating;
            });

            return total_ratings / reviews.length;
          })
        }
      }
    });

    db.define('activity', {
    	name: {
    		type: Sequelize.ENUM('Camp', 'Kayak', 'Climb')
    	}
    })

    db.define('type', {
    	name: {
    		type: Sequelize.STRING,
    		allowNull: false
    	}
    })

};
