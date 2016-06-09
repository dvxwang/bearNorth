'use strict';
var session = require('express-session');
var passport = require('passport');
var db = require('../../db');
require('../../db/models/user')(db);

var User = db.model('user');

module.exports = function (app) {

	var session_secret = app.getValue('env').SESSION_SECRET;
  	app.use(session({
		secret: session_secret,
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