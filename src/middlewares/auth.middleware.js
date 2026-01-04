const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Buscamos la llave en el sobre 'x-auth-token' (como lo envía axios.js)
    const token = req.header('x-auth-token'); 

    // 2. Si no hay llave, no lo dejamos pasar
    if(!token){
        return res.status(401).json({message: 'No hay llave, permiso denegado'});
    }

    try{
        // 3. Verificamos que la llave sea auténtica usando tu palabra secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Guardamos los datos del usuario en la petición para usarlo después
        req.user = decoded;

        // 5. ¡Todo bien! Le damos permiso para pasar al siguiente paso
        next();
    }catch(error){
        // 6. Si la llave es falsa o ya caducó
        res.status(401).json({message: 'La llave no sirve (Token no válido)'});
    }
};