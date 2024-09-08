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
});

const Property = mongoose.model('Property', propertySchema);

export default Property;
