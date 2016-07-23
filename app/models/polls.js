'use strict';

var sanitizeHtml = require('sanitize-html');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    created: Date,
	  title: String,
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    options: [
        {
            text: String,
            votes: Number
        }
    ],
    voters: []
});

// Automatically remove HTML from public facing fields on save
Poll.pre('save', function(next) {
  var sanitize = {
    allowedTags: [],
    allowedAttributes: []
  };

  this.title = sanitizeHtml(this.title, sanitize);
  this.options = this.options.map(function(option){
      option.text = sanitizeHtml(option.text, sanitize);
      return option;
    });
  next();
});

module.exports = mongoose.model('Poll', Poll);