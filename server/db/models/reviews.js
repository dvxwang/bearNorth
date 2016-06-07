'use strict';

var Sequelize = require('sequelize');

module.exports = function (db) {

    db.define('review', {
        rating: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 }
        },
        review: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    });

};
