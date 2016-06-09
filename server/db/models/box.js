'use strict';

var Sequelize = require('sequelize');
var Product = require('./products');

module.exports = function (db) {

  db.define('box', {
    activity: {
      type: Sequelize.STRING, 
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
    },
    productList: {
      type: Sequelize.ARRAY(Sequelize.INTEGER), 
      allowNull: false
    }
  },
  {
    defaultScope: Product //look at order model for syntax CdV/OB
  });

};
