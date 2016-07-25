'use strict';

var sanitizeHtml = require('sanitize-html');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var relationship = require("mongoose-relationship");
var User = require('./users.js');

var PollSchema = new Schema({
    created: Date,
	title: String,
    user: { type:Schema.ObjectId, ref:"User", childPath:"polls" },
    options: [
        {
            text: String,
            votes: Number
        }
    ],
    voters: []
});

// Automatically remove HTML from public facing fields on save
PollSchema.pre('save', function(next) {
  var sanitize = {
    allowedTags: [],
    allowedAttributes: []
  };

  this.title = sanitizeHtml(this.title, sanitize);
  this.options = this.options.map(function(option){
      option.text = sanitizeHtml(option.text, sanitize);
      // 50 char max
      option.text = option.text.slice(0, 50);
      return option;
    });
  next();
});


PollSchema.plugin(relationship, { relationshipPathName:'user' });

module.exports = mongoose.model('Poll', PollSchema);