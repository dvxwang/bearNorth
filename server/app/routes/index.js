'use strict';
var router = require('express').Router();
var Auth = require('../configure/auth-middleware')

module.exports = router;

router.use('/members', Auth.assertAdmin, require('./members'));
router.use('/products', require('./products'));
router.use('/boxes', require('./boxes'));

router.use('/users', require('./users'));
router.use('/orders', Auth.assertAdmin, require('./orders'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
