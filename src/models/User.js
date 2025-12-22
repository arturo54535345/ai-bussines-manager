const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    name: {type: String, required: true},// nombre obigatorio
    email:{type: String, required: true, unique: true},// el email obligatorio y no se puede repetir
    password: {type: String, required: true}, //contraseña obligatoria y guardad como string

}, {timestamps: true});//esto anota automaticamente la fecha de creacion y de actualizacion del usuario

module.exports = mongoose.model('User', UserSchema);