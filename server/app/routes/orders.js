'use strict';
var router = require('express').Router();
var db = require('../../db');
var User = db.model('user');
var Order = db.model('order');
var OrderDetail = db.model('orderDetail');
var Product = db.model('product');
var Auth = require('../configure/auth-middleware')

//get ALL orders (need to ensure user is admin) if route is api/orders
//get all orders for specific user IF route is api/users/:userId/orders
router.get('/', function (req, res) {
    var whereCondition = {};
    if (req.requestedUser) {
        whereCondition.where = {};
        whereCondition.where.userId = req.requestedUser.id;
    }
    Order.all(whereCondition)
    .then(orders => {
        res.json(orders);
    });
});

//get ALL orders for a given status (need to ensure user is admin) if route is api/orders/[status]
//get all orders for a given status specific user IF route is api/users/:userId/orders/[status]
router.get('/:status', function (req, res) {
  var user = (req.user) ? {userId: req.user.id} : null;
  Order.findAll({
    where: { userId: user.userId, status: req.params.status },
    include: [
      { model: OrderDetail,
        include:
          { model: Product }
      }
    ]
  })
  .then(orders => res.json(orders));
});

//creates new order for unsigned-in user, route is POST to api/orders
//creates new order for signed-in user, route is POST to api/users/:userId/orders

router.post('/', function(req, res, next) {
    Order.create(req.body)
    .tap(function(order) {
        if (req.requestedUser) {
            order.addUser(req.requestedUser);
            req.requestedUser.addOrder(order);
        }
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


//-------GET/ADD/DELETE/UPDATE ORDER DETAILS TO EXISTING ORDERS-------

//gets order details for this order
router.get('/:orderId/item', function(req, res, next) {
    OrderDetail.findAll({
        where: {
            orderId: req.order.id
        }
    })
    .then(orderDetails=> {
        res.send(orderDetails);
    })
    .catch(next);
})

//adds order detail to existing order
router.post('/:orderId/item', function(req, res, next) {
    //must send an order detail object WITH productId property
    OrderDetail.create(req.body)
    .tap(function(orderDetail) {
        return orderDetail.setProduct(req.body.productId)
    })
    .then(function(orderDetail) {
        return req.order.addOrderDetail(orderDetail);
    })
    .then(order => {
        return order.reload({include: [{model: OrderDetail}]});
    })
    .then(updatedOrder => {
        console.log(updatedOrder)
        res.json(updatedOrder);
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
router.delete('/:orderId/item/:detailId', function(req, res, next) {
    req.orderDetail.destroy()
    .then(function() {
        res.sendStatus(204);
    })
    .catch(next);
})

//updates order detail (in the event of quantity or rentalDay changes)
router.put('/:orderId/item/:detailId', function(req, res, next) {
    req.orderDetail.update(req.body)
    .then(function(orderDetail) {
        res.send(orderDetail);
    })
    .catch(next);
})

module.exports = router;
<<<<<<< HEAD

=======
>>>>>>> c2a57146153b88cbc7c4e9ed8b2366887f3e84c0
