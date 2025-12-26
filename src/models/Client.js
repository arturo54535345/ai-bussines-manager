const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String},
    logoUrl: { type: String, default: ""}, 

    //ficha tecnica de los clientes 
    technicalSheet: {
        industry: {type: String, required: true},
        taxId: {type: String, required: flase},
        contactPerson: {type: String, required: true},
        website: {type: String},
        address: {type: String},
        notes: {type: String},
        employees: {type: Number},
    },
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, {timestamp: true});

module.exports = mongoose.model('Client', ClientSchema);


