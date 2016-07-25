'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var pollController = require(path + '/app/controllers/pollController.client.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			return pollController.index(req, res);
		}
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(function (req, res) {
		    pollController.index(req, res);
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/mypolls')
		.get(isLoggedIn, function (req, res) {
			pollController.userPolls(req, res);
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
		
    app.route('/newpoll')
		.get(isLoggedIn, function (req, res) {
			res.render(path + '/public/newpoll.ejs', {
				user: req.user._id.toString()
			});
		})
		.post(isLoggedIn, function(req, res) {
			pollController.create(req, res);
		});
	
	app.route('/polls')
	   .get(function(req, res) {
	       pollController.index(req, res);
	   });
	   
	app.route('/polls/:id')
	   .get(function(req, res) {
	   	   pollController.show(req, res);
	   })
	   .post(function(req, res) {
	   	   pollController.vote(req, res);
	  });
	  
    app.route('/delete/:id')
       .post(isLoggedIn, function(req, res) {
       	   pollController.destroy(req, res);
       })
};
