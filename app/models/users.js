var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String
	},
	polls: [{ type:Schema.ObjectId, ref:"Poll" }]
});

module.exports = mongoose.model('User', UserSchema);