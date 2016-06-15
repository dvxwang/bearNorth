'use strict';
var router = require('express').Router();
var db = require('../../db');
var User = db.model('user');
var orderRouter = require('./orders');
var Auth = require('../configure/auth-middleware');
var Order = db.model('order');
var reviewRouter = require('./reviews');


router.get('/', Auth.assertAdmin, function (req, res) {
    User.all()
    .then(users => {
        res.json(users);
    });
});

router.param('userId', function(req, res, next, userId) {
    User.findById(userId)
    .then(user => {
        if (!user) {
            res.status(404);
            throw next(new Error('User not found.'));
        }
        else {
            req.requestedUser = user;
            next();
        }
    })
    .catch(next);
});

router.get('/:userId', Auth.assertAdminOrSelf, function (req, res) {
    res.json(req.requestedUser);
});

router.put('/:userId', Auth.assertAdminOrSelf, function (req, res, next) {
    req.requestedUser.update(req.body)
    .then(function(user) {
        res.send(user);
    })
    .catch(next);
});

router.delete('/:userId', Auth.assertAdminOrSelf, function(req, res, next) {
    req.requestedUser.destroy()
    .then(function() {
        res.sendStatus(204)
    })
    .catch(next);
})

router.get('/:userId/cart', Auth.assertAdminOrSelf, function(req, res, next) {
    Order.findOrCreate({
        where: {
            userId: req.requestedUser.id,
            status: 'pending'
        }
    })
    .spread(cart => {
        res.json(cart)
    })
    .catch(next);
})

router.use('/:userId/orders', Auth.assertAdminOrSelf, orderRouter);
router.use('/:userId/reviews', reviewRouter);


module.exports = router;
