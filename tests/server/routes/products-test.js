var expect = require('chai').expect;
var supertest = require('supertest');

var db = require('../../../server/db');
var Product = db.model('product');
var User = db.model('user');

describe('Products Route', function () {

  var app, guestAgent, adminAgent;
  var adminUserDetails = {
    email: 'obama@email.com',
    password: 'potus',
    isAdmin: true
  }

  beforeEach('Sync DB', function () {
    return db.sync({ force: true });
  });

  beforeEach('Create app', function () {
    app = require('../../../server/app')(db);
  });

  beforeEach('Create an admin user', function() {
    User.create(adminUserDetails)
    .then( function(adminUser) {
      console.log('admin user created')
    });
  });

  beforeEach('Create agents', function(done) {
    guestAgent = supertest.agent(app);
    adminAgent = supertest.agent(app);
    adminAgent.post('/login')
      .send(adminUserDetails)
      .end( function(err, res) {
        console.log('adminAgent logged in')
        done();
      });
  });

  beforeEach('Create products', function (done) {
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
                brand: 'Big Agnes',
                category: 'Sleeping Bag',
                quantity: 10,
                purchase_price: 11999,
                rental_price: 1000,
                pictureUrl: 'http://i1.wp.com/theverybesttop10.com/wp-content/uploads/2014/04/The-World%E2%80%99s-Top-10-Best-Images-of-Cats-Wearing-Helmets-Made-of-Fruit-2.jpg?resize=470%2C392',
                description: 'The second bestest sleeping bag ever.'
        };
    return Product.bulkCreate([aProduct,anotherProduct])
    .then(function (products) {
      done();
    })
    .catch(done);
  });

	describe('Guest requests', function () {
		it('should get all products', function (done) {
			guestAgent.get('/api/products').end(function(err, res) {
        expect(res.body.length).to.equal(2);
        done();
      })
		});
    it('should get one product', function (done) {
			guestAgent.get('/api/products/1').end(function(err, res) {
        expect(res.body.name).to.equal('A bag');
        done();
      })
		});
    it('status should be 404 for an invalid product', function (done) {
			guestAgent.get('/api/products/24356').end(function(err, res) {
        expect(res.status).to.equal(404);
        done();
      })
		});
    it('non-admin user cannot create a product', function (done) {
      guestAgent.post('/api/products').end(function(err, res) {
        expect(res.status).to.equal(500);
        done();
      })
    });
    it('non-admin user cannot update a product', function (done) {
      var productIdToUpdate = 1;
      guestAgent.put('/api/products/' + productIdToUpdate)
      .send({ name: 'something' })
      .end(function(err, res) {
        expect(res.status).to.equal(500);
        done();
      })
    });
    it('non-admin user cannot delete a product', function (done) {
      var productIdToDelete = 1;
      guestAgent.delete('/api/products/' + productIdToDelete)
      .end(function(err, res) {
        expect(res.status).to.equal(500);
        done();
      })
    });
  });

  describe('Admin requests', function () {

    it('admins should be able to update a product', function (done) {
      var newProductDetails = {
        name: 'New bag name'
      }
      adminAgent.put('/api/products/1')
      .send(newProductDetails)
      .end(function(err, res) {
        guestAgent.get('/api/products/1').end(function(err, res) {
          expect(res.body.name).to.equal(newProductDetails.name);
          done();
        })
      })
    });

    it('admins should be able to create a product', function (done) {
      var newProductDetails = {
        name: 'A tent',
        brand: 'Marmot',
        category: 'Tent',
        quantity: 1,
        purchase_price: 500,
        rental_price: 100,
        pictureUrl: 'http://i1.wp.com/theverybesttop10.com/wp-content/uploads/2014/04/The-World%E2%80%99s-Top-10-Best-Images-of-Cats-Wearing-Helmets-Made-of-Fruit-2.jpg?resize=470%2C392',
        description: 'This is a tent.'
      }
      adminAgent.post('/api/products')
      .send(newProductDetails)
      .end(function(err, res) {
        var newProductId = res.body.id;
        guestAgent.get('/api/products/' + newProductId)
        .end(function(err, res) {
          expect(res.body.name).to.equal(newProductDetails.name);
          done();
        })
      })
    });

    it('admins should be able to delete a product', function (done) {
      var productIdToDelete = 3;
      adminAgent.delete('/api/products/' + productIdToDelete)
      .end(function(err, res) {
        guestAgent.get('/api/products/' + productIdToDelete)
        .end(function(err, res) {
          expect(res.status).to.equal(404);
          done();
        })
      })
    });
	});

});
