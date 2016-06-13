'use strict';
var db = require('./_db');

require('./models/user')(db);
require('./models/products')(db);
require('./models/reviews')(db);
require('./models/box')(db);
require('./models/orderDetails')(db);
require('./models/orders')(db);
 
var User = db.model('user');
var Product = db.model('product');
var Order = db.model('order');
var OrderDetail = db.model('orderDetail');
var Box = db.model('box');
var Review = db.model('review');

Order.belongsTo(User); //maybe add other side of relationship (User has many orders) CdV/OB
User.hasMany(Order);
Order.hasMany(OrderDetail); 
OrderDetail.belongsTo(Order);
OrderDetail.belongsTo(Product); //productHasMany(OrderDetail) may be useful CdV/OB
Product.hasMany(OrderDetail);
OrderDetail.addScope('defaultScope', {include: [{model: Product}]}, {override: true})


Product.hasMany(Review);
Review.belongsTo(User); //review should belong to a product too CdV/OB
Review.belongsTo(Product);
console.log("Reached index file");
Box.belongsToMany(Product, {through: 'BoxProduct'});
Product.belongsToMany(Box, {through: 'BoxProduct'});
console.log("Finished index file");

module.exports = db;
