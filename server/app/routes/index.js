'use strict';
var router = require('express').Router();
var Auth = require('../configure/auth-middleware')
module.exports = router;

var db = require('../../db');
var Order = db.model('order');
var OrderDetail = db.model('orderDetail');
var Product = db.model('product');


router.use('/members', Auth.assertAdmin, require('./members'));
router.use('/products', require('./products'));
router.use('/boxes', require('./boxes'));

router.use('/users', require('./users'));
router.use('/orders', Auth.assertAdmin, require('./orders'));
router.use('/reviews', require('./reviews'));
router.use('/checkout', require('./checkout'));


router.post('/checkout/order', function(req, res, next) {
	Order.create(req.body.order)
    .tap(function(order) {
        if (req.requestedUser) {
            order.addUser(req.requestedUser);
            req.requestedUser.addOrder(order);
        }

        var creatingOrderDetails = req.body.orderDetails.map(function(detail) {
        	return addOrderDetail(detail, order.id);
        })

        return Promise.all(creatingOrderDetails);
    })
    .then(order => {
        return order.reload({include: [{model: OrderDetail}]});
    })
    .then(order => {
    	  res.json(order);
    })
    .catch(next);
})


function addOrderDetail(detail, orderId) {
	OrderDetail.create(detail)
    .then(function(orderDetail) {
        return Promise.all([orderDetail.setProduct(detail.productId), orderDetail.setOrder(orderId)]);
    })
}

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
