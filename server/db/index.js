'use strict';
var db = require('./_db');

require('./models/user')(db);
require('./models/products')(db);

var User = db.model('user');
var Product = db.model('product');
var Activity = db.model('activity');
var Type = db.model('type');

Product.belongsTo(Type);
Activity.hasMany(Type);
Type.hasMany(Product);

module.exports = db;