const User = require('../models/User'); 
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 

/**
 * 1. REGISTRO: Crear una cuenta nueva
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ¿Ya existe este correo?
        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Ese correo ya está registrado' });
        }

        // Encriptamos la contraseña para que nadie pueda leerla
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt); 

        // Creamos el nuevo usuario con sus preferencias por defecto
        const newUser = new User({
            name,
            email,
            password: hashedPassword 
        });

        await newUser.save(); 
        res.status(201).json({ message: '¡Cuenta creada con éxito!' });

    } catch (error) {
        res.status(500).json({ message: 'Error al registrar', error: error.message });
    }
};

/**
 * 2. LOGIN: Entrar en la cuenta
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ¿Existe el usuario?
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'El usuario no existe' });
        }

        // ¿La contraseña coincide con la encriptada?
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Generamos el "Carnet de Identidad" (Token)
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Bienvenido de nuevo',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                preferences: user.preferences // Enviamos las preferencias al entrar
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

/**
 * 3. ACTUALIZAR PERFIL: Nombre y Preferencias (IA, Metas, Color)
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, preferences } = req.body;

        // Buscamos por el ID que nos da el "portero" (authMiddleware)
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, preferences },
            { new: true } // Queremos que nos devuelva el usuario ya cambiado
        ).select('-password'); 

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "No se pudo actualizar el perfil" });
    }
};

/**
 * 4. CAMBIAR CONTRASEÑA: Seguridad extra
 */
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Traemos al usuario de la base de datos
        const user = await User.findById(req.user.id);

        // ¿La clave "vieja" es correcta?
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "La contraseña actual no es correcta" });
        }

        // Encriptamos la nueva clave y la guardamos
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Contraseña actualizada con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar la contraseña" });
    }
};