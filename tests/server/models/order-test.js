var sinon = require('sinon');
var expect = require('chai').expect;

var Sequelize = require('sequelize');
var dbURI = require('../../../server/env/development').DATABASE_URI;
var db = new Sequelize(dbURI, {
    logging: false
});

require('../../../server/db/models/orderDetails')(db);
require('../../../server/db/models/orders')(db);
require('../../../server/db/models/products')(db);

var Order = db.model('order');
var OrderDetail = db.model('orderDetail');
var Product = db.model('product');

Order.hasMany(OrderDetail); 
OrderDetail.belongsTo(Order);
OrderDetail.belongsTo(Product);
Product.hasMany(OrderDetail);


describe('Order model', function () {

    beforeEach('Sync DB', function () {
       return db.sync({ force: true });
    });

    describe('methods tests', function () {
        var createOrder = function () {
            return Order.create({});
        }
        var createProduct = function () {
            return Product.create({name: 'Tent 16-1', category: 'gear', quantity: 2, brand: 'north face',
                                   purchase_price: 2249, rental_price: 499, description: 'a product with 4'});
        }
        var createOrderDetail = function () {
            return OrderDetail.create({
                quantity: 2,
                unitPrice: 250,
                rentalDays: 3,
                isRental: true
            });
        }
        var createOrderDetail2 = function () {
            return OrderDetail.create({
                quantity: 3,
                unitPrice: 200,
                rentalDays: 3,
                isRental: true
            });
        }
        var o, p, od, od2;
        it('should successfully create an order', function(done) {
            createOrder()
            .then(function(order) {
                o = order;
                expect(order).to.not.be.equal(null);
                return createProduct();
            })
            .then(product => {
                p = product;
                return createOrderDetail();
            })
            .tap(orderDetail => {
                return orderDetail.setProduct(p.id);
            })
            .tap(orderDetail => {
                return orderDetail.setOrder(o.id);
            })
            .then(orderDetail => {
                od = orderDetail;
                return o.addOrderDetail(orderDetail);
            })
            .then(order => {
                o = order;
                return p.addOrderDetail(od);
            })
            .then(product => {
                p = product;
                return createOrderDetail2();
            })
            .tap(orderDetail => {
                return orderDetail.setProduct(p.id);
            })
            .tap(orderDetail => {
                return orderDetail.setOrder(o.id);
            })
            .then(orderDetail => {
                od2 = orderDetail;
                return o.addOrderDetail(orderDetail);
            })
            .then(order => {
                o = order;
                return p.addOrderDetail(od2);
            })
            .then(product => {
                p = product;
                return o.getOrderDetails();
            })
            .then(orderDetails => {
                expect(od.id).to.be.equal(orderDetails[0].id);
                expect(od2.id).to.be.equal(orderDetails[1].id);
                expect(od.orderId).to.be.equal(o.id);
                expect(od2.orderId).to.be.equal(o.id);
                return p.getOrderDetails();
            })
            .then(orderDetails => {
                expect(od.id).to.be.equal(orderDetails[0].id);
                expect(od2.id).to.be.equal(orderDetails[1].id);
                expect(od.productId).to.be.equal(p.id);
                expect(od2.productId).to.be.equal(p.id);
                done();
            })
        })
        it ("should return the subtotal using the subtotal getter method", function(done) {
            createOrderDetail().then(orderDetail => {
                expect(orderDetail.subtotal).to.be.equal(15);
                done();
            })
        })
    })

});
