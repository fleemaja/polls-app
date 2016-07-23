var _ = require('lodash');
var Poll = require('../models/polls.js');
var path = process.cwd();

// Get list of polls
exports.index = function(req, res) {
  Poll.find(function (err, polls) {
    if(err) { return handleError(res, err); }
    res.render(path + '/public/index.ejs', {
				polls: polls
		});
  });
};

// Get a single poll
exports.show = function(req, res) {
  Poll.findById(req.params.id, function (err, poll) {
    if(err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    res.render(path + '/public/show.ejs', {
				poll: poll
		});
  });
};

// Creates a new poll in the DB.
exports.create = function(req, res) {
  var options = req.body.options.split("\r\n");
  var parsedPoll = req.body;
  var parsedOptions = [];
  for (var i = 0; i < options.length; i++) {
    parsedOptions.push({
      text: options[i],
      votes: 0
    });
  }
  parsedPoll.options = parsedOptions;
  Poll.create(parsedPoll, function(err, poll) {
    if(err) { return handleError(res, err); }
    return res.render(path + '/public/show.ejs', {
				poll: poll
		});
  });
};

// Updates an existing poll in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Poll.findById(req.params.id, function (err, poll) {
    if (err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    var updated = _.extend(poll, req.body);

    // Must be owner or be an admin to update
    if(poll.owner.toString() === req.user._id.toString()) {
      updated.save(function (err) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(poll);
      });
    } else {
      return res.status(403).send('You do not have permission to update this item');
    }
  });
};

// adds a voter to the object
exports.vote = function(req, res) {
  var choice = req.body.option;
  
  if(req.body._id) { delete req.body._id; }
  Poll.findById(req.params.id, function (err, poll) {
    if (err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    var updated = _.extend(poll, req.body);
    
    updated.options.forEach(function(option) {
      if (option.text === choice) {
        option.votes += 1;
      }
    });

    // Add voter IP
    // var ipAddr = req.headers["x-forwarded-for"];
    // if (ipAddr){
    //   var list = ipAddr.split(",");
    //   ipAddr = list[list.length-1];
    // } else {
    //   ipAddr = req.connection.remoteAddress;
    // }
    // updated.voters.push(ipAddr);

    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.render(path + '/public/show.ejs', {
				poll: poll
		  });
    });
  });
};

// Deletes a poll from the DB.
exports.destroy = function(req, res) {
  Poll.findById(req.params.id, function (err, poll) {
    if(err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }

    // Only owners and admins may delete
    if(poll.owner.toString() === req.user._id.toString()) {
      poll.remove(function(err) {
        if(err) { return handleError(res, err); }
        return res.status(204).send('No Content');
      });
    } else {
      return res.status(403).send('You do not have permission to delete this item');
    }
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}