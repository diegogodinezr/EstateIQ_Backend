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

    // Normalizar la ubicación: convertir a minúsculas y eliminar caracteres especiales
    let normalizedLocation = location.toLowerCase().replace(/[^a-z0-9\s]/gi, '');

    // Verificar que la ubicación sea válida (puedes hacer una validación más avanzada si es necesario)
    if (!validator.isAlphanumeric(normalizedLocation.replace(/\s/g, ''))) {
      return res.status(400).json({ message: 'Invalid location format' });
    }

    const imagePaths = req.files.map(file => {
      const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      return url;
    });

    // Obteniendo el ID del usuario autenticado
    const userId = req.user.id;

    const newProperty = new Property({
      title,
      price,
      location: normalizedLocation, // Usar la ubicación normalizada
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

// Obtener todas las propiedades, con posibilidad de filtrar por tipo, ubicación, precio, y destacadas
export const getProperties = async (req, res) => {
  try {
    const { type, propertyType, location, minPrice, maxPrice, isFeatured } = req.query;
    const query = {status: 'active'};

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

// Obtener una propiedad por su ID y aumentar el contador de visualizaciones
export const getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Incrementa el número de visualizaciones
    property.views += 1;
    await property.save();

    res.status(200).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar propiedad
export const updateProperty = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const property = await Property.findById(id);

    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Verifica si la propiedad pertenece al usuario logueado
    if (property.user.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this property' });
    }

    // Actualiza los campos de la propiedad
    const updatedProperty = await Property.findByIdAndUpdate(id, req.body, { new: true });
    return res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar (o marcar como eliminada) una propiedad
export const deleteProperty = async (req, res) => {
  const { id } = req.params;
  const { deleteReason } = req.body; // Motivo de eliminación proporcionado en el request
  const userId = req.user.id;

  try {
    const property = await Property.findById(id);

    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Verifica si la propiedad pertenece al usuario logueado
    if (property.user.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this property' });
    }

    // Marcar la propiedad como eliminada en lugar de eliminarla permanentemente
    property.status = 'deleted';
    property.deletedAt = new Date();
    property.deleteReason = deleteReason || 'other'; // Si no se proporciona un motivo, se pone como 'other'
    await property.save();

    return res.json({ message: 'Property marked as deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener propiedades destacadas
export const getFeaturedProperties = async (req, res) => {
  try {
    const featuredProperties = await Property.find({ isFeatured: true, status: 'active' });
    res.status(200).json(featuredProperties);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener propiedades eliminadas (con fines de estadísticas o revisiones)
export const getDeletedProperties = async (req, res) => {
  try {
    const deletedProperties = await Property.find({ status: 'deleted' });
    res.status(200).json(deletedProperties);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
