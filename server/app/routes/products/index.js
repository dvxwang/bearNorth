'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../../db/_db');
require('../../../db/models/products')(db);
var Product = db.model('product');


// --- Get all products
router.get('/', function(req, res, next) {
  Product.findAll({})
  .then(products => res.send(products))
  .catch(next);
})

// --- Create new product
// need to ensure user is admin
router.post('/', function(req, res, next) {
  Product.create(req.body)
  .then(product => res.status(201).send(product))
  .catch(next);
})

// --- Specific category
router.get('/categories/:category', function (req, res, next) {
  Product.findAll({ where: { category: req.params.category }})
  .then(products => res.send(products))
  .catch(next);
})

// --- Specific product
// ------ get
router.get('/:id', function (req, res, next) {
  Product.findById(req.params.id)
  .then(function(product) {
    if (!product) throw HttpError(404);
    res.send(product);
  })
  .catch(next);
});

// ------ update
// need to ensure user is admin
router.put('/:id', function (req, res, next) {
  Product.findById(req.params.id)
  .then(function(product) {
    if (!product) throw HttpError(404);
    else return product.update(req.body);
  })
  .then(updatedProduct => res.send(updatedProduct))
  .catch(next);
});

// ------ delete
// need to ensure user is admin
router.delete('/:id', function (req, res, next) {
  Product.findById(req.params.id) // need to ensure user is admin
  .then(function(product) {
    if (!product) throw HttpError(404);
    else return product.destroy();
  })
  .then(function() {
    res.status(204).end();
  })
  .catch(next);
});
