const mongoose = require('mongoose');
// Skema penyimpanan data login/creating account user
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type : String,
        required: [true, 'Email is required'],
        unique: true,
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
});

module.exports = mongoose.model('User', userSchema);