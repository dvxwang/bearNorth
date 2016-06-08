'use strict';
var db = require('./_db');

require('./models/user')(db);
require('./models/products')(db);
require('./models/reviews')(db);
require('./models/box')(db);

var User = db.model('user');
var Product = db.model('product');
var Box = db.model('box');
var Review = db.model('review');


Product.hasMany(Review);
Review.belongsTo(User);
Box.belongsToMany(Product, {through: 'BoxProduct'});
Product.belongsToMany(Box, {through: 'BoxProduct'});

module.exports = db;
