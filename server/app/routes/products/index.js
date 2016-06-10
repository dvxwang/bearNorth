'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../../db/_db');
require('../../../db/models/products')(db);
var Product = db.model('product');
var Auth = require('../../configure/auth-middleware')

// --- Get all products
router.get('/', function(req, res, next) {
  Product.findAll({})
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
router.put('/:id', Auth.assertAdmin, function (req, res, next) {
  Product.findById(req.params.id)
  .then(function(product) {
    if (!product) throw HttpError(404);
    else return product.update(req.body);
  })
  .then(updatedProduct => res.send(updatedProduct))
  .catch(next);
});

// ------ delete
router.delete('/:id', Auth.assertAdmin, function (req, res, next) {
  Product.findById(req.params.id)
  .then(function(product) {
    if (!product) throw HttpError(404);
    else return product.destroy();
  })
  .then(function() {
    res.status(204).end();
  })
  .catch(next);
});
