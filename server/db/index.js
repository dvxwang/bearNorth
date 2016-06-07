'use strict';
var db = require('./_db');

require('./models/user')(db);
require('./models/orders')(db);

var User = db.model('user');
var Order = db.model('order');

Order.belongsTo(User);
// User.hasMany(Order);

module.exports = db;