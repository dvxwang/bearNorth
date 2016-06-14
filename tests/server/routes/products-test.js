var expect = require('chai').expect;

var Sequelize = require('sequelize');
var dbURI = 'postgres://localhost:5432/testingfsg';
var db = new Sequelize(dbURI, {
    logging: false
});

require('../../../server/db/models/products')(db);
require('../../../server/db/models/user')(db);

var supertest = require('supertest');
var Product = db.model('product');
var User = db.model('user');

describe('Products Route', function () {

  var app;

  beforeEach('Sync DB', function () {
    return db.sync({ force: true });
  });

  beforeEach('Create app', function () {
    app = require('../../../server/app')(db);
  });

	describe('Non-admin requests', function () {

		var guestAgent;

		beforeEach('Create guest agent', function () {
			guestAgent = supertest.agent(app);
		});

    beforeEach('Create a product', function (done) {
      var aProduct = {
              name: 'A bag',
              brand: 'North Face',
              category: 'Sleeping Bag',
              quantity: 10,
              purchase_price: 12000,
              rental_price: 1000,
              pictureUrl: 'http://i1.wp.com/theverybesttop10.com/wp-content/uploads/2014/04/The-World%E2%80%99s-Top-10-Best-Images-of-Cats-Wearing-Helmets-Made-of-Fruit-2.jpg?resize=470%2C392',
              description: 'Bestest sleeping bag ever.'
          },
          anotherProduct = {
                  name: 'Another bag',
                  brand: 'North Face',
                  category: 'Sleeping Bag',
                  quantity: 10,
                  purchase_price: 12000,
                  rental_price: 1000,
                  pictureUrl: 'http://i1.wp.com/theverybesttop10.com/wp-content/uploads/2014/04/The-World%E2%80%99s-Top-10-Best-Images-of-Cats-Wearing-Helmets-Made-of-Fruit-2.jpg?resize=470%2C392',
                  description: 'Bestest sleeping bag ever.'
              };
      return Product.bulkCreate([aProduct,anotherProduct])
      .then(function (products) {
        done();
      })
      .catch(done);
    });

		it('should get all products', function (done) {
			guestAgent.get('/api/products').end(function(err, res) {
        expect(res.body.length).to.equal(2);
        done();
      })
		});

    it('should get one product', function (done) {
			guestAgent.get('/api/products/1').end(function(err, res) {
        console.log(res.body)
        expect(res.body.name).to.equal('Another bag');
        done();
      })
		});

	});
});

// 	describe('Authenticated request', function () {
//
// 		var loggedInAgent;
//
// 		var userInfo = {
// 			email: 'joe@gmail.com',
// 			password: 'shoopdawoop'
// 		};
//
// 		beforeEach('Create a user', function (done) {
// 			return User.create(userInfo).then(function (user) {
//                 done();
//             }).catch(done);
// 		});
//
// 		beforeEach('Create loggedIn user agent and authenticate', function (done) {
// 			loggedInAgent = supertest.agent(app);
// 			loggedInAgent.post('/login').send(userInfo).end(done);
// 		});
//
// 		it('should get with 200 response and with an array as the body', function (done) {
// 			loggedInAgent.get('/api/members/secret-stash').expect(200).end(function (err, response) {
// 				if (err) return done(err);
// 				expect(response.body).to.be.an('array');
// 				done();
// 			});
// 		});
//
// 	});
//
// });
