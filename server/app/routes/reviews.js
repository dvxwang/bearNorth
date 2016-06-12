'use strict';
var router = require('express').Router();
var db = require('../../db');
var User = db.model('user');
var Review = db.model('review');
var Product = db.model('product');
var Auth = require('../configure/auth-middleware')

//get ALL reviews (need to ensure user is admin) if route is api/reviews
//get all reviews for specific user IF route is api/users/:userId/reviews
router.get('/', function (req, res) {
    var user = req.requestedUser || null;
    Review.all({
        where: user
    })
    .then(reviews => {
        res.json(reviews);
    });
});

//creates new review for unsigned-in user, route is POST to api/reviews
//creates new review for signed-in user, route is POST to api/users/:userId/reviews

router.post('/', function(req, res, next) {
    var product;
    Product.findById(req.query.productId)
    .then(_product => {
        product = _product;
        return Review.create(req.body);
    })
    .tap(function(review) {
        if (req.requestedUser) {
            review.setUser(req.requestedUser);
            req.requestedUser.addReview(review);
        }
        if (product) {
            review.setProduct(product);
        }
    })
    .then(review => {
        res.json(review);
    })
    .catch(next);
})

//----------GET/DELETE/UPDATE EXISTING ORDERS--------------

//Searches our Review table for specific review
router.param('reviewId', function(req, res, next, reviewId) {
    Review.findById(reviewId)
    .then(review => {
        if (!review) {
            res.status(404);
            return next(new Error('Review not found.'));
        }
        req.review = review;
        next();
    })
    .catch(function(err) {
        res.status(500);
        next(err);
    });
})

router.get('/:reviewId', function (req, res) {
    res.send(req.review);
});


router.put('/:reviewId', function (req, res, next) {
    req.review.update(req.body)
    .then(function(review) {
        res.send(review)
    })
    .catch(next);
});

router.delete('/:reviewId', function(req, res, next) {
    req.review.destroy()
    .then(function() {
        res.sendStatus(204)
    })
});

module.exports = router;
