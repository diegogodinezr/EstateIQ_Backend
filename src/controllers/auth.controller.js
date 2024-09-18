import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import Property from '../models/property.model.js';  // Usamos tu modelo de propiedades

export const getStatistics = async (req, res) => {
    try {
        // Cantidad total de usuarios
        const totalUsers = await User.countDocuments();

        // Cantidad total de propiedades
        const totalProperties = await Property.countDocuments();

        // Propiedades publicadas por cada usuario
        const propertiesByUser = await User.aggregate([
            {
                $lookup: {
                    from: 'properties',  // Nombre de la colección de propiedades
                    localField: '_id',
                    foreignField: 'user',  // Este es el campo de referencia en `Property`
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

        res.json({
            totalUsers,
            totalProperties,
            propertiesByUser
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