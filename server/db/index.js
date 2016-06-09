'use strict';
var db = require('./_db');

require('./models/user')(db);
require('./models/products')(db);
require('./models/reviews')(db);
require('./models/box')(db);
require('./models/orders')(db);
 
var User = db.model('user');
var Product = db.model('product');
var Order = db.model('order');
var OrderDetail = db.model('orderDetail');
var Box = db.model('box');
var Review = db.model('review');

Order.belongsTo(User); //maybe add other side of relationship (User has many orders) CdV/OB
Order.hasMany(OrderDetail); 
OrderDetail.belongsTo(Order);
OrderDetail.belongsTo(Product); //productHasMany(OrderDetail) may be useful CdV/OB

Product.hasMany(Review);
Review.belongsTo(User); //review should belong to a product too CdV/OB
Box.belongsToMany(Product, {through: 'BoxProduct'});
Product.belongsToMany(Box, {through: 'BoxProduct'});

module.exports = db;
