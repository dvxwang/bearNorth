'use strict';
var router = require('express').Router();
var stripeSecret = require('../../env').STRIPE_SECRET;
var stripe = require("stripe")(stripeSecret);


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

module.exports = router;
