'use strict';

var Sequelize = require('sequelize');

module.exports = function (db) {

  db.define('box', {
    activity: {
      type: Sequelize.STRING, 
      allowNull: false,
      validate: {notEmpty: true}
    },
    difficulty: {
      type: Sequelize.STRING, 
      allowNull: false,
      validate: {notEmpty: true}
    },
    trip_length: {
      type: Sequelize.STRING, 
      allowNull: false,
      validate: {notEmpty: true}
    },
    climate: {
      type: Sequelize.STRING, 
      allowNull: false,
      validate: {notEmpty: true}
    },
  });

  // var Box = db.model('box');
  // var Product = db.model('product');

  // Box.addScope('defaultScope', {include: [{model: Product}]}, {override: true});

};
