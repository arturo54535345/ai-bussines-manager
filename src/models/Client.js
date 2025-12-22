const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String},
    phone: {type: String},
    //decimos que este cliente pertenece a un usuario 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
},{timestamps: true});

module.exports = mongoose.model('Client', ClientSchema);