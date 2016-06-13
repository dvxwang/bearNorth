'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../../db/_db');
require('../../../db/models/products')(db);
var Product = db.model('product');
var Auth = require('../../configure/auth-middleware');
var reviewRouter = require('../reviews');

// --- Get all products
router.get('/', function(req, res, next) {
  Product.findAll({})
  .then(products => res.send(products))
  .catch(next);
})

// --- Get all categories
router.get('/allCategories', function(req, res, next) {
  Product.aggregate('category', 'DISTINCT', { plain: false })
  .then(products => res.send(products))
  .catch(next);
})

// --- Create new product
router.post('/', Auth.assertAdmin, function(req, res, next) {
  Product.create(req.body)
  .then(product => res.status(201).send(product))
  .catch(next);
})

// --- Specific category
router.post('/categories/', function (req, res, next) {
  Product.findAll({ where: req.body })
  .then(products => res.send(products))
  .catch(next);
})

router.param('productId', function(req, res, next, productId) {
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

// --- Specific product
// ------ get
router.get('/:productId', function (req, res) {
  res.json(req.requestedProduct);
});

// ------ update
router.put('/:productId', Auth.assertAdmin, function (req, res, next) {
  req.requestedProduct.update(req.body)
  .then(function(product) {
      res.send(product);
  })
  .catch(next);
});

// ------ delete
router.delete('/:productId', Auth.assertAdmin, function (req, res, next) {
  req.requestedProduct.destroy()
  .then(function() {
      res.sendStatus(204)
  })
  .catch(next);
});

router.use('/:productId/reviews', reviewRouter);
