'use strict';
var router = require('express').Router();
var stripeSecret = require('../../env').STRIPE_SECRET;
var stripe = require("stripe")(stripeSecret);
var db = require('../../db');
var Order = db.model('order');
var OrderDetail = db.model('orderDetail');
var Product = db.model('product');

router.post('/', function (req, res) {
  var stripeToken = req.body.stripeToken,
      customerDesc = req.body.customerId,
      amountInCents = parseInt(req.body.amount * 100),
      txnDescription = req.body.txnDescription;

  stripe.customers.create({
    source: stripeToken,
    description: customerDesc
  })
  .then( function(stripeCustomer) {
    return stripe.charges.create({
      customer: stripeCustomer.id,
      amount: amountInCents,
      currency: "usd",
      description: txnDescription
    });
  })
  .then( function(charge) {
    res.json(charge);
  });

});


router.post('/orders', function(req, res, next) {
  Order.create(req.body.order)
    .tap(function(order) {
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

module.exports = router;
