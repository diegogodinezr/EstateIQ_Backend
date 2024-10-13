// import { createAccessToken } from '../libs/jwt.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';
import Property from '../models/property.model.js';

const createToken = (payload) => {
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: '1d' });
};

export const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await User.findOne({ email });
    if (userFound) return res.status(400).json(['The email is already in use']);

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: passwordHash,
    });

    const userSaved = await newUser.save();
    const token = createToken({ id: userSaved._id });

    res.json({
      id: userSaved._id,
      email: userSaved.email,
      token: token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = createToken({ id: userFound._id });

    res.json({
      id: userFound._id,
      email: userFound.email,
      token: token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.json({ message: "Logout successful" });
};

export const profile = async (req, res) => {
  try {
    const userFound = await User.findById(req.user.id);
    if (!userFound) return res.status(400).json({ message: "User not found" });

    const userProperties = await Property.find({ user: req.user.id });

    return res.json({
      id: userFound._id,
      email: userFound.email,
      properties: userProperties,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving profile information' });
  }
};

export const getStatistics = async (req, res) => {
  try {
      // 1. Cantidad total de usuarios
      const totalUsers = await User.countDocuments();

      // 2. Cantidad total de propiedades activas
      const totalProperties = await Property.countDocuments({ status: 'active' });
      const totalPropertiesDeleted = await Property.countDocuments({ status: 'deleted' });
      const activePercentage = (totalProperties / (totalProperties + totalPropertiesDeleted)) * 100;

      // 3. Propiedades publicadas por cada usuario
      const propertiesByUser = await User.aggregate([
          {
              $lookup: {
                  from: 'properties',
                  localField: '_id',
                  foreignField: 'user',
                  as: 'userProperties'
              }
          },
          {
              $project: {
                  email: 1,
                  propertiesCount: { $size: "$userProperties" }
              }
          }
      ]);

      // 4. Cantidad de propiedades más solicitadas (mayor número de visualizaciones)
      const mostViewedProperties = await Property.find().sort({ views: -1 }).limit(5);

      // 5. Tiempo promedio que las propiedades permanecen publicadas (por motivo de eliminación)
      const averageTimeOnMarketCompleted = await Property.aggregate([
          { $match: { deleteReason: 'completed' } },
          { $project: { timeOnMarket: { $subtract: ["$deletedAt", "$createdAt"] } } },
          { $group: { _id: null, averageTime: { $avg: "$timeOnMarket" } } }
      ]);
      const averageTimeOnMarketCancelled = await Property.aggregate([
          { $match: { deleteReason: 'cancelled' } },
          { $project: { timeOnMarket: { $subtract: ["$deletedAt", "$createdAt"] } } },
          { $group: { _id: null, averageTime: { $avg: "$timeOnMarket" } } }
      ]);

      // 6. Rendimiento por ubicación (visitas físicas promedio por zona)
      const visitsByLocation = await Property.aggregate([
          { $group: { _id: "$location", averageVisits: { $avg: "$physicalVisits" }, totalCompleted: { $sum: 1 } } },
          { $sort: { totalCompleted: -1 } }
      ]);

      // 7. Cantidad de propiedades eliminadas por motivo
      const deletedPropertiesStats = await Property.aggregate([
          { $match: { status: 'deleted' } },
          { $group: { _id: "$deleteReason", total: { $sum: 1 } } }
      ]);

      // 8. Cantidad de propiedades en venta y en renta
      const propertiesForSale = await Property.countDocuments({ type: 'sale', status: 'active' });
      const propertiesForRent = await Property.countDocuments({ type: 'rent', status: 'active' });

      // 9. Cantidad de propiedades por ubicación
      const propertiesByLocation = await Property.aggregate([
          { $group: { _id: "$location", total: { $sum: 1 } } },
          { $sort: { total: -1 } }
      ]);

      // 10. Tasa de propiedades completadas/canceladas (en comparación con eliminadas por otro motivo)
      const completionRate = deletedPropertiesStats.find(item => item._id === 'completed')?.total || 0;
      const cancellationRate = deletedPropertiesStats.find(item => item._id === 'cancelled')?.total || 0;
      const otherDeletionRate = deletedPropertiesStats.find(item => item._id === 'other')?.total || 0;

      const totalDeleted = completionRate + cancellationRate + otherDeletionRate;
      const completionPercentage = totalDeleted > 0 ? (completionRate / totalDeleted) * 100 : 0;
      const cancellationPercentage = totalDeleted > 0 ? (cancellationRate / totalDeleted) * 100 : 0;

      // Respuesta con las estadísticas
      res.json({
          totalUsers,
          totalProperties,
          activePercentage,
          propertiesByUser,
          mostViewedProperties,
          averageTimeOnMarketCompleted: averageTimeOnMarketCompleted.length > 0 ? averageTimeOnMarketCompleted[0].averageTime : 0,
          averageTimeOnMarketCancelled: averageTimeOnMarketCancelled.length > 0 ? averageTimeOnMarketCancelled[0].averageTime : 0,
          visitsByLocation,
          deletedPropertiesStats,
          propertiesForSale,
          propertiesForRent,
          propertiesByLocation,
          completionPercentage,
          cancellationPercentage
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
