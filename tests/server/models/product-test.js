var sinon = require('sinon');
var expect = require('chai').expect;

var Sequelize = require('sequelize');
var dbURI = require('../../../server/env/development').DATABASE_URI;
var db = new Sequelize(dbURI, {
    logging: false
});

require('../../../server/db/models/user')(db);
require('../../../server/db/models/products')(db);

var User = db.model('user');
var Product = db.model('product');

describe('Product model', function () {

    beforeEach('Sync DB', function () {
       return db.sync({ force: true });
    });

    describe('methods tests', function () {
        var createProduct = function () {
            return Product.create({name: 'Tent 16-1', category: 'gear', quantity: 2, brand: 'north face',
                                   purchase_price: 2249, rental_price: 499, description: 'a product with 4'});
        }
        it('should successfully create a product', function(done) {
            createProduct().then(function(product) {
                expect(product).to.not.be.equal(null);
                done();
            })
        })
        it ("should return the correct dollar purchase price and rental price", function(done) {
            createProduct().then(function(product) {
                expect(product.dollar_purchase_price).to.be.equal(22.49);
                expect(product.dollar_rental_price).to.be.equal(4.99);
                done();
            })
        })
    })

});
