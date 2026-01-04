const User = require ('../models/User'); //tramos el esquema del usuario
const jwt = require ('jsonwebtoken'); //traemos la herramienta para crear tokens
const bcrypt = require ('bcryptjs'); //trameos la herramienta para encriptar contraseñas

/////////REGISTER/////////////
exports.register = async (req, res) =>{
    console.log("DATOS QUE LLEGAN AL BACKEND:", req.body);
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

//////LOGIN//////////////
exports.login = async (req, res) =>{
    try{
        const {email,password} = req.body; //sacamos lo que el usuario envio

        const user = await User.findOne({email});// buscamos si el usuario existe por email

        if(!user){
            return res.status(400).json({message: 'El usuario no existe'});//si no existe el usuario se retorna un error
        }
        const isMatch = await bcrypt.compare(password, user.password); //comparamo la contraseña enviada con la guardada
        if(!isMatch){
            return res.status(400).json({message: 'Contraseña incorrecta'}); //si no coincide se retornara error
        }
        const token = jwt.sign(//si todo es correcto se genera el token que servira para autenticar al usuario
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}// el tiempo caducara en 1 hora solo por seguridad 
        );

        res.json({
            message: 'Login exitoso',
            token: token,
            user:{
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }catch(error){
        res.status(500).json({message: 'Error en el servidor', error: error.message});
    }
};

//actualizar el usuario/ actualizar contraseña
exports.updateProfile = async (req, res) =>{
    try{
        const {name, preferences} = req.body;

        //busca el usuario y aplica los nuevos datos
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {name, preferences},
            {new: true}//esto le dice al back devuelveme el usuario actualizado
        ).select('-password');//no envio la contraseña por seguridad
        res.json(user);
    }catch(error){
        res.status(500).json({message: "Error al actualizar el perfil"});
    }
};
