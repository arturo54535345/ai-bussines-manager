const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    name: {type: String, required: true},// nombre obigatorio
    email:{type: String, required: true, unique: true},// el email obligatorio y no se puede repetir
    password: {type: String, required: true}, //contraseña obligatoria y guardad como string

    //ajustes personalizados
    preference: {
        aiTone:{
            type: String,
            enum: ['Coach', 'Analista', 'Socio'],
            default: 'Socio'
        },
        monthlyGoal: {type: Number, default: 10},//añado una meta de tareas al mes
        businessMotto: {type: String, default: "Mi vision de negocio"},//esto es un lema motivador 
        themeColor: {type: String, default: 'blue'} //color para cada perfil 
    }

}, {timestamps: true});//esto anota automaticamente la fecha de creacion y de actualizacion del usuario

module.exports = mongoose.model('User', UserSchema);