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
var Orders = db.model('order');
var Promise = require('sequelize').Promise;

var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password',
            geography: 'New York',
            age: 5,
            gender: 'Female',
            isAdmin: false
        },
        {
            email: 'obama@gmail.com',
            password: 'potus',
            geography: 'Washington DC',
            age: 54,
            gender: 'Male',
            isAdmin: true
        }
    ];

    var orders = [
        {
            title: '7-Day Mountain Climbing',
            product: [1,2,3],
            quantity: [1,2,1],
            price: [1.00,2.32,0.05],
            status: "In Progress",
            orderDate: new Date(2015, 6, 20)
        },
        {
            title: '6-Day Mountain Climbing',
            product: [1,2,3],
            quantity: [1,2,1],
            price: [1.00,2.32,0.05],
            status: "In Progress",
            orderDate: new Date(2015, 6, 20)
        }
    ];

    var creatingUsers = users.map(function (userObj) {
        return User.create(userObj);
    });

    var creatingOrder = orders.map(function (orderObj) {
        return Orders.create(orderObj);
    });

    return Promise.all(creatingUsers.concat(creatingOrder));

};

db.sync({ force: true })
    .then(function () {
        return seedUsers();
    })
    .then(function(){
        return User.findById(2)
        .then(function(user1){
            return Orders.findById(1)
            .then(function(order){
                console.log("$$1: ",order.total);
                return order.setUser(user1);
            })
            .then(function(){
                return Orders.findById(2)
            })
            .then(function(order){
                console.log("$$2: ",order.total);
                return order.setUser(user1);
            })
        })
    })
    .then(function (test) {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    })
    .catch(function (err) {
        console.error(err);
        process.kill(1);
    });
