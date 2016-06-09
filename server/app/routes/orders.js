'use strict';
var router = require('express').Router();
var db = require('../../db');
var User = db.model('user');
var Order = db.model('order');
var OrderDetail = db.model('orderDetail');
var Product = db.model('product');


//get ALL orders (need to ensure user is admin) if route is api/orders
//get all orders for specific user IF route is api/users/:userId/orders
router.get('/', function (req, res) {
    var user = (req.user) ? {userId: req.user.id} : null;
    Order.all({where: user})
    .then(orders => {
        res.json(orders);
    });
});

//creates new order for unsigned-in user, route is POST to api/orders
//creates new order for signed-in user, route is POST to api/users/:userId/orders

router.post('/', function(req, res, next) {
    Order.create(req.body)
    .then(function(order) {
        if (req.user) order.addUser(req.user);
    })
    .then(order => {
        res.json(order);
    })
    .catch(next);
})

//----------GET/DELETE/UPDATE EXISTING ORDERS--------------

//Searches our Order table for specific order
router.param('orderId', function(req, res, next, orderId) {
    Order.findById(orderId)
    .then(order => {
        if (!order) {
            res.status(404);
            return next(new Error('Order not found.'));
        }
        req.order = order;
        next();
    })
    .catch(function(err) {
        res.status(500);
        next(err);
    });
})

router.get('/:orderId', function (req, res) {
    res.send(req.order);
});


router.put('/:orderId', function (req, res, next) {
    req.order.update(req.body)
    .then(function(order) {
        res.send(order)
    })
    .catch(next);
});

router.delete('/:orderId', function(req, res, next) {
    req.order.destroy()
    .then(function() {
        res.sendStatus(204)
    })
})

//-------ADD/DELETE/UPDATE ORDER DETAILS TO EXISTING ORDERS-------

//adds order detail to existing order
router.post('/:orderId/addItem', function(req, res, next) {
  console.log('in route)')
    //must send an order detail object WITH productId property
    OrderDetail.create(req.body)
    .then(function(orderDetail) {
        return orderDetail.setProduct(req.body.productId)
            .then(function() {
               return req.order.addOrderDetail(orderDetail);
            })
    })
    .then(order => {
        res.json(order);
    })
    .catch(next);
})

//for all requests to api/orders/:orderId/:detailId, searches OrderDetail table for that line item
router.param('detailId', function(req, res, next, detailId) {
    OrderDetail.findById(detailId)
    .then(orderDetail => {
        if (!orderDetail) {
            res.status(404);
            return next(new Error('Order detail not found'));
        }
        req.orderDetail = orderDetail;
        next();
    })
    .catch(function(err) {
        res.status(500);
        next(err);
    });
})

//deletes order detail
router.delete('/:orderId/:detailId', function(req, res, next) {
    req.orderDetail.destroy()
    .then(function() {
        res.sendStatus(204);
    })
    .catch(next);
})

//updates order detail (in the event of quantity or rentalDay changes)
router.put('/:orderId/:detailId', function(req, res, next) {
    req.orderDetail.update(req.body)
    .then(function(orderDetail) {
        res.send(orderDetail);
    })
    .catch(next);
})

module.exports = router;
