'use strict';

var Sequelize = require('sequelize');
var Product = require('./products');

module.exports = function (db) {

  db.define('box', {
    activity: {
      type: Sequelize.ENUM('camp','kayak','climb'),
      allowNull: false
    },
    difficulty: {
      type: Sequelize.STRING,
      allowNull: false
    },
    trip_length: {
      type: Sequelize.STRING,
      allowNull: false
    },
    climate: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    defaultScope: Product
  });

};
