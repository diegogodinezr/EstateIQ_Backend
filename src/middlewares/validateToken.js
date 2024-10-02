import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';
import User from '../models/user.model.js'; // Importa el modelo de usuario para buscar en la base de datos

export const authRequired = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Cambiado para obtener el token del encabezado

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    jwt.verify(token, TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        try {
            // Buscar el usuario en la base de datos usando el ID decodificado del token
            const user = await User.findById(decoded.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Añadir el usuario completo al request
            req.user = user;
            next();
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching user from database' });
        }
    });
};
