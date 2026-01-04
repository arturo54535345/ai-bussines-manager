const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Hemos puesto 'preferences' en plural para que la IA y el Perfil lo encuentren bien
    preferences: {
        aiTone: {
            type: String,
            enum: ['Coach', 'Analista', 'Socio'],
            default: 'Socio'
        },
        monthlyGoal: { type: Number, default: 10 },
        businessMotto: { type: String, default: "Mi visión de negocio" },
        themeColor: { type: String, default: 'blue' }
    }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);