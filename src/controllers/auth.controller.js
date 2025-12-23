const User = require ('../models/User'); //tramos el esquema del usuario
const jwt = require ('jsonwebtoken'); //traemos la herramienta para crear tokens
const bcrypt = require ('bcryptjs'); //trameos la herramienta para encriptar contraseñas

//Funcion para registrar un usuario
exports.register = async (req, res) =>{
    try{
        const {name,email,password} = req.body; //sacamos los datos que envio el usuario
        let userExists = await User.findOne({email});
        //si un email ya existe retornamos este error
        if(userExists){
            return res.status(400).json({message: 'El usuario ya existe'});
        }
        //encriptamos la contraseña y la hacemos secreta antes de guardarla en la base de datos
        const salt = await bcrypt.genSalt(10); //generamos un salt para encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, salt); //encriptamos la contraseña

        const newUser = new User({
            name,
            email,
            password: hashedPassword //lo guardamos con la contraseña encriptada
        });

        await newUser.save(); //guardamos el usuario en la base de datos
        res.status(201).json({message: 'Usuario creado con exito'});
    }catch(error){
        res.status(500).json({message: 'Error al registrar el usuario', error: error.message});
    }
};