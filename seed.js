/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var chalk = require('chalk');
var db = require('./server/db');
var User = db.model('user');
var Product = db.model('product');
var Order = db.model('order');
var Box = db.model('box');
var OrderDetail = db.model('orderDetail');
var Review = db.model('review');
var Promise = require('sequelize').Promise;
var chance = require('chance')(123);

var numUsers = 15;
var numProducts = 150;

var seedUsers = function () {

    var users = [
        {
            first_name: 'Jane',
            last_name: 'FSA',
            email: 'testing@fsa.com',
            password: 'password',
            age: 5,
            gender: 'Female',
            isAdmin: false
        },
        {
            first_name: 'Barack',
            last_name: 'Obama',
            email: 'obama@gmail.com',
            password: 'potus',
            age: 54,
            gender: 'Male',
            isAdmin: true
        },
        {
            first_name: 'Mr.',
            last_name: 'Admin',
            email: 'm@m.com',
            password: 'm',
            age: 54,
            gender: 'Male',
            isAdmin: true
        },
    ];

    function generateRandomUser() {
        var name = chance.name().split(' ');
        return {
            first_name: name[0],
            last_name: name[1],
            email: name.join('').toLowerCase()+'@fsa.com',
            password: 'password',
            defaultShipping: chance.address(),
            age: chance.integer({min: 18, max: 70}),
            gender: chance.pickone(['Male', 'Female']),
            isAdmin: chance.bool({likelihood: 30})
        }

    }

    while (users.length <= numUsers) {
        users.push(generateRandomUser());
    }

    var creatingUsers = users.map(function (userObj) {
        return User.create(userObj);
    });


    return Promise.all(creatingUsers);

};

var seedBox = function () {

    var allArrays=[['Camp','Kayak','Climb','blank'],['Easy','Moderate','Hard','blank'],['Short','Medium','Long','blank'],['Warm','Cold','Wet','blank']];
    
    function allPossibleCases(arr) {
      if (arr.length == 1) {
        return arr[0];
      } else {
        var result = [];
        var allCasesOfRest = allPossibleCases(arr.slice(1));  // recur with the rest of array
        for (var i = 0; i < allCasesOfRest.length; i++) {
          for (var j = 0; j < arr[0].length; j++) {
            result.push(arr[0][j]+","+allCasesOfRest[i]);
          }
        }
        return result;
      }
    }

    var answer = allPossibleCases(allArrays);
    answer = answer.map(function(a){
        return a.split(",");
    });
    var creatingBoxes = answer.map(function (boxObj) {
        return Box.create({activity:boxObj[0],difficulty:boxObj[1],trip_length:boxObj[2],climate:boxObj[3],productList:[1,2,3,4,5]});
    });

    return Promise.all(creatingBoxes);

};

var seedProducts = function() {

    var brands = ['The North Face', 'Burton', 'Marmot','Big Agnes', 'REI', 'ALPS'],
        images = {
            Tent: 'http://ecx.images-amazon.com/images/I/81LmkUY3lLL._SL1500_.jpg',
            Backpack: 'http://pacsit.com/wp-content/uploads/2016/04/camping-backpacks-06.jpg',
            Kitchen: 'http://campingwithgus.com/wp-content/uploads/2011/03/camp-stove-camp-chef.jpg',
            'Sleeping Bag': 'http://cdn.thisiswhyimbroke.com/images/wearable-sleeping-bag-selk-bag-640x533.jpg',
            Gear: 'http://content.backcountry.com/images/items/medium/BLD/BLD1346/LIM.jpg',
            Footwear: 'http://images.mec.ca/fluid/customers/c822/5030-838/generated/5030-838_VGY01_view1_1000x1000.jpg',
            Clothing: 'http://images.evo.com/imgp/zoom/70229/373884/arc-teryx-sabre-jacket-golden-palm.jpg'
        };
        
    var categories = ['Tent', 'Backpack', 'Kitchen', 'Sleeping Bag', 'Gear', 'Footwear', 'Clothing'];
    
    function createItem() {
        var category = chance.pickone(categories);
        var price = generatePrice();

        return {
            name: chance.word()+' '+chance.word(),
            brand: chance.pickone(brands),
            category: category,
            quantity: chance.integer({min: 1, max: 30}),
            purchase_price: price,
            rental_price: generatePrice(price),
            pictureUrl: images[category] || 'http://ecx.images-amazon.com/images/I/81LmkUY3lLL._SL1500_.jpg',
            description: chance.sentence({words: 15})
        }
    }

    var products = [];

    for (var i = 0; i < numProducts; i++) {
        products.push(createItem());
    }

    var creatingProducts = products.map(function(product) {
        return Product.create(product);
    });

    return Promise.all(creatingProducts);
};

function generatePrice(purchasePrice) {
    var max = purchasePrice || 100000;
    return chance.integer({min: 50, max: max});
}


var createOrder = function() {
    var order = {
        address: chance.address(),
        status: 'pending',
        shipDate: chance.date({year: 2016}) ,
    }

    var detail = {
        unitPrice: generatePrice()
    }


    return Promise.all([Order.create(order), OrderDetail.create(detail)])
        .spread(function(order, orderDetail) {
            var chanceProduct = chance.integer({min: 1, max: numProducts});
            var chanceUser = chance.integer({min: 1, max: numUsers});
            return Promise.all([order.addOrderDetail(orderDetail), orderDetail.setOrder(order), orderDetail.setProduct(chanceProduct), order.setUser(chanceUser)])
        })

}

var seedReviews = function () {

    var reviews = [
        {
            rating: 5,
            title: "This product was amazing.",
            description: "Description"
        },
    ];

    var creatingReviews = reviews.map(function (reviewObj) {
        return Review.create(reviewObj);
    });

    return Promise.all(creatingReviews);

};


db.sync({ force: true })
    .then(function () {
        return Promise.all([seedUsers(), seedProducts(), testOrders(), seedBox(), seedReviews()])
    })
    .then(function() {
        orders = [];
        for (var i = 0; i < 10; i++) {
            orders.push(createOrder());
        }
        return Promise.all(orders);
    })
    .then(function() {
        return Box.findAll();
    })
    .then(function(result){
        return result.map(function(box){
            return Promise.all([box.addProduct(1), box.addProduct(2), box.addProduct(4)]);
        });
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });
