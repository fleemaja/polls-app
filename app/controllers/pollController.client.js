var _ = require('lodash');
var Poll = require('../models/polls.js');
var path = process.cwd();

// Get list of polls
exports.index = function(req, res) {
  Poll.find(function (err, polls) {
    if(err) { return handleError(res, err); }
    var showObj = { polls: polls, user: null };
    if (req.user) {
      showObj['user'] = req.user._id.toString()
		}
    return res.render(path + '/public/index.ejs', showObj);
  });
};

// Get list of polls
exports.userPolls = function(req, res) {
  Poll.find({ user: req.user._id }, function (err, polls) {
    if(err) { return handleError(res, err); }
    return res.render(path + '/public/mypolls.ejs', {
				polls: polls,
				user: req.user._id.toString()
		});
  });
};

// Get a single poll
exports.show = function(req, res) {
  Poll.findById(req.params.id, function (err, poll) {
    if(err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    var showObj = { poll: poll, user: null };
    if (req.user) {
      showObj['user'] = req.user._id.toString()
		}
    return res.render(path + '/public/show.ejs', showObj);
  });
};

// Creates a new poll in the DB.
exports.create = function(req, res) {
  var options = req.body.options.split("\r\n");
  var options = options.map(function(op) { return op.slice(0, 50) });
  var options = options.getUnique();
  var parsedPoll = req.body;
  var parsedOptions = [];
  for (var i = 0; i < options.length; i++) {
    parsedOptions.push({
      text: options[i],
      votes: 0
    });
  }
  parsedPoll.options = parsedOptions;
  parsedPoll.user = req.user.id;
  Poll.create(parsedPoll, function(err, poll) {
    if(err) { return handleError(res, err); }
    var showObj = { poll: poll, user: null };
    if (req.user) {
      showObj['user'] = req.user._id.toString()
		}
    return res.render(path + '/public/show.ejs', showObj);
  });
};

// adds a voter to the object
exports.vote = function(req, res) {
  var choice = req.body.option.slice(0, 50);
  
  if(req.body._id) { delete req.body._id; }
  Poll.findById(req.params.id, function (err, poll) {
    if (err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }
    var updated = _.extend(poll, req.body);
    
    var newOption = true;
    updated.options.forEach(function(option) {
      if (option.text === choice) {
        option.votes += 1;
        newOption = false;
      }
    });
    if (newOption && choice != "") {
      updated.options.push({
        text: choice,
        votes: 1
      })
    }

    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      var showObj = { poll: poll, user: null };
      if (req.user) {
        showObj['user'] = req.user._id.toString()
  		}
      return res.render(path + '/public/show.ejs', showObj);
    });
  });
};

// Deletes a poll from the DB.
exports.destroy = function(req, res) {
  Poll.findById(req.params.id, function (err, poll) {
    if(err) { return handleError(res, err); }
    if(!poll) { return res.status(404).send('Not Found'); }

    // Only owners and admins may delete
    if(poll.user.toString() === req.user._id.toString()) {
      poll.remove(function(err) {
        if(err) { return handleError(res, err); }
        Poll.find(function (err, polls) {
          if(err) { return handleError(res, err); }
          var showObj = { polls: polls, user: null };
          if (req.user) {
            showObj['user'] = req.user._id.toString();
          }
          return res.render(path + '/public/index.ejs', showObj);
        });
      });
    } else {
      return res.status(403).send('You do not have permission to delete this item');
    }
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}