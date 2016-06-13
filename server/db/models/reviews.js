'use strict';

var Sequelize = require('sequelize');

module.exports = function (db) {

    db.define('review', {
        rating: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 }
        },
        title: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {notEmpty: true, len: [3,30]}
        },
        description: {
            type: Sequelize.TEXT
        },
    });

};
