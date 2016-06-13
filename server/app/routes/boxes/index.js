'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../../db');
var Box = db.model('box');

// --- Get all boxes
router.get('/', function(req, res, next) {
  Box.findAll({})
  .then(boxes => res.send(boxes))
  .catch(next);
})

// --- Create new box
// need to ensure user is admin
router.post('/', function(req, res, next) {
  Box.create(req.body)
  .then(box => res.status(201).end(box))
  .catch(next);
})

// --- Get a specific box matching specific criteria
router.get('/match', function(req, res, next) {  //post is returning info, use get instead w/ query params CdV/OB
  Box.findOne({ where: req.params })
  .then(function(result){
    return result.getProducts();
  })
  .then(function(products){
    res.send(products);
  })
  .catch(next);
})

// --- Specific box
// ------ get
router.get('/:id', function (req, res, next) {
  Box.findById(req.params.id)
  .then(function(box) {
    if (!box) res.status(404).end();
    res.send(box);
  })
  .catch(next);
});

// ------ update
// need to ensure user is admin
router.put('/:id', function (req, res, next) {
  Box.findById(req.params.id)
  .then(function(box) {
    if (!box) res.status(404).end();
    else return box.update(req.body);
  })
  .then(updatedbox => res.send(updatedbox))
  .catch(next);
});

// ------ delete
// need to ensure user is admin
router.delete('/:id', function (req, res, next) {
  Box.findById(req.params.id) // need to ensure user is admin
  .then(function(box) {
    if (!box) res.status(404).end();
    else return box.destroy();
  })
  .then(function() {
    res.status(204).end();
  })
  .catch(next);
});
