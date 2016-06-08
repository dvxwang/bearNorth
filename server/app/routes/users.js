'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../db');
var User = db.model('user');

router.get('/', function (req, res) {
  User.all()
    .then(users => {
        res.json(users);
    });
});

router.post('/', function (req, res, next) {
  if (!req.body)
    return;
  User.create(req.body)
  .then(function (user) {
    res.status(201).json(user);
  })
  .catch(next);
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
    res.json(req.user);
});