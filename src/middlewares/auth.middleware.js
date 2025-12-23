const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;//buscamo el token en la cabecera Authorization
    const token = req.headers.authorization?.split("")[1]; // buscamos el token en la cabecera Authorization
    if(!token){
        return res.status(401).json({message: 'No tienes permisos para acceder'});//si no hay token no lo dejamos pasar y se retorna error
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);// verificamos si el token es autentico usando nuestra palabra secreta
        req.user = decoded;// guardamos la informacion del usuario dentro de la peticion para que el siguiente middleware o controlador pueda usarla y sepa quien es

        next();//si todo va bien dejamos pasar al siguiente paso (middleware o controlador)
    }catch(error){
        res.status(401).json({message: 'Token no valido o expirado'});//si no es valido o ha expirado se retornara error
    }
};