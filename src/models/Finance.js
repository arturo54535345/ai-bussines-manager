const mongoose = require ('mongoose');

//cada fila sera un movimiento de dinero
const FinanceSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    type:{
        type: String,
        enum: ['ingreso', 'gasto'],//solo hay estas dos opciones 
        required: true
    },
    amount: {
        type: Number,
        required: true//en que se ha gastado el dinero 
    },
    description:{
        type: String,
        required: true//en que el usuario ha gastado o que servicios se han cobrado
    },
    status:{
        type: String,
        enum: ['estimado', 'ejecutado'],//estimado es lo que el usuario piense que pueda pasar y ejecutado dinero real 
    },
    date: {type: Date, default: Date.now},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});

module.exports = mongoose.model('Finance', FinanceSchema);