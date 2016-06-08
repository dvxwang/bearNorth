'use strict';
var router = require('express').Router();
var db = require('../../db');
var User = db.model('user');
var Order = db.model('order');
var OrderDetail = db.model('orderDetail');
var Product = db.model('product');


//route is api/users/:userId/orders OR api/orders

router.get('/', function (req, res) {
    var user = (req.user) ? {userId: req.user.id} : null;
    Order.all({where: user})
    .then(orders => {
        res.json(orders);
    });
});

//route is api/users/:userId/orders OR api/orders
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

//ORDER GETS/PUTS/DELETES
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

// ORDER DETAIL POSTS/UPDATES/DELETES

router.post('/:orderId/addItem', function(req, res, next) {
    //must send an orderdetail object with productId property
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

router.delete('/:orderId/deleteItem', function(req, res, next) {
    OrderDetail.findById(req.body.id)
    .then(function(orderDetail) {
        return orderDetail.destroy();
    })
    .then(function() {
        res.sendStatus(204);
    })
    .catch(next);
})


module.exports = router;