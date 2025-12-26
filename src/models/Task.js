const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, default: ""},
    status:{
        type: String,
        enum: ['pending', 'in-progress', 'completed'],// permite estas tres opciones solo 
        default: 'pending'// si no se pone nada se pone por defecto esta 
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    dueDate:{//le añade una fecha de vencimiento
        type: Date
    },
    notes: [{//notas de seguimiento
        content: String,
        date: {type: Date, default: Date.now},
    }],
    client: {type:mongoose.Schema.Types.ObjectId, ref: 'Client'},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

module.exports = mongoose.model('Task', TaskSchema);