'use strict';
var router = require('express').Router();
var db = require('../../db');
var User = db.model('user');
var orderRouter = require('./orders');

router.get('/', function (req, res) {
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
            return next(new Error('User not found.'));
        }
        req.user = user;
        next();
    })
    .catch(function(err) {
        res.status(500);
        next(err);
    });
})

router.get('/:userId', function (req, res) {
    res.send(req.user);
});

router.put('/:userId', function (req, res, next) {
    req.user.update(req.body)
    .then(function(user) {
        res.send(user)
    })
    .catch(next);
});

router.delete('/:userId', function(req, res, next) {
    req.user.destroy()
    .then(function() {
        res.sendStatus(204)
    })
    .catch(next);
})

router.use('/:userId/orders', orderRouter);


module.exports = router;
