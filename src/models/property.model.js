import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  bedrooms: {
    type: Number,
    required: true,
  },
  bathrooms: {
    type: Number,
    required: true,
  },
  squaremeters: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  type: {
    type: String,
    enum: ['sale', 'rent'], // 'sale' o 'rent'
    required: true,
    default: 'sale', // Valor por defecto
  },
  propertyType: {
    type: String,
    enum: ['House', 'Apartment', 'Land', 'Commercial'], // Opciones de tipos de propiedad
    required: true,
    default: 'House', // Valor por defecto
  },
  contactNumber: {
    type: String,
    required: true, // El número de teléfono del publicador es requerido
  },
  isFeatured: {
    type: Boolean,
    default: false, // Valor por defecto es 'false' (no destacado)
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Hace referencia al modelo User
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Agrega la fecha de creación automáticamente
  },

  // Nuevos campos para estadísticas
  views: {
    type: Number,
    default: 0, // Contador de visualizaciones
  },
  deletedAt: {
    type: Date, // Fecha de eliminación
  },
  deleteReason: {
    type: String, // Motivo de eliminación (completada, cancelada, etc.)
    enum: ['completed', 'cancelled', 'other'],
  },
  status: {
    type: String,
    enum: ['active', 'deleted'], // Estado de la propiedad: activa o eliminada
    default: 'active', // Valor por defecto es activa
  },
});

const Property = mongoose.model('Property', propertySchema);

export default Property;
