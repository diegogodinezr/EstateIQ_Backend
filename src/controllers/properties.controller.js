import Property from '../models/property.model.js';
import validator from 'validator';

// Función para normalizar campos de texto
const normalizeText = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();

// Crear una propiedad nueva
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      price,
      calleYNumero,
      colonia,
      codigoPostal,
      estado,
      municipio,
      bedrooms,
      bathrooms,
      squaremeters,
      description,
      type,
      propertyType,
      contactNumber,
      isFeatured
    } = req.body;

    // Normalizar los campos de ubicación
    const normalizedCalleYNumero = normalizeText(calleYNumero);
    const normalizedColonia = normalizeText(colonia);
    const normalizedEstado = normalizeText(estado);
    const normalizedMunicipio = normalizeText(municipio);

    // Verificar que los campos de ubicación sean válidos
    if (
      !validator.isAlphanumeric(normalizedCalleYNumero.replace(/\s/g, '')) ||
      !validator.isAlphanumeric(normalizedColonia.replace(/\s/g, '')) ||
      !validator.isAlphanumeric(normalizedEstado.replace(/\s/g, '')) ||
      !validator.isAlphanumeric(normalizedMunicipio.replace(/\s/g, ''))
    ) {
      return res.status(400).json({ message: 'Invalid address format' });
    }

    // Obtener las URLs de las imágenes subidas a Cloudinary
    const imagePaths = req.files.map(file => file.path); // Obtiene la URL pública de Cloudinary

    // Obteniendo el ID del usuario autenticado
    const userId = req.user.id;

    const newProperty = new Property({
      title,
      price,
      calleYNumero: normalizedCalleYNumero,
      colonia: normalizedColonia,
      codigoPostal,
      estado: normalizedEstado,
      municipio: normalizedMunicipio,
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

// Obtener todas las propiedades, con posibilidad de filtrar por tipo, estado, municipio, precio, y destacadas
export const getProperties = async (req, res) => {
  try {
    const { type, propertyType, estado, municipio, minPrice, maxPrice, isFeatured } = req.query;
    const query = { status: 'active' };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (propertyType && propertyType !== 'all') {
      query.propertyType = propertyType;
    }

    if (estado) {
      query.estado = { $regex: estado, $options: 'i' }; // Filtro por estado con búsqueda insensible a mayúsculas y minúsculas
    }

    if (municipio) {
      query.municipio = { $regex: municipio, $options: 'i' }; // Filtro por municipio con búsqueda insensible a mayúsculas y minúsculas
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

    // Normalizar los nuevos campos de ubicación si están presentes
    if (req.body.calleYNumero) req.body.calleYNumero = normalizeText(req.body.calleYNumero);
    if (req.body.colonia) req.body.colonia = normalizeText(req.body.colonia);
    if (req.body.estado) req.body.estado = normalizeText(req.body.estado);
    if (req.body.municipio) req.body.municipio = normalizeText(req.body.municipio);

    // Procesar las nuevas imágenes si se subieron
    let imagePaths = property.images; // Mantener las imágenes existentes

    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => file.path); // Actualizar con nuevas imágenes subidas
    }

    // Actualizar los campos de la propiedad
    const updatedProperty = await Property.findByIdAndUpdate(id, {
      ...req.body,
      images: imagePaths // Actualizar las imágenes
    }, { new: true });

    return res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
// Actualizar el contador de visitas presenciales
export const updatePhysicalVisits = async (req, res) => {
  const { id } = req.params;
  const { physicalVisits } = req.body;

  try {
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Actualizar el contador de visitas presenciales
    property.physicalVisits = physicalVisits;
    await property.save();

    res.json({ message: 'Physical visits updated successfully', property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
