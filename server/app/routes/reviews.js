'use strict';
var router = require('express').Router();
var db = require('../../db');
var User = db.model('user');
var Review = db.model('review');
var Product = db.model('product');


function findAllReviews(whereCondition, req, res, next) {
  Review.findAll(whereCondition)
  .then(reviews => {
      if (!reviews) {
          throw new Error('No reviews found.');
      }
      else res.json(reviews);
  })
  .catch(next);
}

//get ALL reviews (need to ensure user is admin) if route is api/reviews
//get all reviews for specific user IF route is api/users/:userId/reviews
router.get('/', function (req, res, next) {
    var whereCondition = {
      where: {}
    };
    if (req.requestedUser) {
        whereCondition.where.userId = req.requestedUser.id;
    }
    if (req.requestedProduct) {
        whereCondition.where.productId = req.requestedProduct.id;
    }
    findAllReviews(whereCondition, req, res, next);
});

router.param('productId', function(req, res, next, productId) {
  if (req.requestedProduct) next();
  Product.findById(productId)
  .then(product => {
    if (!product) {
      res.status(404);
      throw next(new Error('Product not found.'));
    }
    else {
        req.requestedProduct = product;
        next();
    }
  })
  .catch(next);
})

router.param('userId', function(req, res, next, userId) {
    if (req.requestedUser) next();
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

function findReview(req, res, next) {
    if (!req.requestedProduct || !req.requestedUser) {
        var err = new Error('Missing Product or User information');
        next(err);
    }
    var whereCondition = {};
    whereCondition.where = {
      userId: req.requestedUser.id,
      productId: req.requestedProduct.id
    };
    findAllReviews(whereCondition, req, res, next);
}

// get review for a specific product if at /users/:userId/reviews/products/:productId

router.get('/products/:productId', function(req, res, next) {
    findReview(req, res, next);
})

// get review for a specific user if at /products/:productId/reviews/users/userId

router.get('/users/:userId', function(req, res, next) {
    findReview(req, res, next);
})


//creates new review for unsigned-in user, route is POST to api/reviews
//creates new review for signed-in user, route is POST to api/users/:userId/reviews

router.post('/', function(req, res, next) {
    Review.create(req.body)
    .tap(function(review) {
        if (req.requestedUser) {
            review.setUser(req.requestedUser);
            req.requestedUser.addReview(review);
        }
        if (req.requestedProduct) {
            review.setProduct(req.requestedProduct);
            req.requestedProduct.addReview(review);
        }
        else if (req.query.userId) {
            review.setUser(req.query.userId);
        }
        else if (req.query.productId) {
            review.setProduct(req.query.productId);
        }
    })
    .then(review => res.json(review))
    .catch(next);
})

function createReview(req, res, next) {
    if (!req.requestedProduct || !req.requestedUser) {
        var err = new Error('Missing Product or User information');
        next(err);
    }
    Review.create(req.body)
    .tap(function(review) {
        review.setUser(req.requestedUser);
        req.requestedUser.addReview(review);
        review.setProduct(req.requestedProduct.id);
    })
    .then(review => res.json(review))
    .catch(next);
}

// create new review for a specific product if at /users/:userId/reviews/products/:productId

router.post('/products/:productId', function(req, res, next) {
    createReview(req, res, next);
})

// create new review for a specific product if at /products/:productId/reviews/users/userId

router.post('/users/:userId', function(req, res, next) {
    createReview(req, res, next);
})


//----------GET/DELETE/UPDATE EXISTING ORDERS--------------

//Searches our Review table for specific review
router.param('reviewId', function(req, res, next, reviewId) {
    Review.findById(reviewId)
    .then(review => {
        if (!review) {
            res.status(404);
            throw next(new Error('Review not found.'));
        }
        else req.review = review;
    })
    .catch(next);
})

router.get('/:reviewId', function (req, res) {
    res.send(req.review);
});


router.put('/:reviewId', function (req, res) {
    req.review.update(req.body)
    .then(review => res.send(review));
});

router.delete('/:reviewId', function(req, res) {
    req.review.destroy()
    .then(function() {
        res.sendStatus(204);
    });
});

module.exports = router;
