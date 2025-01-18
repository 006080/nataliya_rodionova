const mongoose = require('mongoose');

// Define a schema for the User model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, request: true },
    email: { type: String, required: true, unique: true },
    message: { type: String, required: true },
    terms: { type:String, require: true}
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;