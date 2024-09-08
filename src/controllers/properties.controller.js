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
      contactNumber, // Nuevo campo para el número de contacto
      isFeatured // Nuevo campo para destacar la propiedad
    } = req.body;

    const imagePaths = req.files.map(file => {
      const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      return url;
    });

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
      contactNumber, // Guardando el número de contacto
      isFeatured: isFeatured === 'true' // Asegurando que 'isFeatured' sea un booleano
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
    const { type, propertyType, location, minPrice, maxPrice, isFeatured } = req.query; // Incluyendo el filtro 'isFeatured'
    const query = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (propertyType && propertyType !== 'all') {
      query.propertyType = propertyType;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' }; // Filtro por ubicación con búsqueda insensible a mayúsculas/minúsculas
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: Number(minPrice) }; // Precio mínimo
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: Number(maxPrice) }; // Precio máximo
    }

    if (isFeatured) {
      query.isFeatured = isFeatured === 'true'; // Filtra propiedades destacadas
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
