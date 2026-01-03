const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String},
    logoUrl: { type: String, default: ""}, 
    active: {type: Boolean, default: true},

    category:{
        type: String,
        // CORRECCIÓN: Añadimos 'Potencial' y 'General' para que coincida con el Front
        enum: ['Prospect', 'Active', 'VIP', 'Inactive', 'Potencial', 'General'],
        default: 'General'
    },

    technicalSheet: {
        // CORRECCIÓN: Ponemos required: false para que no rompa el servidor
        industry: {type: String, required: false},
        taxId: {type: String, required: false},
        contactPerson: {type: String, required: false},
        website: {type: String},
        address: {type: String},
        notes: {type: String},
        employees: {type: Number},
    },
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true});

module.exports = mongoose.model('Client', ClientSchema);