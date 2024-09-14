import Property from '../models/property.model.js';

// Crear una propiedad nueva
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      squaremeters,
      description,
      type,
      propertyType,
      contactNumber,
      isFeatured
    } = req.body;

    const imagePaths = req.files.map(file => {
      const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      return url;
    });

    // Obteniendo el ID del usuario autenticado
    const userId = req.user.id;

    const newProperty = new Property({
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      squaremeters,
      description,
      images: imagePaths,
      type,
      propertyType,
      contactNumber,
      isFeatured: isFeatured === 'true',
      user: userId // Asignando el usuario autenticado como propietario de la propiedad
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todas las propiedades, con posibilidad de filtrar por tipo, ubicación y precio
export const getProperties = async (req, res) => {
  try {
    const { type, propertyType, location, minPrice, maxPrice, isFeatured } = req.query;
    const query = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (propertyType && propertyType !== 'all') {
      query.propertyType = propertyType;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }

    if (isFeatured) {
      query.isFeatured = isFeatured === 'true';
    }

    const properties = await Property.find(query);
    res.status(200).json(properties);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener una propiedad por su ID
export const getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
