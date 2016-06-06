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
var Activity = db.model('activity');
var Type = db.model('type');
var Promise = require('sequelize').Promise;
var chance = require('chance')(123);

var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    var creatingUsers = users.map(function (userObj) {
        return User.create(userObj);
    });

    return Promise.all(creatingUsers);

};

var seedActivities = function() {
    var activity = ['Kayak', 'Climb', 'Camp'];
    var creatingActivities = activity.map(function(activity) {
        return Activity.create({name: activity});
    });
    return Promise.all(creatingActivities);
}

var seedTypes = function() {
    var activities = {
        Camp: ['Tent', 'Backpack', 'Kitchen', 'Sleeping Bag', 'Gear', 'Footwear', 'Clothing'],
        Kayak: ['Kayak', 'Paddles', 'Wetsuit', 'Safety'],
        Climb: ['Climbing Hardware', 'Harnesses', 'Rope', 'Climbing Shoes']
    }

    var creatingTypes = [];

    for (var k in activities) {
        
        var createType = activities[k].map(function(type) {
            return Type.create({name: type})
                .then(function(createdType) {
                    return Activity.findOne({where: {name: k} })
                        .then(function(foundActivity) {
                            return foundActivity.addType(createdType);
                        })
                });
        });

        creatingTypes.push(createType);
    }

    return Promise.all(creatingTypes);

}

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
        
    var types = ['Tent', 'Backpack', 'Kitchen', 'Sleeping Bag', 'Gear', 'Footwear', 'Clothing'];
    

    function createItem() {
        var price = chance.floating({min: 10, max: 1000, fixed: 2});
        var type = chance.pickone(types);
        return {
            name: chance.word()+' '+chance.word(),
            brand: chance.pickone(brands),
            purchase_price: price,
            rental_price: chance.floating({min: 2, max: price, fixed: 2}),
            pictureUrl: images[type] || 'http://ecx.images-amazon.com/images/I/81LmkUY3lLL._SL1500_.jpg',
            description: chance.sentence({words: 15})
        }
    }

    var products = [];

    for (var i = 0; i < 100; i++) {
        products.push(createItem());
    }

    var creatingProducts = products.map(function(product) {
        return Product.create(product)
            .then(function(createdProduct) {
                return createdProduct.setType(chance.integer({min: 1, max: 15}));
            });
    });

    return Promise.all(creatingProducts);
};

db.sync({ force: true })
    .then(function () {
        return seedUsers();
    })
    .then(function() {
        return seedActivities();
    })
    .then(function() {
        return seedTypes();
    })
    .then(function() {
        return seedProducts();
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });
