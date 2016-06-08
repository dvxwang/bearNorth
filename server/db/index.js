'use strict';
var db = require('./_db');

require('./models/user')(db);
require('./models/products')(db);


module.exports = db;