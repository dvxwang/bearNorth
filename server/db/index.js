'use strict';
var db = require('./_db');

require('./models/user')(db);
require('./models/products')(db);
require('./models/reviews')(db);
require('./models/box')(db);

<<<<<<< HEAD
var User = db.model('user');
var Product = db.model('product');
var Box = db.model('box');
var Activity = db.model('activity');
var Type = db.model('type');
var Review = db.model('review');

Product.belongsTo(Type);
Activity.hasMany(Type);
Type.hasMany(Product);
Product.hasMany(Review);
Review.belongsTo(User);
Box.belongsToMany(Product, {through: 'BoxProduct'});
Product.belongsToMany(Box, {through: 'BoxProduct'});
=======
>>>>>>> master

module.exports = db;
