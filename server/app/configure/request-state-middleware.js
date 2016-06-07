'use strict';
var session = require('express-session');
var passport = require('passport');
var User = require('../../db/models/user');
var secrets = require('../../env/development')
module.exports = function (app) {

    app.use(session({
		  secret: secrets["SESSION_SECRET"],
		  resave: false,
		  saveUninitialized: false
		}));

		passport.serializeUser(function (user, done) {
		  done(null, user.id);
		});

		passport.deserializeUser(function (id, done) {
		  User.findById(id)
		  .then(function (user) {
		    done(null, user);
		  })
		  .catch(done);
		});

		app.use(passport.initialize());

		app.use(passport.session());
};