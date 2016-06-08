'use strict';
var db = require('./_db');

require('./models/user')(db);
require('./models/products')(db);
require('./models/orders')(db);

var User = db.model('user');
var Order = db.model('order');
var OrderDetail = db.model('orderDetail');
var Product = db.model('product');

Order.belongsTo(User);
Order.hasMany(OrderDetail);
OrderDetail.belongsTo(Order);
OrderDetail.belongsTo(Product);


module.exports = db;