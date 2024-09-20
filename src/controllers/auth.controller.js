import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import Property from '../models/property.model.js';  // Usamos tu modelo de propiedades

export const getStatistics = async (req, res) => {
    try {
        // 1. Cantidad total de usuarios
        const totalUsers = await User.countDocuments();

        // 2. Cantidad total de propiedades activas
        const totalProperties = await Property.countDocuments({ status: 'active' });

        // 3. Propiedades publicadas por cada usuario
        const propertiesByUser = await User.aggregate([
            {
                $lookup: {
                    from: 'properties',  // Nombre de la colección de propiedades
                    localField: '_id',
                    foreignField: 'user',  // Campo de referencia en `Property`
                    as: 'userProperties'
                }
            },
            {
                $project: {
                    email: 1,
                    propertiesCount: { $size: "$userProperties" }  // Contar las propiedades por usuario
                }
            }
        ]);

        // 4. Cantidad de propiedades más solicitadas (mayor número de visualizaciones)
        const mostViewedProperties = await Property.find().sort({ views: -1 }).limit(5);  // Las 5 propiedades más vistas

        // 5. Tiempo promedio que las propiedades permanecen publicadas
        const averageTimeOnMarket = await Property.aggregate([
            {
                $match: { deletedAt: { $exists: true } }  // Solo propiedades eliminadas
            },
            {
                $project: {
                    timeOnMarket: { $subtract: ["$deletedAt", "$createdAt"] }
                }
            },
            {
                $group: {
                    _id: null,
                    averageTime: { $avg: "$timeOnMarket" }
                }
            }
        ]);

        // 6. Rendimiento por ubicación (transacciones completadas por zona)
        const transactionsByLocation = await Property.aggregate([
            {
                $match: { deleteReason: 'completed' }
            },
            {
                $group: {
                    _id: "$location",
                    totalCompleted: { $sum: 1 }
                }
            },
            {
                $sort: { totalCompleted: -1 }  // Ordenar por la cantidad de transacciones completadas
            }
        ]);

        // 7. Cantidad de propiedades eliminadas por motivo
        const deletedPropertiesStats = await Property.aggregate([
            {
                $match: { status: 'deleted' }
            },
            {
                $group: {
                    _id: "$deleteReason",
                    total: { $sum: 1 }
                }
            }
        ]);

        // 8. Cantidad de propiedades en venta y en renta
        const propertiesForSale = await Property.countDocuments({ type: 'sale', status: 'active' });
        const propertiesForRent = await Property.countDocuments({ type: 'rent', status: 'active' });

        // 9. Cantidad de propiedades por ubicación
        const propertiesByLocation = await Property.aggregate([
            {
                $group: {
                    _id: "$location",
                    total: { $sum: 1 }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        // NUEVAS ESTADÍSTICAS:

        // 10. Tasa de propiedades completadas/canceladas (en comparación con eliminadas por otro motivo)
        const completionRate = deletedPropertiesStats.find(item => item._id === 'completed')?.total || 0;
        const cancellationRate = deletedPropertiesStats.find(item => item._id === 'cancelled')?.total || 0;

        // Respuesta con las estadísticas
        res.json({
            totalUsers,
            totalProperties,
            propertiesByUser,
            mostViewedProperties,
            averageTimeOnMarket: averageTimeOnMarket.length > 0 ? averageTimeOnMarket[0].averageTime : 0,
            transactionsByLocation,
            deletedPropertiesStats,
            propertiesForSale,
            propertiesForRent,
            propertiesByLocation,
            completionRate,
            cancellationRate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const register = async (req, res) => {
    const {email, password} = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, 10, );
        const newUser = new User({
            email,
            password: passwordHash,
        });
    
        const userSaved = await newUser.save();
        const token = await createAccessToken({id: userSaved._id})
            res.cookie('token', token);
            res.json({
                _id: userSaved._id,
                email: userSaved.email,
        });
    }   catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const userFound = await User.findOne({email});

        if (!userFound) return res.status(400).json({message: 'User not found'});

        const isMatch = await bcrypt.compare(password, userFound.password);

        if (!isMatch) return res.status(400).json({message: 'Incorrect password'});
    
        const token = await createAccessToken({id: userFound._id})
            res.cookie('token', token);
            res.json({
                _id: userFound._id,
                email: userFound.email,
        });
    }   catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const logout =  (req, res) => {
    res.cookie('token', '', {
        expires: new Date(0)
    });
    return res.sendStatus(200);
};

export const profile = async (req, res) => {
    const userFound = await User.findById(req.user.id)
    if (!userFound) return res.status(400).json({message: 'User not found'});
    return res.json({
        id: userFound._id,
        email: userFound.email,
    });
};